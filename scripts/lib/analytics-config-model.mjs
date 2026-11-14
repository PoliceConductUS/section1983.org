class AnalyticsError extends Error {}
const fail = (message) => {
  throw new AnalyticsError(message);
};
const object = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const eventName = (value) =>
  typeof value === "string" && /^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(value);
const own = (value, key) => Object.hasOwn(value, key);
const measurementFields = [
  "streamEnabled",
  "pageChangesEnabled",
  "scrollsEnabled",
  "outboundClicksEnabled",
  "siteSearchEnabled",
  "videoEngagementEnabled",
  "fileDownloadsEnabled",
  "formInteractionsEnabled",
];
const retentionFields = [
  "eventDataRetention",
  "userDataRetention",
  "resetUserDataOnNewActivity",
];
const redactionFields = [
  "emailRedactionEnabled",
  "queryParameterRedactionEnabled",
  "queryParameterKeys",
];
const dimensionFields = [
  "parameterName",
  "scope",
  "displayName",
  "description",
  "disallowAdsPersonalization",
];
const ruleFields = [
  "destinationEvent",
  "eventConditions",
  "sourceCopyParameters",
  "parameterMutations",
];
const countingMethods = ["ONCE_PER_EVENT", "ONCE_PER_SESSION"];
const comparisonTypes = [
  "EQUALS",
  "EQUALS_CASE_INSENSITIVE",
  "CONTAINS",
  "CONTAINS_CASE_INSENSITIVE",
  "STARTS_WITH",
  "STARTS_WITH_CASE_INSENSITIVE",
  "ENDS_WITH",
  "ENDS_WITH_CASE_INSENSITIVE",
  "GREATER_THAN",
  "GREATER_THAN_OR_EQUAL",
  "LESS_THAN",
  "LESS_THAN_OR_EQUAL",
  "REGULAR_EXPRESSION",
  "REGULAR_EXPRESSION_CASE_INSENSITIVE",
];

function check(condition) {
  if (!condition)
    fail(
      "Invalid analytics config; check the supported fields and values in config/analytics.json.",
    );
}
function fields(value, allowed, required = []) {
  check(
    object(value) &&
      Object.keys(value).every((key) => allowed.includes(key)) &&
      required.every((key) => own(value, key)),
  );
}
function booleans(value, names) {
  for (const name of names)
    if (own(value, name)) check(typeof value[name] === "boolean");
}
function unique(rows, identity) {
  const keys = rows.map(identity);
  check(new Set(keys).size === keys.length);
}
function validateConfig(config) {
  const top = [
    "propertyId",
    "webStreamId",
    "customDimensions",
    "keyEvents",
    "unmarkedKeyEvents",
    "eventCreateRules",
    "dataRetentionSettings",
    "enhancedMeasurementSettings",
    "dataRedactionSettings",
  ];
  fields(config, [...top, "googleSignalsSettings"], top);
  if (config.googleSignalsSettings) {
    fields(config.googleSignalsSettings, ["state"], ["state"]);
    check(
      ["GOOGLE_SIGNALS_ENABLED", "GOOGLE_SIGNALS_DISABLED"].includes(
        config.googleSignalsSettings.state,
      ),
    );
  }
  check(
    typeof config.propertyId === "string" && /^\d+$/.test(config.propertyId),
  );
  check(
    typeof config.webStreamId === "string" && /^\d+$/.test(config.webStreamId),
  );
  for (const kind of [
    "customDimensions",
    "keyEvents",
    "unmarkedKeyEvents",
    "eventCreateRules",
  ])
    check(Array.isArray(config[kind]));
  for (const row of config.customDimensions) {
    fields(row, dimensionFields, ["parameterName", "scope", "displayName"]);
    check(["EVENT", "USER", "ITEM"].includes(row.scope));
    check(
      eventName(row.parameterName) &&
        row.parameterName.length <= (row.scope === "USER" ? 24 : 40),
    );
    check(
      typeof row.displayName === "string" &&
        /^[A-Za-z][A-Za-z0-9_ ]{0,81}$/.test(row.displayName),
    );
    if (own(row, "description"))
      check(
        typeof row.description === "string" && row.description.length <= 150,
      );
    booleans(row, ["disallowAdsPersonalization"]);
    if (row.disallowAdsPersonalization) check(row.scope === "USER");
  }
  unique(config.customDimensions, (row) => `${row.scope}:${row.parameterName}`);
  for (const row of config.keyEvents) {
    fields(
      row,
      ["eventName", "countingMethod"],
      ["eventName", "countingMethod"],
    );
    check(
      eventName(row.eventName) && countingMethods.includes(row.countingMethod),
    );
  }
  unique(config.keyEvents, (row) => row.eventName);
  // This command only unmarks the legacy receipt event; other key events are
  // outside its removal scope, including Google's default events.
  check(
    config.unmarkedKeyEvents.every((name) => name === "form_submit_success"),
  );
  unique(config.unmarkedKeyEvents, (name) => name);
  check(
    !config.keyEvents.some((row) =>
      config.unmarkedKeyEvents.includes(row.eventName),
    ),
  );
  for (const row of config.eventCreateRules) {
    fields(row, ruleFields, [
      "destinationEvent",
      "eventConditions",
      "sourceCopyParameters",
    ]);
    check(eventName(row.destinationEvent) && row.destinationEvent.length < 40);
    check(
      Array.isArray(row.eventConditions) &&
        row.eventConditions.length >= 1 &&
        row.eventConditions.length <= 10,
    );
    for (const condition of row.eventConditions) {
      fields(
        condition,
        ["field", "comparisonType", "value", "negated"],
        ["field", "comparisonType", "value"],
      );
      check(
        typeof condition.field === "string" && /^\S+$/.test(condition.field),
      );
      check(
        comparisonTypes.includes(condition.comparisonType) &&
          typeof condition.value === "string",
      );
      booleans(condition, ["negated"]);
    }
    booleans(row, ["sourceCopyParameters"]);
    if (own(row, "parameterMutations")) {
      check(
        Array.isArray(row.parameterMutations) &&
          row.parameterMutations.length <= 20,
      );
      for (const mutation of row.parameterMutations) {
        fields(
          mutation,
          ["parameter", "parameterValue"],
          ["parameter", "parameterValue"],
        );
        check(
          typeof mutation.parameter === "string" &&
            /^[A-Za-z0-9_]{1,39}$/.test(mutation.parameter),
        );
        check(
          typeof mutation.parameterValue === "string" &&
            mutation.parameterValue.length < 100,
        );
      }
      unique(row.parameterMutations, (mutation) => mutation.parameter);
    }
  }
  unique(config.eventCreateRules, (row) => row.destinationEvent);
  fields(config.dataRetentionSettings, retentionFields);
  fields(config.enhancedMeasurementSettings, measurementFields);
  fields(config.dataRedactionSettings, redactionFields);
  for (const kind of [
    "dataRetentionSettings",
    "enhancedMeasurementSettings",
    "dataRedactionSettings",
  ])
    check(Object.keys(config[kind]).length > 0);
  for (const [field, durations] of [
    [
      "eventDataRetention",
      [
        "TWO_MONTHS",
        "FOURTEEN_MONTHS",
        "TWENTY_SIX_MONTHS",
        "THIRTY_EIGHT_MONTHS",
        "FIFTY_MONTHS",
      ],
    ],
    ["userDataRetention", ["TWO_MONTHS", "FOURTEEN_MONTHS"]],
  ]) {
    if (own(config.dataRetentionSettings, field))
      check(durations.includes(config.dataRetentionSettings[field]));
  }
  booleans(config.dataRetentionSettings, ["resetUserDataOnNewActivity"]);
  booleans(config.enhancedMeasurementSettings, measurementFields);
  booleans(config.dataRedactionSettings, redactionFields.slice(0, 2));
  if (own(config.dataRedactionSettings, "queryParameterKeys")) {
    const keys = config.dataRedactionSettings.queryParameterKeys;
    check(
      Array.isArray(keys) &&
        keys.every(
          (key) =>
            typeof key === "string" && key.length > 0 && !key.includes(","),
        ),
    );
    unique(keys, (key) => key.toLowerCase());
  }
  if (config.dataRedactionSettings.queryParameterRedactionEnabled)
    check(config.dataRedactionSettings.queryParameterKeys?.length > 0);
}

