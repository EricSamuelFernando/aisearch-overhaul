import $http from 'axios';

import { deploymentEnv } from '@/shared/constants/env';
import {
  getActiveUserRole,
  getAuthToken,
} from './storage';
import { getIsAuthExpired, performTokenRefresh } from './api/axios';

const client = $http.create({
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  baseURL: deploymentEnv,
});

// Track whether a refresh is already in flight for the client instance
let isClientRefreshing = false;
let clientFailedQueue: { resolve: (v: any) => void; reject: (e: any) => void }[] = [];

const processClientQueue = (error: any, token: string | null = null) => {
  clientFailedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve(token)
  );
  clientFailedQueue = [];
};

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

      // On 401/403, try to silently refresh the token instead of immediately killing the session
      if ([401, 403].includes(status)) {
        const originalRequest = err.config;
        if (originalRequest._retry) {
          // Already retried once — give up, but DON'T nuke storage.
          // The interceptor in axios.ts will handle last-resort cleanup if needed.
          return await Promise.reject({
            status,
            message: 'Session expired. Please login again.',
          });
        }

        originalRequest._retry = true;

        if (isClientRefreshing) {
          return new Promise((resolve, reject) => {
            clientFailedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return client(originalRequest);
          });
        }

        isClientRefreshing = true;
        try {
          const newToken = await performTokenRefresh();
          if (newToken) {
            processClientQueue(null, newToken);
            originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
            return client(originalRequest);
          }
          // No refresh token available — reject but don't nuke
          processClientQueue(new Error('No refresh token'), null);
          return await Promise.reject({
            status,
            message: 'Session expired. Please login again.',
          });
        } catch (refreshErr) {
          processClientQueue(refreshErr, null);
          return await Promise.reject({
            status,
            message: 'Session expired. Please login again.',
          });
        } finally {
          isClientRefreshing = false;
        }
      }

      if (status === 307) {
        return await Promise.reject({
          status,
          message: 'Redirect required.',
        });
      }
    }

    return await Promise.reject(err);
  },
);

// Set up request interceptor
client.interceptors.request.use((config) => {
  if (getIsAuthExpired()) {
    return Promise.reject(new $http.Cancel('Session expired. Please login again.')) as any;
  }
  const token = getAuthToken();
  const active_user_role = getActiveUserRole();
  const regex = /^\/(login)?$/;
  if (!regex.test(config.url as string)) {
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
