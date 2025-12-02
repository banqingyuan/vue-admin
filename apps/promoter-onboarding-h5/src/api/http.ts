import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '#/store/auth';

const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 15000,
});

instance.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.token) {
    config.headers = config.headers || {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

instance.interceptors.response.use((resp) => {
  const data = resp.data;
  if (data && typeof data === 'object') {
    const { code, message } = data;
    if (code !== 0) {
      return Promise.reject(new Error(message || 'Request Error'));
    }
    return data.data;
  }
  return data;
});

export function request<T = any>(config: AxiosRequestConfig) {
  return instance.request<any, T>(config);
}


