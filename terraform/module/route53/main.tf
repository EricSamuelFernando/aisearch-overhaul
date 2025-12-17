data "aws_route53_zone" "hosted_zone" {
  zone_id = var.hosted_zone_id
}

resource "aws_acm_certificate" "certificate" {
  domain_name       = var.domain
  validation_method = "DNS"

  subject_alternative_names = [
    "*.${var.domain}"
  ]

  tags = {
    Environment = var.env
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "validation" {
  for_each = {
    for dvo in aws_acm_certificate.certificate.domain_validation_options :
    dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id = var.hosted_zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60

  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "this" {
  certificate_arn = aws_acm_certificate.certificate.arn

  validation_record_fqdns = [
    for r in aws_route53_record.validation : r.fqdn
  ]
}

# resource "aws_route53_record" "root" {
#   zone_id = data.aws_route53_zone.hosted_zone.zone_id
#   name    = var.domain
#   type    = "A"

#   alias {
#     name                   = var.cdn_domain_name
#     zone_id                = var.cdn_hosted_zone_id
#     evaluate_target_health = false
#   }
# }

resource "aws_route53_record" "sub_domain" {
  name    = var.domain
  type    = "A"
  zone_id = data.aws_route53_zone.hosted_zone.zone_id
  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cdn_hosted_zone_id
    evaluate_target_health = false
  }
}
