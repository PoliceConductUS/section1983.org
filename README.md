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

Runs the format check, lint, the type check (`npm run typecheck`), and the unit tests. The `Validate` workflow runs it on every pull request.

## Infrastructure

Single Terraform entrypoint:

- `infrastructure/bootstrap`

Run all infrastructure work through the npm scripts:

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

The commands need AWS credentials for the account that holds the state. They read
`AWS_PROFILE` from the git-ignored `.env` when the shell has not set one. Do not
run `terraform apply` directly: `npm run infra:apply` is the only path that checks
the state, the account, and the plan first.

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
