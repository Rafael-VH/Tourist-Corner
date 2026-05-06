import type { ReservationRepository } from '@/domain/repositories/ReservationRepository';
import type { Reservation, CreateReservationDto, ExtendReservationDto, CancelWithPolicyDto, ReservationStatusHistory } from '@/domain/entities/Reservation';
import type { RoomRepository } from '@/domain/repositories/RoomRepository';

export class CreateReservationUseCase {
  private reservationRepository: ReservationRepository;
  private roomRepository: RoomRepository;

  constructor(reservationRepository: ReservationRepository, roomRepository: RoomRepository) {
    this.reservationRepository = reservationRepository;
    this.roomRepository = roomRepository;
  }

  async execute(data: CreateReservationDto): Promise<Reservation> {
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);

    if (checkOut <= checkIn) {
      throw new Error('Check-out date must be after check-in date');
    }

    const room = await this.roomRepository.getRoomById(data.roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const isAvailable = await this.reservationRepository.checkAvailability(
      data.roomId,
      data.checkIn,
      data.checkOut,
    );
    if (!isAvailable) {
      throw new Error('Room is not available for the selected dates');
    }

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * room.pricePerNight;

    return this.reservationRepository.createReservation({
      ...data,
      totalPrice,
    });
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

export class GetReservationsByStatusUseCase {
  private reservationRepository: ReservationRepository;

  constructor(reservationRepository: ReservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  async execute(hotelIds: string[], status: Reservation['status']): Promise<Reservation[]> {
    return this.reservationRepository.getReservationsByStatus(hotelIds, status);
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

export class CancelWithPolicyUseCase {
  private reservationRepository: ReservationRepository;

  constructor(reservationRepository: ReservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  async execute(id: string, dto: CancelWithPolicyDto): Promise<Reservation> {
    return this.reservationRepository.cancelWithPolicy(id, dto);
  }
}

export class CheckInUseCase {
  private reservationRepository: ReservationRepository;

  constructor(reservationRepository: ReservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  async execute(id: string): Promise<Reservation> {
    return this.reservationRepository.checkIn(id);
  }
}

export class CheckOutUseCase {
  private reservationRepository: ReservationRepository;

  constructor(reservationRepository: ReservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  async execute(id: string): Promise<Reservation> {
    return this.reservationRepository.checkOut(id);
  }
}

export class ExtendReservationUseCase {
  private reservationRepository: ReservationRepository;

  constructor(reservationRepository: ReservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  async execute(id: string, dto: ExtendReservationDto): Promise<Reservation> {
    return this.reservationRepository.extendReservation(id, dto);
  }
}

export class MarkNoShowUseCase {
  private reservationRepository: ReservationRepository;

  constructor(reservationRepository: ReservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  async execute(id: string): Promise<Reservation> {
    return this.reservationRepository.markNoShow(id);
  }
}

export class ValidateAvailabilityUseCase {
  private reservationRepository: ReservationRepository;

  constructor(reservationRepository: ReservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  async execute(roomId: string, checkIn: string, checkOut: string): Promise<boolean> {
    return this.reservationRepository.checkAvailability(roomId, checkIn, checkOut);
  }
}

export class GetStatusHistoryUseCase {
  private reservationRepository: ReservationRepository;

  constructor(reservationRepository: ReservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  async execute(reservationId: string): Promise<ReservationStatusHistory[]> {
    return this.reservationRepository.getStatusHistory(reservationId);
  }
}

export class GetOverdueReservationsUseCase {
  private reservationRepository: ReservationRepository;

  constructor(reservationRepository: ReservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  async execute(): Promise<Reservation[]> {
    return this.reservationRepository.getOverduePendingReservations();
  }
}
