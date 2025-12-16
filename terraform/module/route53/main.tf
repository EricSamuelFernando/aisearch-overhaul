data "aws_route53_zone" "hosted_zone" {
  zone_id = var.hosted_zone_id
}

resource "aws_route53_record" "cert_validation" {
  zone_id = data.aws_route53_zone.hosted_zone.zone_id
  name    = var.certificate_resource_record_name
  type    = var.certificate_resource_record_type
  records = [var.certificate_resource_record_value]
  ttl     = 60
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
    name                   = var.lambda_domain
    zone_id                = var.apigateway_hostedzone_id
    evaluate_target_health = false
  }
}
