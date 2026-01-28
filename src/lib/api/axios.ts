import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosInstance,
} from 'axios';

const baseURL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_GRAPHQL_URL ||
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
  const token = localStorage.getItem('userAccessToken');
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
    const refreshToken = localStorage.getItem('userRefreshToken');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
    const { data } = await axios.post(
      `${apiUrl}/auth/refresh-token`,
      { refreshToken },
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const newAccessToken = data.accessToken;
    const newRefreshToken = data.refreshToken;

    localStorage.setItem('userAccessToken', newAccessToken);
    if (newRefreshToken) {
      localStorage.setItem('userRefreshToken', newRefreshToken);
    }

    API.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
    originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

    processQueue(null, newAccessToken);
    return API(originalRequest);
  } catch (err) {
    processQueue(err, null);
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
    throw new Error(response.data.errors[0].message);
  }
  return response.data.data;
}

API.graphql = graphqlRequest;

export default API;
