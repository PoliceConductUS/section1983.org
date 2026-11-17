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
  # GitHub signs a job that names an environment with this subject. A role that
  # trusts only these subjects cannot be assumed by a job outside the environment.
  github_environment_subjects = {
    for name in ["production", "preview"] :
    name => "repo:${var.github_org}/${var.github_repo}:environment:${name}"
  }
  infra_role_name              = "${var.role_name}-infra"
  preview_role_name            = "${var.role_name}-preview"
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
        AWS_INFRA_ROLE_ARN = aws_iam_role.github_actions_infra.arn
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
        AWS_ROLE_ARN       = aws_iam_role.github_actions_preview.arn
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
    blocked_encryption_types = ["SSE-C"]

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

  tags = {
    Environment = "preview"
  }
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
    blocked_encryption_types = ["SSE-C"]

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

# Each GitHub environment publishes with its own role. A role can be assumed
# only from its environment and can reach only that environment's bucket and
# distribution, so a pull request preview can never write to the live site.
locals {
  publish_targets = {
    production = {
      bucket_arn       = aws_s3_bucket.site.arn
      distribution_arn = aws_cloudfront_distribution.site.arn
    }
    preview = {
      bucket_arn       = aws_s3_bucket.preview.arn
      distribution_arn = aws_cloudfront_distribution.preview.arn
    }
  }
}

data "aws_iam_policy_document" "publish_assume_role" {
  for_each = local.publish_targets

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
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = [local.github_environment_subjects[each.key]]
    }
  }
}

# Publishing only writes the built site's files and clears the CloudFront
# cache. Infrastructure changes use the separate role below.
data "aws_iam_policy_document" "publish_permissions" {
  for_each = local.publish_targets

  statement {
    sid    = "ListSiteBucket"
    effect = "Allow"

    actions = [
      "s3:GetBucketLocation",
      "s3:ListBucket",
    ]
    resources = [each.value.bucket_arn]
  }

  statement {
    sid    = "PublishSiteFiles"
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = ["${each.value.bucket_arn}/*"]
  }

  statement {
    sid    = "ClearCloudFrontCache"
    effect = "Allow"

    actions = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetInvalidation",
    ]
    resources = [each.value.distribution_arn]
  }
}

# Publishes the live site. Only the production environment can assume it.
resource "aws_iam_role" "github_actions" {
  name               = var.role_name
  assume_role_policy = data.aws_iam_policy_document.publish_assume_role["production"].json
  description        = "Publishes the live site from the production environment of ${var.github_org}/${var.github_repo}"
}

resource "aws_iam_role_policy" "github_actions_permissions" {
  name   = "${var.project_name}-github-actions"
  role   = aws_iam_role.github_actions.id
  policy = data.aws_iam_policy_document.publish_permissions["production"].json
}

# Publishes pull request previews. Only the preview environment can assume it.
resource "aws_iam_role" "github_actions_preview" {
  name               = local.preview_role_name
  assume_role_policy = data.aws_iam_policy_document.publish_assume_role["preview"].json
  description        = "Publishes pull request previews from the preview environment of ${var.github_org}/${var.github_repo}"

  # When the deploy applies this stack, the infrastructure role must be allowed
  # to manage this role before it creates it.
  depends_on = [aws_iam_role_policy.github_actions_infra_permissions]
}

resource "aws_iam_role_policy" "github_actions_preview_permissions" {
  name   = "${var.project_name}-github-actions-preview"
  role   = aws_iam_role.github_actions_preview.id
  policy = data.aws_iam_policy_document.publish_permissions["preview"].json
}

# The infrastructure role runs `npm run infra:apply` in the production deploy
# workflow. Only a job in the production GitHub environment can assume it, and
# that environment accepts only the main branch.
data "aws_iam_policy_document" "github_actions_infra_assume_role" {
  statement {
    sid    = "GitHubActionsProductionOnly"
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
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = [local.github_environment_subjects["production"]]
    }
  }
}

resource "aws_iam_role" "github_actions_infra" {
  name               = local.infra_role_name
  assume_role_policy = data.aws_iam_policy_document.github_actions_infra_assume_role.json
  description        = "Applies the Terraform stack from the production deploy of ${var.github_org}/${var.github_repo}"
}

