# Infrastructure

section1983.org is a static site hosted on AWS (S3 + CloudFront) with automated deploys via GitHub Actions.

## Architecture

```
GitHub Actions (OIDC) → IAM Role → S3 → CloudFront → Route 53
```

- **S3**: Two buckets — production and PR previews
- **CloudFront**: Two distributions — production (apex + www) and previews (wildcard subdomain)
- **ACM**: Single certificate covering `section1983.org`, `www.section1983.org`, `*.preview.section1983.org`
- **Route 53**: Hosted zone with A/AAAA alias records for production and wildcard CNAME for previews
- **Auth**: GitHub OIDC federation — no stored AWS credentials

## Workflows

| Workflow              | Trigger           | What it does                                                         |
| --------------------- | ----------------- | -------------------------------------------------------------------- |
| `deploy.yml`          | Push to `main`    | Build → sync to S3 → invalidate CloudFront                           |
| `preview.yml`         | PR opened/updated | Build → deploy to `pr-N.preview.section1983.org` → comment URL on PR |
| `preview-cleanup.yml` | PR closed/merged  | Delete preview from S3                                               |
| `infrastructure.yml`  | Manual dispatch   | Create/update all AWS resources                                      |

## First-Time Setup

### Prerequisites

- AWS CLI configured with an IAM user that has admin permissions (one-time only)
- Domain `section1983.org` registered
- GitHub repo at `PoliceConduct-org/section1983.org`

### 1. Run the infrastructure script

```bash
# From repo root
bash infrastructure/setup.sh
```

This creates:

1. **GitHub OIDC provider** in your AWS account
2. **IAM role** (`section1983-github-actions`) scoped to this repo only
3. **S3 buckets** — `section1983.org` (prod) + `section1983.org-preview` (previews), public access blocked
4. **ACM certificate** — with DNS validation records auto-added to Route 53
5. **CloudFront Origin Access Control** — S3 accessed only via CloudFront
6. **CloudFront distributions** — production (HTTP/2+3, TLS 1.2, compression) and previews (with CloudFront Function for subdomain → S3 path routing)
7. **Route 53 hosted zone** — A/AAAA alias for apex + www, wildcard CNAME for previews
8. **S3 bucket policies** — allow CloudFront OAC only

The script is idempotent — safe to re-run.

### 2. Update domain nameservers

If the script creates a new Route 53 hosted zone, update your domain registrar's nameservers to the ones shown in the output.

### 3. Add GitHub Variables

Go to **Settings → Secrets and variables → Actions → Variables** and add:

| Variable                  | Value                                 | Example                                                  |
| ------------------------- | ------------------------------------- | -------------------------------------------------------- |
| `AWS_ROLE_ARN`            | IAM role ARN from setup output        | `arn:aws:iam::123456789:role/section1983-github-actions` |
| `S3_BUCKET_PROD`          | Production S3 bucket name             | `section1983.org`                                        |
| `S3_BUCKET_PREVIEW`       | Preview S3 bucket name                | `section1983.org-preview`                                |
| `CLOUDFRONT_DIST_PROD`    | Production CloudFront distribution ID | `E1ABC2DEF3GHIJ`                                         |
| `CLOUDFRONT_DIST_PREVIEW` | Preview CloudFront distribution ID    | `E4KLM5NOP6QRST`                                         |

**No secrets are needed.** GitHub Actions authenticates to AWS via OIDC federation (short-lived tokens, no stored keys).

### 4. Push to `main`

The deploy workflow runs automatically. Your site is live.

## Preview Sites

Every pull request gets a preview at `https://pr-{number}.preview.section1983.org`. The URL is posted as a comment on the PR. Previews are automatically deleted when the PR is closed or merged.

## IAM Permissions

The `section1983-github-actions` role has least-privilege access:

- **S3**: Read/write/delete on the two buckets only
- **CloudFront**: Create/update distributions, invalidations, functions, OAC
- **ACM**: Request and describe certificates
- **Route 53**: Manage hosted zones and record sets

The trust policy is scoped to `repo:PoliceConduct-org/section1983.org:*` — no other repo can assume this role.

## CloudFront Configuration

Both distributions use:

- HTTP/2 + HTTP/3
- TLS 1.2 minimum (`TLSv1.2_2021`)
- Redirect HTTP → HTTPS
- Compression enabled
- `PriceClass_100` (US, Canada, Europe — cheapest tier)
- Custom 404 error page
- Origin Access Control (no public S3)

The preview distribution additionally uses a **CloudFront Function** (`section1983-preview-router`) that rewrites `pr-N.preview.section1983.org/path` → `/pr-N/path` in S3.

## Cost

Essentially free for a low-traffic static site:

- S3 storage: pennies/month
- CloudFront: 1TB transfer + 10M requests/month free tier
- Route 53: $0.50/month per hosted zone + pennies for queries
- ACM: free
- GitHub Actions: free for public repos

## Environment Variables

The Astro config respects `SITE_URL` for preview builds:

```js
// astro.config.mjs
site: process.env.SITE_URL || "https://www.section1983.org";
```

This ensures sitemaps, canonical URLs, and RSS feeds use the correct domain for both production and preview builds.

## Troubleshooting

**ACM cert stuck in PENDING_VALIDATION**: Check that Route 53 has the CNAME validation records. The setup script adds them automatically, but DNS propagation can take a few minutes.

**Preview site shows 403**: The CloudFront Function may not be published. Check the `section1983-preview-router` function in the CloudFront console.

**Deploy fails with "Access Denied"**: Verify the `AWS_ROLE_ARN` variable is set correctly and the OIDC provider exists in your AWS account.

**Nameservers not updated**: If you see DNS resolution failures, confirm your domain registrar is using the Route 53 nameservers (shown during setup).
