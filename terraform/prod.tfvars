environment = "prod"

lambda_timeout = 60

lambda_memory_size = 512

price_class = "PriceClass_All"

domain = "waitlist.snaphomz.com"

acm_certificate_arn = "arn:aws:acm:us-east-1:075502422618:certificate/5502616a-cd7d-44d7-8846-d905e2feeb6d"

cloudfront_aliases = ["snaphomz.com", "www.snaphomz.com", "waitlist.snaphomz.com"]

lambda_env_variables = {
  Environment = "prod"
    NEXT_PUBLIC_GOOGLE_CLIENT_ID    = "448512456564-p64marq9uat5onc9ncj0mr69uol806s4.apps.googleusercontent.com",
  NEXT_PUBLIC_SEARCH_RECORDS      = 10,
  CONVERSATION_ENC_DEC_KEY        = "developers_at_OBI_family",
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "AIzaSyB16d5_QU7x9Ry8dqt1XxOYO-bfi6Vr5dU",

  NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL = "https://prod-api.snaphomz.com/auth/graphql",

  NEXT_PUBLIC_MORTGAGE_FRONTEND_URL = "https://prod-mortgage.snaphomz.com",

  NEXT_PUBLIC_SNAPHOMZ_MAIN_FRONTEND_URL = "https://demo.snaphomz.com",

  NEXT_PUBLIC_MORTGAGE_SERIVCE_GRAPHQL_URL = "https://prod-api.snaphomz.com/mortgage/graphql",

  NEXT_PUBLIC_AI_BACKEND_BASE_URI = "https://prod-ai.snaphomz.com",

  NEXT_PUBLIC_MORTGAGE_SERIVCE_URL = "https://prod-api.snaphomz.com/mortgage",

  NEXT_PUBLIC_COMMUNICATION_SOCKET_URI = "wss://prod-ws.snaphomz.com",

  NEXT_PUBLIC_COMMUNICATION_SERVICE_URI = "https://prod-api.snaphomz.com/communication",

  NEXT_PUBLIC_AUTH_SERIVCE_SOCKET_URL = "wss://prod-ws.snaphomz.com",

  NEXT_PUBLIC_APPLICATION_URL = "https://snaphomz.com",

  NEXT_PUBLIC_AGENT_URL = "https://agent.snaphomz.com",

  NEXT_PUBLIC_COGNITO_USER_POOL_ID = "us-east-1_XP9jpI8bY"
  NEXT_PUBLIC_COGNITO_CLIENT_ID    = "2ou8p18egu2jqb6ucq03vtjb70",


  NEXT_PUBLIC_GOOGLE_COGNITO_CLIENT_ID         = "972804820356-urh3bju8aopsuq2qkte96819rj3vnoko.apps.googleusercontent.com",
  NEXT_PUBLIC_GOOGLE_SECRET_COGNITO_SECRECT_ID = "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"


  NEXT_PUBLIC_COGNITO_DOMAIN = "https://us-east-1xp9jpi8by.auth.us-east-1.amazoncognito.com"

  NEXT_PUBLIC_AGENT_URL = "https://api.snaphomz.com/auth"
}

allowed_origins = [
  "https://www.snaphomz.com",
  "https://snaphomz.com",
  "https://waitlist.snaphomz.com"
]
