# Terraform Bootstrap (One-Time Infra)

This is the single Terraform entrypoint for infrastructure.

It creates:

- GitHub OIDC provider
- IAM roles for GitHub Actions: one publishes the live site, one publishes previews, one applies this stack
- GitHub environments (`production`, `preview`) and environment variables used by workflows
- S3 bucket for Terraform state
- S3 bucket for PR preview content
- Production site bucket
- CloudFront distribution + OAC + function
- ACM certificate in `us-east-1` + DNS validation
- Route53 hosted zone + records

## Usage

```bash
npm run infra:apply
```

It shows every change and asks for `yes` before it applies. Do not run
`terraform` directly. `infrastructure/README.md` lists every `npm run infra:*`
command and when to use it.

## Where values come from

- **State** is in the S3 bucket `section1983-tfstate-942370948729` (`backend.tf`), so every checkout and worktree reads the same state.
- **Inputs** are tracked in `section1983.auto.tfvars`, which Terraform loads on every plan and apply. Secrets never go in that file.
- **Secrets** live only in AWS Systems Manager Parameter Store, as SecureString parameters named `/policeconduct/secrets/<NAME>`. This stack uses `SENTRY_AUTH_TOKEN` and `GITHUB_TOKEN`, which it shares with policeconduct.org. The stored value replaces any local copy. Store or replace one with `npm run infra:add:secret -- NAME`.
- **Deployed resource names** are Terraform outputs: `npm run infra:outputs`. Nothing copies them into a file.
- **Machine settings** go in the git-ignored `.env`: `AWS_PROFILE`, and the public `PUBLIC_SENTRY_DSN` and `PUBLIC_SENTRY_ENVIRONMENT` for local builds.

Before it changes anything, `npm run infra:apply`:

- refuses a checkout that cannot read the existing state, and an AWS account that does not match it;
- writes one plan, and refuses it when it destroys or replaces a resource whose address is not listed, one per line, in `TERRAFORM_APPROVED_DESTROYS`;
- asks for `yes`, then applies exactly that plan. When live infrastructure already matches, it applies nothing.

`npm run infra:diff` does the same checks and shows the same changes, then stops.

## Which AWS Account Is Used?

Terraform uses the active AWS credentials in your shell.

```bash
npm run infra:doctor
```

Use a specific profile:

```bash
export AWS_PROFILE=<profile-name>
npm run infra:doctor
```

## First Domain Delegation

After first apply, update your registrar nameservers:

```bash
npm run infra:outputs -- route53_name_servers
dig +short NS <your-domain>
```

Then re-run `npm run infra:apply` until ACM status is issued.

CloudFront bootstrap is idempotent for names:

- If `${project_name}-oac`, `${project_name}-index-rewrite`, or `${project_name}-preview-router` already exist, Terraform reuses them instead of trying to recreate them.
- If distributions already exist with aliases `${domain_name}` or `*.preview.${domain_name}`, Terraform imports and reuses them.

## DNS Records Included

Bootstrap applies DNS records from `extra_dns_records` in `section1983.auto.tfvars`.

Current default includes Google Workspace MX:

- `@ MX 1 smtp.google.com.`

Add your domain-specific TXT verification/DKIM records in `section1983.auto.tfvars` under `extra_dns_records` so they are applied with the zone.

## GitHub Environments + Vars

Terraform manages these GitHub environments automatically:

- `production`
- `preview`

And sets these environment variables automatically:

- `production`: `AWS_ROLE_ARN`, `AWS_INFRA_ROLE_ARN`, `S3_BUCKET`, `CLOUDFRONT_DIST_ID`
- `preview`: `AWS_ROLE_ARN`, `S3_BUCKET`, `CLOUDFRONT_DIST_ID`

Optional GA inputs in `section1983.auto.tfvars`:

- `public_ga_measurement_id_production`
- `public_ga_measurement_id_preview`

If set, Terraform also creates `PUBLIC_GA_MEASUREMENT_ID` in the matching GitHub environment.
If unset/null, no GA variable is written and the GA component renders nothing.

Optional Sentry inputs in `section1983.auto.tfvars`:

- `public_sentry_dsn_production`
- `public_sentry_dsn_preview`
- `sentry_org`
- `sentry_project`

If set, Terraform creates `PUBLIC_SENTRY_DSN` and `PUBLIC_SENTRY_ENVIRONMENT` in the matching GitHub environment.
If unset/null, Sentry is not initialized in that environment.
If `sentry_org` and `sentry_project` are set, workflows can upload source maps to Sentry.
If `sentry_auth_token` is set, Terraform also writes `SENTRY_AUTH_TOKEN` as a GitHub environment secret in both `production` and `preview`.

## Notes

- Every production deploy runs `npm run infra:apply -- -auto-approve` first, then syncs files to S3 and invalidates CloudFront. See `infrastructure/README.md`.
- Preview deploys never run Terraform.
- The `production` environment accepts only the `main` branch.
