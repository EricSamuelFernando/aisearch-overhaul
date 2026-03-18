resource "aws_secretsmanager_secret" "frontend_secrets" {
  name                    = "${var.project_name}-frontend/${var.env}/secrets"
  description             = "Frontend environment secrets for ${var.project_name} (${var.env})"
  recovery_window_in_days = 7

  tags = {
    Project     = var.project_name
    Environment = var.env
    ManagedBy   = "terraform"
  }
}
