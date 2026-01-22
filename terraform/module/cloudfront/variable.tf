variable "domain" {
  type = string
}

variable "env" {
  type = string
}

variable "s3_domain_name" {
  type = string
}

variable "price_class" {
  type = string
}

variable "project_name" {
  type = string
}

variable "lambda_function_url" {
  type = string
}

variable "acm_certificate_arn" {
  type = string
}

variable "cloudfront_aliases" {
  type = list(string)
}
