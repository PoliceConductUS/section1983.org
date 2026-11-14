import {
  analyticsResources,
  changedFields,
  fail,
  own,
  validateConfig,
} from "./analytics-config-model.mjs";

export function planAnalytics(config, state) {
  const { collections, singletons } = analyticsResources(config);
  const operations = [];
  const patch = (spec, current, desired, keys) => {
    if (!keys.length) return;
    const body = Object.fromEntries(keys.map((key) => [key, desired[key]]));
    if (spec.kind === "dataRetentionSettings") {
      for (const key of ["eventDataRetention", "userDataRetention"]) {
        if (typeof current[key] !== "string" || !current[key])
          fail(
            "Analytics API settings response is missing a required retention duration.",
          );
        if (!own(body, key)) body[key] = current[key];
      }
    }
    // Required in the provider request schema even when search is disabled.
    if (spec.kind === "enhancedMeasurementSettings") {
      if (
        typeof current.searchQueryParameter !== "string" ||
        !current.searchQueryParameter
      )
        fail(
          "Analytics API settings response is missing required searchQueryParameter.",
        );
      body.searchQueryParameter = current.searchQueryParameter;
    }
    operations.push({
      version: spec.version,
      resource: current.name,
      method: "PATCH",
      body,
      mask: keys,
    });
  };
  for (const spec of collections) {
    const wanted = config[spec.kind];
    for (const desired of wanted) {
      const matches = state[spec.kind].filter(
        (row) => spec.identity(row) === spec.identity(desired),
      );
      if (matches.length > 1)
        fail(`Ambiguous managed analytics identity in ${spec.kind}.`);
      if (!matches.length)
        operations.push({
          version: spec.version,
          resource: `${spec.parent}/${spec.kind}`,
          method: "POST",
          body: desired,
        });
      else
        patch(
          spec,
          matches[0],
          desired,
          changedFields(desired, matches[0], spec.fields),
        );
    }
  }
  for (const name of config.unmarkedKeyEvents) {
    const matches = state.keyEvents.filter((row) => row.eventName === name);
    if (matches.length > 1)
      fail("Ambiguous managed analytics identity in keyEvents.");
    if (matches.length) {
      if (matches[0].deletable !== true)
        fail("The explicitly unmarked key event is not deletable.");
      operations.push({
        version: "v1beta",
        resource: matches[0].name,
        method: "DELETE",
      });
    }
  }
  for (const spec of singletons)
    patch(
      spec,
      state[spec.kind],
      config[spec.kind],
      changedFields(config[spec.kind], state[spec.kind], spec.fields),
    );
  return operations;
}

export function snapshotAnalytics(config, state) {
  const { collections, singletons } = analyticsResources(config);
  const snapshot = structuredClone(config);
  const pick = (row, names) =>
    Object.fromEntries(
      names.filter((key) => own(row, key)).map((key) => [key, row[key]]),
    );
  for (const spec of collections) {
    const names = spec.configurationFields;
    snapshot[spec.kind] = state[spec.kind]
      .map((row) => {
        const selected = pick(row, names);
        if (spec.kind === "customDimensions" && row.scope !== "USER")
          delete selected.disallowAdsPersonalization;
        if (spec.kind === "eventCreateRules")
          selected.sourceCopyParameters ??= false;
        return selected;
      })
      .sort((a, b) => spec.identity(a).localeCompare(spec.identity(b)));
  }
  snapshot.unmarkedKeyEvents = config.unmarkedKeyEvents.filter(
    (name) => !state.keyEvents.some((row) => row.eventName === name),
  );
  for (const spec of singletons) {
    snapshot[spec.kind] = pick(state[spec.kind], spec.fields);
    for (const key of spec.fields) {
      if (typeof config[spec.kind][key] === "boolean")
        snapshot[spec.kind][key] ??= false;
    }
  }
  validateConfig(snapshot);
  // A pull must produce a configuration that compares cleanly to this read.
  return snapshot;
}
