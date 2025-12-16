output "ecr_repository_url" {
  value = data.aws_ecr_repository.ecr_repo.repository_url
}
