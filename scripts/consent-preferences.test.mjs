import assert from "node:assert/strict";
import test from "node:test";

const key = "ipc-analytics-consent-v1";
const preferencesModule = () =>
  import("../src/lib/client/consent-preferences.js");

function storage(value = null) {
  return {
    value,
    getItem(name) {
      assert.equal(name, key);
      return this.value;
    },
    setItem(name, value) {
      assert.equal(name, key);
      this.value = value;
    },
  };
}

test("saved category choices round-trip independently", async () => {
  const { createConsentPreferences } = await preferencesModule();
  const saved = storage();
  const preferences = createConsentPreferences(
    () => saved,
    () => {},
  );
  assert.equal(preferences.read(), null);
  const choices = { analytics: "denied", advertising: "granted" };
  preferences.save(choices);
  assert.deepEqual(preferences.read(), choices);
});

test("legacy choices preserve analytics and deny advertising", async () => {
  const { createConsentPreferences } = await preferencesModule();
  for (const choice of ["granted", "denied"]) {
    const preferences = createConsentPreferences(
      () => storage(choice),
      () => {},
    );
    assert.deepEqual(preferences.read(), {
      analytics: choice,
      advertising: "denied",
    });
  }
});

test("unavailable storage and malformed choices remain undecided", async () => {
  const { createConsentPreferences } = await preferencesModule();
  for (const value of [
    null,
    "broken",
    "{}",
    '{"analytics":"granted"}',
    '{"analytics":"other","advertising":"denied"}',
  ]) {
    assert.equal(
      createConsentPreferences(
        () => storage(value),
        () => {},
      ).read(),
      null,
    );
  }
  const preferences = createConsentPreferences(
    () => {
      throw new Error("blocked");
    },
    () => {},
  );
  assert.equal(preferences.read(), null);
  assert.throws(
    () => preferences.save({ analytics: "granted", advertising: "denied" }),
    /blocked/,
  );
});

test("subscribers receive category changes and storage clears, ignoring other keys", async () => {
  const { createConsentPreferences } = await preferencesModule();
  const saved = storage();
  let notify;
  const preferences = createConsentPreferences(
    () => saved,
    (listener) => {
      notify = listener;
    },
  );
  const changes = [];
  preferences.subscribe((choice) => changes.push(choice));
  notify({ key: "unrelated" });
  assert.deepEqual(changes, []);
  preferences.save({ analytics: "granted", advertising: "denied" });
  notify({ key });
  saved.value = null;
  notify({ key: null });
  assert.deepEqual(changes, [
    { analytics: "granted", advertising: "denied" },
    null,
  ]);
});
