#!/usr/bin/env bash
set -euo pipefail

# Infrastructure tasks for the Terraform stack in infrastructure/bootstrap.
# Each task has an npm script: npm run infra:<task>.
# infrastructure/README.md describes when to use each one.
# Usage: infra.sh TASK [arguments...]
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STACK_DIR="${REPO_ROOT}/infrastructure/bootstrap"
DOTENV_FILE="${REPO_ROOT}/.env"

usage() {
  cat >&2 <<'USAGE'
Usage: infra.sh TASK [arguments...]

  apply       Make live infrastructure match the code. Shows every change and
              asks for 'yes' first
  diff        Show how live infrastructure differs from the code. Changes nothing
  refresh     Record settings changed outside Terraform in the state. Shows
              them and asks for 'yes' first
  outputs     Print deployed names and IDs, or the one output named
  doctor      Check that this machine and account can do infrastructure work
  add:secret NAME...
              Store a secret in Parameter Store, or replace its value. Asks
              for each value with hidden input
  format      Rewrite the Terraform files in standard format
  format:validate
              Fail when a Terraform file is not in standard format or the
              configuration has an error. Reads only the files: no AWS access
  setup-user  Create or update the least-privilege IAM user for this stack
USAGE
}

# Read only AWS_PROFILE from the local .env, without sourcing it, when the
# shell has not set one.
if [[ -z "${AWS_PROFILE:-}" && -f "${DOTENV_FILE}" ]]; then
  env_profile="$(sed -n 's/^AWS_PROFILE=//p' "${DOTENV_FILE}" | tail -n 1 | tr -d "\"'")"
  if [[ -n "${env_profile}" ]]; then
    export AWS_PROFILE="${env_profile}"
  fi
fi

require_tools() {
  local tool
  for tool in "$@"; do
    if ! command -v "${tool}" >/dev/null; then
      echo "Error: ${tool} is required and is not installed." >&2
      exit 1
    fi
  done
}

require_aws_access() {
  local identity
  if ! identity="$(aws sts get-caller-identity --query Arn --output text 2>&1)"; then
    echo "Error: AWS credentials are missing or expired." >&2
    echo "${identity}" >&2
    echo "Set AWS_PROFILE, in the shell or in .env, to a profile for the account that holds the Terraform state, and sign in." >&2
    exit 1
  fi
  echo "AWS identity: ${identity}"
}

# A new checkout or worktree has no providers and no link to the state bucket.
# terraform init is safe to repeat, and -input=false stops it from offering to
# create or move state.
ensure_initialized() {
  if [[ -f "${STACK_DIR}/.terraform/terraform.tfstate" ]] \
    && terraform -chdir="${STACK_DIR}" validate >/dev/null 2>&1; then
    return
  fi
  echo "Preparing this checkout for Terraform..."
  local log
  if ! log="$(terraform -chdir="${STACK_DIR}" init -input=false 2>&1)"; then
    echo "${log}" >&2
    echo "Error: terraform init failed. Nothing was changed." >&2
    exit 1
  fi
}

# Everything a task that reads live infrastructure needs first.
prepare() {
  require_tools terraform aws jq
  require_aws_access
  ensure_initialized
}

task="${1:-}"
if [[ $# -gt 0 ]]; then
  shift
fi

case "${task}" in
  apply)
    prepare
    exec bash "${STACK_DIR}/scripts/apply.sh" "$@"
    ;;
  diff)
    prepare
    exec bash "${STACK_DIR}/scripts/apply.sh" -plan-only "$@"
    ;;
  refresh)
    prepare
    exec bash "${STACK_DIR}/scripts/apply.sh" -refresh-only "$@"
    ;;
  outputs)
    prepare >&2
    terraform -chdir="${STACK_DIR}" output "$@"
    ;;
  doctor)
    prepare
    bash "${REPO_ROOT}/scripts/require-terraform-state.sh" "${STACK_DIR}"
    echo "Terraform state: readable"
    bash "${REPO_ROOT}/scripts/require-terraform-account.sh" "${STACK_DIR}"
    echo "AWS account: matches the state"
    (
      # shellcheck source=scripts/parameter-store-secrets.sh
      source "${REPO_ROOT}/scripts/parameter-store-secrets.sh"
      load_parameter_store_secrets SENTRY_AUTH_TOKEN GITHUB_TOKEN
    )
    echo "Parameter Store secrets: readable"
    echo "Ready for infrastructure work."
    ;;
  format:validate)
    require_tools terraform
    terraform -chdir="${STACK_DIR}" fmt -check -diff -recursive
    # Validation needs the providers. Fetch them without touching the state
    # when this checkout has never been prepared.
    if [[ ! -d "${STACK_DIR}/.terraform" ]]; then
      terraform -chdir="${STACK_DIR}" init -backend=false -input=false >/dev/null
    fi
    terraform -chdir="${STACK_DIR}" validate
    ;;
  format)
    require_tools terraform
    terraform -chdir="${STACK_DIR}" fmt -recursive "$@"
    ;;
  add:secret)
    require_tools aws jq
    if [[ $# -eq 0 ]]; then
      echo "Usage: npm run infra:add:secret -- NAME [NAME...]" >&2
      echo "Give only the names. Each value is asked for with hidden input." >&2
      exit 2
    fi
    for name in "$@"; do
      if [[ ! "${name}" =~ ^[A-Z][A-Z0-9_]*$ ]]; then
        echo "Error: '${name}' is not a secret name. Use capitals, digits and underscores, such as SENTRY_AUTH_TOKEN." >&2
        echo "Give only the names. Each value is asked for with hidden input, so it stays out of the shell history." >&2
        exit 2
      fi
    done
    require_aws_access
    # mktemp -d makes a directory only this user can read.
    secret_dir="$(mktemp -d)"
    trap 'rm -rf "${secret_dir}"' EXIT
    for name in "$@"; do
      # A terminal gets a hidden prompt. Piped input gives one value per line.
      if [[ -t 0 ]]; then
        read -r -s -p "Value for ${name} (input is hidden): " value
        echo >&2
      else
        IFS= read -r value || true
      fi
      if [[ -z "${value}" ]]; then
        echo "Error: no value given for ${name}. Nothing was stored for it." >&2
        exit 1
      fi
      # The value reaches aws in a private temporary file, never on a command
      # line, where other processes could read it.
      printf '%s' "${value}" \
        | jq -Rsc --arg name "/policeconduct/secrets/${name}" \
          '{Name: $name, Value: ., Type: "SecureString", Overwrite: true}' \
          >"${secret_dir}/payload.json"
      aws ssm put-parameter \
        --region "${PARAMETER_STORE_REGION:-us-east-1}" \
        --cli-input-json "file://${secret_dir}/payload.json" >/dev/null
      rm -f "${secret_dir}/payload.json"
      unset value
      echo "Stored /policeconduct/secrets/${name}"
    done
    echo "Run 'npm run infra:apply' to pass a changed secret on to GitHub."
    ;;
  setup-user)
    require_tools aws
    exec bash "${STACK_DIR}/create-bootstrap-user.sh" "$@"
    ;;
  *)
    if [[ -n "${task}" ]]; then
      echo "Error: unknown task '${task}'." >&2
    fi
    usage
    exit 2
    ;;
esac
