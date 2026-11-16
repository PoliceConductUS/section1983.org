# Infrastructure

This repo uses one Terraform entrypoint:

1. `infrastructure/bootstrap` (one-time foundation + static-site infra)

## Zero-to-Deploy

Use these steps in order if you are starting from a brand-new AWS account.

1. Sign in to AWS Console as root and enable MFA.
2. Create IAM user `section1983-setup-admin`.
3. Attach `AdministratorAccess` to that user (setup phase only).
4. Create an access key for that user.
5. Configure local CLI and verify account:

```bash
aws configure --profile section1983-setup-admin
export AWS_PROFILE=section1983-setup-admin
aws sts get-caller-identity
```

6. Run bootstrap:

```bash
bash infrastructure/bootstrap/scripts/apply.sh
```

The wrapper needs AWS credentials for the account that holds the state; it reads
`AWS_PROFILE` from the git-ignored `.env` when the shell has not set one. Do not
run `terraform apply` directly.

7. If bootstrap created a new hosted zone, update nameservers at your registrar to the Route 53 values:

```bash
terraform -chdir=infrastructure/bootstrap output route53_name_servers
dig +short NS <your-domain>
```

8. Wait for DNS propagation, then re-run bootstrap apply if ACM is still pending:

```bash
terraform -chdir=infrastructure/bootstrap apply
```

If apply is waiting at `aws_acm_certificate_validation.site`, fetch nameservers from the just-created zone and update your registrar:

```bash
terraform -chdir=infrastructure/bootstrap output route53_name_servers
```

9. Bootstrap also creates GitHub environments and environment variables for workflows:
   `production` (`AWS_ROLE_ARN`, `S3_BUCKET`, `CLOUDFRONT_DIST_ID`) and
   `preview` (`AWS_ROLE_ARN`, `S3_BUCKET`, `CLOUDFRONT_DIST_ID`).
   If GA IDs are set in `section1983.auto.tfvars`, it also writes `PUBLIC_GA_MEASUREMENT_ID` per environment.
   If Sentry DSNs are set in `section1983.auto.tfvars`, it also writes `PUBLIC_SENTRY_DSN` and `PUBLIC_SENTRY_ENVIRONMENT` per environment.
   If `sentry_org`/`sentry_project` are set, workflows can upload source maps to Sentry.
   If `sentry_auth_token` is set in bootstrap inputs, bootstrap also writes `SENTRY_AUTH_TOKEN` as a GitHub environment secret for both environments.

If `bucket_name` is omitted in `infrastructure/bootstrap/section1983.auto.tfvars`, bootstrap uses `<project_name>-site-<account_id>`.

10. Optional hardening: remove `AdministratorAccess` from `section1983-setup-admin`, then disable or delete its access key.

## Account Selection

Terraform runs in whichever AWS account your active credentials point to.

```bash
aws sts get-caller-identity
```

To switch:

```bash
export AWS_PROFILE=<profile-name>
aws sts get-caller-identity
```

## GitHub Actions

Bootstrap is manual/local only and creates infra.

1. Run `infrastructure/bootstrap` locally once.
2. Then GitHub deploy workflows (`deploy.yml`, `preview.yml`, `preview-cleanup.yml`) only publish content and assume infra already exists.

Credentials used by deploy workflows:

1. OIDC role via `AWS_ROLE_ARN`

## More Detail

1. `infrastructure/bootstrap/README.md`
