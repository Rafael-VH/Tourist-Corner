import type { SupportTicketRepository } from '@/domain/repositories/SupportTicketRepository';
import type { SupportTicket, CreateSupportTicketDto } from '@/domain/entities/SupportTicket';

export class CreateSupportTicketUseCase {
  private repository: SupportTicketRepository;

  constructor(repository: SupportTicketRepository) {
    this.repository = repository;
  }

  async execute(userId: string, dto: CreateSupportTicketDto): Promise<SupportTicket> {
    return this.repository.createTicket(dto, userId);
  }
}

export class GetTicketsByUserUseCase {
  private repository: SupportTicketRepository;

  constructor(repository: SupportTicketRepository) {
    this.repository = repository;
  }

  async execute(userId: string): Promise<SupportTicket[]> {
    return this.repository.getTicketsByUser(userId);
  }
}

export class GetTicketByIdUseCase {
  private repository: SupportTicketRepository;

  constructor(repository: SupportTicketRepository) {
    this.repository = repository;
  }

  async execute(id: string): Promise<SupportTicket> {
    return this.repository.getTicketById(id);
  }
}

export class UpdateTicketStatusUseCase {
  private repository: SupportTicketRepository;

  constructor(repository: SupportTicketRepository) {
    this.repository = repository;
  }

  async execute(id: string, status: SupportTicket['status']): Promise<SupportTicket> {
    return this.repository.updateTicketStatus(id, status);
  }
}

export class GetTicketsByHotelUseCase {
  private repository: SupportTicketRepository;

  constructor(repository: SupportTicketRepository) {
    this.repository = repository;
  }

  async execute(hotelId: string): Promise<SupportTicket[]> {
    return this.repository.getTicketsByHotel(hotelId);
  }
}
