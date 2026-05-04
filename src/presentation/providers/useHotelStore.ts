import { create } from 'zustand';
import type { Hotel } from '@/domain/entities/Hotel';
import type { HotelFilters } from '@/domain/repositories/HotelRepository';
import { getContainer } from '@/core/di/Container';

interface HotelState {
  hotels: Hotel[];
  featuredHotels: Hotel[];
  selectedHotel: Hotel | null;
  isLoading: boolean;
  error: string | null;
  filters: HotelFilters;

  setHotels: (hotels: Hotel[]) => void;
  setFeaturedHotels: (hotels: Hotel[]) => void;
  setSelectedHotel: (hotel: Hotel | null) => void;
  setLoading: (loading: boolean) => void;
  setFilters: (filters: HotelFilters) => void;
  fetchHotels: (filters?: HotelFilters) => Promise<void>;
  fetchFeaturedHotels: () => Promise<void>;
  fetchHotelById: (id: string) => Promise<void>;
  fetchManagerHotels: (managerId: string) => Promise<void>;
  updateHotel: (id: string, hotel: Partial<Hotel>) => Promise<void>;
  createHotel: (hotel: Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteHotel: (id: string) => Promise<void>;
  toggleHotelStatus: (id: string) => Promise<void>;
}

export const useHotelStore = create<HotelState>((set, get) => ({
  hotels: [],
  featuredHotels: [],
  selectedHotel: null,
  isLoading: false,
  error: null,
  filters: {},

  setHotels: (hotels) => set({ hotels }),
  setFeaturedHotels: (hotels) => set({ featuredHotels: hotels }),
  setSelectedHotel: (hotel) => set({ selectedHotel: hotel }),
  setLoading: (isLoading) => set({ isLoading }),
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),

  fetchHotels: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { getHotels } = getContainer();
      const hotels = await getHotels.execute(filters);
      set({ hotels, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchFeaturedHotels: async () => {
    set({ isLoading: true, error: null });
    try {
      const { getFeaturedHotels } = getContainer();
      const hotels = await getFeaturedHotels.execute();
      set({ featuredHotels: hotels, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchHotelById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { getHotelById } = getContainer();
      const hotel = await getHotelById.execute(id);
      set({ selectedHotel: hotel, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchManagerHotels: async (managerId) => {
    set({ isLoading: true, error: null });
    try {
      const { getManagerHotels } = getContainer();
      const managerHotels = await getManagerHotels.execute(managerId);
      set({ hotels: managerHotels, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateHotel: async (id, hotel) => {
    set({ isLoading: true, error: null });
    try {
      const { updateHotel } = getContainer();
      const updated = await updateHotel.execute(id, hotel);
      set((state) => ({
        hotels: state.hotels.map((h) => (h.id === id ? updated : h)),
        selectedHotel: state.selectedHotel?.id === id ? updated : state.selectedHotel,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createHotel: async (hotel) => {
    set({ isLoading: true, error: null });
    try {
      const { createHotel } = getContainer();
      const created = await createHotel.execute(hotel);
      set((state) => ({
        hotels: [...state.hotels, created],
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteHotel: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { deleteHotel } = getContainer();
      await deleteHotel.execute(id);
      set((state) => ({
        hotels: state.hotels.filter((h) => h.id !== id),
        selectedHotel: state.selectedHotel?.id === id ? null : state.selectedHotel,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  toggleHotelStatus: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { toggleHotelStatus } = getContainer();
      const isActive = await toggleHotelStatus.execute(id);
      set((state) => ({
        hotels: state.hotels.map((h) => (h.id === id ? { ...h, isActive } : h)),
        selectedHotel: state.selectedHotel?.id === id ? { ...state.selectedHotel, isActive } : state.selectedHotel,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
