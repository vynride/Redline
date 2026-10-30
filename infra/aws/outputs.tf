output "app_url" {
  description = "Public HTTPS URL of Redline."
  value       = local.public_url
}

output "oauth_redirect_uris" {
  description = "Register these as the authorized callback URLs in the Google / GitHub OAuth apps."
  value = {
    google = "${local.public_url}/api/auth/google/callback"
    github = "${local.public_url}/api/auth/github/callback"
  }
}

output "instance_id" {
  value = aws_instance.app.id
}

output "ssm_shell_command" {
  description = "Open a shell on the server (needs the Session Manager plugin)."
  value       = "aws ssm start-session --region ${var.region} --target ${aws_instance.app.id}"
}

output "rds_endpoint" {
  value = aws_db_instance.main.address
}

output "backup_bucket" {
  value = aws_s3_bucket.backups.bucket
}

output "log_group" {
  value = aws_cloudwatch_log_group.app.name
}

output "cloudfront_domain" {
  description = "Point the custom domain's CNAME here."
  value       = aws_cloudfront_distribution.app.domain_name
}

output "acm_validation_record" {
  description = "Add this CNAME at your DNS provider so ACM can issue the certificate."
  value = local.use_domain ? {
    for o in aws_acm_certificate.app[0].domain_validation_options : o.domain_name => {
      name  = o.resource_record_name
      type  = o.resource_record_type
      value = o.resource_record_value
    }
  } : null
}
