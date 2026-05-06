export type ReservationStatus = 'pending' | 'accepted' | 'checked-in' | 'checked-out' | 'completed' | 'cancelled' | 'no-show';

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
  actualCheckIn: Date | null;
  actualCheckOut: Date | null;
  cancellationReason: string | null;
  cancellationFee: number;
  refundAmount: number;
  cancelledAt: Date | null;
  noShowFlag: boolean;
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
  totalPrice?: number;
}

export interface ExtendReservationDto {
  newCheckOut: string;
}

export interface CancelWithPolicyDto {
  reason?: string;
}

export interface ReservationStatusHistory {
  id: string;
  reservationId: string;
  fromStatus: ReservationStatus | null;
  toStatus: ReservationStatus;
  changedBy: string | null;
  changedAt: Date;
  reason: string | null;
}
