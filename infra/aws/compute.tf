# One EC2 instance runs the app as three Docker containers (nginx, FastAPI backend,
# Next.js frontend). Dependency chain, which avoids a cycle:
#
#   Elastic IP ──► CloudFront (origin = EIP DNS) ──► EC2 (user_data needs the
#   CloudFront URL baked into the frontend build) ──► EIP association

locals {
  is_arm     = startswith(var.instance_type, "t4g") || startswith(var.instance_type, "c7g") || startswith(var.instance_type, "m7g")
  public_url = "https://${local.use_domain ? var.domain_name : aws_cloudfront_distribution.app.domain_name}"
}

data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-${local.is_arm ? "arm64" : "x86_64"}"]
  }
}

resource "aws_eip" "app" {
  domain = "vpc"
  tags   = { Name = "${var.project}-eip" }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public_a.id
  vpc_security_group_ids = [aws_security_group.app.id]
  iam_instance_profile   = aws_iam_instance_profile.app.name

  # "unlimited" lets the first Docker build (npm ci + next build) burst past the
  # t3 baseline instead of crawling at 10% CPU; the worst-case surplus charge for a
  # few hours of building is a few cents. Set "standard" to make that charge impossible.
  credit_specification {
    cpu_credits = "unlimited"
  }

  metadata_options {
    http_tokens                 = "required" # IMDSv2 only
    http_put_response_hop_limit = 1
  }

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.root_volume_gb
    encrypted             = true
    delete_on_termination = true
  }

  user_data = templatefile("${path.module}/templates/user_data.sh.tftpl", {
    region         = var.region
    repo_url       = var.repo_url
    git_ref        = var.git_ref
    secrets_prefix = local.secrets_prefix
    backup_bucket  = aws_s3_bucket.backups.bucket
    compose_yml = templatefile("${path.module}/templates/compose.yml.tftpl", {
      region     = var.region
      log_group  = aws_cloudwatch_log_group.app.name
      public_url = local.public_url
    })
    nginx_conf = templatefile("${path.module}/templates/nginx.conf.tftpl", {
      origin_verify = random_password.origin_verify.result
    })
  })
  user_data_replace_on_change = true

  # Secrets (incl. the RDS URL) must exist before first boot reads them.
  depends_on = [aws_ssm_parameter.app, aws_iam_role_policy.app]

  lifecycle {
    ignore_changes = [ami] # a newer AL2023 release must not replace a running server
  }

  tags = { Name = "${var.project}-app" }
}

resource "aws_eip_association" "app" {
  instance_id   = aws_instance.app.id
  allocation_id = aws_eip.app.id
}
