import type { Reservation, CreateReservationDto } from '../entities/Reservation';

export interface ReservationRepository {
  createReservation(data: CreateReservationDto): Promise<Reservation>;
  getReservationById(id: string): Promise<Reservation | null>;
  getReservationsByUser(userId: string): Promise<Reservation[]>;
  getReservationsByHotelIds(hotelIds: string[]): Promise<Reservation[]>;
  updateReservationStatus(id: string, status: Reservation['status']): Promise<Reservation>;
  cancelReservation(id: string): Promise<Reservation>;
}
