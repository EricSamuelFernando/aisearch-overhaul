output "certificate_resource_record_name" {
  value = [for option in aws_acm_certificate.certificate.domain_validation_options : option.resource_record_name][0]
}

output "certificate_resource_record_value" {
  value = [for option in aws_acm_certificate.certificate.domain_validation_options : option.resource_record_value][0]
}

output "certificate_resource_record_type" {
  value = [for option in aws_acm_certificate.certificate.domain_validation_options : option.resource_record_type][0]
}

output "acm_certificate_arn" {
  value = aws_acm_certificate.certificate.arn
}
