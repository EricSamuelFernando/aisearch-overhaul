variable "hosted_zone_id" {
  type = string
}

variable "certificate_resource_record_name" {
  type = string
}
variable "certificate_resource_record_value" {
  type = string
}
variable "certificate_resource_record_type" {
  type = string
}

variable "domain" {
  type = string
}

# variable "cdn_domain_name" {
#   type = string
# }

# variable "cdn_hosted_zone_id" {
#   type = string
# }

# variable "cloudfront_domain_name" {
#   type = string
# }

variable "lambda_domain" {
  type = string
}
