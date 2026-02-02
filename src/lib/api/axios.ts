import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosInstance,
} from 'axios';
import { getAuthToken, storeCookie, deleteStorageCookie, clearItem, getStoredCookie } from '@/lib/storage';
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

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve(token)
  );
  failedQueue = [];
};

API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
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

    // Cleanup on failure
    deleteStorageCookie({ key: AUTH_TOKEN });
    deleteStorageCookie({ key: REFRESH_TOKEN });
    localStorage.removeItem('userAccessToken');
    localStorage.removeItem('userRefreshToken');
    localStorage.removeItem('userDetails');

    // Redirect to login if needed (optional, or handle in UI)
    // window.location.href = '/login'; 

    return Promise.reject(err);
  } finally {
    isRefreshing = false;
  }
};

API.interceptors.response.use(
  async (res) => {
    // Check for GraphQL Unauthorized error in 200 OK response
    if (res.data?.errors?.some((err: any) => err.message === 'Unauthorized')) {
      const originalRequest = res.config as any;
      if (!originalRequest._retry) {
        return refreshTokenLogic(originalRequest);
      }
    }
    return res;
  },
  async (error: AxiosError) => {
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

