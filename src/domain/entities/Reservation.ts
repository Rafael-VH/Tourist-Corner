export type ReservationStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export interface Reservation {
  id: string;
  roomId: string;
  userId: string | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  status: ReservationStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReservationDto {
  roomId: string;
  userId: string | null;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  notes?: string;
}
