// ============================================================
// Booking Store — Manages multi-step booking flow state
// ============================================================

import { create } from 'zustand';
import type { ServiceType, TimeSlot } from '@/types';

interface BookingState {
  // Step data
  selectedService: ServiceType | null;
  selectedDate: string | null;
  selectedSlot: TimeSlot | null;
  therapistId: string | null;
  notes: string;

  // Step tracking
  currentStep: 1 | 2 | 3 | 4;

  // Actions
  setService: (service: ServiceType) => void;
  setDate: (date: string, therapistId: string) => void;
  setSlot: (slot: TimeSlot) => void;
  setNotes: (notes: string) => void;
  goToStep: (step: 1 | 2 | 3 | 4) => void;
  reset: () => void;
}

const initialState = {
  selectedService: null,
  selectedDate: null,
  selectedSlot: null,
  therapistId: null,
  notes: '',
  currentStep: 1 as const,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setService: (service) =>
    set({ selectedService: service, currentStep: 2 }),

  setDate: (date, therapistId) =>
    set({ selectedDate: date, therapistId, currentStep: 3 }),

  setSlot: (slot) =>
    set({ selectedSlot: slot, currentStep: 4 }),

  setNotes: (notes) => set({ notes }),

  goToStep: (step) => set({ currentStep: step }),

  reset: () => set(initialState),
}));