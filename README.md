# section1983.org

Static Astro site with AWS infrastructure managed by Terraform.

## Stack

- Astro for site build
- S3 + CloudFront for hosting/CDN
- ACM for TLS certs
- Route53 for DNS
- GitHub Actions for deploys
- Terraform bootstrap stack for all infrastructure

## Local Dev

```bash
npm ci
npm run dev
```

## Build

```bash
npm run build
```

Note: `npm run build` expects Mermaid CLI (`mmdc`) for diagram generation.

## Validate

```sh
npm run validate
```

Runs the format check (`npm run format:validate`), lint, the type check, the Terraform format and configuration check (`npm run infra:format:validate`), and the unit tests. It needs Terraform installed. The type check (`npm run typecheck`) covers the `.astro` files with `astro check` and the remaining TypeScript and JavaScript with `tsc`. The `Validate` workflow runs it on every pull request.

## Infrastructure

Single Terraform entrypoint:

- `infrastructure/bootstrap`

Run all infrastructure work through these commands:

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

The commands need AWS credentials for the account that holds the state. They read
`AWS_PROFILE` from the git-ignored `.env` when the shell has not set one. Do not
run `terraform` directly: `npm run infra:apply` is the only path that checks the
state, the account, and the changes first.

Full setup docs:

- `infrastructure/README.md`
- `infrastructure/bootstrap/README.md`

## Deploy

Deploys are handled by GitHub Actions:

- `.github/workflows/deploy.yml` (production)
- `.github/workflows/preview.yml` (PR previews)
- `.github/workflows/preview-cleanup.yml` (preview cleanup on PR close)

After bootstrap, deploy workflows only sync content to S3 and invalidate CloudFront.

## Analytics configuration sync

Use `npm run analytics:pull`, `npm run analytics:compare`, and `npm run analytics:push` to sync this site’s versioned GA settings. See [configuration and authentication](docs/analytics-config.md).
