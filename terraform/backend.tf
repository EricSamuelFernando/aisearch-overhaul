terraform {
  backend "s3" {
    bucket         = "snaphomz-terraform-state-bucket"
    region         = "us-west-1"
    encrypt        = true
    dynamodb_table = "snaphomz-terraform-state-lock-table"
    use_lockfile   = true
    access_key     = "AKIARDFCLRJNG3Z4WP7L"
    secret_key     = "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"
  }
}
