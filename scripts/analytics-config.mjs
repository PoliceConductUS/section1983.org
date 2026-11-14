import { readFile, writeFile, rename, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  AnalyticsError,
  fail,
  validateConfig,
} from "./lib/analytics-config-model.mjs";
import { createAnalyticsAdminClient } from "./lib/analytics-admin-client.mjs";
import { planAnalytics, snapshotAnalytics } from "./lib/analytics-plan.mjs";

const describeChange = ({ method, resource, mask, body }) => {
  let detail = "";
  if (mask) detail = ` (${mask.join(", ")})`;
  else if (method === "POST")
    detail = ` (${body.parameterName ?? body.eventName ?? body.destinationEvent})`;
  return `${method} ${resource}${detail}`;
};

export async function reconcileAnalytics({
  config,
  token,
  fetchImpl = fetch,
  apply = false,
  pull = false,
}) {
  validateConfig(config);
  const client = createAnalyticsAdminClient({ config, token, fetchImpl });
  const state = await client.readState();
  if (pull) return { changes: [], config: snapshotAnalytics(config, state) };
  const operations = planAnalytics(config, state);
  const changes = operations.map(describeChange);
  if (apply && operations.length) {
    await client.applyChanges(operations);
    if (planAnalytics(config, await client.readState()).length)
      fail("Analytics apply verification failed; managed differences remain.");
  }
  return { changes };
}

export async function runCli(
  args,
  {
    env = process.env,
    fetchImpl = fetch,
    stdout = (line) => process.stdout.write(`${line}\n`),
    configPath = new URL("../config/analytics.json", import.meta.url),
    stderr = (line) => process.stderr.write(`${line}\n`),
  } = {},
) {
  try {
    if (
      args.length !== 1 ||
      !["compare", "apply", "pull", "push"].includes(args[0])
    )
      fail(
        "Usage: npm run analytics:compare, analytics:pull, or analytics:push",
      );
    if (!env.GOOGLE_ANALYTICS_ACCESS_TOKEN?.trim())
      fail(
        "Set GOOGLE_ANALYTICS_ACCESS_TOKEN to an authorized OAuth access token.",
      );
    let config;
    try {
      config = JSON.parse(await readFile(configPath, "utf8"));
    } catch {
      fail("Cannot read valid JSON from config/analytics.json.");
    }
    const result = await reconcileAnalytics({
      config,
      token: env.GOOGLE_ANALYTICS_ACCESS_TOKEN,
      fetchImpl,
      apply: ["apply", "push"].includes(args[0]),
      pull: args[0] === "pull",
    });
    if (args[0] === "pull") {
      const destination =
        configPath instanceof URL ? fileURLToPath(configPath) : configPath;
      const temporary = `${destination}.${randomUUID()}.tmp`;
      try {
        await writeFile(
          temporary,
          `${JSON.stringify(result.config, null, 2)}\n`,
          { flag: "wx" },
        );
        await rename(temporary, destination);
      } finally {
        await unlink(temporary).catch(() => {});
      }
      stdout(
        "Remote analytics settings saved to config/analytics.json; review the Git diff before committing.",
      );
      return 0;
    }
    for (const change of result.changes) stdout(change);
    stdout(
      result.changes.length
        ? ["apply", "push"].includes(args[0])
          ? "Analytics changes applied and verified."
          : "Managed analytics settings differ."
        : "Managed analytics settings match.",
    );
    return args[0] === "compare" && result.changes.length ? 1 : 0;
  } catch (error) {
    const message =
      error instanceof AnalyticsError
        ? error.message
        : "Analytics configuration failed; check settings and API responses.";
    const token = env.GOOGLE_ANALYTICS_ACCESS_TOKEN;
    stderr(token ? message.replaceAll(token, "[redacted]") : message);
    return 2;
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  process.exitCode = await runCli(process.argv.slice(2));
