import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

function run(t, script, overrides = {}) {
  const dir = mkdtempSync(join(resolve(tmpdir()), "tf-reads-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const bin = join(dir, "bin");
  mkdirSync(bin);
  writeFileSync(
    join(bin, "aws"),
    `#!/usr/bin/env bash
if [[ "$1" == "sts" ]]; then
  printf '%s' "$CALLER"
  exit "$IDENTITY_EXIT"
fi
if [[ "$2" == "$FAIL_OPERATION" ]]; then
  echo 'AccessDenied: read failed' >&2
  exit 23
fi
printf '%s' 'None'
`,
    { mode: 0o755 },
  );
  writeFileSync(
    join(bin, "terraform"),
    '#!/usr/bin/env bash\nprintf "%s" "$STATE"\nexit "$STATE_EXIT"\n',
    { mode: 0o755 },
  );
  return spawnSync("bash", [resolve(script), dir], {
    input: JSON.stringify({
      oac_name: "oac",
      index_function_name: "index",
      preview_function_name: "preview",
      site_alias: "example.org",
      preview_alias: "preview.example.org",
    }),
    encoding: "utf8",
    env: {
      ...process.env,
      BASH_ENV: "/dev/null",
      PATH: `${bin}:${process.env.PATH}`,
      CALLER: "123456789012",
      IDENTITY_EXIT: "0",
      STATE_EXIT: "0",
      FAIL_OPERATION: "",
      STATE: JSON.stringify({
        resources: [
          {
            mode: "managed",
            type: "aws_lambda_function",
            instances: [
              {
                attributes: {
                  arn: "arn:aws:lambda:us-east-1:123456789012:function:test",
                },
              },
            ],
          },
        ],
      }),
      ...overrides,
    },
  });
}

for (const [name, overrides, allowed] of [
  ["matching regional ARN", {}, true],
  ["STS fails after output", { IDENTITY_EXIT: "1" }, false],
  ["blank caller", { CALLER: "" }, false],
  ["missing caller", { CALLER: "None" }, false],
  ["state pull fails after output", { STATE_EXIT: "1" }, false],
  ["malformed state", { STATE: "bad json" }, false],
  ["no account evidence", { STATE: '{"resources":[]}' }, false],
  ["different account", { CALLER: "999999999999" }, false],
]) {
  test(`account guard: ${name}`, (t) => {
    const result = run(t, "scripts/require-terraform-account.sh", overrides);
    assert.equal(result.status === 0, allowed, result.stderr);
  });
}

test("apply wrapper stops before apply when account verification fails", (t) => {
  const dir = mkdtempSync(join(resolve(tmpdir()), "tf-wrapper-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const scripts = join(dir, "infrastructure/bootstrap/scripts");
  mkdirSync(scripts, { recursive: true });
  mkdirSync(join(dir, "scripts"));
  writeFileSync(
    join(scripts, "apply.sh"),
    readFileSync("infrastructure/bootstrap/scripts/apply.sh"),
  );
  writeFileSync(join(dir, "scripts/require-terraform-account.sh"), "exit 37\n");
  const bin = join(dir, "bin");
  mkdirSync(bin);
  writeFileSync(join(bin, "terraform"), "#!/bin/sh\necho APPLY_REACHED\n", {
    mode: 0o755,
  });
  const result = spawnSync("bash", [join(scripts, "apply.sh")], {
    encoding: "utf8",
    env: { PATH: `${bin}:${process.env.PATH}`, BASH_ENV: "/dev/null" },
  });
  assert.equal(result.status, 37, result.stderr);
  assert.doesNotMatch(result.stdout, /APPLY_REACHED/);
});

function resource(account, mode = "managed", partition = "aws") {
  return {
    mode,
    type: "aws_lambda_function",
    instances: [
      {
        attributes: {
          arn: `arn:${partition}:lambda:us-east-1:${account}:function:test`,
        },
      },
    ],
  };
}
for (const [name, resources, allowed] of [
  [
    "mixed managed accounts",
    [resource("123456789012"), resource("999999999999")],
    false,
  ],
  [
    "foreign data source excluded",
    [resource("123456789012"), resource("999999999999", "data")],
    true,
  ],
  [
    "data source alone is insufficient",
    [resource("123456789012", "data")],
    false,
  ],
  [
    "alternate ARN partition",
    [resource("123456789012", "managed", "aws-us-gov")],
    true,
  ],
]) {
  test(`account guard: ${name}`, (t) => {
    const result = run(t, "scripts/require-terraform-account.sh", {
      STATE: JSON.stringify({ resources }),
    });
    assert.equal(result.status === 0, allowed, result.stderr);
  });
}
for (const missing of ["aws", "terraform", "jq"]) {
  test(`account guard refuses missing ${missing}`, (t) => {
    const dir = mkdtempSync(join(resolve(tmpdir()), "tf-missing-"));
    t.after(() => rmSync(dir, { recursive: true, force: true }));
    for (const name of ["aws", "terraform", "jq"].filter(
      (name) => name !== missing,
    )) {
      writeFileSync(join(dir, name), "#!/bin/sh\nexit 0\n", { mode: 0o755 });
    }
    const result = spawnSync(
      "/bin/bash",
      [resolve("scripts/require-terraform-account.sh"), dir],
      {
        encoding: "utf8",
        env: { PATH: dir, BASH_ENV: "/dev/null" },
      },
    );
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, new RegExp(`${missing} is required`));
  });
}
