data "aws_route53_zone" "zone" {
  zone_id = var.hosted_zone_id
}

resource "aws_route53_record" "cloudfront_alias_a" {
  for_each = toset(var.cloudfront_aliases)

  zone_id = data.aws_route53_zone.zone.zone_id
  name    = each.value
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "cloudfront_alias_aaaa" {
  for_each = toset(var.cloudfront_aliases)

  zone_id = data.aws_route53_zone.zone.zone_id
  name    = each.value
  type    = "AAAA"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}
