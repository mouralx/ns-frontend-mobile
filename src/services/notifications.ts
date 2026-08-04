// ============================================================
// Notifications API
// ============================================================

import { apiClient } from './api';
import type { Notification, ApiResponse } from '@/types';

export const notificationsApi = {
  async list(page = 1, perPage = 20): Promise<Notification[]> {
    const { data } = await apiClient.get<ApiResponse<Notification[]>>('/notifications', {
      params: { page, per_page: perPage },
    });
    return data.data;
  },

  async markRead(id: string): Promise<void> {
    await apiClient.put(`/notifications/${id}/read`);
  },
};
