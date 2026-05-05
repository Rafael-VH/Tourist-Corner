import { create } from 'zustand';
import type { Room, RoomStatus } from '@/domain/entities/Room';
import { getContainer } from '@/core/di/Container';

interface RoomState {
  rooms: Room[];
  featuredRooms: Room[];
  selectedRoom: Room | null;
  isLoading: boolean;
  error: string | null;

  setRooms: (rooms: Room[]) => void;
  setFeaturedRooms: (rooms: Room[]) => void;
  setSelectedRoom: (room: Room | null) => void;
  fetchRoomsByHotel: (hotelId: string) => Promise<void>;
  fetchFeaturedRooms: () => Promise<void>;
  fetchFeaturedRoomsByHotel: (hotelId: string) => Promise<void>;
  fetchRoomById: (id: string) => Promise<void>;
  updateRoom: (roomId: string, room: Partial<Room>) => Promise<void>;
  updateRoomStatus: (roomId: string, status: RoomStatus) => Promise<void>;
  createRoom: (room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
}

export const useRoomStore = create<RoomState>((set) => ({
  rooms: [],
  featuredRooms: [],
  selectedRoom: null,
  isLoading: false,
  error: null,

  setRooms: (rooms) => set({ rooms }),
  setFeaturedRooms: (rooms) => set({ featuredRooms: rooms }),
  setSelectedRoom: (room) => set({ selectedRoom: room }),

  fetchRoomsByHotel: async (hotelId) => {
    set({ isLoading: true, error: null });
    try {
      const { getRoomsByHotel } = getContainer();
      const rooms = await getRoomsByHotel.execute(hotelId);
      set({ rooms, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchFeaturedRooms: async () => {
    set({ isLoading: true, error: null });
    try {
      const { getFeaturedRooms } = getContainer();
      const rooms = await getFeaturedRooms.execute();
      set({ featuredRooms: rooms, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchFeaturedRoomsByHotel: async (hotelId) => {
    set({ isLoading: true, error: null });
    try {
      const { getFeaturedRoomsByHotel } = getContainer();
      const rooms = await getFeaturedRoomsByHotel.execute(hotelId);
      set({ featuredRooms: rooms, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchRoomById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { getRoomById } = getContainer();
      const room = await getRoomById.execute(id);
      set({ selectedRoom: room, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateRoomStatus: async (roomId, status) => {
    set({ isLoading: true });
    try {
      const { updateRoomStatus } = getContainer();
      const updatedRoom = await updateRoomStatus.execute(roomId, status);
      set((state) => ({
        rooms: state.rooms.map((r) =>
          r.id === roomId ? updatedRoom : r
        ),
        selectedRoom: state.selectedRoom?.id === roomId ? updatedRoom : state.selectedRoom,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateRoom: async (roomId, room) => {
    set({ isLoading: true, error: null });
    try {
      const { updateRoom } = getContainer();
      const updated = await updateRoom.execute(roomId, room);
      set((state) => ({
        rooms: state.rooms.map((r) => (r.id === roomId ? updated : r)),
        selectedRoom: state.selectedRoom?.id === roomId ? updated : state.selectedRoom,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createRoom: async (room) => {
    set({ isLoading: true, error: null });
    try {
      const { createRoom } = getContainer();
      const created = await createRoom.execute(room);
      set((state) => ({
        rooms: [...state.rooms, created],
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteRoom: async (roomId) => {
    set({ isLoading: true, error: null });
    try {
      const { deleteRoom } = getContainer();
      await deleteRoom.execute(roomId);
      set((state) => ({
        rooms: state.rooms.filter((r) => r.id !== roomId),
        selectedRoom: state.selectedRoom?.id === roomId ? null : state.selectedRoom,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
