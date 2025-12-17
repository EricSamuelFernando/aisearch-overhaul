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
