import { googleMapsApiKey, googleMapsUrl } from '@/shared/constants/env';

// User endpoints
export const USER_ONBOARDING = `/user/onboard-user`;
export const USER_LOGIN = `/auth/user/login`;
export const GOOGLE_LOGIN_ENDPOINT = `/auth/google`;
export const USER_SEND_VERIFICATION = `/auth/user/send-verification`;
export const USER_RESEND_CODE = `/auth/user/resend/code`;
export const USER_PASSWORD_RESET_CODE = `/auth/user/forgot-password`;
export const USER_FORGOT_PASSWORD = `/auth/user/forgot-password`;
export const USER_VERIFY_CODE = `/auth/user/verify/code`;
export const USER_UPDATE_PASSWORD = `/auth/user/update/password`;
export const USER_UPDATE_PROFILE = `/user/update/profile`;
export const USER_SAVE_PREFERENCE = `/user/save/property-preference`;
export const USER_COMPLETE_PREFERENCE = `user/complete/property-preference`;

// User Agents Querys
export const GET_AGENT_LIST = '/agent/user/invited-agents';
export const SEARCH_AGENT = '/agent/search';
export const INVITE_AGENT = '/invite/agent';
export const ADD_AGENT_TO_PROPERTY = '/property/add/agent';
export const GET_USER_AGENT_LIST = '/agent/user/invited-agents';

// Agent Endpoints
export const AGENT_LOGIN = `auth/agent/login`;
export const AGENT_SEND_VERIFICATION = `/auth/agent/send-verification`;
export const AGENT_RESEND_VERIFICATION = `/auth/agent/resend-verification`;
export const AGENT_VERIFY_CODE = `/auth/agent/verify/code`;
export const AGENT_ONBOARDING = `/agent/onboard-agent`;
export const AGENT_ADD_PROPERTY = '/property/agent/create';
export const AGENT_BUYER_PROPERTY = '/property/agent/buyer/properties';
export const AGENT_SELLER_PROPERTY = '/property/agent/seller/properties';
export const AGENT_PROPERTY_INVITES = '/property/agent/invites';
export const AGENT_INVITE_RESPONSE = 'property/agent/response/property-invite/';
export const AGENT_TOURS = '/property/agent/tours';
export const AGENT_INCOMING_OFFERS = '/property/agent/incoming/offers';
export const AGENT_OUTGOING_OFFERS = '/property/agent/outgoing/offers';
export const GET_PROPERTY_OFFERS = '/property/all/property/offers';
export const GET_SINGLE_OFFER_DETAIL = '/property/single/offer';
export const AGENT_SUBMIT_OFFER = '/property/agent/submit/offer';

// Property Enpoints
export const PROPERTIES = `/property`;
export const GET_PROPERTY = `/api/property`;
export const UPDATE_PROPERTY = `/property/update`;
export const SCHEDULE_PROPERTY_TOUR = `/property/schedule/tour`;
export const BUYER_CREATE_OFFER = `/property/buyer/create/offer`;
export const PROPERTY_QUERY_BY_ADDERESS = `/property/query/propeties-details`;
export const CLAIM_PROPERTY_QUERY_BY_ADDERESS = `/api/search/address`;
export const SELLER_ANALYTICS = `property/seller/analytics`;

// Sellers
export const PLACES_URL = `${googleMapsUrl}&api_key=${googleMapsApiKey}`;
export const CREATE_PROPERTY = '/property/create';
export const FETCH_PROPERTY = '/property';
export const PUBLISH_PROPERTY_ENDPOINT = '/property/publish-property/';
export const SHARE_PROPERTY = '/property/share/property/document';
export const REVOKE_ACCESS = '/property/remove/property/document';
export const GET_PROPERTY_LIST = '/property/share/property/documents';
export const FETCH_SELLER_PROPERTY = `/property/user/selling/properties`;
export const GET_NOTIFICATIONS = '/auth/notifications';
export const MARK_ONE_NOTIFICATION_AS_READ = '/auth//notifications/read/one/';
export const MARK_ALL_AS_READ = '/auth/notifications/read/all/';
export const MARK_THREAD_NOTIFICATIONS_AS_READ = '/auth/notifications/read/thread/';
export const MARK_LINK_NOTIFICATIONS_AS_READ = '/auth/notifications/read/link';
export const GET_FUTURE_TOURS = '/property/user/future/tours';
export const DELETE_TOUR = '/property/delete/tour-schedule';
export const GET_PROPERTY_DOCUMENT_REPO =
  '/property-repo/all/property-documents';
export const ADD_PROPERTY_DOCUMENT = '/property-repo/add/property-documents';
export const DELETE_PROPERTY_DOCUMENT =
  '/property-repo/delete/single/property-documents';
export const SELLER_OFFER_RESPONSE = '/property/seller/offer/response';

// Buyer
export const FETCH_BUYER_PROPERTY = `/property/user/buying/properties`;

// S3 FILE UPLOAD
export const FETCH_PRESIGNED_URL = `/file/upload-url`;

// MESSAGES
// export const GET_USER_MESSAGES = '/message/send/user/chat';
export const GET_USER_MESSAGES = `/message/user/chats`;

// IMPLEMENTED
export const AGENT_UPDATE_PASSWORD = `/auth/agent/update/password`;
export const INVITE_USER_AGENT = '/invite/agent';
export const INVITE_AGENT_TO_PROPERTY = '/property/add/agent';

// YET TO BE IMPLEMENTED
export const VERIFY_OWNERSHIP = '/property/verify/property/ownership';
export const GET_SUBSCRIPTION_SESSION = '/subcription/session';
export const GET_USER_ACTIVE_SESSION = '/subcription/';
export const CANCEL_SUBSCRIPTION = '/subcription/cancel';
export const GET_USER_TOURS = '/property/user/tours';
export const GET_PAST_TOURS = '/property/user/past/tours';
export const SAVE_PROPERTY = '/property/user/save-property';
export const CREATE_PROPERTY_AGENT_MESSAGE =
  '/message/create/user/user-message';
export const SEND_CHAT = '/message/send/user/chat';
export const GET_USER_MESSAGE_CHAT = '/property/all/offer/comments';
export const ADD_USER_MESSAGE_CHAT = '/property/offer/comment';
export const AGENT_FORGOT_PASSWORD = `/auth/agent/forgot-password`;
export const AGENT_PROFILE_UPDATE = `/agent/update/profile`;
export const AGENT_CREATE_OFFER = `/property/agent/create/offer`;
export const AGENT_PUBLISH_PROPERTY = `/property/agent/response`;
export const GET_AGENT_MESSAGES = `/message/agent/chats`;
export const SEND_AGENTS_CHAT = `message/send/agent/chat`;
export const ADMIN_CREATE_SUBSCRIPTION_PLAN = `/subcription/create/plan`;
