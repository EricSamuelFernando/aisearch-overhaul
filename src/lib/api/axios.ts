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
  // Notify AuthSessionSync that the user logged in again,
  // so it can reset its hasHandled flag for future session expirations.
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth-session-reset'));
  }
};

/**
 * Check whether auth has been marked as expired.
 * Useful for code that uses raw `axios` instead of the custom API instance,
 * so it can bail out early and avoid showing redundant error toasts.
 */
export const getIsAuthExpired = () => isAuthExpired;

/**
 * Mark auth as expired and dispatch the session-expired event.
 * Call this from global error handlers (e.g. React Query onError) when
 * an "Unauthorized" error is detected on calls that bypass this interceptor.
 */
export const markAuthExpired = () => {
  if (isAuthExpired) return; // already handled
  isAuthExpired = true;

  // Nuclear cleanup: wipe ALL auth data (cookies, localStorage, sessionStorage,
  // Redux Persist, and Cognito SDK storage) immediately so no stale token
  // can be picked up by any subsequent code path.
  clearAllAuthStorage();

  // Dispatch custom event so the React app can handle forced logout
  // (AuthSessionSync will dispatch Redux logout, show a single toast, redirect)
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

API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // If auth has expired (refresh token failed), reject all subsequent requests immediately
  if (isAuthExpired) {
    return Promise.reject(new Error('Session expired. Please login again.')) as any;
  }
  const token = getAuthToken() || localStorage.getItem('userAccessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
    const refreshToken = getStoredCookie(REFRESH_TOKEN) || localStorage.getItem('userRefreshToken'); // Assuming refresh token stays in LS
    const graphqlUrl = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || 'http://localhost:4000/auth/graphql';

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
        variables: {
          refreshToken,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data.refreshToken;

    // Update both storage mechanisms
    localStorage.setItem('userAccessToken', newAccessToken);
    storeCookie({ key: AUTH_TOKEN, value: newAccessToken });

    if (newRefreshToken) {
      localStorage.setItem('userRefreshToken', newRefreshToken);
      storeCookie({ key: REFRESH_TOKEN, value: newRefreshToken });
    }

    API.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
    originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

    processQueue(null, newAccessToken);
    return API(originalRequest);
  } catch (err) {
    processQueue(err, null);

    // Mark auth as expired and do full cleanup
    // markAuthExpired() handles: set flag, clear ALL storage, dispatch event
    markAuthExpired();

    return Promise.reject(err);
  } finally {
    isRefreshing = false;
  }
};

API.interceptors.response.use(
  async (res) => {
    // Check for GraphQL Unauthorized error in 200 OK response
    if (res.data?.errors?.some((err: any) => err.message === 'Unauthorized')) {
      // If auth is already expired, don't try anything - just reject
      if (isAuthExpired) {
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
      const originalRequest = res.config as any;
      if (!originalRequest._retry) {
        return refreshTokenLogic(originalRequest);
      }
      // Retry was already attempted and failed - reject instead of returning error response
      return Promise.reject(new Error('Session expired. Please login again.'));
    }
    return res;
  },
  async (error: AxiosError) => {
    // If auth is already expired, don't try anything - just reject
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
  headers?: Record<string, string>
): Promise<T> {
  const response = await API.post('', body, { headers });
  if (response.data.errors) {
    if (response.data.errors[0].message === 'Unauthorized') {
      // This block might be unreachable if interceptor catches it first, 
      // but good for safety if using this helper directly.
      // However, the interceptor above handles the 200 OK with errors case.
      throw new Error(response.data.errors[0].message);
    }
    throw new Error(response.data.errors[0].message);
  }
  return response.data.data;
}

API.graphql = graphqlRequest;

export default API;

