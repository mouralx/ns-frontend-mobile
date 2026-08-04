// ============================================================
// API Client — Axios instance with interceptors
// Handles JWT auth, token refresh, and error normalization
// ============================================================

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

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

async function getToken(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function setToken(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteToken(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function getStoredTokens() {
  const [access, refresh] = await Promise.all([
    getToken(TOKEN_KEYS.access),
    getToken(TOKEN_KEYS.refresh),
  ]);
  return { access, refresh };
}

export async function storeTokens(tokens: { access_token: string; refresh_token: string }) {
  await Promise.all([
    setToken(TOKEN_KEYS.access, tokens.access_token),
    setToken(TOKEN_KEYS.refresh, tokens.refresh_token),
  ]);
}

export async function clearTokens() {
  await Promise.all([
    deleteToken(TOKEN_KEYS.access),
    deleteToken(TOKEN_KEYS.refresh),
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
