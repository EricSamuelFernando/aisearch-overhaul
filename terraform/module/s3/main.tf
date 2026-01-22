locals {
  bucket_name = "${var.project_name}-frontend-${var.env}-terraform"
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

resource "aws_s3_bucket_policy" "allow_public_access" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.s3_bucket_policy.json
}

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
    allowed_origins = [
      "https://d3t6xtiakz1dzi.cloudfront.net",
      "https://www.snaphomz.com",
      "https://snaphomz.com",
      "https://waitlist.snaphomz.com"
    ]
    allowed_headers = ["*"]
    expose_headers  = []
    max_age_seconds = 3000
  }
}
