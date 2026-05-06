import type { SupportTicket, CreateSupportTicketDto } from '../entities/SupportTicket';

export interface SupportTicketRepository {
  createTicket(ticket: CreateSupportTicketDto, userId: string): Promise<SupportTicket>;
  getTicketsByUser(userId: string): Promise<SupportTicket[]>;
  getTicketById(id: string): Promise<SupportTicket>;
  updateTicketStatus(id: string, status: SupportTicket['status']): Promise<SupportTicket>;
  getTicketsByHotel(hotelId: string): Promise<SupportTicket[]>;
}
