# Optional custom domain (DNS hosted outside AWS, e.g. Cloudflare).
# CloudFront only accepts ACM certificates from us-east-1. ACM is free for public certs.
#
# Two-step rollout, because the validation CNAME must exist before ACM issues:
#   1. terraform apply -target=aws_acm_certificate.app
#      → add the `acm_validation_record` output as a CNAME at your DNS provider
#   2. terraform apply
#      → waits for issuance, attaches the domain to CloudFront, redeploys the app
#   3. CNAME  <domain> → <cloudfront_domain>  (Cloudflare: "DNS only", grey cloud)
#
# Re-creating the stack: delete the <domain> CNAME first. CloudFront refuses
# (409 CNAMEAlreadyExists) to attach an alias whose DNS still points at another,
# even deleted, distribution. The ACM validation CNAME can stay — it is stable
# per account + domain, so a new certificate validates without DNS changes.

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = local.default_tags
  }
}

locals {
  use_domain = var.domain_name != ""
}

resource "aws_acm_certificate" "app" {
  count    = local.use_domain ? 1 : 0
  provider = aws.us_east_1

  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "app" {
  count    = local.use_domain ? 1 : 0
  provider = aws.us_east_1

  certificate_arn = aws_acm_certificate.app[0].arn

  timeouts {
    create = "30m"
  }
}
