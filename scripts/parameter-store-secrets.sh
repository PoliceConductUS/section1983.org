#!/usr/bin/env bash
# Sourced, not executed. Values shared by every PoliceConductUS repository live
# in AWS Systems Manager Parameter Store:
#   /policeconduct/secrets/<ENV_NAME>  SecureString  secrets
#   /policeconduct/config/default/<ENV_NAME>        String  shared settings, not secret
#   /policeconduct/config/<environment>/<ENV_NAME>  String  override for one environment,
#                                                           such as production or preview

# Usage: load_parameter_store_secrets ENV_NAME...
# Exports each named secret. The stored value replaces any value already in the
# environment, so a stale local copy can never be used.
load_parameter_store_secrets() {
  local name value
  for name in "$@"; do
    if ! value="$(aws ssm get-parameter \
      --region "${PARAMETER_STORE_REGION:-us-east-1}" \
      --name "/policeconduct/secrets/${name}" \
      --with-decryption \
      --query Parameter.Value \
      --output text)"; then
      echo "Error: could not read /policeconduct/secrets/${name} from Parameter Store." >&2
      echo "Check AWS_PROFILE and that the parameter exists." >&2
      return 1
    fi
    if [[ -z "${value}" || "${value}" == "None" ]]; then
      echo "Error: /policeconduct/secrets/${name} in Parameter Store is empty." >&2
      return 1
    fi
    export "${name}=${value}"
  done
}

# Usage: load_parameter_store_config ENV_NAME...
# Exports each named shared setting, such as GOOGLE_CLOUD_PROJECT. When
# PARAMETER_STORE_ENVIRONMENT is set (production, preview, ...), a value stored
# for that environment wins; otherwise the value under default is used. The
# stored value replaces any value already in the environment, so every
# repository and every operator uses the same one.
load_parameter_store_config() {
  local name value scope error found
  local scopes=("default")
  if [[ -n "${PARAMETER_STORE_ENVIRONMENT:-}" ]]; then
    scopes=("${PARAMETER_STORE_ENVIRONMENT}" "default")
  fi
  for name in "$@"; do
    found=0
    for scope in "${scopes[@]}"; do
      if value="$(aws ssm get-parameter \
        --region "${PARAMETER_STORE_REGION:-us-east-1}" \
        --name "/policeconduct/config/${scope}/${name}" \
        --query Parameter.Value \
        --output text 2>&1)"; then
        found=1
        break
      fi
      error="${value}"
      # Only a missing override falls through to default. Any other failure,
      # such as denied access, must stop the caller.
      if [[ "${scope}" == "default" || "${error}" != *ParameterNotFound* ]]; then
        echo "Error: could not read /policeconduct/config/${scope}/${name} from Parameter Store." >&2
        echo "${error}" >&2
        echo "Check AWS_PROFILE and that the parameter exists." >&2
        return 1
      fi
    done
    if [[ ${found} -eq 0 || -z "${value}" || "${value}" == "None" ]]; then
      echo "Error: /policeconduct/config/${scope}/${name} in Parameter Store is empty." >&2
      return 1
    fi
    export "${name}=${value}"
  done
}
