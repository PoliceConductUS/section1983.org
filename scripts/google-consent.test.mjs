import assert from "node:assert/strict";
import test from "node:test";

const consentModule = () => import("../src/lib/client/google-consent.js");

for (const analytics of ["granted", "denied"]) {
  for (const advertising of ["granted", "denied"]) {
    test(`Google consent preserves independent ${analytics} analytics / ${advertising} advertising`, async () => {
      const { applyGoogleConsent } = await consentModule();
      const calls = [];
      applyGoogleConsent(
        { analytics, advertising },
        {
          gtag: (...args) => calls.push(args),
          hostname: "www.section1983.org",
          document: { cookie: "" },
        },
      );
      assert.deepEqual(calls, [
        [
          "set",
          {
            allow_ad_personalization_signals: advertising === "granted",
            allow_google_signals: advertising === "granted",
          },
        ],
        [
          "consent",
          "update",
          {
            analytics_storage: analytics,
            ad_storage: advertising,
            ad_user_data: advertising,
            ad_personalization: advertising,
          },
        ],
      ]);
    });
  }
}

test("withdrawal expires only the denied cookie category at host and parent domains", async () => {
  const { clearGoogleConsentCookies } = await consentModule();
  const expired = [];
  const jar = {
    get cookie() {
      return "_ga=one; _ga_ABC=two; _gcl_au=three; session=four";
    },
    set cookie(value) {
      expired.push(value);
    },
  };
  clearGoogleConsentCookies(
    { analytics: "granted", advertising: "denied" },
    "www.section1983.org",
    jar,
  );
  assert.equal(expired.length, 4);
  assert(
    expired.every((value) =>
      value.startsWith("_gcl_au=; Max-Age=0; Path=/; SameSite=Lax"),
    ),
  );
  assert(expired.some((value) => value.endsWith("Domain=section1983.org")));
  expired.length = 0;
  clearGoogleConsentCookies(
    { analytics: "denied", advertising: "granted" },
    "www.section1983.org",
    jar,
  );
  assert.equal(expired.length, 8);
  assert(
    expired.every(
      (value) => value.startsWith("_ga=") || value.startsWith("_ga_ABC="),
    ),
  );
});

test("undecided consent defaults all Google categories to denied", async () => {
  const { consentState, advertisingSettings } = await consentModule();
  assert.deepEqual(consentState(null), {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  assert.deepEqual(advertisingSettings(null), {
    allow_ad_personalization_signals: false,
    allow_google_signals: false,
  });
});
