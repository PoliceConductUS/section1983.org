output "aws_role_arn" {
  description = "IAM role ARN to set as GitHub Actions variable AWS_ROLE_ARN."
  value       = aws_iam_role.github_actions.arn
}

output "aws_role_name" {
  description = "IAM role name for GitHub Actions."
  value       = aws_iam_role.github_actions.name
}

output "oidc_provider_arn" {
  description = "GitHub OIDC provider ARN used by the IAM role trust policy."
  value       = local.oidc_provider_arn
}

output "state_bucket_name" {
  description = "S3 bucket name for Terraform remote state."
  value       = aws_s3_bucket.terraform_state.id
}

output "site_bucket_names_effective" {
  description = "S3 bucket names granted to the GitHub Actions role for site deploy access."
  value       = local.effective_site_bucket_names
}

output "preview_bucket_name" {
  description = "S3 preview bucket used by PR preview workflows."
  value       = aws_s3_bucket.preview.id
}

output "site_bucket_name" {
  description = "Private S3 bucket hosting production site assets."
  value       = aws_s3_bucket.site.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for production."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name for production."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "preview_cloudfront_distribution_id" {
  description = "CloudFront distribution ID for previews."
  value       = aws_cloudfront_distribution.preview.id
}

output "preview_cloudfront_domain_name" {
  description = "CloudFront distribution domain name for previews."
  value       = aws_cloudfront_distribution.preview.domain_name
}

output "acm_certificate_arn" {
  description = "ACM certificate ARN used by CloudFront (in us-east-1)."
  value       = aws_acm_certificate_validation.site.certificate_arn
}

output "route53_zone_id" {
  description = "Route 53 hosted zone ID used for DNS records."
  value       = local.route53_zone_id
}

output "route53_name_servers" {
  description = "Route 53 nameservers (only when this stack creates the hosted zone)."
  value       = local.manage_hosted_zone ? aws_route53_zone.site[0].name_servers : []
}

output "site_url" {
  description = "Primary site URL."
  value       = "https://${var.domain_name}"
}

output "www_url" {
  description = "www URL when enabled."
  value       = local.include_www ? "https://${local.www_domain}" : null
}
