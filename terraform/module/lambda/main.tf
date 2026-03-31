locals {
  function_name = "${var.project_name}-frontend-${var.env}"
}

data "aws_iam_policy_document" "assume_role_policy_document" {
  statement {
    effect = "Allow"
    actions = [
      "sts:AssumeRole"
    ]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# IAM role for Lambda
resource "aws_iam_role" "this" {
  name               = "${local.function_name}-lambda-role-${var.env}-terraform"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy_document.json
}

resource "aws_iam_role_policy_attachment" "basic_execution" {
  role       = aws_iam_role.this.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda function backed by container image
resource "aws_lambda_function" "this" {
  function_name = "${local.function_name}-terraform"
  package_type  = "Image"
  image_uri     = "${var.image_uri}:latest"
  role          = aws_iam_role.this.arn
  timeout       = var.timeout
  memory_size   = var.memory_size

  tags = {
    Name        = "${local.function_name}-terraform"
    Environment = var.env
  }
}

resource "aws_lambda_function_url" "this" {
  function_name = aws_lambda_function.this.function_name

  authorization_type = "NONE"
  invoke_mode        = "RESPONSE_STREAM"

  cors {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["*"]
  }
}

resource "aws_lambda_permission" "allow_public_url" {
  statement_id  = "AllowPublicAccess"
  action        = "lambda:InvokeFunctionUrl"
  function_name = aws_lambda_function.this.function_name
  principal     = "*"

  function_url_auth_type = "NONE"
}
