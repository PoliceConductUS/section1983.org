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

## Infrastructure

Single Terraform entrypoint:

- `infrastructure/bootstrap`

Use:

```bash
export GITHUB_TOKEN=<github-token-with-repo-admin-access>
terraform -chdir=infrastructure/bootstrap init
terraform -chdir=infrastructure/bootstrap apply
```

Or load local `.env` first:

```bash
set -a
source .env
set +a
terraform -chdir=infrastructure/bootstrap apply
```

Full setup docs:

- `infrastructure/README.md`
- `infrastructure/bootstrap/README.md`

## Deploy

Deploys are handled by GitHub Actions:

- `.github/workflows/deploy.yml` (production)
- `.github/workflows/preview.yml` (PR previews)
- `.github/workflows/preview-cleanup.yml` (preview cleanup on PR close)

After bootstrap, deploy workflows only sync content to S3 and invalidate CloudFront.
