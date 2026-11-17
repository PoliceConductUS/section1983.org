#!/usr/bin/env bash
set -euo pipefail

# Runs one infrastructure command against the Terraform stack in
# infrastructure/bootstrap. Each command has an npm script: npm run infra:<command>.
# infrastructure/README.md describes what each one does.
# Usage: infra.sh COMMAND [arguments...]
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STACK_DIR="${REPO_ROOT}/infrastructure/bootstrap"
DOTENV_FILE="${REPO_ROOT}/.env"

usage() {
  cat >&2 <<'USAGE'
Usage: infra.sh COMMAND [arguments...]

  account       Show the AWS account and identity the commands will use
  init          Download providers and connect to the state bucket
  plan          Show what apply would change. Changes nothing
  apply         Plan, refuse unapproved destroys, ask for 'yes', then apply
  output        Print the stack's outputs, or the one output named
  format        Rewrite the Terraform files in standard format
  format:check  Fail when a Terraform file is not in standard format
  validate      Check the Terraform configuration for errors
  create-user   Create or update the least-privilege IAM user for this stack
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

command="${1:-}"
if [[ $# -gt 0 ]]; then
  shift
fi

case "${command}" in
  account)
    aws sts get-caller-identity "$@"
    ;;
  init)
    terraform -chdir="${STACK_DIR}" init "$@"
    ;;
  plan)
    exec bash "${STACK_DIR}/scripts/apply.sh" -plan-only "$@"
    ;;
  apply)
    exec bash "${STACK_DIR}/scripts/apply.sh" "$@"
    ;;
  output)
    terraform -chdir="${STACK_DIR}" output "$@"
    ;;
  format)
    terraform -chdir="${STACK_DIR}" fmt -recursive "$@"
    ;;
  format:check)
    terraform -chdir="${STACK_DIR}" fmt -check -diff -recursive "$@"
    ;;
  validate)
    terraform -chdir="${STACK_DIR}" validate "$@"
    ;;
  create-user)
    exec bash "${STACK_DIR}/create-bootstrap-user.sh" "$@"
    ;;
  *)
    if [[ -n "${command}" ]]; then
      echo "Error: unknown command '${command}'." >&2
    fi
    usage
    exit 2
    ;;
esac
