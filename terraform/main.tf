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

module "cloudfront" {
  source         = "./module/cloudfront"
  domain         = var.domain
  env            = var.environment
  price_class    = "PriceClass_100"
  s3_domain_name = module.s3.domain_name
}

module "acm" {
  source                  = "./module/acm"
  env                     = var.environment
  domain                  = var.domain
  validation_record_fqdns = module.route53.cert_validation_fqdn
}

module "route53" {
  source                            = "./module/route53"
  certificate_resource_record_name  = module.acm.certificate_resource_record_name
  certificate_resource_record_type  = module.acm.certificate_resource_record_type
  certificate_resource_record_value = module.acm.certificate_resource_record_value
  domain                            = var.domain
  lambda_domain                     = module.lambda.lambda_domain
  hosted_zone_id                    = ""
}
