# S3 bucket for nightly Postgres dumps (pg_dump | gzip, uploaded by a systemd timer
# on the EC2 instance). Private, encrypted, auto-expiring — stays well inside 5 GB.

resource "aws_s3_bucket" "backups" {
  bucket_prefix = "${var.project}-db-backups-"
  force_destroy = true # `terraform destroy` empties it; set false for long-lived stacks
}

resource "aws_s3_bucket_public_access_block" "backups" {
  bucket                  = aws_s3_bucket.backups.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    id     = "expire-old-dumps"
    status = "Enabled"
    filter {}

    expiration {
      days = var.backup_retention_days
    }
  }
}
