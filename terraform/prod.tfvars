environment = "prod"

lambda_timeout = 60

lambda_memory_size = 256

price_class = "PriceClass_All"

domain = "snaphomz.com"

certificate_domain = "snaphomz.com"
certificate_san    = ["www.snaphomz.com"]

cloudfront_aliases = ["snaphomz.com", "www.snaphomz.com"]

allowed_origins = [
  "https://www.snaphomz.com",
  "https://snaphomz.com"
]
