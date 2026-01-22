module "ecr" {
  source       = "./module/ecr"
  env          = var.environment
  project_name = var.project_name
}

module "s3" {
  source          = "./module/s3"
  env             = var.environment
  project_name    = var.project_name
  cloudfront_arn  = module.cloudfront.cloudfront_arn
  allowed_origins = var.allowed_origins
}

module "lambda" {
  source               = "./module/lambda"
  env                  = var.environment
  image_uri            = module.ecr.ecr_repository_url
  memory_size          = var.lambda_memory_size
  timeout              = var.lambda_timeout
  project_name         = var.project_name
  lambda_env_variables = var.lambda_env_variables
}

module "cloudfront" {
  source              = "./module/cloudfront"
  domain              = var.domain
  env                 = var.environment
  price_class         = "PriceClass_100"
  s3_domain_name      = module.s3.domain_name
  project_name        = var.project_name
  lambda_function_url = module.lambda.function_url
  acm_certificate_arn = var.acm_certificate_arn
  cloudfront_aliases  = var.cloudfront_aliases
}

# demo -> terraform init -backend-config="key=snaphomz-frontend-terraform/demo/terraform.tfstate"
# prod -> terraform init -backend-config="key=snaphomz-frontend-terraform/prod/terraform.tfstate"

# demo -> terraform apply -var-file="demo.tfvars"
# prod -> terraform apply -var-file="demo.tfvars"
