# Secrets live in SSM Parameter Store (SecureString, encrypted with the free
# aws/ssm KMS key). Standard parameters are free — Secrets Manager is $0.40/secret.
# The EC2 instance reads everything under /redline/secrets/ at boot and writes
# backend/.env; parameter name = env var name (lower-cased).

resource "random_password" "db" {
  length  = 32
  special = false # keeps the DATABASE_URL free of characters that need escaping
}

resource "random_password" "jwt" {
  length  = 64
  special = false
}

# Shared secret CloudFront adds to every origin request; nginx rejects requests
# without it, so the EC2 public DNS name is useless if hit directly.
resource "random_password" "origin_verify" {
  length  = 40
  special = false
}

locals {
  secrets_prefix = "/${var.project}/secrets"

  app_secrets = {
    jwt_secret           = random_password.jwt.result
    database_url         = "postgresql+psycopg2://${aws_db_instance.main.username}:${random_password.db.result}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/${aws_db_instance.main.db_name}?sslmode=require"
    sarvam_api_key       = var.sarvam_api_key
    google_client_id     = var.google_client_id
    google_client_secret = var.google_client_secret
    github_client_id     = var.github_client_id
    github_client_secret = var.github_client_secret
  }

  # SSM rejects empty values, so unset OAuth providers are simply skipped. Only the
  # optional inputs are filtered — the generated values aren't known until apply.
  # The key set itself is not secret, only the values are.
  optional_secrets = {
    google_client_id     = var.google_client_id
    google_client_secret = var.google_client_secret
    github_client_id     = var.github_client_id
    github_client_secret = var.github_client_secret
  }
  app_secret_names = setunion(
    ["jwt_secret", "database_url", "sarvam_api_key"],
    nonsensitive(toset([for k, v in local.optional_secrets : k if v != ""])),
  )
}

resource "aws_ssm_parameter" "app" {
  for_each = local.app_secret_names

  name  = "${local.secrets_prefix}/${each.key}"
  type  = "SecureString"
  value = local.app_secrets[each.key]
}

# Non-secret app settings ride the same path so deploy.sh picks them up without a
# user_data change (which would replace the instance).
resource "aws_ssm_parameter" "sarvam_chat_model" {
  name  = "${local.secrets_prefix}/sarvam_chat_model"
  type  = "String"
  value = var.sarvam_chat_model
}
