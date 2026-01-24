variable "environment" {
  type = string
}

variable "project_name" {
  type    = string
  default = "snaphomz"
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
}

variable "lambda_memory_size" {
  description = "Lambda function memory size in MB"
  type        = number
}

variable "price_class" {
  type = string
}

variable "domain" {
  type = string
}

variable "hosted_zone_id" {
  type    = string
  default = "Z03826773GQ15YX1JR593"
}

variable "acm_certificate_arn" {
  type = string
}

variable "cloudfront_aliases" {
  type = list(string)
}

variable "lambda_env_variables" {
  type = map(any)
}

variable "allowed_origins" {
  type = list(string)
}
