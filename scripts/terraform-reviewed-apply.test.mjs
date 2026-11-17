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

// Stand-in terraform, aws and jq that record each call in one log.
// `terraform plan` exits with PLAN_EXIT (2 means the plan has changes),
// `terraform validate` with VALIDATE_EXIT, and `aws` with AWS_EXIT.
function stubTools(t) {
  const dir = mkdtempSync(join(resolve(tmpdir()), "tf-reviewed-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const bin = join(dir, "bin");
  mkdirSync(bin);
  const log = join(dir, "calls");
  writeFileSync(log, "");
  writeFileSync(
    join(bin, "terraform"),
    `#!/bin/sh
shift
printf 'terraform %s\\n' "$*" >> "${log}"
case "$1" in
  plan) exit "\${PLAN_EXIT:-2}" ;;
  validate) exit "\${VALIDATE_EXIT:-0}" ;;
  show) printf '%s' '{"resource_changes":[]}' ;;
esac
`,
    { mode: 0o755 },
  );
  writeFileSync(
    join(bin, "aws"),
    `#!/bin/sh
printf 'aws %s\\n' "$1 $2" >> "${log}"
if [ "\${AWS_EXIT:-0}" != "0" ]; then
  echo 'ExpiredToken: sign in again' >&2
  exit "$AWS_EXIT"
fi
printf '%s\\n' 'arn:aws:iam::123456789012:user/example'
`,
    { mode: 0o755 },
  );
  writeFileSync(join(bin, "jq"), "#!/bin/sh\ncat >/dev/null\n", {
    mode: 0o755,
  });
  const env = {
    ...process.env,
    BASH_ENV: "/dev/null",
    PATH: `${bin}:${process.env.PATH}`,
  };
  delete env.TERRAFORM_APPROVED_DESTROYS;
  delete env.AWS_PROFILE;
  const calls = () => readFileSync(log, "utf8").split("\n").filter(Boolean);
  return { dir, env, calls };
}

// The first word after the tool name: "plan", "show", "apply".
function terraformSubcommands(calls) {
  return calls()
    .filter((call) => call.startsWith("terraform "))
    .map((call) => call.split(" ")[1]);
}

test("-plan-only shows the plan and never applies", (t) => {
  const { dir, env, calls } = stubTools(t);
  const result = spawnSync("bash", [reviewedApply, dir, "-plan-only"], {
    env,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Plan only\. Nothing was changed\./);
  assert.deepEqual(terraformSubcommands(calls), ["plan", "show"]);
  assert.doesNotMatch(calls()[0], /plan-only/);
});

test("-plan-only reports a matching stack without applying", (t) => {
  const { dir, env, calls } = stubTools(t);
  const result = spawnSync("bash", [reviewedApply, dir, "-plan-only"], {
    env: { ...env, PLAN_EXIT: "0" },
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Nothing to apply/);
  assert.deepEqual(terraformSubcommands(calls), ["plan"]);
});

test("an answer other than yes cancels the apply", (t) => {
  const { dir, env, calls } = stubTools(t);
  const result = spawnSync("bash", [reviewedApply, dir], {
    env,
    input: "y\n",
    encoding: "utf8",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Apply cancelled/);
  assert.deepEqual(terraformSubcommands(calls), ["plan", "show"]);
});

test("yes applies the plan that was shown", (t) => {
  const { dir, env, calls } = stubTools(t);
  const result = spawnSync("bash", [reviewedApply, dir], {
    env,
    input: "yes\n",
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(terraformSubcommands(calls), ["plan", "show", "apply"]);
  const planFile = calls()[0].match(/-out=(\S+)/)[1];
  assert.equal(calls()[2], `terraform apply ${planFile}`);
});

// A copy of infra.sh in a throwaway repository, with a stand-in apply wrapper
// that reports the arguments it was handed.
function infraRepo(t, { initialized = false } = {}) {
  const tools = stubTools(t);
  const stack = join(tools.dir, "infrastructure/bootstrap");
  mkdirSync(join(stack, "scripts"), { recursive: true });
  mkdirSync(join(tools.dir, "scripts"));
  writeFileSync(
    join(tools.dir, "scripts/infra.sh"),
    readFileSync("scripts/infra.sh"),
  );
  writeFileSync(join(stack, "scripts/apply.sh"), 'echo "APPLY_WRAPPER $*"\n');
  for (const guard of [
    "require-terraform-state",
    "require-terraform-account",
  ]) {
    writeFileSync(join(tools.dir, `scripts/${guard}.sh`), "exit 0\n");
  }
  writeFileSync(
    join(tools.dir, "scripts/parameter-store-secrets.sh"),
    "load_parameter_store_secrets() { :; }\n",
  );
  if (initialized) {
    mkdirSync(join(stack, ".terraform"));
    writeFileSync(join(stack, ".terraform/terraform.tfstate"), "{}");
  }
  const run = (args, extraEnv = {}) =>
    spawnSync("bash", [join(tools.dir, "scripts/infra.sh"), ...args], {
      env: { ...tools.env, ...extraEnv },
      encoding: "utf8",
    });
  return { ...tools, run };
}

test("apply checks access and prepares a new checkout before the apply wrapper", (t) => {
  const { run, calls } = infraRepo(t);
  const result = run(["apply"]);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(calls(), [
    "aws sts get-caller-identity",
    "terraform init -input=false",
  ]);
  assert.match(result.stdout, /AWS identity: arn:aws:iam::123456789012/);
  assert.match(result.stdout, /APPLY_WRAPPER $/m);
});

test("a prepared checkout is not initialized again", (t) => {
  const { run, calls } = infraRepo(t, { initialized: true });
  const result = run(["apply", "-auto-approve"]);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(calls(), [
    "aws sts get-caller-identity",
    "terraform validate",
  ]);
  assert.match(result.stdout, /APPLY_WRAPPER -auto-approve$/m);
});

test("a prepared checkout whose providers changed is initialized again", (t) => {
  const { run, calls } = infraRepo(t, { initialized: true });
  const result = run(["apply"], { VALIDATE_EXIT: "1" });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(calls(), [
    "aws sts get-caller-identity",
    "terraform validate",
    "terraform init -input=false",
  ]);
});

test("diff and refresh reach the apply wrapper in their read-only modes", (t) => {
  const { run } = infraRepo(t, { initialized: true });
  assert.match(run(["diff"]).stdout, /APPLY_WRAPPER -plan-only$/m);
  assert.match(run(["refresh"]).stdout, /APPLY_WRAPPER -refresh-only$/m);
});

test("without AWS access nothing else runs", (t) => {
  const { run, calls } = infraRepo(t, { initialized: true });
  for (const task of ["apply", "diff", "refresh", "outputs", "doctor"]) {
    const result = run([task], { AWS_EXIT: "255" });
    assert.equal(result.status, 1, task);
    assert.match(result.stderr, /AWS credentials are missing or expired/);
    assert.match(result.stderr, /ExpiredToken/);
    assert.doesNotMatch(result.stdout, /APPLY_WRAPPER/);
  }
  assert.deepEqual([...new Set(calls())], ["aws sts get-caller-identity"]);
});

test("outputs prints only the outputs on standard output", (t) => {
  const { run, calls } = infraRepo(t, { initialized: true });
  const result = run(["outputs", "route53_name_servers"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "");
  assert.equal(calls().at(-1), "terraform output route53_name_servers");
});

test("doctor reports each check and reads no plan", (t) => {
  const { run, calls } = infraRepo(t, { initialized: true });
  const result = run(["doctor"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Terraform state: readable/);
  assert.match(result.stdout, /AWS account: matches the state/);
  assert.match(result.stdout, /Parameter Store secrets: readable/);
  assert.match(result.stdout, /Ready for infrastructure work\./);
  assert.deepEqual(terraformSubcommands(calls), ["validate"]);
});

test("lint and lint:fix need no AWS access", (t) => {
  const { run, calls } = infraRepo(t, { initialized: true });
  assert.equal(run(["lint"], { AWS_EXIT: "255" }).status, 0);
  assert.equal(run(["lint:fix"], { AWS_EXIT: "255" }).status, 0);
  assert.deepEqual(calls(), [
    "terraform fmt -check -diff -recursive",
    "terraform validate",
    "terraform fmt -recursive",
  ]);
});

test("lint fetches providers without the state in a new checkout", (t) => {
  const { run, calls } = infraRepo(t);
  assert.equal(run(["lint"]).status, 0);
  assert.deepEqual(calls(), [
    "terraform fmt -check -diff -recursive",
    "terraform init -backend=false -input=false",
    "terraform validate",
  ]);
});

test("an unknown task is refused and the tasks are listed", (t) => {
  const { run, calls } = infraRepo(t);
  for (const args of [["destroy"], ["plan"], []]) {
    const result = run(args);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /Usage: infra\.sh TASK/);
  }
  assert.deepEqual(calls(), []);
});

test("every infra npm script names a task infra.sh accepts", () => {
  const { scripts } = JSON.parse(readFileSync("package.json", "utf8"));
  const source = readFileSync("scripts/infra.sh", "utf8");
  const names = Object.keys(scripts).filter((name) =>
    name.startsWith("infra:"),
  );
  assert.ok(names.length > 0);
  for (const name of names) {
    const task = name.slice("infra:".length);
    assert.equal(scripts[name], `bash scripts/infra.sh ${task}`);
    assert.match(source, new RegExp(`^  ${task}\\)$`, "m"));
  }
});
