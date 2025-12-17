resource "aws_cloudfront_origin_access_control" "default_oac" {
  name                              = "default-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_origin_access_control" "lambda" {
  name                              = "lambda-oac"
  description                       = "Origin Access Control for Lambda function URL"
  origin_access_control_origin_type = "lambda"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_cloudfront_cache_policy" "cache_optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_cache_policy" "cache_disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_origin_request_policy" "origin_request_policy" {
  name = "Managed-CORS-S3Origin"
}

resource "aws_cloudfront_distribution" "distribution" {
  origin {
    domain_name              = var.s3_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.default_oac.id
    origin_id                = "S3Origin"
  }

  origin {
    domain_name              = replace(replace(var.lambda_function_url, "https://", ""), "/", "")
    origin_id                = "LambdaOrigin"
    origin_access_control_id = aws_cloudfront_origin_access_control.lambda.id
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled         = true
  is_ipv6_enabled = true
  # aliases         = [var.domain]

  default_cache_behavior {
    viewer_protocol_policy = "allow-all"
    cache_policy_id        = data.aws_cloudfront_cache_policy.cache_disabled.id
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    compress               = true
    target_origin_id       = "LambdaOrigin"
  }

  ordered_cache_behavior {
    path_pattern             = "_next/*"
    viewer_protocol_policy   = "allow-all"
    cache_policy_id          = data.aws_cloudfront_cache_policy.cache_optimized.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.origin_request_policy.id
    allowed_methods          = ["GET", "HEAD", "OPTIONS"]
    cached_methods           = ["GET", "HEAD", "OPTIONS"]
    compress                 = true
    target_origin_id         = "S3Origin"
  }

  ordered_cache_behavior {
    path_pattern             = "public/*"
    viewer_protocol_policy   = "allow-all"
    cache_policy_id          = data.aws_cloudfront_cache_policy.cache_optimized.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.origin_request_policy.id
    allowed_methods          = ["GET", "HEAD", "OPTIONS"]
    cached_methods           = ["GET", "HEAD", "OPTIONS"]
    compress                 = true
    target_origin_id         = "S3Origin"
  }

  ordered_cache_behavior {
    path_pattern             = "assets/*"
    viewer_protocol_policy   = "allow-all"
    cache_policy_id          = data.aws_cloudfront_cache_policy.cache_optimized.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.origin_request_policy.id
    allowed_methods          = ["GET", "HEAD", "OPTIONS"]
    cached_methods           = ["GET", "HEAD", "OPTIONS"]
    compress                 = true
    target_origin_id         = "S3Origin"
  }

  # viewer_certificate {
  #   acm_certificate_arn      = var.acm_certificate_arn
  #   ssl_support_method       = "sni-only"
  #   minimum_protocol_version = "TLSv1.2_2021"
  # }
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  price_class = var.price_class

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    "Name"        = "${var.project_name}-nextjs-frontend-cdn-${var.env}"
    "Environment" = var.env
  }
}
