import $http from 'axios';

import { deploymentEnv } from '@/shared/constants/env';
import {
  getActiveUserRole,
  getAuthToken,
} from './storage';
import { getIsAuthExpired, markAuthExpired } from './api/axios';

const client = $http.create({
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  baseURL: deploymentEnv,
});

// Set up response interceptor
client.interceptors.response.use(
  async (response) => await Promise.resolve(response),
  async (err) => {
    if (err.response) {
      const status = err.response.status;

      if ([500, 501, 503].includes(status)) {
        return await Promise.reject({
          status,
          message:
            'Something went wrong processing your request, Refresh your window and try again!!!',
        });
      }
      if ([401, 307, 403].includes(status)) {
        // Mark auth as expired globally so all other API calls stop immediately
        markAuthExpired();
        return await Promise.reject({
          status,
          message: 'Session expired. Please login again.',
        });
      }
    }

    return await Promise.reject(err);
  },
);

// Set up request interceptor
client.interceptors.request.use((config) => {
  // If auth has expired, reject immediately to avoid unnecessary network calls
  if (getIsAuthExpired()) {
    return Promise.reject(new $http.Cancel('Session expired. Please login again.')) as any;
  }
  const token = getAuthToken();
  const active_user_role = getActiveUserRole();
  const regex = /^\/(login)?$/;
  if (!regex.test(config.url as string)) {
    // Set the authorization header
    config.headers.Authorization = `Bearer ${token as string}`;
    config.headers.role = active_user_role;
  }
  return config;
});

export default client;

// Get the authorization header
export const setAuthorization = () => ({
  Authorization: `Bearer ${getAuthToken() as string}`,
});

type ResponseKeys = 'data';
type ErrorKeys = 'msg' | 'error_details';

export const pickErrorKey =
  (key: ErrorKeys = 'msg') =>
  async (error: {
    request: any;
    response?: { data: Record<ErrorKeys, string> };
  }) => {
    if (error?.response?.data != null) {
      const { msg: errorMessage, error_details: errorDetails } =
        error.response.data;
      switch (key) {
        case 'msg':
          return await Promise.reject(errorMessage ?? 'An error occurred.');
        case 'error_details':
          return await Promise.reject(errorDetails ?? 'An error occurred.');
      }
    } else if (error.request) {
      throw new Error(`Unexpected request error`);
    } else {
      throw new Error(`Client error`);
    }
  };

export const pickResponseKey =
  (key: ResponseKeys = 'data') =>
  <T = any>(response: { data: Record<ResponseKeys, any> }) => {
    return (response.data?.[key] as T) ?? (response.data as T);
  };

export const pickResult = pickResponseKey('data');
export const pickErrorMessage = pickErrorKey('msg');
