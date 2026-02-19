data "aws_caller_identity" "current" {}

locals {
  provided_oidc_provider_arn = var.existing_oidc_provider_arn == null || trimspace(var.existing_oidc_provider_arn) == "" ? null : trimspace(var.existing_oidc_provider_arn)
  create_oidc_provider       = local.provided_oidc_provider_arn == null
  oidc_provider_arn          = local.create_oidc_provider ? aws_iam_openid_connect_provider.github[0].arn : local.provided_oidc_provider_arn
  state_bucket_name          = var.state_bucket_name == null || trimspace(var.state_bucket_name) == "" ? "${var.project_name}-tfstate-${data.aws_caller_identity.current.account_id}" : trimspace(var.state_bucket_name)
  site_bucket_name           = var.bucket_name == null || trimspace(var.bucket_name) == "" ? "${var.project_name}-site-${data.aws_caller_identity.current.account_id}" : trimspace(var.bucket_name)
  preview_bucket_name        = var.preview_bucket_name == null || trimspace(var.preview_bucket_name) == "" ? "${var.project_name}-preview-${data.aws_caller_identity.current.account_id}" : trimspace(var.preview_bucket_name)
  effective_site_bucket_names = [
    local.site_bucket_name,
    local.preview_bucket_name,
  ]
  github_repo_sub              = "repo:${var.github_org}/${var.github_repo}:*"
  www_domain                   = "www.${var.domain_name}"
  include_www                  = var.www_record_mode != "none"
  create_www_alias_records     = var.www_record_mode == "alias"
  create_www_cname_record      = var.www_record_mode == "cname"
  preview_wildcard_domain      = "*.preview.${var.domain_name}"
  distribution_aliases         = local.include_www ? [var.domain_name, local.www_domain] : [var.domain_name]
  preview_distribution_aliases = [local.preview_wildcard_domain]
  certificate_san_names        = local.include_www ? [local.www_domain, local.preview_wildcard_domain] : [local.preview_wildcard_domain]
  origin_id                    = "s3-${local.site_bucket_name}"
  preview_origin_id            = "s3-${local.preview_bucket_name}"
  site_oac_name                = "${var.project_name}-oac"
  index_rewrite_function_name  = "${var.project_name}-index-rewrite"
  preview_router_function_name = "${var.project_name}-preview-router"
  provided_hosted_zone_id      = var.hosted_zone_id == null || trimspace(var.hosted_zone_id) == "" ? null : trimspace(var.hosted_zone_id)
  manage_hosted_zone           = local.provided_hosted_zone_id == null
  route53_zone_id              = local.manage_hosted_zone ? aws_route53_zone.site[0].zone_id : local.provided_hosted_zone_id
  cloudfront_hosted_zone_id    = "Z2FDTNDATAQYW2"
  normalized_extra_dns_records = [
    for record in var.extra_dns_records : merge(record, {
      name = trimspace(record.name) == "" || trimspace(record.name) == "@" ? var.domain_name : trimspace(record.name)
      type = upper(trimspace(record.type))
      ttl  = try(record.ttl, 300)
    })
  ]
  extra_dns_records_map = {
    for idx, record in local.normalized_extra_dns_records : tostring(idx) => record
  }
  public_ga_measurement_id_production = var.public_ga_measurement_id_production == null || trimspace(var.public_ga_measurement_id_production) == "" ? null : trimspace(var.public_ga_measurement_id_production)
  public_ga_measurement_id_preview    = var.public_ga_measurement_id_preview == null || trimspace(var.public_ga_measurement_id_preview) == "" ? null : trimspace(var.public_ga_measurement_id_preview)
  public_sentry_dsn_production        = var.public_sentry_dsn_production == null || trimspace(var.public_sentry_dsn_production) == "" ? null : trimspace(var.public_sentry_dsn_production)
  public_sentry_dsn_preview           = var.public_sentry_dsn_preview == null || trimspace(var.public_sentry_dsn_preview) == "" ? null : trimspace(var.public_sentry_dsn_preview)
  sentry_org                          = var.sentry_org == null || trimspace(var.sentry_org) == "" ? null : trimspace(var.sentry_org)
  sentry_project                      = var.sentry_project == null || trimspace(var.sentry_project) == "" ? null : trimspace(var.sentry_project)
  sentry_auth_token                   = var.sentry_auth_token == null || trimspace(var.sentry_auth_token) == "" ? null : trimspace(var.sentry_auth_token)
  has_sentry_auth_token               = nonsensitive(local.sentry_auth_token != null)
  github_environment_names            = toset(["production", "preview"])
  github_environment_variables = {
    production = merge(
      {
        AWS_ROLE_ARN       = aws_iam_role.github_actions.arn
        S3_BUCKET          = aws_s3_bucket.site.id
        CLOUDFRONT_DIST_ID = aws_cloudfront_distribution.site.id
      },
      local.public_ga_measurement_id_production == null ? {} : {
        PUBLIC_GA_MEASUREMENT_ID = local.public_ga_measurement_id_production
      },
      local.public_sentry_dsn_production == null ? {} : {
        PUBLIC_SENTRY_DSN         = local.public_sentry_dsn_production
        PUBLIC_SENTRY_ENVIRONMENT = "production"
      },
      local.sentry_org == null ? {} : {
        SENTRY_ORG = local.sentry_org
      },
      local.sentry_project == null ? {} : {
        SENTRY_PROJECT = local.sentry_project
      }
    )
    preview = merge(
      {
        AWS_ROLE_ARN       = aws_iam_role.github_actions.arn
        S3_BUCKET          = aws_s3_bucket.preview.id
        CLOUDFRONT_DIST_ID = aws_cloudfront_distribution.preview.id
      },
      local.public_ga_measurement_id_preview == null ? {} : {
        PUBLIC_GA_MEASUREMENT_ID = local.public_ga_measurement_id_preview
      },
      local.public_sentry_dsn_preview == null ? {} : {
        PUBLIC_SENTRY_DSN         = local.public_sentry_dsn_preview
        PUBLIC_SENTRY_ENVIRONMENT = "preview"
      },
      local.sentry_org == null ? {} : {
        SENTRY_ORG = local.sentry_org
      },
      local.sentry_project == null ? {} : {
        SENTRY_PROJECT = local.sentry_project
      }
    )
  }
  github_environment_variable_bindings = merge([
    for environment_name, env_vars in local.github_environment_variables : {
      for variable_name, variable_value in env_vars :
      "${environment_name}:${variable_name}" => {
        environment = environment_name
        name        = variable_name
        value       = variable_value
      }
    }
  ]...)
}

