// ============================================================
// Dashboard API — Today, Stats, At-Risk
// ============================================================

import { apiClient } from './api';
import type { DashboardToday, DashboardStats, DashboardAtRisk, ApiResponse } from '@/types';

export const dashboardApi = {
  async getToday(): Promise<DashboardToday> {
    const { data } = await apiClient.get<ApiResponse<DashboardToday>>('/dashboard/today');
    return data.data;
  },

  async getStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return data.data;
  },

  async getAtRisk(): Promise<DashboardAtRisk> {
    const { data } = await apiClient.get<ApiResponse<DashboardAtRisk>>('/dashboard/at-risk');
    return data.data;
  },
};