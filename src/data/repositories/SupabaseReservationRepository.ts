import { supabase, handleSupabaseError } from '../datasources/SupabaseClient';
import type { ReservationRepository } from '@/domain/repositories/ReservationRepository';
import type { Reservation, CreateReservationDto, ExtendReservationDto, CancelWithPolicyDto, ReservationStatusHistory } from '@/domain/entities/Reservation';

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
  actual_check_in: string | null;
  actual_check_out: string | null;
  cancellation_reason: string | null;
  cancellation_fee: number;
  refund_amount: number;
  cancelled_at: string | null;
  no_show_flag: boolean;
}

interface StatusHistoryRecord {
  id: string;
  reservation_id: string;
  from_status: string | null;
  to_status: string;
  changed_by: string | null;
  changed_at: string;
  reason: string | null;
}

export class SupabaseReservationRepository implements ReservationRepository {
  async createReservation(data: CreateReservationDto): Promise<Reservation> {
    const { data: record, error } = await supabase
      .from('reservations')
      .insert({
        room_id: data.roomId,
        user_id: data.userId,
        guest_name: data.guestName,
        guest_email: data.guestEmail,
        guest_phone: data.guestPhone || null,
        check_in: data.checkIn,
        check_out: data.checkOut,
        total_price: data.totalPrice ?? 0,
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

  async getReservationsByStatus(hotelIds: string[], status: Reservation['status']): Promise<Reservation[]> {
    if (hotelIds.length === 0) return [];

    const { data, error } = await supabase
      .from('reservations')
      .select('*, room:room_id(*, hotel:hotel_id(id, name))')
      .in('room.hotel_id', hotelIds)
      .eq('status', status)
      .order('check_in', { ascending: true });

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

  async cancelWithPolicy(id: string, dto: CancelWithPolicyDto): Promise<Reservation> {
    const reservation = await this.getReservationById(id);
    if (!reservation) throw new Error('Reservation not found');

    const checkInDate = new Date(reservation.checkIn);
    const now = new Date();
    const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let cancellationFee = 0;
    let refundAmount = reservation.totalPrice;

    if (reservation.status === 'accepted' || reservation.status === 'checked-in') {
      cancellationFee = reservation.totalPrice;
      refundAmount = 0;
    } else if (daysUntilCheckIn < 3) {
      cancellationFee = reservation.totalPrice;
      refundAmount = 0;
    } else if (daysUntilCheckIn < 7) {
      cancellationFee = reservation.totalPrice * 0.5;
      refundAmount = reservation.totalPrice * 0.5;
    }

    const updateData: Record<string, unknown> = {
      status: 'cancelled',
      updated_at: new Date().toISOString(),
      cancellation_reason: dto.reason || null,
      cancellation_fee: cancellationFee,
      refund_amount: refundAmount,
      cancelled_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return this.mapToReservation(data);
  }

  async checkIn(id: string): Promise<Reservation> {
    const reservation = await this.getReservationById(id);
    if (!reservation) throw new Error('Reservation not found');
    if (reservation.status !== 'accepted') {
      throw new Error(`Cannot check-in: reservation status is '${reservation.status}', expected 'accepted'`);
    }

    const { data, error } = await supabase
      .from('reservations')
      .update({
        status: 'checked-in',
        actual_check_in: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error);

    const room = await supabase
      .from('rooms')
      .update({
        is_available: false,
        status: 'occupied',
        updated_at: new Date().toISOString(),
      })
      .eq('id', reservation.roomId)
      .select()
      .single();

    if (room.error) handleSupabaseError(room.error);

    return this.mapToReservation(data);
  }

  async checkOut(id: string): Promise<Reservation> {
    const reservation = await this.getReservationById(id);
    if (!reservation) throw new Error('Reservation not found');
    if (reservation.status !== 'checked-in') {
      throw new Error(`Cannot check-out: reservation status is '${reservation.status}', expected 'checked-in'`);
    }

    const now = new Date();
    let finalTotal = reservation.totalPrice;

    const actualCheckIn = reservation.actualCheckIn || new Date(reservation.checkIn);
    const actualNights = Math.ceil((now.getTime() - actualCheckIn.getTime()) / (1000 * 60 * 60 * 24));
    const plannedNights = Math.ceil((new Date(reservation.checkOut).getTime() - new Date(reservation.checkIn).getTime()) / (1000 * 60 * 60 * 24));

    if (actualNights > plannedNights) {
      const pricePerNight = plannedNights > 0 ? reservation.totalPrice / plannedNights : 0;
      const extraNights = actualNights - plannedNights;
      finalTotal = reservation.totalPrice + (extraNights * pricePerNight);
    }

    const { error } = await supabase
      .from('reservations')
      .update({
        status: 'checked-out',
        actual_check_out: now.toISOString(),
        total_price: finalTotal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error);

    await supabase
      .from('rooms')
      .update({
        is_available: true,
        status: 'available',
        updated_at: new Date().toISOString(),
      })
      .eq('id', reservation.roomId);

    await supabase
      .from('reservations')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    const completedRecord = await this.getReservationById(id);
    if (!completedRecord) throw new Error('Failed to retrieve completed reservation');
    return completedRecord;
  }

  async extendReservation(id: string, dto: ExtendReservationDto): Promise<Reservation> {
    const reservation = await this.getReservationById(id);
    if (!reservation) throw new Error('Reservation not found');

    if (reservation.status !== 'accepted' && reservation.status !== 'checked-in') {
      throw new Error(`Cannot extend: reservation status is '${reservation.status}'`);
    }

    const newCheckOut = new Date(dto.newCheckOut);
    const currentCheckOut = new Date(reservation.checkOut);

    if (newCheckOut <= currentCheckOut) {
      throw new Error('New check-out date must be after current check-out date');
    }

    const isAvailable = await this.checkAvailability(reservation.roomId, currentCheckOut.toISOString().split('T')[0], dto.newCheckOut);
    if (!isAvailable) {
      throw new Error('Room is not available for the extended dates');
    }

    const plannedNights = Math.ceil((currentCheckOut.getTime() - new Date(reservation.checkIn).getTime()) / (1000 * 60 * 60 * 24));
    const pricePerNight = plannedNights > 0 ? reservation.totalPrice / plannedNights : 0;
    const extraNights = Math.ceil((newCheckOut.getTime() - currentCheckOut.getTime()) / (1000 * 60 * 60 * 24));
    const newTotal = reservation.totalPrice + (extraNights * pricePerNight);

    const { data, error } = await supabase
      .from('reservations')
      .update({
        check_out: dto.newCheckOut,
        total_price: newTotal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return this.mapToReservation(data);
  }

  async markNoShow(id: string): Promise<Reservation> {
    const reservation = await this.getReservationById(id);
    if (!reservation) throw new Error('Reservation not found');

    if (reservation.status !== 'pending' && reservation.status !== 'accepted') {
      throw new Error(`Cannot mark no-show: reservation status is '${reservation.status}'`);
    }

    const { data, error } = await supabase
      .from('reservations')
      .update({
        status: 'no-show',
        no_show_flag: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error);

    await supabase
      .from('rooms')
      .update({
        is_available: true,
        status: 'available',
        updated_at: new Date().toISOString(),
      })
      .eq('id', reservation.roomId);

    return this.mapToReservation(data);
  }

  async checkAvailability(roomId: string, checkIn: string, checkOut: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)
      .in('status', ['pending', 'accepted', 'checked-in'])
      .lt('check_in', checkOut)
      .gt('check_out', checkIn);

    if (error) handleSupabaseError(error);
    return count === 0;
  }

  async getStatusHistory(reservationId: string): Promise<ReservationStatusHistory[]> {
    const { data, error } = await supabase
      .from('reservation_status_history')
      .select('*')
      .eq('reservation_id', reservationId)
      .order('changed_at', { ascending: true });

    if (error) handleSupabaseError(error);
    return (data || []).map(this.mapToStatusHistory);
  }

  async getOverduePendingReservations(): Promise<Reservation[]> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .in('status', ['pending', 'accepted'])
      .lt('check_in', yesterdayStr);

    if (error) handleSupabaseError(error);
    return (data || []).map(this.mapToReservation);
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
      actualCheckIn: record.actual_check_in ? new Date(record.actual_check_in) : null,
      actualCheckOut: record.actual_check_out ? new Date(record.actual_check_out) : null,
      cancellationReason: record.cancellation_reason,
      cancellationFee: record.cancellation_fee,
      refundAmount: record.refund_amount,
      cancelledAt: record.cancelled_at ? new Date(record.cancelled_at) : null,
      noShowFlag: record.no_show_flag || false,
    };
  }

  private mapToStatusHistory(record: StatusHistoryRecord): ReservationStatusHistory {
    return {
      id: record.id,
      reservationId: record.reservation_id,
      fromStatus: record.from_status as Reservation['status'] | null,
      toStatus: record.to_status as Reservation['status'],
      changedBy: record.changed_by,
      changedAt: new Date(record.changed_at),
      reason: record.reason,
    };
  }
}
