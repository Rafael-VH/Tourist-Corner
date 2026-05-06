import { supabase, handleSupabaseError } from '../datasources/SupabaseClient';
import type { SupportTicketRepository } from '@/domain/repositories/SupportTicketRepository';
import type { SupportTicket, CreateSupportTicketDto } from '@/domain/entities/SupportTicket';

interface SupportTicketRecord {
  id: string;
  user_id: string;
  hotel_id: string;
  reservation_id: string | null;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseSupportTicketRepository implements SupportTicketRepository {
  private mapToTicket(record: SupportTicketRecord): SupportTicket {
    return {
      id: record.id,
      userId: record.user_id,
      hotelId: record.hotel_id,
      reservationId: record.reservation_id,
      subject: record.subject,
      description: record.description,
      status: record.status as SupportTicket['status'],
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    };
  }

  async createTicket(ticket: CreateSupportTicketDto, userId: string): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        hotel_id: ticket.hotelId,
        reservation_id: ticket.reservationId || null,
        subject: ticket.subject,
        description: ticket.description,
      })
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return this.mapToTicket(data as SupportTicketRecord);
  }

  async getTicketsByUser(userId: string): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error);
    return (data as SupportTicketRecord[]).map((r) => this.mapToTicket(r));
  }

  async getTicketById(id: string): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) handleSupabaseError(error);
    return this.mapToTicket(data as SupportTicketRecord);
  }

  async updateTicketStatus(id: string, status: SupportTicket['status']): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return this.mapToTicket(data as SupportTicketRecord);
  }

  async getTicketsByHotel(hotelId: string): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('hotel_id', hotelId)
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error);
    return (data as SupportTicketRecord[]).map((r) => this.mapToTicket(r));
  }
}
