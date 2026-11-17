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

const reviewedApply = resolve("scripts/terraform-reviewed-apply.sh");
const infra = resolve("scripts/infra.sh");
const stackDir = resolve("infrastructure/bootstrap");

// A stand-in terraform that records each call. `plan` exits with PLAN_EXIT
// (2 means the plan has changes) and `show` prints a plan with no destroys.
function stubTerraform(t) {
  const dir = mkdtempSync(join(resolve(tmpdir()), "tf-reviewed-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const bin = join(dir, "bin");
  mkdirSync(bin);
  const log = join(dir, "calls");
  writeFileSync(log, "");
  writeFileSync(
    join(bin, "terraform"),
    `#!/bin/sh
printf '%s\\n' "$*" >> "${log}"
case "$2" in
  plan) exit "\${PLAN_EXIT:-2}" ;;
  show) printf '%s' '{"resource_changes":[]}' ;;
esac
`,
    { mode: 0o755 },
  );
  const env = {
    ...process.env,
    BASH_ENV: "/dev/null",
    PATH: `${bin}:${process.env.PATH}`,
  };
  delete env.TERRAFORM_APPROVED_DESTROYS;
  const calls = () =>
    readFileSync(log, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => line.split(" ").slice(1).join(" "));
  return { dir, env, calls };
}

function subcommands(calls) {
  return calls().map((call) => call.split(" ")[0]);
}

test("-plan-only shows the plan and never applies", (t) => {
  const { dir, env, calls } = stubTerraform(t);
  const result = spawnSync("bash", [reviewedApply, dir, "-plan-only"], {
    env,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Plan only\. Nothing was changed\./);
  assert.deepEqual(subcommands(calls), ["plan", "show"]);
  assert.doesNotMatch(calls()[0], /plan-only/);
});

test("-plan-only reports a matching stack without applying", (t) => {
  const { dir, env, calls } = stubTerraform(t);
  const result = spawnSync("bash", [reviewedApply, dir, "-plan-only"], {
    env: { ...env, PLAN_EXIT: "0" },
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Nothing to apply/);
  assert.deepEqual(subcommands(calls), ["plan"]);
});

test("an answer other than yes cancels the apply", (t) => {
  const { dir, env, calls } = stubTerraform(t);
  const result = spawnSync("bash", [reviewedApply, dir], {
    env,
    input: "y\n",
    encoding: "utf8",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Apply cancelled/);
  assert.deepEqual(subcommands(calls), ["plan", "show"]);
});

test("yes applies the plan that was shown", (t) => {
  const { dir, env, calls } = stubTerraform(t);
  const result = spawnSync("bash", [reviewedApply, dir], {
    env,
    input: "yes\n",
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(subcommands(calls), ["plan", "show", "apply"]);
  const planFile = calls()[0].match(/-out=(\S+)/)[1];
  assert.equal(calls()[2], `apply ${planFile}`);
});

test("infra.sh runs terraform commands in the bootstrap stack", (t) => {
  const { env, calls } = stubTerraform(t);
  const cases = [
    [["output", "route53_name_servers"], "output route53_name_servers"],
    [["init"], "init"],
    [["format"], "fmt -recursive"],
    [["format:check"], "fmt -check -diff -recursive"],
    [["validate"], "validate"],
  ];
  for (const [args] of cases) {
    const result = spawnSync("bash", [infra, ...args], {
      env,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
  }
  assert.deepEqual(
    calls(),
    cases.map(([, expected]) => expected),
  );
  for (const line of readFileSync(
    join(env.PATH.split(":")[0], "..", "calls"),
    "utf8",
  )
    .split("\n")
    .filter(Boolean)) {
    assert.equal(line.split(" ")[0], `-chdir=${stackDir}`);
  }
});

test("infra.sh refuses an unknown command and lists the commands", (t) => {
  const { env, calls } = stubTerraform(t);
  for (const args of [["destroy"], []]) {
    const result = spawnSync("bash", [infra, ...args], {
      env,
      encoding: "utf8",
    });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /Usage: infra\.sh COMMAND/);
  }
  assert.deepEqual(calls(), []);
});

test("every infra npm script names a command infra.sh accepts", () => {
  const { scripts } = JSON.parse(readFileSync("package.json", "utf8"));
  const source = readFileSync(infra, "utf8");
  const names = Object.keys(scripts).filter((name) =>
    name.startsWith("infra:"),
  );
  assert.ok(names.length > 0);
  for (const name of names) {
    const command = name.slice("infra:".length);
    assert.equal(scripts[name], `bash scripts/infra.sh ${command}`);
    assert.match(
      source,
      new RegExp(`^  ${command.replace(":", "\\:")}\\)$`, "m"),
    );
  }
});
