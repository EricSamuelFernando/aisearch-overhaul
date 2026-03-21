variable "hosted_zone_id" {
  type        = string
  description = "Route53 hosted zone ID"
}

variable "cloudfront_aliases" {
  type        = list(string)
  description = "List of domain aliases registered in CloudFront (must match Route53 records)"
}

variable "cloudfront_domain_name" {
  type        = string
  description = "CloudFront distribution domain name (e.g. d1234abcd.cloudfront.net)"
}

variable "cloudfront_hosted_zone_id" {
  type        = string
  description = "CloudFront hosted zone ID used for alias targets"
}
