terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = local.default_tags
  }
}

# Every resource gets these tags, so Cost Explorer / Tag Editor can show exactly
# what this stack created (and confirm it is all gone after `terraform destroy`).
locals {
  default_tags = {
    Project   = var.project
    ManagedBy = "terraform"
  }
}

data "aws_caller_identity" "current" {}

data "aws_availability_zones" "available" {
  state = "available"
}
