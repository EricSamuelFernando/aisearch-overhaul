data "aws_ecr_repository" "ecr_repo" {
  name = "${var.project_name}-nextjs-frontend-${var.env}"
}
