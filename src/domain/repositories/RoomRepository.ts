import type { Room, RoomAvailability } from '../entities/Room';

export interface RoomRepository {
  getRoomsByHotel(hotelId: string): Promise<Room[]>;
  getRoomById(id: string): Promise<Room | null>;
  createRoom(room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<Room>;
  updateRoom(id: string, room: Partial<Room>): Promise<Room>;
  deleteRoom(id: string): Promise<void>;
  getRoomAvailability(roomId: string, startDate: Date, endDate: Date): Promise<RoomAvailability[]>;
  updateRoomAvailability(roomId: string, availability: RoomAvailability[]): Promise<void>;
  updateRoomStatus(roomId: string, status: string): Promise<Room>;
  getFeaturedRooms(): Promise<Room[]>;
  getFeaturedRoomsByHotel(hotelId: string): Promise<Room[]>;
}