# Everything this stack manages, and nothing outside it. The role can change
# its own policy, so the limit that matters is who can assume it, above.
data "aws_iam_policy_document" "github_actions_infra_permissions" {
  statement {
    sid    = "StackBuckets"
    effect = "Allow"

    actions = ["s3:*"]
    resources = flatten([
      for bucket_arn in [
        aws_s3_bucket.terraform_state.arn,
        aws_s3_bucket.site.arn,
        aws_s3_bucket.preview.arn,
      ] : [bucket_arn, "${bucket_arn}/*"]
    ])
  }

  statement {
    sid    = "ListBuckets"
    effect = "Allow"

    actions   = ["s3:ListAllMyBuckets"]
    resources = ["*"]
  }

  statement {
    sid    = "CloudFrontCertificatesAndDns"
    effect = "Allow"

    actions = [
      "cloudfront:*",
      "acm:*",
      "route53:*",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "WafRead"
    effect = "Allow"

    actions = [
      "wafv2:GetWebACL",
      "wafv2:ListWebACLs",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "StackRolesAndOidcProvider"
    effect = "Allow"

    actions = ["iam:*"]
    # Every role of this stack shares the name prefix, so a role added later
    # is covered before it exists.
    resources = [
      "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.role_name}*",
      local.oidc_provider_arn,
    ]
  }

  statement {
    sid    = "ListOidcProviders"
    effect = "Allow"

    actions   = ["iam:ListOpenIDConnectProviders"]
    resources = ["*"]
  }

  statement {
    sid    = "ReadStackSecrets"
    effect = "Allow"

    actions = ["ssm:GetParameter"]
    resources = [
      for name in ["SENTRY_AUTH_TOKEN", "GITHUB_TOKEN"] :
      "arn:aws:ssm:*:${data.aws_caller_identity.current.account_id}:parameter/policeconduct/secrets/${name}"
    ]
  }

  statement {
    sid    = "DecryptStackSecrets"
    effect = "Allow"

    actions   = ["kms:Decrypt"]
    resources = ["*"]

    condition {
      test     = "StringLike"
      variable = "kms:ViaService"
      values   = ["ssm.*.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy" "github_actions_infra_permissions" {
  name   = "${var.project_name}-github-actions-infra"
  role   = aws_iam_role.github_actions_infra.id
  policy = data.aws_iam_policy_document.github_actions_infra_permissions.json
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

  tags = {
    Environment = "production"
  }
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
    blocked_encryption_types = ["SSE-C"]

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

  tags = {
    Environment = "production"
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
  comment = "Canonical host/slash redirects; rewrite extensionless URIs to index.html."
  publish = true
  code    = <<-EOF
var CANONICAL_HOST = '${local.include_www ? local.www_domain : var.domain_name}';

function redirect(location) {
  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: {
      'location': { value: location },
      'cache-control': { value: 'public, max-age=86400' }
    }
  };
}

function queryString(request) {
  var keys = Object.keys(request.querystring || {});
  if (keys.length === 0) return '';
  var parts = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var entry = request.querystring[key];
    var values = entry.multiValue ? entry.multiValue : [entry];
    for (var j = 0; j < values.length; j++) {
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(values[j].value));
    }
  }
  return '?' + parts.join('&');
}

function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var hostHeader = request.headers.host;
  var host = hostHeader ? hostHeader.value : CANONICAL_HOST;
  var canonicalUri = uri;

  // Collapse /index.html to the directory URL.
  if (canonicalUri.endsWith('/index.html')) {
    canonicalUri = canonicalUri.slice(0, -'index.html'.length);
  }

  // Extensionless paths get a trailing slash so each page has one URL.
  var lastSegment = canonicalUri.substring(canonicalUri.lastIndexOf('/') + 1);
  if (canonicalUri !== '/' && !canonicalUri.endsWith('/') && !lastSegment.includes('.')) {
    canonicalUri += '/';
  }

  if (host !== CANONICAL_HOST || canonicalUri !== uri) {
    return redirect('https://' + CANONICAL_HOST + canonicalUri + queryString(request));
  }

  if (uri.endsWith('/')) {
    request.uri += 'index.html';
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
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = local.origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
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
      restriction_type = "whitelist"
      locations        = ["US"]
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Environment = "production"
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
    domain_name              = aws_s3_bucket.preview.bucket_regional_domain_name
    origin_id                = local.preview_origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
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
      restriction_type = "whitelist"
      locations        = ["US"]
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Environment = "preview"
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

  # Production deploys, and the infrastructure role with them, run only from
  # the branch named below. Previews run from any pull request branch.
  dynamic "deployment_branch_policy" {
    for_each = each.value == "production" ? [1] : []

    content {
      protected_branches     = false
      custom_branch_policies = true
    }
  }
}

resource "github_repository_environment_deployment_policy" "production_main" {
  repository     = var.github_repo
  environment    = github_repository_environment.environments["production"].environment
  branch_pattern = "main"
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

  repository  = var.github_repo
  environment = each.value
  secret_name = "SENTRY_AUTH_TOKEN"
  value       = local.sentry_auth_token

  depends_on = [github_repository_environment.environments]
}
