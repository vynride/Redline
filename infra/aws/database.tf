# Amazon RDS for PostgreSQL 16 — free tier: single-AZ db.t4g.micro, 20 GB gp2.
# Lives in the private subnets; only the app security group can connect.

resource "aws_db_subnet_group" "main" {
  name       = "${var.project}-db-subnets"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]
}

resource "aws_db_instance" "main" {
  identifier     = "${var.project}-db"
  engine         = "postgres"
  engine_version = "16"
  instance_class = var.db_instance_class

  allocated_storage     = var.db_storage_gb
  max_allocated_storage = 0 # no autoscaling past the free 20 GB
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = "redline"
  username = "redline"
  password = random_password.db.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]
  availability_zone      = local.az_a # same AZ as EC2: no cross-AZ data charges
  multi_az               = false
  publicly_accessible    = false

  # Free-plan accounts reject longer retention; the app takes its own nightly
  # dumps to S3 instead (see storage.tf / user_data).
  backup_retention_period = 0

  performance_insights_enabled = false
  auto_minor_version_upgrade   = true
  apply_immediately            = true

  # Clean teardown with no leftover (billable) snapshot. Flip both for long-lived stacks.
  skip_final_snapshot = true
  deletion_protection = false
}
