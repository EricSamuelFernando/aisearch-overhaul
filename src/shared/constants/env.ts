export const isProd = process.env.NODE_ENV === 'production';
export const isLocal = process.env.NODE_ENV === 'development';

export const showLogger = isLocal
  ? true
  : process.env.NEXT_PUBLIC_SHOW_LOGGER === 'true' && false;

export const APP_ID = '';
export const API_APP_ID = '';

export const IDENTITY_GATEWAY = '/login';
export const AUTH_TOKEN = '__WEB_APP_Ocreal345####btny_ocreal';
export const REFRESH_TOKEN = '__WEB_APP_Ocreal345####refresh_token'; // Added
export const USER_ROLE = '__WEB_APP_Ocreal345####user_role';
export const AUTH_APP_STATE = ``;
export const SECURE_LOGIN_KEY = '__WEB_APP_Ocreal345####btny_yut';
export const SECURE_TOKEN = '__WEB_APP_Ocreal345####btny_ocreal';
export const SECURE_STORE = 'OCREAL-SECURED-STORE';
export const APP_PUBLIC_ROUTE = [
  '/login',
  '/signup',
  '/forgot-password',
  '/not-supported',
  '/home',
  '/sell',
  '/agents',
  '/buy/browse',
  /^\/buy\/[^/]+\/prop\/preview$/,
];
export const PRIVATE_DYNAMIC_ROUTE = [
  /^\/start-process\/[^/]+\/transaction-agreement$/,
  /^\/start-process\/[^/]+\/finance-process$/,
  /^\/start-process\/[^/]+\/options$/,
]

export const APP_PRIVATE_ROUTE = [
  '/dashboard/buyer',
  '/dashboard/seller',
  '/dashboard/chat',
  '/profile',
  '/payments',
  '/settings',
  '/account',
  '/dashboard'
]


export const VERSION_NUMBER = '0.0.0.3';

export const SNAPHOMZ_MAIN_APPLICATION_URL = process.env.NEXT_PUBLIC_SNAPHOMZ_MAIN_FRONTEND_URL || "http://13.60.114.186:8000";

export const MORTGAGE_APPLICATION_URL = process.env.NEXT_PUBLIC_MORTGAGE_FRONTEND_URL || "http://13.60.114.186:8000";

export const AI_BACKEND_BASE_URI = process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI

// export const PROPERTY_SEARCH_AI_URL = `${process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI}/api/search` || "http://13.60.114.186:9000/api/search";
export const PROPERTY_SEARCH_AI_URL = `${process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI}/api/search` || "http://13.60.114.186:9000/api/search";

export const PROPERTY_DETAIL_SEARCH_AI_URL = `${process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI}/api/get_data` || 'http://13.60.114.186:9000/api/get_data'

export const PROPERTY_SEARCH_PREFERENCE_AI_URL = `${process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI}/api/search/preference` || 'http://13.60.114.186:9000/api/search/preference'

export const PROPERTY_SEARCH_DATA_LIMIT_AI_URL = process.env.SEARCH_RECORDS || 10;

export const GET_PROPERTY_SEARCH_PREFERENCE_AI_URL = `${process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI}/api/preference` || 'http://13.60.114.186:9000/api/preference'

export const COMMUNICATION_SOCKET_URI = process.env.NEXT_PUBLIC_COMMUNICATION_SOCKET_URI

export const COMMUNICATION_SERVICE_URI = process.env.NEXT_PUBLIC_COMMUNICATION_SERVICE_URI

export const GET_MESSAGE_PROPERTY_MESSAGE_THREADS = `${COMMUNICATION_SERVICE_URI}/conversations/threads`

export const deploymentEnv = process.env.NEXT_PUBLIC_AUTH_SERIVCE_SOCKET_URL || "http://localhost:4000";

export const AGENT_APPLICATIONS = process.env.NEXT_PUBLIC_AGENT_URL;

export const mlsDeploymentEnv = process.env.NEXT_PUBLIC_MLS_ENVIROMENT_URL || deploymentEnv || "https://demo-ai.snaphomz.com";
export const publicDomain = process.env.NEXT_PUBLIC_DOMAIN;
export const googleMapsUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_URL;
export const googleMapsApiKey = process.env.NEXT_PUBLIC_MAP_KEY || "AIzaSyAD1nloXcpFm5mvgyRdvgwFFpin7dEwwwc";
export const googleMapsMapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || "7358af43a0d0de0eddbece56";

export const awsAccessKey = process.env.NEXT_PUBLIC_ACCESS_AWS_KEY!;
export const awsSecretKey = process.env.NEXT_PUBLIC_SECRET_AWS__ACCESS_KEY!;
export const awsS3BucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;


export const cloudinaryCloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
export const cloudinaryUploadPreset =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const sessionStatus = true;

// export const deploymentURL =
//   process.env.NEXT_PUBLIC_DEPLOYMENT_URL != null
//     ? `${process.env.NEXT_PUBLIC_DEPLOYMENT_URL}`
//     : process.env.NEXT_PUBLIC_VERCEL_URL != null
//     ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
//     : 'http://localhost:3000';
