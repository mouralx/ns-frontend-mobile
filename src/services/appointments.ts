// ============================================================
// Appointments API — CRUD + slots + confirmation
// ============================================================

import { apiClient } from './api';
import type {
  Appointment,
  BookAppointmentRequest,
  SlotsQuery,
  SlotsResponse,
  AppointmentsQuery,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const appointmentsApi = {
  async list(query: AppointmentsQuery = {}): Promise<PaginatedResponse<Appointment>> {
    const { data } = await apiClient.get<PaginatedResponse<Appointment>>('/appointments', {
      params: query,
    });
    return data;
  },

  async get(id: string): Promise<Appointment> {
    const { data } = await apiClient.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return data.data;
  },

  async book(payload: BookAppointmentRequest): Promise<Appointment> {
    const { data } = await apiClient.post<ApiResponse<Appointment>>('/appointments', payload);
    return data.data;
  },

  async update(id: string, payload: Partial<Appointment>): Promise<Appointment> {
    const { data } = await apiClient.put<ApiResponse<Appointment>>(`/appointments/${id}`, payload);
    return data.data;
  },

  async cancel(id: string, reason?: string): Promise<Appointment> {
    const { data } = await apiClient.delete<ApiResponse<Appointment>>(`/appointments/${id}`, {
      data: { cancellation_reason: reason },
    });
    return data.data;
  },

  async confirm(id: string): Promise<Appointment> {
    const { data } = await apiClient.post<ApiResponse<Appointment>>(
      `/appointments/${id}/confirm`
    );
    return data.data;
  },

  async getSlots(query: SlotsQuery): Promise<SlotsResponse> {
    const { data } = await apiClient.get<ApiResponse<SlotsResponse>>('/appointments/slots', {
      params: query,
    });
    return data.data;
  },
};