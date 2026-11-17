import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const mainTf = readFileSync("infrastructure/bootstrap/main.tf", "utf8");
const deployWorkflow = readFileSync(".github/workflows/deploy.yml", "utf8");

// The text of one job in a workflow file: from its name to the next job.
function job(workflow, name) {
  const start = workflow.indexOf(`\n  ${name}:\n`);
  assert.notEqual(start, -1, `no job named ${name}`);
  const rest = workflow.slice(start + 1);
  const next = rest.slice(1).search(/\n  [\w-]+:\n/);
  return next === -1 ? rest : rest.slice(0, next + 1);
}

// The JavaScript of each CloudFront function, keyed by resource name.
function cloudFrontFunctions(source) {
  const found = {};
  const pattern =
    /resource "aws_cloudfront_function" "(\w+)" \{[\s\S]*?code\s*=\s*<<-EOF\n([\s\S]*?)\nEOF\n/g;
  for (const [, name, code] of source.matchAll(pattern)) {
    // Stand in for Terraform's ${...} values so the code can be parsed.
    found[name] = code.replace(/\$\{[^}]*\}/g, "placeholder");
  }
  return found;
}

test("each CloudFront function is valid JavaScript", () => {
  const functions = cloudFrontFunctions(mainTf);
  assert.deepEqual(Object.keys(functions).sort(), [
    "index_rewrite",
    "preview_router",
  ]);
  for (const [name, code] of Object.entries(functions)) {
    assert.doesNotThrow(
      () => new vm.Script(code),
      `aws_cloudfront_function.${name} has a JavaScript syntax error`,
    );
    assert.match(code, /function handler\(event\)/);
  }
});

test("the production deploy applies infrastructure first", () => {
  const infra = job(deployWorkflow, "infra");
  assert.match(infra, /run: npm run infra:apply -- -auto-approve\n/);
  assert.match(infra, /environment: production\n/);
  assert.match(infra, /role-to-assume: \$\{\{ vars\.AWS_INFRA_ROLE_ARN \}\}/);

  const deploy = job(deployWorkflow, "deploy");
  assert.match(deploy, /needs: infra\n/);
  assert.match(deploy, /role-to-assume: \$\{\{ vars\.AWS_ROLE_ARN \}\}/);
});

test("a running infrastructure apply is never cancelled", () => {
  // Workflow-level concurrency would cancel the apply along with the deploy.
  assert.doesNotMatch(deployWorkflow, /^concurrency:/m);
  assert.match(
    job(deployWorkflow, "infra"),
    /concurrency:\n\s+group: infra-production\n\s+cancel-in-progress: false\n/,
  );
});

test("no AWS role trusts every branch and workflow of the repository", () => {
  const subjects = [
    ...mainTf.matchAll(
      /variable = "token\.actions\.githubusercontent\.com:sub"\n\s+values\s+= (.+)\n/g,
    ),
  ].map((match) => match[1]);
  assert.deepEqual(subjects, [
    "values(local.github_environment_subjects)",
    '[local.github_environment_subjects["production"]]',
  ]);
  assert.match(
    mainTf,
    /"repo:\$\{var\.github_org\}\/\$\{var\.github_repo\}:environment:\$\{name\}"/,
  );
  assert.doesNotMatch(mainTf, /github_repo\}:\*"/);
});

test("the production environment accepts only the main branch", () => {
  assert.match(
    mainTf,
    /resource "github_repository_environment_deployment_policy" "production_main" \{[^}]*branch_pattern = "main"/,
  );
});
