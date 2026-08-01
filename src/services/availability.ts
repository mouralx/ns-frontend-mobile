// ============================================================
// Availability API — Rules + Blocks for therapists
// ============================================================

import { apiClient } from './api';
import type { AvailabilityRule, AvailabilityBlock, ApiResponse } from '@/types';

export const availabilityApi = {
  // Rules
  async getRules(): Promise<AvailabilityRule[]> {
    const { data } = await apiClient.get<ApiResponse<AvailabilityRule[]>>('/availability/rules');
    return data.data;
  },

  async createRule(
    payload: Omit<AvailabilityRule, 'id' | 'is_active' | 'created_at' | 'updated_at' | 'therapist_id'>
  ): Promise<AvailabilityRule> {
    const { data } = await apiClient.post<ApiResponse<AvailabilityRule>>('/availability/rules', payload);
    return data.data;
  },

  async deleteRule(id: string): Promise<void> {
    await apiClient.delete(`/availability/rules/${id}`);
  },

  // Blocks
  async getBlocks(): Promise<AvailabilityBlock[]> {
    const { data } = await apiClient.get<ApiResponse<AvailabilityBlock[]>>('/availability/blocks');
    return data.data;
  },

  async createBlock(
    payload: Omit<AvailabilityBlock, 'id' | 'created_at' | 'therapist_id'>
  ): Promise<AvailabilityBlock> {
    const { data } = await apiClient.post<ApiResponse<AvailabilityBlock>>('/availability/blocks', payload);
    return data.data;
  },

  async deleteBlock(id: string): Promise<void> {
    await apiClient.delete(`/availability/blocks/${id}`);
  },
};