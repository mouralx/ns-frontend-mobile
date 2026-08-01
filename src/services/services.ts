// ============================================================
// Services API — Service type catalog
// ============================================================

import { apiClient } from './api';
import type { ServiceType, ApiResponse } from '@/types';

export const servicesApi = {
  async list(): Promise<ServiceType[]> {
    const { data } = await apiClient.get<ApiResponse<ServiceType[]>>('/services');
    return data.data;
  },

  async get(id: string): Promise<ServiceType> {
    const { data } = await apiClient.get<ApiResponse<ServiceType>>(`/services/${id}`);
    return data.data;
  },

  async create(payload: Omit<ServiceType, 'id' | 'is_active' | 'created_at' | 'updated_at'>): Promise<ServiceType> {
    const { data } = await apiClient.post<ApiResponse<ServiceType>>('/services', payload);
    return data.data;
  },

  async update(id: string, payload: Partial<ServiceType>): Promise<ServiceType> {
    const { data } = await apiClient.put<ApiResponse<ServiceType>>(`/services/${id}`, payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/services/${id}`);
  },
};