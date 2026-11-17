# Infrastructure

This repo uses one Terraform entrypoint:

1. `infrastructure/bootstrap` (one-time foundation + static-site infra)

## Commands

Run all infrastructure work through these commands, from the repository root.

| Command                         | Use it when                                                                                                                                                                                                                                                                                                                                                                                                           | Changes anything?        |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `npm run infra:apply`           | You edited the Terraform files or the tracked inputs and want live infrastructure to match. It shows every difference between live infrastructure and the code, refuses destroys nobody approved, asks for `yes`, then applies exactly that.                                                                                                                                                                          | Yes, live infrastructure |
| `npm run infra:diff`            | You only want to see how live infrastructure differs from the code, for example after someone changed a setting in the AWS console. It shows the same differences as `apply` and stops.                                                                                                                                                                                                                               | No                       |
| `npm run infra:refresh`         | A setting was changed outside Terraform and the state should record what is live now. It shows those changes, asks for `yes`, then updates only the state.                                                                                                                                                                                                                                                            | Terraform state only     |
| `npm run infra:add:secret`      | A secret is new or its value changed. Give the names only, for example `npm run infra:add:secret -- SENTRY_AUTH_TOKEN GITHUB_TOKEN`. It asks for each value with hidden input, so the value stays out of the shell history, and stores it in Parameter Store, replacing any existing value. Every PoliceConductUS repository reads the same secrets. Run `infra:apply` afterwards to pass the new value on to GitHub. | Yes, Parameter Store     |
| `npm run infra:outputs`         | You need a deployed name or ID, such as the bucket, the CloudFront distribution, or the nameservers. Name one to print only that: `npm run infra:outputs -- route53_name_servers`.                                                                                                                                                                                                                                    | No                       |
| `npm run infra:doctor`          | A command fails, or you are on a new machine. It checks the tools, your AWS sign-in, that the state is readable, that the account matches the state, and that the secrets are readable.                                                                                                                                                                                                                               | No                       |
| `npm run infra:format:validate` | You edited Terraform files and want format problems and configuration errors caught before you apply. It reads only the files: no AWS access and no look at live infrastructure. `npm run validate` runs it.                                                                                                                                                                                                          | No                       |
| `npm run infra:format`          | `infra:format:validate` reports a format problem. It rewrites the Terraform files in standard format.                                                                                                                                                                                                                                                                                                                 | Terraform files          |
| `npm run infra:setup-user`      | You are setting up a new operator. It creates or updates the least-privilege IAM user that can run this stack. Needs admin credentials.                                                                                                                                                                                                                                                                               | Yes, one IAM user        |
| `npm run test:infra`            | You changed an infrastructure script. It runs the unit tests for those scripts.                                                                                                                                                                                                                                                                                                                                       | No                       |

`apply`, `diff`, `refresh`, `outputs` and `doctor` prepare themselves. Each one
checks that Terraform, the AWS CLI and `jq` are installed, checks your AWS
sign-in, and connects a new checkout or worktree to the state bucket. There is no
separate setup step.

For a normal infrastructure change, edit the Terraform files and run
`npm run infra:apply`. It is the only command the change needs.

To pass an argument to a command, put it after `--`, for example
`npm run infra:apply -- -auto-approve`.

`apply`, `diff` and `refresh` also refuse a checkout that cannot read the
existing state, refuse an AWS account that does not match it, and read the
secrets from Parameter Store. `diff` then stops after showing the differences.
`apply` asks for `yes` and applies exactly the changes it showed.

To approve a destroy or replacement, list each resource address, one per line,
in `TERRAFORM_APPROVED_DESTROYS` for that one run.

## Infrastructure in the production deploy

Every push to `main` runs `npm run infra:apply -- -auto-approve` before it
publishes the site. Production then always has the infrastructure that the code
on `main` describes. The apply output is in the `infra` job log of the
`Deploy to Production` workflow.

| What the apply finds                               | What happens                                                          |
| -------------------------------------------------- | --------------------------------------------------------------------- |
| Live infrastructure matches the code               | Nothing is changed and the site is published.                         |
| Settings differ, with nothing destroyed            | The changes are applied, then the site is published.                  |
| The plan destroys or replaces a resource           | Nothing is changed, the job fails, and the site is **not** published. |
| The apply fails, or the role or a secret is absent | The job fails and the site is **not** published.                      |

An infrastructure change therefore needs no separate step: merge it and the
deploy applies it. Run `npm run infra:apply` locally when you want the change
live before the merge, or when the deploy refused it.

A destroy or replacement is never applied by the deploy. Apply it locally with
`TERRAFORM_APPROVED_DESTROYS` set, then run the failed deploy again.

Reverting a commit on `main` reverts its setting changes on the next deploy. A
revert that removes a resource is a destroy, so it also needs the local apply.

The deploy uses two AWS roles. Both can only be assumed from a GitHub
environment, and the `production` environment accepts only the `main` branch.

| Role                               | Used by                                    | Can do                                                              |
| ---------------------------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| `section1983-github-actions`       | Site publish in `production` and `preview` | Write files to the two site buckets and clear the CloudFront cache. |
| `section1983-github-actions-infra` | The `infra` job in `production` only       | Change everything this stack manages, including both roles.         |

If a bad apply locks the deploy out of its own role, run `npm run infra:apply`
locally to repair it.

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
npm run infra:doctor
```

6. Run bootstrap:

```bash
npm run infra:apply
```

The commands need AWS credentials for the account that holds the state; they read
`AWS_PROFILE` from the git-ignored `.env` when the shell has not set one. Do not
run `terraform apply` directly.

7. If bootstrap created a new hosted zone, update nameservers at your registrar to the Route 53 values:

```bash
npm run infra:outputs -- route53_name_servers
dig +short NS <your-domain>
```

8. Wait for DNS propagation, then re-run bootstrap apply if ACM is still pending:

```bash
npm run infra:apply
```

If apply is waiting at `aws_acm_certificate_validation.site`, fetch nameservers from the just-created zone and update your registrar:

```bash
npm run infra:outputs -- route53_name_servers
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
npm run infra:doctor
```

To switch:

```bash
export AWS_PROFILE=<profile-name>
npm run infra:doctor
```

## GitHub Actions

1. Run `npm run infra:apply` locally once. It creates the roles and the GitHub
   environment variables that the workflows need.
2. After that, `deploy.yml` applies infrastructure and then publishes the site.
   See [Infrastructure in the production deploy](#infrastructure-in-the-production-deploy).
3. `preview.yml` and `preview-cleanup.yml` only publish and remove preview
   content. They never change infrastructure.

Credentials used by the workflows:

1. `AWS_ROLE_ARN`: the role that publishes site files.
2. `AWS_INFRA_ROLE_ARN`: the role that applies infrastructure, in `production` only.

## More Detail

1. `infrastructure/bootstrap/README.md`
