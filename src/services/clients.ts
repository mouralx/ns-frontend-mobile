// ============================================================
// Clients API — Therapist/Admin client management
// ============================================================

import { apiClient } from './api';
import type { ClientProfile, Appointment, ApiResponse, PaginatedResponse, ClientsQuery } from '@/types';

export const clientsApi = {
  async list(query: ClientsQuery = {}): Promise<PaginatedResponse<ClientProfile>> {
    const { data } = await apiClient.get<PaginatedResponse<ClientProfile>>('/clients', {
      params: query,
    });
    return data;
  },

  async get(id: string): Promise<ClientProfile> {
    const { data } = await apiClient.get<ApiResponse<ClientProfile>>(`/clients/${id}`);
    return data.data;
  },

  async getAppointments(id: string, page = 1, perPage = 20): Promise<PaginatedResponse<Appointment>> {
    const { data } = await apiClient.get<PaginatedResponse<Appointment>>(
      `/clients/${id}/appointments`,
      { params: { page, per_page: perPage } }
    );
    return data;
  },
};