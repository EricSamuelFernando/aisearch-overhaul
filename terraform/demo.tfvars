environment = "demo"

lambda_timeout = 60

lambda_memory_size = 1024

domain = "demo.snaphomz.com"

acm_certificate_arn = "arn:aws:acm:us-east-1:075502422618:certificate/a3be7146-4c1c-44b3-bc89-f1a121f45894"

cloudfront_aliases = ["demo.snaphomz.com"]


lambda_env_variables = {
  Environment                     = "demo",
  NEXT_PUBLIC_GOOGLE_CLIENT_ID    = "448512456564-p64marq9uat5onc9ncj0mr69uol806s4.apps.googleusercontent.com",
  NEXT_PUBLIC_SEARCH_RECORDS      = 10,
  CONVERSATION_ENC_DEC_KEY        = "developers_at_OBI_family",
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "AIzaSyB16d5_QU7x9Ry8dqt1XxOYO-bfi6Vr5dU",

  NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL = "https://api.snaphomz.com/auth/graphql",

  NEXT_PUBLIC_MORTGAGE_FRONTEND_URL = "https://demo-mortgage.snaphomz.com",

  NEXT_PUBLIC_SNAPHOMZ_MAIN_FRONTEND_URL = "https://demo.snaphomz.com",

  NEXT_PUBLIC_MORTGAGE_SERIVCE_GRAPHQL_URL = "https://api.snaphomz.com/mortgage/graphql",

  NEXT_PUBLIC_AI_BACKEND_BASE_URI = "https://demo-ai.snaphomz.com",

  NEXT_PUBLIC_MORTGAGE_SERIVCE_URL = "https://api.snaphomz.com/mortgage",

  NEXT_PUBLIC_COMMUNICATION_SOCKET_URI = "wss://ge7k22aqak.execute-api.us-west-1.amazonaws.com/ws",

  NEXT_PUBLIC_COMMUNICATION_SERVICE_URI = "https://api.snaphomz.com/communication",

  NEXT_PUBLIC_AUTH_SERIVCE_SOCKET_URL = "wss://ge7k22aqak.execute-api.us-west-1.amazonaws.com/ws",

  NEXT_PUBLIC_APPLICATION_URL = "https://demo.snaphomz.com",

  NEXT_PUBLIC_AGENT_URL = "https://demo-agent.snaphomz.com",

  NEXT_PUBLIC_COGNITO_USER_POOL_ID = "us-east-1_XP9jpI8bY"
  NEXT_PUBLIC_COGNITO_CLIENT_ID    = "2ou8p18egu2jqb6ucq03vtjb70",


  NEXT_PUBLIC_GOOGLE_COGNITO_CLIENT_ID         = "972804820356-urh3bju8aopsuq2qkte96819rj3vnoko.apps.googleusercontent.com",
  NEXT_PUBLIC_GOOGLE_SECRET_COGNITO_SECRECT_ID = "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"


  NEXT_PUBLIC_COGNITO_DOMAIN = "https://us-east-1xp9jpi8by.auth.us-east-1.amazoncognito.com"

  NEXT_PUBLIC_AGENT_URL = "https://api.snaphomz.com/auth"

}

allowed_origins = [
  "https://demo.snaphomz.com"
]
