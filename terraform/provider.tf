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
  region = "us-west-1"
}

# ACM certificates for CloudFront must exist in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
