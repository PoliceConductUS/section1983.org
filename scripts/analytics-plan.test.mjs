import assert from "node:assert/strict";
import test from "node:test";

const planner = () => import("./lib/analytics-plan.mjs");
const property = "properties/123";
const stream = `${property}/dataStreams/456`;
function example() {
  const config = {
    propertyId: "123",
    webStreamId: "456",
    customDimensions: [],
    keyEvents: [],
    unmarkedKeyEvents: [],
    eventCreateRules: [],
    dataRetentionSettings: { eventDataRetention: "TWO_MONTHS" },
    enhancedMeasurementSettings: { streamEnabled: false },
    dataRedactionSettings: { emailRedactionEnabled: true },
  };
  const state = {
    customDimensions: [],
    keyEvents: [],
    eventCreateRules: [],
    dataRetentionSettings: {
      name: `${property}/dataRetentionSettings`,
      eventDataRetention: "TWO_MONTHS",
      userDataRetention: "FOURTEEN_MONTHS",
    },
    enhancedMeasurementSettings: {
      name: `${stream}/enhancedMeasurementSettings`,
      streamEnabled: false,
      searchQueryParameter: "q,s",
    },
    dataRedactionSettings: {
      name: `${stream}/dataRedactionSettings`,
      emailRedactionEnabled: true,
    },
  };
  return { config, state };
}

test("planning creates only the missing resource without changing either input", async () => {
  const { planAnalytics } = await planner();
  const { config, state } = example();
  const dimension = {
    parameterName: "form_name",
    scope: "EVENT",
    displayName: "Form name",
  };
  config.customDimensions.push(dimension);
  const before = structuredClone({ config, state });
  assert.deepEqual(planAnalytics(config, state), [
    {
      version: "v1beta",
      resource: `${property}/customDimensions`,
      method: "POST",
      body: dimension,
    },
  ]);
  assert.deepEqual({ config, state }, before);
});

test("planning retention updates preserves the provider's required unlisted duration", async () => {
  const { planAnalytics } = await planner();
  const { config, state } = example();
  config.dataRetentionSettings.eventDataRetention = "FOURTEEN_MONTHS";
  assert.deepEqual(planAnalytics(config, state), [
    {
      version: "v1beta",
      resource: `${property}/dataRetentionSettings`,
      method: "PATCH",
      body: {
        eventDataRetention: "FOURTEEN_MONTHS",
        userDataRetention: "FOURTEEN_MONTHS",
      },
      mask: ["eventDataRetention"],
    },
  ]);
});

test("pull snapshots strip provider metadata and leave source data unchanged", async () => {
  const { snapshotAnalytics } = await planner();
  const { config, state } = example();
  const before = structuredClone({ config, state });
  assert.deepEqual(snapshotAnalytics(config, state), {
    ...config,
    dataRetentionSettings: {
      ...config.dataRetentionSettings,
      userDataRetention: "FOURTEEN_MONTHS",
    },
  });
  assert.deepEqual({ config, state }, before);
});
