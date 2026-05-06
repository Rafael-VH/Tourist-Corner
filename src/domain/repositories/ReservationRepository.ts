import type { Reservation, CreateReservationDto, ExtendReservationDto, CancelWithPolicyDto, ReservationStatusHistory } from '../entities/Reservation';

export interface ReservationRepository {
  createReservation(data: CreateReservationDto): Promise<Reservation>;
  getReservationById(id: string): Promise<Reservation | null>;
  getReservationsByUser(userId: string): Promise<Reservation[]>;
  getReservationsByHotelIds(hotelIds: string[]): Promise<Reservation[]>;
  getReservationsByStatus(hotelIds: string[], status: Reservation['status']): Promise<Reservation[]>;
  updateReservationStatus(id: string, status: Reservation['status']): Promise<Reservation>;
  cancelReservation(id: string): Promise<Reservation>;
  cancelWithPolicy(id: string, dto: CancelWithPolicyDto): Promise<Reservation>;
  checkIn(id: string): Promise<Reservation>;
  checkOut(id: string): Promise<Reservation>;
  extendReservation(id: string, dto: ExtendReservationDto): Promise<Reservation>;
  markNoShow(id: string): Promise<Reservation>;
  checkAvailability(roomId: string, checkIn: string, checkOut: string): Promise<boolean>;
  getStatusHistory(reservationId: string): Promise<ReservationStatusHistory[]>;
  getOverduePendingReservations(): Promise<Reservation[]>;
}
