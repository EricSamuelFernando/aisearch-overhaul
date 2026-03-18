terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.25.0"
    }
  }
}

provider "aws" {
  region     = "us-west-1"
  access_key = "AKIARDFCLRJNG3Z4WP7L"
  secret_key = "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"
}
