import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosInstance,
} from 'axios';
import { getAuthToken, storeCookie, getStoredCookie, clearAllAuthStorage } from '@/lib/storage';
import { AUTH_TOKEN, REFRESH_TOKEN } from '@/shared/constants/env';

const baseURL =
  process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
  'http://localhost:5050/zipform';

const API: AxiosInstance & { graphql: typeof graphqlRequest } = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  // withCredentials: true,
}) as any;

let isRefreshing = false;
let failedQueue: any[] = [];
let isAuthExpired = false;

/**
 * Reset the auth expired flag after a successful login.
 * Call this from your login success handler.
 */
export const resetAuthExpired = () => {
  isAuthExpired = false;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth-session-reset'));
  }
};

/**
 * Check whether auth has been marked as expired.
 */
export const getIsAuthExpired = () => isAuthExpired;

/**
 * Mark auth as expired and dispatch the session-expired event.
 * This is now only called as an absolute last resort — when the refresh token
 * itself is invalid / expired and we truly cannot recover the session.
 */
export const markAuthExpired = () => {
  if (isAuthExpired) return; // already handled
  isAuthExpired = true;

  clearAllAuthStorage();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth-session-expired'));
  }
};

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve(token)
  );
  failedQueue = [];
};

// ────────────────────────────────────────────────────────────
// Shared refresh-token logic — exported so `client.ts` can reuse it
// ────────────────────────────────────────────────────────────
export const performTokenRefresh = async (): Promise<string | null> => {
  const refreshToken =
    getStoredCookie(REFRESH_TOKEN) || localStorage.getItem('userRefreshToken');
  if (!refreshToken) return null;

  const graphqlUrl =
    process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
    'http://localhost:4000/auth/graphql';

  const { data } = await axios.post(
    graphqlUrl,
    {
      query: `
        mutation RefreshToken($refreshToken: String!) {
          refreshToken(refreshToken: $refreshToken) {
            accessToken
            refreshToken
          }
        }
      `,
      variables: { refreshToken },
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (data.errors) {
    throw new Error(data.errors[0].message);
  }

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    data.data.refreshToken;

  // Persist new tokens
  localStorage.setItem('userAccessToken', newAccessToken);
  storeCookie({ key: AUTH_TOKEN, value: newAccessToken });

  if (newRefreshToken) {
    localStorage.setItem('userRefreshToken', newRefreshToken);
    storeCookie({ key: REFRESH_TOKEN, value: newRefreshToken });
  }

  API.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
  return newAccessToken;
};

// ────────────────────────────────────────────────────────────
// Internal refresh logic for the API instance interceptor
// ────────────────────────────────────────────────────────────
const refreshTokenLogic = async (originalRequest: any) => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then((token) => {
      originalRequest.headers['Authorization'] = 'Bearer ' + token;
      return API(originalRequest);
    });
  }

  isRefreshing = true;
  originalRequest._retry = true;

  try {
    const newAccessToken = await performTokenRefresh();
    if (!newAccessToken) {
      throw new Error('No refresh token available');
    }

    originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

    processQueue(null, newAccessToken);
    return API(originalRequest);
  } catch (err: any) {
    processQueue(err, null);

    // Only nuke the session if the refresh token is truly invalid/expired
    // (not just a transient network error).
    const isRefreshTokenInvalid =
      err?.message === 'No refresh token available' ||
      err?.message?.includes('Unauthorized') ||
      err?.message?.includes('jwt expired') ||
      err?.message?.includes('invalid token') ||
      err?.message?.includes('invalid signature') ||
      err?.message?.includes('jwt malformed') ||
      err?.response?.status === 401;

    if (isRefreshTokenInvalid) {
      markAuthExpired();
    }
    // For transient errors (network timeout, 500, etc.) we do NOT nuke the session.
    // The user can retry the action and it will attempt refresh again.

    return Promise.reject(err);
  } finally {
    isRefreshing = false;
  }
};

// ── Request interceptor ─────────────────────────────────────
API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (isAuthExpired) {
    return Promise.reject(new Error('Session expired. Please login again.')) as any;
  }
  const token = getAuthToken() || localStorage.getItem('userAccessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor ────────────────────────────────────
API.interceptors.response.use(
  async (res) => {
    // Check for GraphQL Unauthorized error in 200 OK response
    if (res.data?.errors?.some((err: any) => err.message === 'Unauthorized')) {
      if (isAuthExpired) {
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
      const originalRequest = res.config as any;
      if (!originalRequest._retry) {
        return refreshTokenLogic(originalRequest);
      }
      return Promise.reject(new Error('Session expired. Please login again.'));
    }
    return res;
  },
  async (error: AxiosError) => {
    if (isAuthExpired) {
      return Promise.reject(new Error('Session expired. Please login again.'));
    }
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      return refreshTokenLogic(originalRequest);
    }

    return Promise.reject(error);
  }
);

async function graphqlRequest<T = any>(
  body: {
    query: string;
    variables?: Record<string, any>;
  },
  options?: {
    headers?: Record<string, string>;
    baseURL?: string;
  }
): Promise<T> {
  const response = await API.post('', body, {
    headers: options?.headers,
    baseURL: options?.baseURL,
  });
  if (response.data.errors) {
    if (response.data.errors[0].message === 'Unauthorized') {
      throw new Error(response.data.errors[0].message);
    }
    throw new Error(response.data.errors[0].message);
  }
  return response.data.data;
}

API.graphql = graphqlRequest;

export default API;
