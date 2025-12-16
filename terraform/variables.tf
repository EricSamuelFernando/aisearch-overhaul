variable "environment" {
  type    = string
  default = "dev"
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
