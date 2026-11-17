#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
DOTENV_FILE="${REPO_ROOT}/.env"

# The checks below need the operator's AWS profile. Read only that key from the
# local .env, without sourcing it, when the shell has not set one.
if [[ -z "${AWS_PROFILE:-}" && -f "${DOTENV_FILE}" ]]; then
  env_profile="$(sed -n 's/^AWS_PROFILE=//p' "${DOTENV_FILE}" | tail -n 1 | tr -d "\"'")"
  if [[ -n "${env_profile}" ]]; then
    export AWS_PROFILE="${env_profile}"
  fi
fi

# Refuse a checkout that cannot read the existing state before anything else.
bash "${REPO_ROOT}/scripts/require-terraform-state.sh" "${ROOT_DIR}"
bash "${REPO_ROOT}/scripts/require-terraform-account.sh" "${ROOT_DIR}"

# Secrets come only from Parameter Store; the stored value replaces any local copy.
# shellcheck source=scripts/parameter-store-secrets.sh
source "${REPO_ROOT}/scripts/parameter-store-secrets.sh"
load_parameter_store_secrets SENTRY_AUTH_TOKEN GITHUB_TOKEN
export TF_VAR_sentry_auth_token="${SENTRY_AUTH_TOKEN}"

# In GitHub Actions, have the runner hide these values if anything prints them.
if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
  echo "::add-mask::${SENTRY_AUTH_TOKEN}"
  echo "::add-mask::${GITHUB_TOKEN}"
fi

# With -refresh-only, show settings that were changed outside Terraform, ask
# for 'yes', then record them in the state. Live infrastructure is not changed.
for arg in "$@"; do
  if [[ "${arg}" == "-refresh-only" || "${arg}" == "--refresh-only" ]]; then
    terraform -chdir="${ROOT_DIR}" apply -refresh-only
    exit 0
  fi
done

# Plan once, refuse destroys nobody approved, then apply exactly that plan.
# With -plan-only it stops after the plan and the destroy check.
bash "${REPO_ROOT}/scripts/terraform-reviewed-apply.sh" "${ROOT_DIR}" "$@"

for arg in "$@"; do
  if [[ "${arg}" == "-plan-only" || "${arg}" == "--plan-only" ]]; then
    exit 0
  fi
done
echo "Bootstrap apply complete."
