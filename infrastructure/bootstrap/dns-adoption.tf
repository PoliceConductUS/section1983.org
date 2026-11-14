# Adopt the existing Google site-verification record without changing DNS.
resource "aws_route53_record" "google_domain_verification" {
  zone_id         = local.route53_zone_id
  name            = "section1983.org"
  type            = "TXT"
  ttl             = 300
  records         = ["google-site-verification=H4b2ysfqzZMBDNpqvb4PdnLEeGNSUAwbsiwmMZoiD9c"]
  allow_overwrite = false
}

import {
  to = aws_route53_record.google_domain_verification
  id = "Z0278811YX63ROJ3VX8Y_section1983.org_TXT"
}
