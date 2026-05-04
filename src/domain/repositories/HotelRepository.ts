import type { Hotel, HotelEssentialInfo } from '../entities/Hotel';

export interface HotelFilters {
  city?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  rating?: number;
  searchQuery?: string;
}

export interface HotelRepository {
  getAllHotels(filters?: HotelFilters): Promise<Hotel[]>;
  getHotelById(id: string): Promise<Hotel | null>;
  getHotelsByManager(managerId: string): Promise<Hotel[]>;
  createHotel(hotel: Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Hotel>;
  updateHotel(id: string, hotel: Partial<Hotel>): Promise<Hotel>;
  deleteHotel(id: string): Promise<void>;
  getHotelEssentialInfo(id: string): Promise<HotelEssentialInfo | null>;
  toggleHotelStatus(id: string): Promise<boolean>;
  getFeaturedHotels(): Promise<Hotel[]>;
}
