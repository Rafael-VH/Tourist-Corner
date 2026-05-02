export type RoomStatus = 'available' | 'occupied' | 'maintenance';

export interface Room {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  type: string;
  pricePerNight: number;
  capacity: number;
  bedType: string;
  size?: number;
  images: string[];
  amenities: string[];
  status: RoomStatus;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomAvailability {
  roomId: string;
  date: Date;
  isAvailable: boolean;
  priceOverride?: number;
}
