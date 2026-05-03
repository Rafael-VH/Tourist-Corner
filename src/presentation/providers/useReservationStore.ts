import { create } from 'zustand';
import type { Reservation, CreateReservationDto } from '@/domain/entities/Reservation';
import { getContainer } from '@/core/di/Container';

interface ReservationState {
  reservations: Reservation[];
  selectedReservation: Reservation | null;
  isLoading: boolean;
  error: string | null;

  setReservations: (reservations: Reservation[]) => void;
  setSelectedReservation: (reservation: Reservation | null) => void;
  createReservation: (data: CreateReservationDto) => Promise<Reservation>;
  getReservationById: (id: string) => Promise<Reservation | null>;
  getReservationsByUser: (userId: string) => Promise<void>;
  updateReservationStatus: (id: string, status: Reservation['status']) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
}

export const useReservationStore = create<ReservationState>((set) => ({
  reservations: [],
  selectedReservation: null,
  isLoading: false,
  error: null,

  setReservations: (reservations) => set({ reservations }),
  setSelectedReservation: (reservation) => set({ selectedReservation: reservation }),

  createReservation: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { createReservation } = getContainer();
      const reservation = await createReservation.execute(data);
      set((state) => ({
        reservations: [...state.reservations, reservation],
        isLoading: false,
      }));
      return reservation;
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  getReservationById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { getReservationById } = getContainer();
      const reservation = await getReservationById.execute(id);
      set({ selectedReservation: reservation, isLoading: false });
      return reservation;
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  getReservationsByUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { getReservationsByUser } = getContainer();
      const reservations = await getReservationsByUser.execute(userId);
      set({ reservations, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateReservationStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      const { updateReservationStatus } = getContainer();
      const updated = await updateReservationStatus.execute(id, status);
      set((state) => ({
        reservations: state.reservations.map((r) => (r.id === id ? updated : r)),
        selectedReservation: state.selectedReservation?.id === id ? updated : state.selectedReservation,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  cancelReservation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { cancelReservation } = getContainer();
      const cancelled = await cancelReservation.execute(id);
      set((state) => ({
        reservations: state.reservations.map((r) => (r.id === id ? cancelled : r)),
        selectedReservation: state.selectedReservation?.id === id ? cancelled : state.selectedReservation,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
