import { create } from 'zustand';
import type { Reservation, CreateReservationDto, ExtendReservationDto, CancelWithPolicyDto, ReservationStatusHistory } from '@/domain/entities/Reservation';
import { getContainer } from '@/core/di/Container';

interface ReservationState {
  reservations: Reservation[];
  selectedReservation: Reservation | null;
  statusHistory: ReservationStatusHistory[];
  isLoading: boolean;
  error: string | null;

  setReservations: (reservations: Reservation[]) => void;
  setSelectedReservation: (reservation: Reservation | null) => void;
  createReservation: (data: CreateReservationDto) => Promise<Reservation>;
  getReservationById: (id: string) => Promise<Reservation | null>;
  getReservationsByUser: (userId: string) => Promise<void>;
  getReservationsByStatus: (hotelIds: string[], status: Reservation['status']) => Promise<void>;
  updateReservationStatus: (id: string, status: Reservation['status']) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
  cancelWithPolicy: (id: string, dto: CancelWithPolicyDto) => Promise<void>;
  checkIn: (id: string) => Promise<void>;
  checkOut: (id: string) => Promise<void>;
  extendReservation: (id: string, dto: ExtendReservationDto) => Promise<void>;
  markNoShow: (id: string) => Promise<void>;
  getStatusHistory: (reservationId: string) => Promise<void>;
  validateAvailability: (roomId: string, checkIn: string, checkOut: string) => Promise<boolean>;
}

export const useReservationStore = create<ReservationState>((set) => ({
  reservations: [],
  selectedReservation: null,
  statusHistory: [],
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

  getReservationsByStatus: async (hotelIds, status) => {
    set({ isLoading: true, error: null });
    try {
      const { getReservationsByStatus } = getContainer();
      const reservations = await getReservationsByStatus.execute(hotelIds, status);
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

  cancelWithPolicy: async (id, dto) => {
    set({ isLoading: true, error: null });
    try {
      const { cancelWithPolicy } = getContainer();
      const cancelled = await cancelWithPolicy.execute(id, dto);
      set((state) => ({
        reservations: state.reservations.map((r) => (r.id === id ? cancelled : r)),
        selectedReservation: state.selectedReservation?.id === id ? cancelled : state.selectedReservation,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  checkIn: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { checkIn } = getContainer();
      const updated = await checkIn.execute(id);
      set((state) => ({
        reservations: state.reservations.map((r) => (r.id === id ? updated : r)),
        selectedReservation: state.selectedReservation?.id === id ? updated : state.selectedReservation,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  checkOut: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { checkOut } = getContainer();
      const updated = await checkOut.execute(id);
      set((state) => ({
        reservations: state.reservations.map((r) => (r.id === id ? updated : r)),
        selectedReservation: state.selectedReservation?.id === id ? updated : state.selectedReservation,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  extendReservation: async (id, dto) => {
    set({ isLoading: true, error: null });
    try {
      const { extendReservation } = getContainer();
      const updated = await extendReservation.execute(id, dto);
      set((state) => ({
        reservations: state.reservations.map((r) => (r.id === id ? updated : r)),
        selectedReservation: state.selectedReservation?.id === id ? updated : state.selectedReservation,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  markNoShow: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { markNoShow } = getContainer();
      const updated = await markNoShow.execute(id);
      set((state) => ({
        reservations: state.reservations.map((r) => (r.id === id ? updated : r)),
        selectedReservation: state.selectedReservation?.id === id ? updated : state.selectedReservation,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  getStatusHistory: async (reservationId) => {
    set({ isLoading: true, error: null });
    try {
      const { getStatusHistory } = getContainer();
      const history = await getStatusHistory.execute(reservationId);
      set({ statusHistory: history, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  validateAvailability: async (roomId, checkIn, checkOut) => {
    try {
      const { validateAvailability } = getContainer();
      return await validateAvailability.execute(roomId, checkIn, checkOut);
    } catch (error: unknown) {
      set({ error: (error as Error).message });
      return false;
    }
  },
}));
