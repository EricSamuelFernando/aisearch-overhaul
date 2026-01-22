data "aws_ecr_repository" "ecr_repo" {
  name = "${var.project_name}-frontend-${var.env}-terraform"
}
