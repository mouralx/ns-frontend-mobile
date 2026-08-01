// ============================================================
// API Client — Axios instance with interceptors
// Handles JWT auth, token refresh, and error normalization
// ============================================================

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.massagebooking.com/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// --- Token management ---
const TOKEN_KEYS = {
  access: 'auth_access_token',
  refresh: 'auth_refresh_token',
} as const;

export async function getStoredTokens() {
  const [access, refresh] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEYS.access),
    SecureStore.getItemAsync(TOKEN_KEYS.refresh),
  ]);
  return { access, refresh };
}

export async function storeTokens(tokens: { access_token: string; refresh_token: string }) {
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEYS.access, tokens.access_token),
    SecureStore.setItemAsync(TOKEN_KEYS.refresh, tokens.refresh_token),
  ]);
}

export async function clearTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEYS.access),
    SecureStore.deleteItemAsync(TOKEN_KEYS.refresh),
  ]);
}

// --- Request interceptor: attach Bearer token ---
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { access } = await getStoredTokens();
  if (access && config.headers) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// --- Response interceptor: refresh on 401 ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error || !token) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { refresh } = await getStoredTokens();
      if (!refresh) throw new Error('No refresh token');

      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: refresh,
      });

      await storeTokens(data);
      processQueue(null, data.access_token);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await clearTokens();
      // Navigation to login will be handled by auth state listener
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);