locals {
  bucket_name = "${var.project_name}-nextjs-frontend-${var.env}"
}

data "aws_iam_policy_document" "s3_bucket_policy" {

  statement {
    sid     = "GetOnlyThroughCloudFront"
    effect  = "Allow"
    actions = ["s3:GetObject"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    resources = [
      "arn:aws:s3:::${aws_s3_bucket.frontend.bucket}/*"
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values = [
        var.cloudfront_arn
      ]
    }
  }
}

# data "aws_iam_policy_document" "s3_bucket_policy" {
#   statement {
#     principals {
#       type        = "*"
#       identifiers = ["*"]
#     }
#     effect    = "Allow"
#     actions   = ["s3:GetObject"]
#     resources = ["${aws_s3_bucket.frontend.arn}/*"]
#   }
# }

resource "aws_s3_bucket_policy" "allow_public_access" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.s3_bucket_policy.json
}

# resource "aws_s3_bucket_public_access_block" "block_public_access" {
#   bucket                  = aws_s3_bucket.frontend.id
#   block_public_acls       = false
#   block_public_policy     = false
#   ignore_public_acls      = false
#   restrict_public_buckets = false
# }

resource "aws_s3_bucket" "frontend" {
  bucket = local.bucket_name
  tags = {
    "Name"        = local.bucket_name,
    "Environment" = var.env
  }
}

resource "aws_s3_bucket_cors_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  cors_rule {
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["https://d3t6xtiakz1dzi.cloudfront.net"]
    allowed_headers = ["*"]
    expose_headers  = []
    max_age_seconds = 3000
  }
}
