variable "region" {
  description = "AWS region. ap-south-1 = Mumbai."
  type        = string
  default     = "ap-south-1"
}

variable "project" {
  description = "Name prefix for every resource."
  type        = string
  default     = "redline"
}

# --- Source ---------------------------------------------------------------------

variable "repo_url" {
  description = "Git repository the EC2 instance clones and builds."
  type        = string
  default     = "https://github.com/vynride/Redline.git"
}

variable "git_ref" {
  description = "Branch or tag to deploy."
  type        = string
  default     = "main"
}

# --- Sizing (defaults are all free-tier eligible) --------------------------------

variable "instance_type" {
  description = "EC2 type. t3.micro is free tier on every account; accounts on the post-July-2025 free plan may also use t3.small (2 GB RAM, faster Next.js build)."
  type        = string
  default     = "t3.micro"
}

variable "root_volume_gb" {
  description = "Root EBS volume (gp3). Free tier covers 30 GB total."
  type        = number
  default     = 20
}

variable "db_instance_class" {
  description = "RDS class. db.t4g.micro / db.t3.micro are free tier (750 h/month, single-AZ)."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_storage_gb" {
  description = "RDS storage. Free tier covers 20 GB."
  type        = number
  default     = 20
}

variable "backup_retention_days" {
  description = "Days to keep the nightly pg_dump files in S3."
  type        = number
  default     = 7
}

# --- Monitoring ------------------------------------------------------------------

variable "alert_email" {
  description = "Email for CloudWatch alarms and the billing budget. Empty = no alerts/budget. You must click the confirmation link AWS sends."
  type        = string
  default     = ""
}

variable "monthly_budget_usd" {
  description = "AWS Budgets alert threshold in USD (only created when alert_email is set)."
  type        = number
  default     = 1
}

# --- Application secrets (stored in SSM Parameter Store as SecureString) ----------

variable "sarvam_api_key" {
  description = "Sarvam API key (chat + STT + TTS)."
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  type      = string
  default   = ""
  sensitive = true
}

variable "google_client_secret" {
  type      = string
  default   = ""
  sensitive = true
}

variable "github_client_id" {
  type      = string
  default   = ""
  sensitive = true
}

variable "github_client_secret" {
  type      = string
  default   = ""
  sensitive = true
}

# --- Custom domain (optional) ----------------------------------------------------

variable "domain_name" {
  description = "Custom domain for the app, e.g. redline.example.com. Empty = use the *.cloudfront.net URL. See domain.tf for the rollout steps."
  type        = string
  default     = ""
}

variable "sarvam_chat_model" {
  description = "Sarvam chat model id. sarvam-30b is deprecated; plain sarvam-105b returns empty content on mid-drill turns, so use the conversations variant."
  type        = string
  default     = "sarvam-105b-conversations"
}
