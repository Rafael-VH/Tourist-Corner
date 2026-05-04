import { supabase, handleSupabaseError } from '../datasources/SupabaseClient';
import type { RoomRepository } from '@/domain/repositories/RoomRepository';
import type { Room, RoomAvailability, RoomStatus } from '@/domain/entities/Room';

interface RoomRecord {
  id: string;
  hotel_id: string;
  name: string;
  description: string;
  type: string;
  price_per_night: number;
  capacity: number;
  bed_type: string;
  size?: number;
  images: string[];
  amenities: string[];
  status: RoomStatus;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

interface AvailabilityRecord {
  room_id: string;
  date: string;
  is_available: boolean;
  price_override?: number;
}

export class SupabaseRoomRepository implements RoomRepository {
  async getRoomsByHotel(hotelId: string): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', hotelId);

    if (error) handleSupabaseError(error);

    const rooms = (data || []).map(this.mapToRoom);

    const { data: featuredData } = await supabase
      .from('featured_rooms')
      .select('room_id')
      .eq('active', true);

    const featuredSet = new Set((featuredData || []).map((f: { room_id: string }) => f.room_id));

    return rooms.map((r) => ({
      ...r,
      isFeatured: featuredSet.has(r.id),
    }));
  }

  async getRoomById(id: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') handleSupabaseError(error);
    if (!data) return null;

    return this.mapToRoom(data);
  }

  async createRoom(room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .insert(this.mapToRecord(room))
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return this.mapToRoom(data);
  }

  async updateRoom(id: string, room: Partial<Room>): Promise<Room> {
    const updateData: Partial<RoomRecord> = {};
    if (room.name) updateData.name = room.name;
    if (room.description) updateData.description = room.description;
    if (room.type) updateData.type = room.type;
    if (room.pricePerNight !== undefined) updateData.price_per_night = room.pricePerNight;
    if (room.capacity) updateData.capacity = room.capacity;
    if (room.bedType) updateData.bed_type = room.bedType;
    if (room.size !== undefined) updateData.size = room.size;
    if (room.images) updateData.images = room.images;
    if (room.amenities) updateData.amenities = room.amenities;
    if (room.status) updateData.status = room.status;
    if (room.isAvailable !== undefined) updateData.is_available = room.isAvailable;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('rooms')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return this.mapToRoom(data);
  }

  async deleteRoom(id: string): Promise<void> {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);

    if (error) handleSupabaseError(error);
  }

  async getRoomAvailability(roomId: string, startDate: Date, endDate: Date): Promise<RoomAvailability[]> {
    const { data, error } = await supabase
      .from('room_availability')
      .select('*')
      .eq('room_id', roomId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    if (error) handleSupabaseError(error);
    return (data || []).map(this.mapToAvailability);
  }

  async updateRoomAvailability(roomId: string, availability: RoomAvailability[]): Promise<void> {
    const records = availability.map((a) => ({
      room_id: roomId,
      date: a.date.toISOString().split('T')[0],
      is_available: a.isAvailable,
      price_override: a.priceOverride,
    }));

    const { error } = await supabase
      .from('room_availability')
      .upsert(records);

    if (error) handleSupabaseError(error);
  }

  async updateRoomStatus(roomId: string, status: string): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .update({
        status: status as RoomStatus,
        is_available: status === 'available',
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return this.mapToRoom(data);
  }

  async getFeaturedRooms(): Promise<Room[]> {
    const { data: featuredData, error: featuredError } = await supabase
      .from('featured_rooms')
      .select('room_id')
      .eq('active', true)
      .order('featured_order', { ascending: true });

    if (featuredError) handleSupabaseError(featuredError);

    if (!featuredData || featuredData.length === 0) {
      return [];
    }

    const roomIds = featuredData.map((f: { room_id: string }) => f.room_id);

    const { data: roomsData, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .in('id', roomIds)
      .eq('is_available', true);

    if (roomsError) handleSupabaseError(roomsError);

    const rooms = (roomsData || []).map(this.mapToRoom);
    const featuredSet = new Set(roomIds);

    return rooms
      .map((r) => ({ ...r, isFeatured: featuredSet.has(r.id) }))
      .sort((a, b) => {
        const aIndex = roomIds.indexOf(a.id);
        const bIndex = roomIds.indexOf(b.id);
        return aIndex - bIndex;
      });
  }

  async getFeaturedRoomsByHotel(hotelId: string): Promise<Room[]> {
    const { data: featuredData, error: featuredError } = await supabase
      .from('featured_rooms')
      .select('room_id')
      .eq('active', true)
      .order('featured_order', { ascending: true });

    if (featuredError) handleSupabaseError(featuredError);

    if (!featuredData || featuredData.length === 0) {
      return [];
    }

    const roomIds = featuredData.map((f: { room_id: string }) => f.room_id);

    const { data: roomsData, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .in('id', roomIds)
      .eq('hotel_id', hotelId)
      .eq('is_available', true);

    if (roomsError) handleSupabaseError(roomsError);

    const rooms = (roomsData || []).map(this.mapToRoom);
    const featuredSet = new Set(roomIds);

    return rooms
      .map((r) => ({ ...r, isFeatured: featuredSet.has(r.id) }))
      .sort((a, b) => {
        const aIndex = roomIds.indexOf(a.id);
        const bIndex = roomIds.indexOf(b.id);
        return aIndex - bIndex;
      });
  }

  private mapToRoom(record: RoomRecord): Room {
    return {
      id: record.id,
      hotelId: record.hotel_id,
      name: record.name,
      description: record.description,
      type: record.type,
      pricePerNight: record.price_per_night,
      capacity: record.capacity,
      bedType: record.bed_type,
      size: record.size,
      images: record.images,
      amenities: record.amenities,
      status: record.status,
      isAvailable: record.is_available,
      isFeatured: false,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    };
  }

  private mapToRecord(room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Partial<RoomRecord> {
    return {
      hotel_id: room.hotelId,
      name: room.name,
      description: room.description,
      type: room.type,
      price_per_night: room.pricePerNight,
      capacity: room.capacity,
      bed_type: room.bedType,
      size: room.size,
      images: room.images,
      amenities: room.amenities,
      status: room.status,
      is_available: room.isAvailable,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  private mapToAvailability(record: AvailabilityRecord): RoomAvailability {
    return {
      roomId: record.room_id,
      date: new Date(record.date),
      isAvailable: record.is_available,
      priceOverride: record.price_override,
    };
  }
}
