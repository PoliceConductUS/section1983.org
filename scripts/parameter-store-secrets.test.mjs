import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const library = resolve("scripts/parameter-store-secrets.sh");

function run(
  t,
  names,
  overrides = {},
  loader = "load_parameter_store_secrets",
) {
  const dir = mkdtempSync(join(resolve(tmpdir()), "parameter-store-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const bin = join(dir, "bin");
  mkdirSync(bin);
  writeFileSync(
    join(bin, "aws"),
    `#!/usr/bin/env bash
printf '%s\\n' "$*" >> "$CALL_LOG"
name=""
while [[ $# -gt 0 ]]; do
  if [[ "$1" == "--name" ]]; then name="$2"; fi
  shift
done
if [[ "$name" == "$FAIL_NAME" ]]; then echo "\${FAIL_MESSAGE:-ParameterNotFound}" >&2; exit 254; fi
if [[ "$name" == "$EMPTY_NAME" ]]; then exit 0; fi
printf 'stored:%s' "$name"
`,
    { mode: 0o755 },
  );
  const callLog = join(dir, "calls");
  writeFileSync(callLog, "");
  const list = names.join(" ");
  const result = spawnSync(
    "bash",
    [
      "-c",
      `set -euo pipefail; source "${library}"; ${loader} ${list}; for n in ${list}; do printf '%s=%s\\n' "$n" "\${!n}"; done`,
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        BASH_ENV: "/dev/null",
        PATH: `${bin}:${process.env.PATH}`,
        CALL_LOG: callLog,
        FAIL_NAME: "",
        EMPTY_NAME: "",
        ...overrides,
      },
    },
  );
  return { result, calls: readFileSync(callLog, "utf8") };
}

test("each named secret is read decrypted and exported", (t) => {
  const { result, calls } = run(t, ["RESEND_API_KEY", "GITHUB_TOKEN"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.stdout,
    "RESEND_API_KEY=stored:/policeconduct/secrets/RESEND_API_KEY\nGITHUB_TOKEN=stored:/policeconduct/secrets/GITHUB_TOKEN\n",
  );
  const lines = calls.trim().split("\n");
  assert.equal(lines.length, 2);
  for (const line of lines) {
    assert.match(line, /^ssm get-parameter /);
    assert.match(line, /--with-decryption/);
    assert.match(line, /--region us-east-1/);
  }
});

test("the stored value replaces a value already in the environment", (t) => {
  const { result } = run(t, ["SENTRY_AUTH_TOKEN"], {
    SENTRY_AUTH_TOKEN: "stale-local-copy",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.stdout,
    "SENTRY_AUTH_TOKEN=stored:/policeconduct/secrets/SENTRY_AUTH_TOKEN\n",
  );
});

test("a parameter that cannot be read stops the caller and is named", (t) => {
  const { result } = run(t, ["RESEND_API_KEY", "GITHUB_TOKEN"], {
    FAIL_NAME: "/policeconduct/secrets/GITHUB_TOKEN",
  });
  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /could not read \/policeconduct\/secrets\/GITHUB_TOKEN/,
  );
  assert.equal(result.stdout, "");
});

test("an empty parameter stops the caller", (t) => {
  const { result } = run(t, ["RESEND_API_KEY"], {
    EMPTY_NAME: "/policeconduct/secrets/RESEND_API_KEY",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /is empty/);
});

const loadConfig = "load_parameter_store_config";
const configPath = (scope) =>
  `/policeconduct/config/${scope}/GOOGLE_CLOUD_PROJECT`;

test("shared settings come from default and replace a local value", (t) => {
  const { result, calls } = run(
    t,
    ["GOOGLE_CLOUD_PROJECT"],
    { GOOGLE_CLOUD_PROJECT: "stale-local-project" },
    loadConfig,
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.stdout,
    `GOOGLE_CLOUD_PROJECT=stored:${configPath("default")}\n`,
  );
  assert.match(calls, /^ssm get-parameter /);
  assert.doesNotMatch(calls, /--with-decryption/);
});

test("a value stored for the environment wins over default", (t) => {
  const { result } = run(
    t,
    ["GOOGLE_CLOUD_PROJECT"],
    { PARAMETER_STORE_ENVIRONMENT: "preview" },
    loadConfig,
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.stdout,
    `GOOGLE_CLOUD_PROJECT=stored:${configPath("preview")}\n`,
  );
});

test("an environment with no override falls back to default", (t) => {
  const { result } = run(
    t,
    ["GOOGLE_CLOUD_PROJECT"],
    {
      PARAMETER_STORE_ENVIRONMENT: "preview",
      FAIL_NAME: configPath("preview"),
    },
    loadConfig,
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.stdout,
    `GOOGLE_CLOUD_PROJECT=stored:${configPath("default")}\n`,
  );
});

test("a failure other than a missing override does not fall back", (t) => {
  const { result } = run(
    t,
    ["GOOGLE_CLOUD_PROJECT"],
    {
      PARAMETER_STORE_ENVIRONMENT: "preview",
      FAIL_NAME: configPath("preview"),
      FAIL_MESSAGE: "AccessDeniedException",
    },
    loadConfig,
  );
  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /could not read \/policeconduct\/config\/preview\//,
  );
  assert.equal(result.stdout, "");
});

test("a shared setting missing from default stops the caller and is named", (t) => {
  const { result } = run(
    t,
    ["GOOGLE_CLOUD_PROJECT"],
    { FAIL_NAME: configPath("default") },
    loadConfig,
  );
  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /could not read \/policeconduct\/config\/default\//,
  );
  assert.equal(result.stdout, "");
});
