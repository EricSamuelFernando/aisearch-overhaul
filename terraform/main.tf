module "ecr" {
  source       = "./module/ecr"
  env          = var.environment
  project_name = var.project_name
}

module "s3" {
  source       = "./module/s3"
  env          = var.environment
  project_name = var.project_name
}

module "lambda" {
  source       = "./module/lambda"
  env          = var.environment
  image_uri    = module.ecr.ecr_repository_url
  memory_size  = var.lambda_memory_size
  timeout      = var.lambda_timeout
  project_name = var.project_name
}
