import { supabase, handleSupabaseError } from '../datasources/SupabaseClient';
import type { HotelRepository, HotelFilters } from '@/domain/repositories/HotelRepository';
import type { Hotel, HotelEssentialInfo, HotelType } from '@/domain/entities/Hotel';

interface HotelRecord {
  id: string;
  name: string;
  type: HotelType;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  images: string[];
  cover_image?: string;
  rating: number;
  review_count: number;
  amenities: string[];
  latitude: number;
  longitude: number;
  price_range_min: number;
  price_range_max: number;
  manager_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export class SupabaseHotelRepository implements HotelRepository {
  async getAllHotels(filters?: HotelFilters): Promise<Hotel[]> {
    let query = supabase
      .from('hotels')
      .select('*')
      .eq('is_active', true);

    if (filters?.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.minPrice) {
      query = query.gte('price_range_min', filters.minPrice);
    }
    if (filters?.maxPrice) {
      query = query.lte('price_range_max', filters.maxPrice);
    }
    if (filters?.rating) {
      query = query.gte('rating', filters.rating);
    }
    if (filters?.searchQuery) {
      query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) handleSupabaseError(error);

    return (data || []).map(this.mapToHotel);
  }

  async getHotelById(id: string): Promise<Hotel | null> {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') handleSupabaseError(error);
    if (!data) return null;

    return this.mapToHotel(data);
  }

  async getHotelsByManager(managerId: string): Promise<Hotel[]> {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('manager_id', managerId);

    if (error) handleSupabaseError(error);
    return (data || []).map(this.mapToHotel);
  }

  async createHotel(hotel: Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Hotel> {
    const { data, error } = await supabase
      .from('hotels')
      .insert(this.mapToRecord(hotel))
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return this.mapToHotel(data);
  }

  async updateHotel(id: string, hotel: Partial<Hotel>): Promise<Hotel> {
    const updateData: Partial<HotelRecord> = {};
    if (hotel.name) updateData.name = hotel.name;
    if (hotel.description) updateData.description = hotel.description;
    if (hotel.address) updateData.address = hotel.address;
    if (hotel.city) updateData.city = hotel.city;
    if (hotel.phone) updateData.phone = hotel.phone;
    if (hotel.email) updateData.email = hotel.email;
    if (hotel.images) updateData.images = hotel.images;
    if (hotel.coverImage) updateData.cover_image = hotel.coverImage;
    if (hotel.rating !== undefined) updateData.rating = hotel.rating;
    if (hotel.reviewCount !== undefined) updateData.review_count = hotel.reviewCount;
    if (hotel.amenities) updateData.amenities = hotel.amenities;
    if (hotel.latitude) updateData.latitude = hotel.latitude;
    if (hotel.longitude) updateData.longitude = hotel.longitude;
    if (hotel.priceRange) {
      if (hotel.priceRange.min !== undefined) updateData.price_range_min = hotel.priceRange.min;
      if (hotel.priceRange.max !== undefined) updateData.price_range_max = hotel.priceRange.max;
    }
    if (hotel.isActive !== undefined) updateData.is_active = hotel.isActive;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('hotels')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return this.mapToHotel(data);
  }

  async deleteHotel(id: string): Promise<void> {
    const { error } = await supabase
      .from('hotels')
      .delete()
      .eq('id', id);

    if (error) handleSupabaseError(error);
  }

  async getHotelEssentialInfo(id: string): Promise<HotelEssentialInfo | null> {
    const { data, error } = await supabase
      .from('hotels')
      .select('id, name, type, cover_image, rating, price_range_min, price_range_max, city, amenities, review_count')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') handleSupabaseError(error);
    if (!data) return null;

    const { data: roomCount } = await supabase
      .from('rooms')
      .select('id', { count: 'exact' })
      .eq('hotel_id', id);

    return {
      id: data.id,
      name: data.name,
      type: data.type,
      coverImage: data.cover_image,
      rating: data.rating,
      priceRange: { min: data.price_range_min, max: data.price_range_max },
      city: data.city,
      amenities: data.amenities,
      roomCount: roomCount?.length || 0,
      reviewCount: data.review_count,
    };
  }

  async toggleHotelStatus(id: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('hotels')
      .select('is_active')
      .eq('id', id)
      .single();

    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Hotel not found');

    const newStatus = !data.is_active;

    const { error: updateError } = await supabase
      .from('hotels')
      .update({ is_active: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) handleSupabaseError(updateError);

    return newStatus;
  }

  private mapToHotel(record: HotelRecord): Hotel {
    return {
      id: record.id,
      name: record.name,
      type: record.type,
      description: record.description,
      address: record.address,
      city: record.city,
      phone: record.phone,
      email: record.email,
      images: record.images,
      coverImage: record.cover_image,
      rating: record.rating,
      reviewCount: record.review_count,
      amenities: record.amenities,
      latitude: record.latitude,
      longitude: record.longitude,
      priceRange: { min: record.price_range_min, max: record.price_range_max },
      managerId: record.manager_id,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
      isActive: record.is_active,
    };
  }

  private mapToRecord(hotel: Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>): Partial<HotelRecord> {
    return {
      name: hotel.name,
      type: hotel.type,
      description: hotel.description,
      address: hotel.address,
      city: hotel.city,
      phone: hotel.phone,
      email: hotel.email,
      images: hotel.images,
      cover_image: hotel.coverImage,
      rating: hotel.rating,
      review_count: hotel.reviewCount,
      amenities: hotel.amenities,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      price_range_min: hotel.priceRange.min,
      price_range_max: hotel.priceRange.max,
      manager_id: hotel.managerId,
      is_active: hotel.isActive,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}
