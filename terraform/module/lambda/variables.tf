variable "project_name" {
  description = "Project name"
  type        = string
}

variable "image_uri" {
  description = "Container image URI for the Lambda function"
  type        = string
}

variable "timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 30
}

variable "memory_size" {
  description = "Memory size in MB"
  type        = number
  default     = 512
}

variable "env" {
  description = "Environment"
  type        = string
}

variable "lambda_env_variables" {
  type = map(any)
}

# variable "NEXT_PUBLIC_ASSET_PREFIX" {
#   type = string
# }

# variable "NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL" {
#   type = string
# }
