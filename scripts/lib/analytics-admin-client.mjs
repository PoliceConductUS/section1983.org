import {
  analyticsResources,
  fail,
  object,
  own,
  eventName,
} from "./analytics-config-model.mjs";

const snakeCase = (value) =>
  value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export function createAnalyticsAdminClient({
  config,
  token,
  quotaProject,
  fetchImpl = fetch,
}) {
  if (typeof token !== "string" || !token.trim())
    fail(
      "Set GOOGLE_ANALYTICS_ACCESS_TOKEN to an authorized OAuth access token.",
    );
  const { collections, singletons } = analyticsResources(config);
  async function request(version, resource, method = "GET", body, mask) {
    const url = new URL(
      `https://analyticsadmin.googleapis.com/${version}/${resource}`,
    );
    if (mask) url.searchParams.set("updateMask", mask.map(snakeCase).join(","));
    let response;
    try {
      response = await fetchImpl(url, {
        method,
        signal: AbortSignal.timeout(30000),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          // User credentials from the Cloud CLI need a project to bill
          // quota to; without it Google falls back to the CLI's own default.
          ...(quotaProject?.trim()
            ? { "x-goog-user-project": quotaProject.trim() }
            : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch {
      fail(
        "Analytics API request failed; check connectivity and authorization.",
      );
    }
    if (!response.ok)
      fail(`Analytics API ${method} failed (HTTP ${response.status}).`);
    let data;
    try {
      data = await response.json();
    } catch {
      fail("Invalid analytics API JSON response.");
    }
    if (!object(data) || own(data, "error"))
      fail("Invalid analytics API response.");
    return data;
  }
  async function readAll() {
    const state = {};
    for (const spec of collections) {
      const rows = [];
      const seenTokens = new Set();
      let pageToken = "";
      do {
        const path = `${spec.parent}/${spec.kind}`;
        const data = await request(
          spec.version,
          `${path}${pageToken ? `?pageToken=${encodeURIComponent(pageToken)}` : ""}`,
        );
        if (own(data, spec.kind) && !Array.isArray(data[spec.kind]))
          fail("Invalid analytics API collection response.");
        for (const row of data[spec.kind] ?? []) {
          if (
            !object(row) ||
            typeof row.name !== "string" ||
            !row.name.startsWith(`${path}/`) ||
            !/^[A-Za-z0-9_-]+$/.test(row.name.slice(path.length + 1)) ||
            typeof spec.identity(row) !== "string"
          )
            fail("Invalid analytics API resource response.");
          if (
            spec.kind === "customDimensions" &&
            (!eventName(row.parameterName) ||
              !["EVENT", "USER", "ITEM"].includes(row.scope))
          )
            fail("Invalid analytics API dimension response.");
          if (spec.kind === "keyEvents" && !eventName(row.eventName))
            fail("Invalid analytics API key event response.");
          if (
            spec.kind === "eventCreateRules" &&
            (!eventName(row.destinationEvent) ||
              !Array.isArray(row.eventConditions))
          )
            fail("Invalid analytics API event rule response.");
          rows.push(row);
        }
        pageToken = data.nextPageToken ?? "";
        if (
          typeof pageToken !== "string" ||
          (pageToken && seenTokens.has(pageToken))
        )
          fail("Invalid analytics API pagination response.");
        seenTokens.add(pageToken);
      } while (pageToken);
      state[spec.kind] = rows;
    }
    for (const spec of singletons) {
      state[spec.kind] = await request(
        spec.version,
        `${spec.parent}/${spec.kind}`,
      );
      if (state[spec.kind].name !== `${spec.parent}/${spec.kind}`)
        fail("Invalid analytics API settings response.");
    }
    return state;
  }
  return {
    readState: readAll,
    async applyChanges(operations) {
      for (const operation of operations) {
        await request(
          operation.version,
          operation.resource,
          operation.method,
          operation.body,
          operation.mask,
        );
      }
    },
  };
}
