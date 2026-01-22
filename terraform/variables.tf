variable "environment" {
  type    = string
  default = "prod"
}

variable "project_name" {
  type    = string
  default = "snaphomz"
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 60
}

variable "lambda_memory_size" {
  description = "Lambda function memory size in MB"
  type        = number
  default     = 512
}

variable "domain" {
  type    = string
  default = "waitlist.snaphomz.com"
}

variable "hosted_zone_id" {
  type    = string
  default = "Z03826773GQ15YX1JR593"
}

variable "acm_certificate_arn" {
  type    = string
  default = "arn:aws:acm:us-east-1:075502422618:certificate/5502616a-cd7d-44d7-8846-d905e2feeb6d"
}

variable "cloudfront_aliases" {
  type    = list(string)
  default = ["snaphomz.com", "www.snaphomz.com", "waitlist.snaphomz.com"]
}
