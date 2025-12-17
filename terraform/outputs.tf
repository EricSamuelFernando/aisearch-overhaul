output "cloudfront_arn" {
  value = module.cloudfront.cloudfront_arn
}

output "cloudfront_domain_name" {
  value = module.cloudfront.domain_name
}

output "cloudfront_id" {
  value = module.cloudfront.cloudfront_id
}

output "name" {
  value = module.lambda.function_url
}
