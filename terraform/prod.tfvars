environment = "prod"

lambda_timeout = 60

lambda_memory_size = 512

domain = "waitlist.snaphomz.com"

acm_certificate_arn = "arn:aws:acm:us-east-1:075502422618:certificate/5502616a-cd7d-44d7-8846-d905e2feeb6d"

cloudfront_aliases = ["snaphomz.com", "www.snaphomz.com", "waitlist.snaphomz.com"]

lambda_env_variables = {
  Environment = "prod"
}

allowed_origins = [
  "https://www.snaphomz.com",
  "https://snaphomz.com",
  "https://waitlist.snaphomz.com"
]
