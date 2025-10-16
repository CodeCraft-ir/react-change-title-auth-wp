import axios, { AxiosError, AxiosInstance } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { LoginCredentials } from '@/types/auth';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost/simorq/wp-json';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper برای چک expire توکن
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: { exp: number } = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Interceptor برای درخواست‌ها: اضافه کردن Bearer token و handle refresh
api.interceptors.request.use(async (config) => {
  let accessToken = localStorage.getItem('access_token');
  if (accessToken && isTokenExpired(accessToken)) {
    // Refresh token
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken || isTokenExpired(refreshToken)) {
      throw new Error('Refresh token expired. Please login again.');
    }

    try {
      const { data } = await axios.post(`${BASE_URL}/cja/v1/refresh`, { refresh_token: refreshToken });
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      accessToken = data.access_token;
    } catch (_err) {
      localStorage.clear();
      window.location.href = '/login'; // Redirect to login
      return config;
    }
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Interceptor برای response: handle errors مثل 403 برای refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 403 && error.config && !error.config.url?.includes('/refresh')) {
      // Try refresh
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/cja/v1/refresh`, { refresh_token: refreshToken });
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          // Retry original request
          error.config.headers.Authorization = `Bearer ${data.access_token}`;
          return api(error.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const login = async (credentials: LoginCredentials) => {
  const { data } = await axios.post(`${BASE_URL}/cja/v1/login`, credentials);
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  localStorage.setItem('user_id', data.user_id.toString());
  return data;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (refreshToken) {
    await api.post('/cja/v1/logout', { refresh_token: refreshToken });
  }
  localStorage.clear();
};

export const updateSiteTitle = async (title: string) => {
  const { data } = await api.post('/wp/v2/settings', { title });
  return data;
};

export const getSiteTitle = async () => {
  const { data } = await api.get('/wp/v2/settings');
  return data.title;
};

export default api;