function normalized(value, field, desired) {
  if (field === "eventConditions")
    return (value ?? [])
      .map((condition) => ({
        field: condition.field ?? "",
        comparisonType:
          condition.comparisonType ?? "COMPARISON_TYPE_UNSPECIFIED",
        value: condition.value ?? "",
        negated: condition.negated ?? false,
      }))
      .map((condition) => JSON.stringify(condition))
      .sort();
  if (field === "queryParameterKeys")
    return [...new Set((value ?? []).map((key) => key.toLowerCase()))].sort();
  if (field === "parameterMutations")
    return (value ?? []).map((mutation) => ({
      parameter: mutation.parameter ?? "",
      parameterValue: mutation.parameterValue ?? "",
    }));
  return value ?? (typeof desired === "boolean" ? false : "");
}
function changedFields(desired, current, names) {
  return names.filter(
    (key) =>
      own(desired, key) &&
      JSON.stringify(normalized(desired[key], key, desired[key])) !==
        JSON.stringify(normalized(current[key], key, desired[key])),
  );
}
export function analyticsResources(config) {
  const property = `properties/${config.propertyId}`;
  const stream = `${property}/dataStreams/${config.webStreamId}`;
  const collections = [
    {
      kind: "customDimensions",
      version: "v1beta",
      parent: property,
      identity: (row) => `${row.scope}:${row.parameterName}`,
      fields: ["displayName", "description", "disallowAdsPersonalization"],
      configurationFields: dimensionFields,
    },
    {
      kind: "keyEvents",
      version: "v1beta",
      parent: property,
      identity: (row) => row.eventName,
      fields: ["countingMethod"],
      configurationFields: ["eventName", "countingMethod"],
    },
    {
      kind: "eventCreateRules",
      version: "v1alpha",
      parent: stream,
      identity: (row) => row.destinationEvent,
      fields: ruleFields.filter((key) => key !== "destinationEvent"),
      configurationFields: ruleFields,
    },
  ];
  const singletons = [
    {
      kind: "dataRetentionSettings",
      version: "v1beta",
      parent: property,
      fields: retentionFields,
    },
    {
      kind: "enhancedMeasurementSettings",
      version: "v1alpha",
      parent: stream,
      fields: measurementFields,
    },
    {
      kind: "dataRedactionSettings",
      version: "v1alpha",
      parent: stream,
      fields: redactionFields,
    },
  ];
  if (config.googleSignalsSettings)
    singletons.push({
      kind: "googleSignalsSettings",
      version: "v1alpha",
      parent: property,
      fields: ["state"],
    });
  return { collections, singletons };
}

export {
  AnalyticsError,
  fail,
  object,
  own,
  eventName,
  validateConfig,
  changedFields,
};
