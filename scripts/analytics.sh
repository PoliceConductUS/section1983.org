#!/usr/bin/env bash
set -euo pipefail

# Runs the analytics configuration CLI with the organization's shared Google
# Cloud project, read from Parameter Store, as the API quota project.
# Usage: analytics.sh pull|compare|push
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOTENV_FILE="${REPO_ROOT}/.env"

# Read only AWS_PROFILE from the local .env, without sourcing it, when the
# shell has not set one.
if [[ -z "${AWS_PROFILE:-}" && -f "${DOTENV_FILE}" ]]; then
  env_profile="$(sed -n 's/^AWS_PROFILE=//p' "${DOTENV_FILE}" | tail -n 1 | tr -d "\"'")"
  if [[ -n "${env_profile}" ]]; then
    export AWS_PROFILE="${env_profile}"
  fi
fi

# shellcheck source=scripts/parameter-store-secrets.sh
source "${REPO_ROOT}/scripts/parameter-store-secrets.sh"
load_parameter_store_config GOOGLE_CLOUD_PROJECT

exec node "${REPO_ROOT}/scripts/analytics-config.mjs" "$@"
