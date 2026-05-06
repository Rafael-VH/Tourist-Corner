import { supabase, handleSupabaseError } from '../datasources/SupabaseClient';
import type { ReservationRepository } from '@/domain/repositories/ReservationRepository';
import type { Reservation, CreateReservationDto } from '@/domain/entities/Reservation';

interface ReservationRecord {
  id: string;
  room_id: string;
  user_id: string | null;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  status: string;
  total_price: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export class SupabaseReservationRepository implements ReservationRepository {
  async createReservation(data: CreateReservationDto): Promise<Reservation> {
    const { data: record, error } = await supabase
      .from('reservations')
      .insert({
        room_id: data.roomId,
        guest_name: data.guestName,
        guest_email: data.guestEmail,
        guest_phone: data.guestPhone || null,
        check_in: data.checkIn,
        check_out: data.checkOut,
        total_price: 0,
        notes: data.notes || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return this.mapToReservation(record);
  }

  async getReservationById(id: string): Promise<Reservation | null> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') handleSupabaseError(error);
    if (!data) return null;

    return this.mapToReservation(data);
  }

  async getReservationsByUser(userId: string): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId)
      .order('check_in', { ascending: false });

    if (error) handleSupabaseError(error);
    return (data || []).map(this.mapToReservation);
  }

  async getReservationsByHotelIds(hotelIds: string[]): Promise<Reservation[]> {
    if (hotelIds.length === 0) return [];

    const { data, error } = await supabase
      .from('reservations')
      .select('*, room:room_id(*, hotel:hotel_id(id, name))')
      .in('room.hotel_id', hotelIds)
      .order('check_in', { ascending: false });

    if (error) handleSupabaseError(error);
    return (data || []).map(this.mapToReservation);
  }

  async updateReservationStatus(id: string, status: Reservation['status']): Promise<Reservation> {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return this.mapToReservation(data);
  }

  async cancelReservation(id: string): Promise<Reservation> {
    return this.updateReservationStatus(id, 'cancelled');
  }

  private mapToReservation(record: ReservationRecord): Reservation {
    return {
      id: record.id,
      roomId: record.room_id,
      userId: record.user_id,
      guestName: record.guest_name,
      guestEmail: record.guest_email,
      guestPhone: record.guest_phone,
      checkIn: new Date(record.check_in),
      checkOut: new Date(record.check_out),
      totalPrice: record.total_price,
      status: record.status as Reservation['status'],
      notes: record.notes,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    };
  }
}
