terraform {
  backend "s3" {
    bucket         = "snaphomz-terraform-state-bucket"
    region         = "us-west-1"
    encrypt        = true
    dynamodb_table = "snaphomz-terraform-state-lock-table"
    use_lockfile   = true
  }
}
