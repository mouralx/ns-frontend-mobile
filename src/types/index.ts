// ============================================================
// Domain Types — Massage Booking Application
// Matches backend Pydantic schemas from Architecture Report v3.0
// ============================================================

// --- Auth ---
export type UserRole = 'client' | 'therapist' | 'admin';

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  push_token: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
}

// --- Services ---
export interface ServiceType {
  id: string;
  name: string;
  duration_min: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// --- Appointments ---
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type ConfirmationStatus = 'pending' | 'confirmed' | 'at_risk' | 'expired';

export interface Appointment {
  id: string;
  client_id: string;
  therapist_id: string;
  service_type_id: string;
  scheduled_at: string;
  duration_min: number;
  status: AppointmentStatus;
  confirmation_status: ConfirmationStatus;
  confirmed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  notes: string | null;
  is_walkin: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  service?: ServiceType;
  therapist?: Pick<User, 'id' | 'name'>;
  client?: Pick<User, 'id' | 'name' | 'email' | 'phone'>;
  ends_at?: string;
  confirmation_deadline?: string;
}

export interface BookAppointmentRequest {
  service_type_id: string;
  therapist_id: string;
  scheduled_at: string;
  notes?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface SlotsResponse {
  date: string;
  therapist_id: string;
  service_type_id: string;
  slots: TimeSlot[];
}

// --- Availability ---
export interface AvailabilityRule {
  id: string;
  therapist_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityBlock {
  id: string;
  therapist_id: string;
  start_at: string;
  end_at: string;
  reason: string;
  is_recurring: boolean;
  recurrence_rule: string | null;
  created_at: string;
}

// --- Notifications ---
export type NotificationType =
  | 'booking_confirmation'
  | 'confirmation_request'
  | 'reminder_2h'
  | 'cancellation'
  | 'therapist_alert'
  | 'walkin_confirmation';

export type NotificationChannel = 'push' | 'in_app';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';

export interface Notification {
  id: string;
  user_id: string;
  appointment_id: string | null;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  sent_at: string | null;
  read_at: string | null;
  delivered_at: string | null;
  error_message: string | null;
  created_at: string;
}

// --- Dashboard ---
export interface DashboardToday {
  date: string;
  appointments: Appointment[];
  stats: {
    total: number;
    confirmed: number;
    at_risk: number;
    pending: number;
  };
}

export interface DashboardStats {
  period: string;
  confirmation_rate: number;
  cancellation_rate: number;
  total_appointments: number;
  completed_appointments: number;
}

export interface DashboardAtRisk {
  appointments: (Appointment & {
    hours_until: number;
    client_name: string;
    service_name: string;
  })[];
}

// --- Clients (Therapist/Admin) ---
export interface ClientProfile extends User {
  appointment_count: number;
  last_appointment: string | null;
}

// --- API Response Wrapper ---
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// --- Query Params ---
export interface AppointmentsQuery {
  status?: AppointmentStatus;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}

export interface ClientsQuery {
  search?: string;
  page?: number;
  per_page?: number;
}

export interface SlotsQuery {
  therapist_id: string;
  service_type_id: string;
  date: string;
}