# Desired inputs for this stack. Terraform loads this file on every plan and apply,
# so every checkout and worktree plans against the same values.
# Secrets never go here: they live in AWS Systems Manager Parameter Store.

project_name = "section1983"
aws_region   = "us-east-1"
domain_name  = "section1983.org"

github_org  = "PoliceConductUS"
github_repo = "section1983.org"
role_name   = "section1983-github-actions"

state_bucket_force_destroy          = false
preview_bucket_force_destroy        = false
site_bucket_force_destroy           = false
enable_site_bucket_versioning       = true
public_ga_measurement_id_production = "G-K7Z2Y0JM5G"
public_ga_measurement_id_preview    = null

extra_dns_records = [
  {
    name = "@"
    type = "MX"
    ttl  = 3600
    records = [
      "1 smtp.google.com."
    ]
  }
]

public_sentry_dsn_production = "https://8a529edfc17ef459bb23f11d73ca1d0c@o4510914782953472.ingest.us.sentry.io/4510914784526336"
sentry_org                   = "institute-for-police-conduct-i"
sentry_project               = "section1983"

# Applied to every AWS resource in this stack. A resource that serves only one
# environment sets its own Environment tag.
tags = {
  Project     = "section1983.org"
  Environment = "shared"
  Stack       = "bootstrap"
  Repository  = "PoliceConductUS/section1983.org"
  ManagedBy   = "Terraform"
}
