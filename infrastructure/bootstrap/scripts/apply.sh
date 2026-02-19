#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

preflight_account_check() {
  if command -v aws >/dev/null 2>&1; then
    :
  else
    return 0
  fi
  if command -v jq >/dev/null 2>&1; then
    :
  else
    return 0
  fi

  local caller_account
  caller_account="$(aws sts get-caller-identity --query 'Account' --output text 2>/dev/null || true)"
  if [[ -z "${caller_account}" || "${caller_account}" == "None" ]]; then
    return 0
  fi

  local state_accounts
  state_accounts="$(
    terraform -chdir="${ROOT_DIR}" state pull 2>/dev/null \
      | jq -r '..|.arn? // empty' \
      | grep -Eo 'arn:aws:[^:]+::[0-9]{12}' \
      | grep -Eo '[0-9]{12}' \
      | sort -u \
      | tr '\n' ' ' \
      | sed -E 's/[[:space:]]+$//' || true
  )"

  if [[ -z "${state_accounts}" ]]; then
    return 0
  fi

  if echo "${state_accounts}" | grep -Eq "(^| )${caller_account}( |$)"; then
    :
  else
    echo "Error: AWS account mismatch detected before terraform apply." >&2
    echo "Active caller account: ${caller_account}" >&2
    echo "Terraform state references account(s): ${state_accounts}" >&2
    echo >&2
    echo "Use credentials/profile for one of the state account IDs above," >&2
    echo "or intentionally migrate state before applying." >&2
    exit 1
  fi
}

preflight_account_check
terraform -chdir="${ROOT_DIR}" apply "$@"
bash "${SCRIPT_DIR}/sync-env.sh"

echo "Bootstrap apply complete and .env synced."
