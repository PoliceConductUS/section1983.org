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

Use:

```bash
bash infrastructure/bootstrap/scripts/apply.sh
```

The wrapper needs AWS credentials for the account that holds the state; it reads
`AWS_PROFILE` from the git-ignored `.env` when the shell has not set one. Do not
run `terraform apply` directly.

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
