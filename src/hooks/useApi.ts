// ============================================================
// React Query Hooks — Data fetching for all API endpoints
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi, appointmentsApi, availabilityApi, notificationsApi, dashboardApi, clientsApi } from '@/services';
import type {
  AppointmentsQuery,
  BookAppointmentRequest,
  SlotsQuery,
  ClientsQuery,
} from '@/types';

// --- Query Keys ---
export const queryKeys = {
  services: ['services'] as const,
  service: (id: string) => ['services', id] as const,
  appointments: (query: AppointmentsQuery) => ['appointments', query] as const,
  appointment: (id: string) => ['appointments', id] as const,
  slots: (query: SlotsQuery) => ['slots', query] as const,
  availabilityRules: ['availability', 'rules'] as const,
  availabilityBlocks: ['availability', 'blocks'] as const,
  notifications: (page: number) => ['notifications', page] as const,
  dashboardToday: ['dashboard', 'today'] as const,
  dashboardStats: ['dashboard', 'stats'] as const,
  dashboardAtRisk: ['dashboard', 'at-risk'] as const,
  clients: (query: ClientsQuery) => ['clients', query] as const,
  client: (id: string) => ['clients', id] as const,
  clientAppointments: (id: string) => ['clients', id, 'appointments'] as const,
} as const;

// --- Services ---
export function useServices() {
  return useQuery({
    queryKey: queryKeys.services,
    queryFn: servicesApi.list,
    staleTime: 5 * 60 * 1000, // 5 minutes — catalog changes rarely
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: queryKeys.service(id),
    queryFn: () => servicesApi.get(id),
    enabled: !!id,
  });
}

// --- Appointments ---
export function useAppointments(query: AppointmentsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.appointments(query),
    queryFn: () => appointmentsApi.list(query),
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: queryKeys.appointment(id),
    queryFn: () => appointmentsApi.get(id),
    enabled: !!id,
  });
}

export function useBookAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookAppointmentRequest) => appointmentsApi.book(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useConfirmAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentsApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      appointmentsApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// --- Slots ---
export function useSlots(query: SlotsQuery) {
  return useQuery({
    queryKey: queryKeys.slots(query),
    queryFn: () => appointmentsApi.getSlots(query),
    enabled: !!query.therapist_id && !!query.service_type_id && !!query.date,
  });
}

// --- Availability ---
export function useAvailabilityRules() {
  return useQuery({
    queryKey: queryKeys.availabilityRules,
    queryFn: availabilityApi.getRules,
  });
}

export function useCreateAvailabilityRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: availabilityApi.createRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

export function useDeleteAvailabilityRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => availabilityApi.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

export function useAvailabilityBlocks() {
  return useQuery({
    queryKey: queryKeys.availabilityBlocks,
    queryFn: availabilityApi.getBlocks,
  });
}

export function useCreateAvailabilityBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: availabilityApi.createBlock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

export function useDeleteAvailabilityBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => availabilityApi.deleteBlock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

// --- Notifications ---
export function useNotifications(page = 1) {
  return useQuery({
    queryKey: queryKeys.notifications(page),
    queryFn: () => notificationsApi.list(page),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// --- Dashboard ---
export function useDashboardToday() {
  return useQuery({
    queryKey: queryKeys.dashboardToday,
    queryFn: dashboardApi.getToday,
    refetchInterval: 60_000, // Refresh every minute
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: dashboardApi.getStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useDashboardAtRisk() {
  return useQuery({
    queryKey: queryKeys.dashboardAtRisk,
    queryFn: dashboardApi.getAtRisk,
    refetchInterval: 30_000, // Refresh every 30s — urgency
  });
}

// --- Clients ---
export function useClients(query: ClientsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.clients(query),
    queryFn: () => clientsApi.list(query),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: queryKeys.client(id),
    queryFn: () => clientsApi.get(id),
    enabled: !!id,
  });
}

export function useClientAppointments(id: string) {
  return useQuery({
    queryKey: queryKeys.clientAppointments(id),
    queryFn: () => clientsApi.getAppointments(id),
    enabled: !!id,
  });
}