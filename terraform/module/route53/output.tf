output "zone_name" {
  value = data.aws_route53_zone.zone.name
}

output "record_names" {
  value = [for r in aws_route53_record.cloudfront_alias_a : r.fqdn]
}
