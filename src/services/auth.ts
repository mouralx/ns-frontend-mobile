// ============================================================
// Auth API — Login, Register, Refresh, Logout
// ============================================================

import { apiClient, storeTokens, clearTokens } from './api';
import type {
  LoginRequest,
  RegisterRequest,
  AuthTokens,
  User,
  ApiResponse,
} from '@/types';

export const authApi = {
  async login(credentials: LoginRequest): Promise<User> {
    const { data } = await apiClient.post<AuthTokens & { user: User }>(
      '/auth/login',
      credentials
    );
    await storeTokens(data);
    return data.user;
  },

  async register(payload: RegisterRequest): Promise<User> {
    const { data } = await apiClient.post<AuthTokens & { user: User }>(
      '/auth/register',
      payload
    );
    await storeTokens(data);
    return data.user;
  },

  async refresh(): Promise<AuthTokens> {
    const { data } = await apiClient.post<AuthTokens>('/auth/refresh');
    await storeTokens(data);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      await clearTokens();
    }
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },
};