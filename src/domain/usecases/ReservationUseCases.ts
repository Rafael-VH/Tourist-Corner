import type { ReservationRepository } from '@/domain/repositories/ReservationRepository';
import type { Reservation, CreateReservationDto } from '@/domain/entities/Reservation';

export class CreateReservationUseCase {
  private reservationRepository: ReservationRepository;

  constructor(reservationRepository: ReservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  async execute(data: CreateReservationDto): Promise<Reservation> {
    return this.reservationRepository.createReservation(data);
  }
}

export class GetReservationByIdUseCase {
  private reservationRepository: ReservationRepository;

  constructor(reservationRepository: ReservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  async execute(id: string): Promise<Reservation | null> {
    return this.reservationRepository.getReservationById(id);
  }
}

export class GetReservationsByUserUseCase {
  private reservationRepository: ReservationRepository;

  constructor(reservationRepository: ReservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  async execute(userId: string): Promise<Reservation[]> {
    return this.reservationRepository.getReservationsByUser(userId);
  }
}

export class UpdateReservationStatusUseCase {
  private reservationRepository: ReservationRepository;

  constructor(reservationRepository: ReservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  async execute(id: string, status: Reservation['status']): Promise<Reservation> {
    return this.reservationRepository.updateReservationStatus(id, status);
  }
}

export class CancelReservationUseCase {
  private reservationRepository: ReservationRepository;

  constructor(reservationRepository: ReservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  async execute(id: string): Promise<Reservation> {
    return this.reservationRepository.cancelReservation(id);
  }
}
