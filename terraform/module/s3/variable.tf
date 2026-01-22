variable "env" {
  type = string
}

variable "project_name" {
  type = string
}

variable "cloudfront_arn" {
  type = string
}

variable "allowed_origins" {
  type = list(string)
}
