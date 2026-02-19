variable "project_name" {
  description = "Short project identifier used in resource names."
  type        = string
  default     = "section1983"
}

variable "aws_region" {
  description = "AWS region for bootstrap resources."
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Apex domain for the site."
  type        = string
  default     = "section1983.org"
}

variable "bucket_name" {
  description = "Name of the private S3 bucket that stores site assets. If null, defaults to <project_name>-site-<account_id>."
  type        = string
  default     = null
}

variable "public_ga_measurement_id_production" {
  description = "GA4 Measurement ID for production builds (example: G-XXXXXXXXXX). Leave null/empty to disable GA."
  type        = string
  default     = null
}

variable "public_ga_measurement_id_preview" {
  description = "GA4 Measurement ID for preview builds. Leave null/empty to disable GA."
  type        = string
  default     = null
}

variable "github_org" {
  description = "GitHub organization/user that owns the repository."
  type        = string
  default     = "PoliceConductUS"
}

variable "github_repo" {
  description = "GitHub repository name."
  type        = string
  default     = "section1983.org"
}

variable "role_name" {
  description = "IAM role name for GitHub Actions OIDC."
  type        = string
  default     = "section1983-github-actions"
}

variable "existing_oidc_provider_arn" {
  description = "Existing GitHub OIDC provider ARN override. Leave null to create token.actions.githubusercontent.com provider."
  type        = string
  default     = null
}

variable "github_oidc_thumbprints" {
  description = "SHA-1 thumbprints for token.actions.githubusercontent.com."
  type        = list(string)
  default     = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

variable "state_bucket_name" {
  description = "S3 bucket name override for Terraform state. Leave null to use <project_name>-tfstate-<account_id>."
  type        = string
  default     = null
}

variable "state_bucket_force_destroy" {
  description = "If true, allows destroying the Terraform state bucket when non-empty."
  type        = bool
  default     = false
}

variable "preview_bucket_name" {
  description = "S3 bucket name override for preview deployments. Leave null to use <project_name>-preview-<account_id>."
  type        = string
  default     = null
}

variable "preview_bucket_force_destroy" {
  description = "If true, allows destroying the preview bucket when non-empty."
  type        = bool
  default     = false
}

variable "site_bucket_force_destroy" {
  description = "If true, allows deleting a non-empty site bucket."
  type        = bool
  default     = false
}

variable "enable_site_bucket_versioning" {
  description = "If true, enables object versioning for the site bucket."
  type        = bool
  default     = true
}

variable "hosted_zone_id" {
  description = "Existing public Route 53 hosted zone ID to reuse. If null, this stack creates/manages the public hosted zone for domain_name."
  type        = string
  default     = null
}

variable "www_record_mode" {
  description = "How to configure the www record: alias, cname, or none."
  type        = string
  default     = "alias"

  validation {
    condition     = contains(["alias", "cname", "none"], var.www_record_mode)
    error_message = "www_record_mode must be one of: alias, cname, none."
  }
}

variable "price_class" {
  description = "CloudFront price class."
  type        = string
  default     = "PriceClass_100"

  validation {
    condition     = contains(["PriceClass_All", "PriceClass_200", "PriceClass_100"], var.price_class)
    error_message = "price_class must be one of: PriceClass_All, PriceClass_200, PriceClass_100."
  }
}

variable "waf_web_acl_arn" {
  description = "WAFv2 Web ACL ARN for CloudFront. Leave null for a pure static site."
  type        = string
  default     = null
}

variable "extra_dns_records" {
  description = "Additional Route 53 records to create in the hosted zone (for MX/TXT/SPF/DKIM/verification, etc.)."
  type = list(object({
    name    = string
    type    = string
    ttl     = optional(number)
    records = optional(list(string))
    alias = optional(object({
      name                   = string
      zone_id                = string
      evaluate_target_health = optional(bool)
    }))
  }))
  default = []

  validation {
    condition = alltrue([
      for record in var.extra_dns_records : (
        (try(record.alias, null) == null && try(length(record.records), 0) > 0) ||
        (try(record.alias, null) != null && try(length(record.records), 0) == 0)
      )
    ])
    error_message = "Each extra_dns_records item must define either records (non-empty) or alias, but not both."
  }

  validation {
    condition = alltrue([
      for record in var.extra_dns_records :
      try(record.alias, null) == null || contains(["A", "AAAA"], upper(record.type))
    ])
    error_message = "Alias entries in extra_dns_records must use record type A or AAAA."
  }
}

variable "tags" {
  description = "Tags applied to all taggable resources."
  type        = map(string)
  default = {
    ManagedBy = "Terraform"
    Project   = "section1983.org"
    Stack     = "bootstrap"
  }
}
