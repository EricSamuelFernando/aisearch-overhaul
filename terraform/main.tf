module "s3" {
  source       = "./module/s3"
  env          = var.environment
  project_name = var.project_name
}
