# Terraform Bootstrap (One-Time Infra)

This is the single Terraform entrypoint for infrastructure.

It creates:

- GitHub OIDC provider
- IAM role for GitHub Actions
- GitHub environments (`production`, `preview`) and environment variables used by workflows
- S3 bucket for Terraform state
- S3 bucket for PR preview content
- Production site bucket
- CloudFront distribution + OAC + function
- ACM certificate in `us-east-1` + DNS validation
- Route53 hosted zone + records

## Usage

```bash
cd infrastructure/bootstrap
cp terraform.tfvars.example terraform.tfvars
export GITHUB_TOKEN=<github-token-with-repo-admin-access>
terraform init
bash scripts/apply.sh
```

## Using .env

You can keep local values in `.env` (gitignored), then load before Terraform:

```bash
set -a
source .env
set +a
bash infrastructure/bootstrap/scripts/apply.sh
```

Example `.env` keys:

- `GITHUB_TOKEN`
- `TF_VAR_public_ga_measurement_id_production`
- `TF_VAR_public_ga_measurement_id_preview`
- `TF_STATE_BUCKET`
- `AWS_ROLE_ARN`
- `S3_BUCKET`
- `CLOUDFRONT_DIST_ID`

`scripts/apply.sh` runs Terraform apply and then syncs `.env`.
The sync step comments any existing matching `KEY=...` line in `.env` and appends the latest value from Terraform outputs.
It also writes all outputs as `TF_OUT_<OUTPUT_NAME>` keys (uppercase, non-alphanumeric chars replaced with `_`).

## Which AWS Account Is Used?

Terraform uses the active AWS credentials in your shell.

```bash
aws sts get-caller-identity
```

Use a specific profile:

```bash
export AWS_PROFILE=<profile-name>
aws sts get-caller-identity
```

## First Domain Delegation

After first apply, update your registrar nameservers:

```bash
terraform -chdir=infrastructure/bootstrap output route53_name_servers
dig +short NS <your-domain>
```

Then re-run `terraform apply` until ACM status is issued.

CloudFront bootstrap is idempotent for names:

- If `${project_name}-oac`, `${project_name}-index-rewrite`, or `${project_name}-preview-router` already exist, Terraform reuses them instead of trying to recreate them.
- If distributions already exist with aliases `${domain_name}` or `*.preview.${domain_name}`, Terraform imports and reuses them.

## DNS Records Included

Bootstrap applies DNS records from `extra_dns_records` in `terraform.tfvars`.

Current default includes Google Workspace MX:

- `@ MX 1 smtp.google.com.`

Add your domain-specific TXT verification/DKIM records in local `terraform.tfvars` under `extra_dns_records` so they are applied with the zone.

## GitHub Environments + Vars

Terraform manages these GitHub environments automatically:

- `production`
- `preview`

And sets these environment variables automatically:

- `production`: `AWS_ROLE_ARN`, `S3_BUCKET`, `CLOUDFRONT_DIST_ID`
- `preview`: `AWS_ROLE_ARN`, `S3_BUCKET`, `CLOUDFRONT_DIST_ID`

Optional GA inputs in `terraform.tfvars`:

- `public_ga_measurement_id_production`
- `public_ga_measurement_id_preview`

If set, Terraform also creates `PUBLIC_GA_MEASUREMENT_ID` in the matching GitHub environment.
If unset/null, no GA variable is written and the GA component renders nothing.

## Notes

- Normal deploys do not run Terraform. GitHub Actions only sync files to S3 and invalidate CloudFront.
- Run Terraform again only when infra changes.
