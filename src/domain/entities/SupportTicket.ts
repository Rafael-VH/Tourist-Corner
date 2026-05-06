export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  userId: string;
  hotelId: string;
  reservationId: string | null;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSupportTicketDto {
  hotelId: string;
  reservationId?: string;
  subject: string;
  description: string;
}
