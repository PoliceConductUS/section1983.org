# Infrastructure

This repo uses one Terraform entrypoint:

1. `infrastructure/bootstrap` (one-time foundation + static-site infra)

## Commands

Run all infrastructure work through these npm scripts, from the repository root.

| Command                      | What it does                                                                                                                                   | Changes anything?        |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `npm run infra:account`      | Shows the AWS account and identity the other commands will use.                                                                                | No                       |
| `npm run infra:init`         | Downloads the Terraform providers and connects this checkout to the state bucket. Run it once in a new checkout or worktree.                   | Local `.terraform/` only |
| `npm run infra:plan`         | Shows what an apply would change, and fails if the plan destroys a resource nobody approved.                                                   | No                       |
| `npm run infra:apply`        | Makes one plan, refuses unapproved destroys, asks for `yes`, then applies exactly that plan. Applies nothing when live infrastructure matches. | Yes, live infrastructure |
| `npm run infra:output`       | Prints the stack's outputs. Name one to print only that: `npm run infra:output -- route53_name_servers`.                                       | No                       |
| `npm run infra:format`       | Rewrites the Terraform files in standard format.                                                                                               | Terraform files          |
| `npm run infra:format:check` | Fails, and shows the difference, when a Terraform file is not in standard format.                                                              | No                       |
| `npm run infra:validate`     | Checks the Terraform configuration for errors without contacting AWS.                                                                          | No                       |
| `npm run infra:create-user`  | Creates or updates the least-privilege IAM user that can run this stack. Needs admin credentials.                                              | Yes, one IAM user        |
| `npm run test:infra`         | Runs the unit tests for the infrastructure scripts.                                                                                            | No                       |

To pass an argument to a command, put it after `--`, for example
`npm run infra:apply -- -auto-approve`.

`plan` and `apply` do the same checks before they touch anything: they refuse a
checkout that cannot read the existing state, refuse an AWS account that does not
match it, and read the secrets from Parameter Store. `plan` then stops after
showing the plan. `apply` asks for `yes` and applies exactly the plan it showed.

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
npm run infra:account
```

6. Run bootstrap:

```bash
npm run infra:init
npm run infra:apply
```

The commands need AWS credentials for the account that holds the state; they read
`AWS_PROFILE` from the git-ignored `.env` when the shell has not set one. Do not
run `terraform apply` directly.

7. If bootstrap created a new hosted zone, update nameservers at your registrar to the Route 53 values:

```bash
npm run infra:output -- route53_name_servers
dig +short NS <your-domain>
```

8. Wait for DNS propagation, then re-run bootstrap apply if ACM is still pending:

```bash
npm run infra:apply
```

If apply is waiting at `aws_acm_certificate_validation.site`, fetch nameservers from the just-created zone and update your registrar:

```bash
npm run infra:output -- route53_name_servers
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
npm run infra:account
```

To switch:

```bash
export AWS_PROFILE=<profile-name>
npm run infra:account
```

## GitHub Actions

Bootstrap is manual/local only and creates infra.

1. Run `infrastructure/bootstrap` locally once.
2. Then GitHub deploy workflows (`deploy.yml`, `preview.yml`, `preview-cleanup.yml`) only publish content and assume infra already exists.

Credentials used by deploy workflows:

1. OIDC role via `AWS_ROLE_ARN`

## More Detail

1. `infrastructure/bootstrap/README.md`
