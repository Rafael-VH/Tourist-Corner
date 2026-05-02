import type { RoomRepository } from '@/domain/repositories/RoomRepository';
import type { Room, RoomAvailability, RoomStatus } from '@/domain/entities/Room';

export class GetRoomsByHotelUseCase {
  private roomRepository: RoomRepository;

  constructor(roomRepository: RoomRepository) {
    this.roomRepository = roomRepository;
  }

  async execute(hotelId: string): Promise<Room[]> {
    return this.roomRepository.getRoomsByHotel(hotelId);
  }
}

export class GetRoomByIdUseCase {
  private roomRepository: RoomRepository;

  constructor(roomRepository: RoomRepository) {
    this.roomRepository = roomRepository;
  }

  async execute(id: string): Promise<Room | null> {
    return this.roomRepository.getRoomById(id);
  }
}

export class CreateRoomUseCase {
  private roomRepository: RoomRepository;

  constructor(roomRepository: RoomRepository) {
    this.roomRepository = roomRepository;
  }

  async execute(room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<Room> {
    return this.roomRepository.createRoom(room);
  }
}

export class UpdateRoomUseCase {
  private roomRepository: RoomRepository;

  constructor(roomRepository: RoomRepository) {
    this.roomRepository = roomRepository;
  }

  async execute(id: string, room: Partial<Room>): Promise<Room> {
    return this.roomRepository.updateRoom(id, room);
  }
}

export class DeleteRoomUseCase {
  private roomRepository: RoomRepository;

  constructor(roomRepository: RoomRepository) {
    this.roomRepository = roomRepository;
  }

  async execute(id: string): Promise<void> {
    return this.roomRepository.deleteRoom(id);
  }
}

export class GetRoomAvailabilityUseCase {
  private roomRepository: RoomRepository;

  constructor(roomRepository: RoomRepository) {
    this.roomRepository = roomRepository;
  }

  async execute(roomId: string, startDate: Date, endDate: Date): Promise<RoomAvailability[]> {
    return this.roomRepository.getRoomAvailability(roomId, startDate, endDate);
  }
}

export class UpdateRoomAvailabilityUseCase {
  private roomRepository: RoomRepository;

  constructor(roomRepository: RoomRepository) {
    this.roomRepository = roomRepository;
  }

  async execute(roomId: string, availability: RoomAvailability[]): Promise<void> {
    return this.roomRepository.updateRoomAvailability(roomId, availability);
  }
}

export class UpdateRoomStatusUseCase {
  private roomRepository: RoomRepository;

  constructor(roomRepository: RoomRepository) {
    this.roomRepository = roomRepository;
  }

  async execute(roomId: string, status: RoomStatus): Promise<Room> {
    return this.roomRepository.updateRoomStatus(roomId, status);
  }
}
