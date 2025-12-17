module "ecr" {
  source       = "./module/ecr"
  env          = var.environment
  project_name = var.project_name
}

module "s3" {
  source         = "./module/s3"
  env            = var.environment
  project_name   = var.project_name
  cloudfront_arn = module.cloudfront.cloudfront_arn
}

module "lambda" {
  source       = "./module/lambda"
  env          = var.environment
  image_uri    = module.ecr.ecr_repository_url
  memory_size  = var.lambda_memory_size
  timeout      = var.lambda_timeout
  project_name = var.project_name
}

module "cloudfront" {
  source              = "./module/cloudfront"
  domain              = var.domain
  env                 = var.environment
  price_class         = "PriceClass_100"
  s3_domain_name      = module.s3.domain_name
  project_name        = var.project_name
  lambda_function_url = module.lambda.function_url
  # acm_certificate_arn = module.route53.acm_certificate_arn
}

# module "route53" {
#   source                 = "./module/route53"
#   domain                 = var.domain
#   hosted_zone_id         = var.hosted_zone_id
#   cdn_hosted_zone_id     = module.cloudfront.hosted_zone_id
#   cloudfront_domain_name = module.cloudfront.domain_name
#   env                    = var.environment
#   providers = {
#     "aws" = "us-east-1"
#   }
# }
