# Existing ACM certificate (imported into state — do not destroy)
resource "aws_acm_certificate" "cert" {
  provider                  = aws.us_east_1
  domain_name               = var.certificate_domain
  subject_alternative_names = var.certificate_san
  validation_method         = "DNS"

  # lifecycle {
  #   prevent_destroy = true
  # }
}

# Look up the Route53 hosted zone and create alias records pointing to CloudFront
module "route53" {
  source                    = "./module/route53"
  hosted_zone_id            = var.hosted_zone_id
  cloudfront_aliases        = var.cloudfront_aliases
  cloudfront_domain_name    = module.cloudfront.domain_name
  cloudfront_hosted_zone_id = module.cloudfront.hosted_zone_id
}

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

module "secrets_manager" {
  source       = "./module/secrets_manager"
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
  source              = "./module/cloudfront"
  domain              = var.domain
  env                 = var.environment
  price_class         = var.price_class
  s3_domain_name      = module.s3.domain_name
  project_name        = var.project_name
  lambda_function_url = module.lambda.function_url
  acm_certificate_arn = aws_acm_certificate.cert.arn
  cloudfront_aliases  = var.cloudfront_aliases
}

# demo -> terraform init -backend-config="key=snaphomz-frontend-terraform/demo/terraform.tfstate"
# prod -> terraform init -backend-config="key=snaphomz-frontend-terraform/prod/terraform.tfstate"

# demo -> terraform plan -var-file="demo.tfvars"
# prod -> terraform plan -var-file="prod.tfvars"
