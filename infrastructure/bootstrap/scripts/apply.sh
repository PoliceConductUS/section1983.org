#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
DOTENV_FILE="${REPO_ROOT}/.env"

load_dotenv_if_present() {
  if [[ ! -f "${DOTENV_FILE}" ]]; then
    return 0
  fi

  set -a
  # shellcheck disable=SC1090
  source "${DOTENV_FILE}"
  set +a
}

normalize_tf_var_names() {
  local vars_file="${ROOT_DIR}/variables.tf"
  if [[ ! -f "${vars_file}" ]]; then
    return 0
  fi

  local -a expected_names
  mapfile -t expected_names < <(sed -En 's/^variable "([^"]+)".*/\1/p' "${vars_file}")

  local -A expected_set=()
  local name
  for name in "${expected_names[@]}"; do
    expected_set["${name}"]=1
  done

  local -a env_tf_var_keys=()
  mapfile -t env_tf_var_keys < <(env | sed -En 's/^(TF_VAR_[^=]+)=.*/\1/p')

  local -a conflicts=()
  local key raw_name lower_name expected_key
  for key in "${env_tf_var_keys[@]}"; do
    raw_name="${key#TF_VAR_}"
    if [[ -n "${expected_set[${raw_name}]+x}" ]]; then
      continue
    fi

    lower_name="$(printf "%s" "${raw_name}" | tr '[:upper:]' '[:lower:]')"
    if [[ "${raw_name}" == "${lower_name}" ]] || [[ -z "${expected_set[${lower_name}]+x}" ]]; then
      continue
    fi

    expected_key="TF_VAR_${lower_name}"
    if [[ -n "${!expected_key+x}" ]]; then
      if [[ "${!expected_key}" != "${!key}" ]]; then
        conflicts+=("  - ${key} conflicts with ${expected_key} (different values)")
      fi
      continue
    fi

    export "${expected_key}=${!key}"
  done

  if [[ ${#conflicts[@]} -gt 0 ]]; then
    echo "Error: Conflicting TF_VAR names found." >&2
    printf "%s\n" "${conflicts[@]}" >&2
    exit 1
  fi
}

preflight_explicit_tf_var_secrets() {
  # Prevent silently ignoring a common secret name that Terraform will not read.
  if [[ -n "${SENTRY_AUTH_TOKEN+x}" ]] \
    && [[ -z "${TF_VAR_sentry_auth_token+x}" ]] \
    && [[ -z "${TF_VAR_SENTRY_AUTH_TOKEN+x}" ]]; then
    echo "Error: SENTRY_AUTH_TOKEN is set, but Terraform reads TF_VAR_sentry_auth_token." >&2
    echo "Set TF_VAR_sentry_auth_token (or TF_VAR_SENTRY_AUTH_TOKEN) before apply." >&2
    exit 1
  fi
}

warn_if_sentry_tf_var_missing() {
  if [[ -z "${TF_VAR_sentry_auth_token+x}" ]] && [[ -z "${TF_VAR_SENTRY_AUTH_TOKEN+x}" ]]; then
    echo "Warning: TF_VAR_sentry_auth_token is not set." >&2
    echo "Warning: Bootstrap will not write GitHub environment secret SENTRY_AUTH_TOKEN." >&2
    echo "Warning: Deploy/preview workflows will fail at Sentry sourcemap upload." >&2
  fi
}

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

load_dotenv_if_present
normalize_tf_var_names
preflight_explicit_tf_var_secrets
warn_if_sentry_tf_var_missing
preflight_account_check
terraform -chdir="${ROOT_DIR}" apply "$@"
bash "${SCRIPT_DIR}/sync-env.sh"

echo "Bootstrap apply complete and .env synced."
