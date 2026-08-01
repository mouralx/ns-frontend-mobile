// ============================================================
// Notifications API
// ============================================================

import { apiClient } from './api';
import type { Notification, ApiResponse, PaginatedResponse } from '@/types';

export const notificationsApi = {
  async list(page = 1, perPage = 20): Promise<PaginatedResponse<Notification>> {
    const { data } = await apiClient.get<PaginatedResponse<Notification>>('/notifications', {
      params: { page, per_page: perPage },
    });
    return data;
  },

  async markRead(id: string): Promise<Notification> {
    const { data } = await apiClient.put<ApiResponse<Notification>>(
      `/notifications/${id}/read`
    );
    return data.data;
  },
};