locals {
  existing_site_oac_id             = trimspace(try(data.external.cloudfront_existing.result.oac_id, ""))
  existing_index_rewrite_arn       = trimspace(try(data.external.cloudfront_existing.result.index_function_arn, ""))
  existing_preview_router_arn      = trimspace(try(data.external.cloudfront_existing.result.preview_function_arn, ""))
  existing_site_distribution_id    = trimspace(try(data.external.cloudfront_existing.result.site_distribution_id, ""))
  existing_preview_distribution_id = trimspace(try(data.external.cloudfront_existing.result.preview_distribution_id, ""))
}

resource "aws_s3_bucket" "terraform_state" {
  bucket        = local.state_bucket_name
  force_destroy = var.state_bucket_force_destroy
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

data "aws_iam_policy_document" "state_bucket_tls_only" {
  statement {
    sid    = "DenyInsecureTransport"
    effect = "Deny"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions = ["s3:*"]
    resources = [
      aws_s3_bucket.terraform_state.arn,
      "${aws_s3_bucket.terraform_state.arn}/*",
    ]

    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

resource "aws_s3_bucket_policy" "terraform_state_tls_only" {
  bucket = aws_s3_bucket.terraform_state.id
  policy = data.aws_iam_policy_document.state_bucket_tls_only.json
}

resource "aws_s3_bucket" "preview" {
  bucket        = local.preview_bucket_name
  force_destroy = var.preview_bucket_force_destroy
}

resource "aws_s3_bucket_public_access_block" "preview" {
  bucket = aws_s3_bucket.preview.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "preview" {
  bucket = aws_s3_bucket.preview.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_versioning" "preview" {
  bucket = aws_s3_bucket.preview.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "preview" {
  bucket = aws_s3_bucket.preview.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_iam_openid_connect_provider" "github" {
  count = local.create_oidc_provider ? 1 : 0

  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = var.github_oidc_thumbprints
}

data "aws_iam_policy_document" "github_actions_assume_role" {
  statement {
    sid    = "GitHubActionsOidcAssumeRole"
    effect = "Allow"

    principals {
      type        = "Federated"
      identifiers = [local.oidc_provider_arn]
    }

    actions = ["sts:AssumeRoleWithWebIdentity"]

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = [local.github_repo_sub]
    }
  }
}

resource "aws_iam_role" "github_actions" {
  name               = var.role_name
  assume_role_policy = data.aws_iam_policy_document.github_actions_assume_role.json
  description        = "GitHub Actions OIDC role for ${var.github_org}/${var.github_repo}"
}

data "aws_iam_policy_document" "github_actions_permissions" {
  statement {
    sid    = "S3CreateBucket"
    effect = "Allow"

    actions = [
      "s3:CreateBucket",
      "s3:ListAllMyBuckets",
      "s3:GetAccountPublicAccessBlock",
      "s3:PutAccountPublicAccessBlock",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "StateBucketAccess"
    effect = "Allow"

    actions = [
      "s3:GetBucketLocation",
      "s3:ListBucket",
      "s3:GetBucketVersioning",
      "s3:PutBucketVersioning",
      "s3:GetBucketPublicAccessBlock",
      "s3:PutBucketPublicAccessBlock",
      "s3:GetBucketPolicy",
      "s3:PutBucketPolicy",
      "s3:DeleteBucketPolicy",
      "s3:GetBucketTagging",
      "s3:PutBucketTagging",
      "s3:DeleteBucketTagging",
      "s3:GetBucketOwnershipControls",
      "s3:PutBucketOwnershipControls",
      "s3:GetEncryptionConfiguration",
      "s3:PutEncryptionConfiguration",
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:GetObjectVersion",
    ]
    resources = [
      aws_s3_bucket.terraform_state.arn,
      "${aws_s3_bucket.terraform_state.arn}/*",
    ]
  }

  statement {
    sid    = "DeploymentBucketsAccess"
    effect = "Allow"

    actions = [
      "s3:GetBucketLocation",
      "s3:HeadBucket",
      "s3:ListBucket",
      "s3:GetBucketVersioning",
      "s3:PutBucketVersioning",
      "s3:GetBucketPublicAccessBlock",
      "s3:PutBucketPublicAccessBlock",
      "s3:GetBucketPolicy",
      "s3:PutBucketPolicy",
      "s3:DeleteBucketPolicy",
      "s3:GetBucketOwnershipControls",
      "s3:PutBucketOwnershipControls",
      "s3:GetEncryptionConfiguration",
      "s3:PutEncryptionConfiguration",
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:GetObjectVersion",
      "s3:PutObjectAcl",
    ]
    resources = flatten([
      for bucket_name in local.effective_site_bucket_names : [
        "arn:aws:s3:::${bucket_name}",
        "arn:aws:s3:::${bucket_name}/*",
      ]
    ])
  }

  statement {
    sid    = "CloudFrontAccess"
    effect = "Allow"

    actions = [
      "cloudfront:CreateDistribution",
      "cloudfront:UpdateDistribution",
      "cloudfront:GetDistribution",
      "cloudfront:GetDistributionConfig",
      "cloudfront:ListDistributions",
      "cloudfront:CreateInvalidation",
      "cloudfront:CreateOriginAccessControl",
      "cloudfront:UpdateOriginAccessControl",
      "cloudfront:GetOriginAccessControl",
      "cloudfront:ListOriginAccessControls",
      "cloudfront:CreateFunction",
      "cloudfront:UpdateFunction",
      "cloudfront:DescribeFunction",
      "cloudfront:PublishFunction",
      "cloudfront:DeleteFunction",
      "cloudfront:ListFunctions",
      "cloudfront:TagResource",
      "cloudfront:UntagResource",
      "cloudfront:ListTagsForResource",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "AcmAccess"
    effect = "Allow"

    actions = [
      "acm:RequestCertificate",
      "acm:DescribeCertificate",
      "acm:ListCertificates",
      "acm:AddTagsToCertificate",
      "acm:RemoveTagsFromCertificate",
      "acm:DeleteCertificate",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "Route53Access"
    effect = "Allow"

    actions = [
      "route53:CreateHostedZone",
      "route53:DeleteHostedZone",
      "route53:GetHostedZone",
      "route53:ListHostedZones",
      "route53:ListHostedZonesByName",
      "route53:ChangeResourceRecordSets",
      "route53:ListResourceRecordSets",
      "route53:GetChange",
      "route53:ChangeTagsForResource",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "WafReadAccess"
    effect = "Allow"

    actions = [
      "wafv2:GetWebACL",
      "wafv2:ListWebACLs",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "github_actions_permissions" {
  name   = "${var.project_name}-github-actions"
  role   = aws_iam_role.github_actions.id
  policy = data.aws_iam_policy_document.github_actions_permissions.json
}

data "aws_cloudfront_cache_policy" "managed_caching_optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_response_headers_policy" "managed_security_headers" {
  name = "Managed-SecurityHeadersPolicy"
}

data "external" "cloudfront_existing" {
  program = ["bash", "${path.module}/scripts/cloudfront_lookup.sh"]

  query = {
    oac_name              = local.site_oac_name
    index_function_name   = local.index_rewrite_function_name
    preview_function_name = local.preview_router_function_name
    site_alias            = var.domain_name
    preview_alias         = local.preview_wildcard_domain
  }
}

import {
  for_each = local.existing_site_oac_id == "" ? {} : { site = local.existing_site_oac_id }
  to       = aws_cloudfront_origin_access_control.site
  id       = each.value
}

import {
  for_each = local.existing_index_rewrite_arn == "" ? {} : { index = local.index_rewrite_function_name }
  to       = aws_cloudfront_function.index_rewrite
  id       = each.value
}

import {
  for_each = local.existing_preview_router_arn == "" ? {} : { preview = local.preview_router_function_name }
  to       = aws_cloudfront_function.preview_router
  id       = each.value
}

import {
  for_each = local.existing_site_distribution_id == "" ? {} : { site = local.existing_site_distribution_id }
  to       = aws_cloudfront_distribution.site
  id       = each.value
}

import {
  for_each = local.existing_preview_distribution_id == "" ? {} : { preview = local.existing_preview_distribution_id }
  to       = aws_cloudfront_distribution.preview
  id       = each.value
}

resource "aws_route53_zone" "site" {
  count = local.manage_hosted_zone ? 1 : 0

  name = var.domain_name
}

resource "aws_s3_bucket" "site" {
  bucket        = local.site_bucket_name
  force_destroy = var.site_bucket_force_destroy
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id

  versioning_configuration {
    status = var.enable_site_bucket_versioning ? "Enabled" : "Suspended"
  }
}

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = local.site_oac_name
  description                       = "OAC for ${var.domain_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_acm_certificate" "site" {
  provider = aws.us_east_1

  domain_name               = var.domain_name
  subject_alternative_names = local.certificate_san_names
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.site.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = local.route53_zone_id
}

resource "aws_acm_certificate_validation" "site" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for record in aws_route53_record.acm_validation : record.fqdn]
}

resource "aws_cloudfront_function" "index_rewrite" {
  name    = local.index_rewrite_function_name
  runtime = "cloudfront-js-2.0"
  comment = "Rewrite extensionless URIs to index.html."
  publish = true
  code    = <<-EOF
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.endsWith('/')) {
    request.uri += 'index.html';
  } else if (!uri.includes('.')) {
    request.uri += '/index.html';
  }

  return request;
}
EOF
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name} static site"
  aliases             = local.distribution_aliases
  default_root_object = "index.html"
  http_version        = "http2and3"
  price_class         = var.price_class
  web_acl_id          = var.waf_web_acl_arn

  origin {
    domain_name                 = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                   = local.origin_id
    origin_access_control_id    = aws_cloudfront_origin_access_control.site.id

    s3_origin_config {
      origin_access_identity = ""
    }
  }

  default_cache_behavior {
    target_origin_id       = local.origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = data.aws_cloudfront_cache_policy.managed_caching_optimized.id

    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.managed_security_headers.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.index_rewrite.arn
    }
  }

  custom_error_response {
    error_code            = 403
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 60
  }

  custom_error_response {
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 60
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  lifecycle {
    ignore_changes = [origin]
  }
}

resource "aws_cloudfront_function" "preview_router" {
  name    = local.preview_router_function_name
  runtime = "cloudfront-js-2.0"
  comment = "Route preview subdomains to matching S3 prefix."
  publish = true
  code    = <<-EOF
function handler(event) {
  var request = event.request;
  var host = request.headers.host && request.headers.host.value ? request.headers.host.value : '';
  var uri = request.uri;
  var match = host.match(/^([^.]+)\.preview\./);

  if (!match) {
    return request;
  }

  if (uri.endsWith('/')) {
    uri += 'index.html';
  } else if (!uri.includes('.')) {
    uri += '/index.html';
  }

  request.uri = '/' + match[1] + uri;
  return request;
}
EOF
}

resource "aws_cloudfront_distribution" "preview" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name} preview static site"
  aliases             = local.preview_distribution_aliases
  default_root_object = "index.html"
  http_version        = "http2and3"
  price_class         = var.price_class
  web_acl_id          = var.waf_web_acl_arn

  origin {
    domain_name                 = aws_s3_bucket.preview.bucket_regional_domain_name
    origin_id                   = local.preview_origin_id
    origin_access_control_id    = aws_cloudfront_origin_access_control.site.id

    s3_origin_config {
      origin_access_identity = ""
    }
  }

  default_cache_behavior {
    target_origin_id       = local.preview_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = data.aws_cloudfront_cache_policy.managed_caching_optimized.id

    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.managed_security_headers.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.preview_router.arn
    }
  }

  custom_error_response {
    error_code            = 403
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 60
  }

  custom_error_response {
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 60
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  lifecycle {
    ignore_changes = [origin]
  }
}

data "aws_iam_policy_document" "site_bucket_policy" {
  statement {
    sid = "AllowCloudFrontServicePrincipalReadOnly"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceAccount"
      values   = [data.aws_caller_identity.current.account_id]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.site_bucket_policy.json
}

data "aws_iam_policy_document" "preview_bucket_policy" {
  statement {
    sid = "AllowPreviewCloudFrontServicePrincipalReadOnly"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.preview.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.preview.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceAccount"
      values   = [data.aws_caller_identity.current.account_id]
    }
  }
}

resource "aws_s3_bucket_policy" "preview" {
  bucket = aws_s3_bucket.preview.id
  policy = data.aws_iam_policy_document.preview_bucket_policy.json
}

resource "aws_route53_record" "apex_a" {
  zone_id = local.route53_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = local.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "apex_aaaa" {
  zone_id = local.route53_zone_id
  name    = var.domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = local.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_alias_a" {
  count = local.create_www_alias_records ? 1 : 0

  zone_id = local.route53_zone_id
  name    = local.www_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = local.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_alias_aaaa" {
  count = local.create_www_alias_records ? 1 : 0

  zone_id = local.route53_zone_id
  name    = local.www_domain
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = local.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_cname" {
  count = local.create_www_cname_record ? 1 : 0

  zone_id = local.route53_zone_id
  name    = local.www_domain
  type    = "CNAME"
  ttl     = 300
  records = [aws_cloudfront_distribution.site.domain_name]
}

resource "aws_route53_record" "preview_wildcard_a" {
  allow_overwrite = true
  zone_id         = local.route53_zone_id
  name            = local.preview_wildcard_domain
  type            = "A"

  alias {
    name                   = aws_cloudfront_distribution.preview.domain_name
    zone_id                = local.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "preview_wildcard_aaaa" {
  allow_overwrite = true
  zone_id         = local.route53_zone_id
  name            = local.preview_wildcard_domain
  type            = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.preview.domain_name
    zone_id                = local.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "extra_standard" {
  for_each = {
    for key, record in local.extra_dns_records_map : key => record
    if try(record.alias, null) == null
  }

  allow_overwrite = true
  zone_id         = local.route53_zone_id
  name            = each.value.name
  type            = each.value.type
  ttl             = each.value.ttl
  records         = each.value.records
}

resource "aws_route53_record" "extra_alias" {
  for_each = {
    for key, record in local.extra_dns_records_map : key => record
    if try(record.alias, null) != null
  }

  allow_overwrite = true
  zone_id         = local.route53_zone_id
  name            = each.value.name
  type            = each.value.type

  alias {
    name                   = each.value.alias.name
    zone_id                = each.value.alias.zone_id
    evaluate_target_health = try(each.value.alias.evaluate_target_health, false)
  }
}

resource "github_repository_environment" "environments" {
  for_each = local.github_environment_names

  repository  = var.github_repo
  environment = each.value
}

resource "github_actions_environment_variable" "environment_variables" {
  for_each = local.github_environment_variable_bindings

  repository    = var.github_repo
  environment   = each.value.environment
  variable_name = each.value.name
  value         = each.value.value

  depends_on = [github_repository_environment.environments]
}

resource "github_actions_environment_secret" "sentry_auth_token" {
  for_each = local.has_sentry_auth_token ? local.github_environment_names : toset([])

  repository      = var.github_repo
  environment     = each.value
  secret_name     = "SENTRY_AUTH_TOKEN"
  plaintext_value = local.sentry_auth_token

  depends_on = [github_repository_environment.environments]
}
