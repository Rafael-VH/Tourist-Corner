import type { HotelRepository, HotelFilters } from '@/domain/repositories/HotelRepository';
import type { Hotel, HotelEssentialInfo } from '@/domain/entities/Hotel';

export class GetHotelsUseCase {
  private hotelRepository: HotelRepository;

  constructor(hotelRepository: HotelRepository) {
    this.hotelRepository = hotelRepository;
  }

  async execute(filters?: HotelFilters): Promise<Hotel[]> {
    return this.hotelRepository.getAllHotels(filters);
  }
}

export class GetHotelByIdUseCase {
  private hotelRepository: HotelRepository;

  constructor(hotelRepository: HotelRepository) {
    this.hotelRepository = hotelRepository;
  }

  async execute(id: string): Promise<Hotel | null> {
    return this.hotelRepository.getHotelById(id);
  }
}

export class GetManagerHotelsUseCase {
  private hotelRepository: HotelRepository;

  constructor(hotelRepository: HotelRepository) {
    this.hotelRepository = hotelRepository;
  }

  async execute(managerId: string): Promise<Hotel[]> {
    return this.hotelRepository.getHotelsByManager(managerId);
  }
}

export class CreateHotelUseCase {
  private hotelRepository: HotelRepository;

  constructor(hotelRepository: HotelRepository) {
    this.hotelRepository = hotelRepository;
  }

  async execute(hotel: Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Hotel> {
    return this.hotelRepository.createHotel(hotel);
  }
}

export class UpdateHotelUseCase {
  private hotelRepository: HotelRepository;

  constructor(hotelRepository: HotelRepository) {
    this.hotelRepository = hotelRepository;
  }

  async execute(id: string, hotel: Partial<Hotel>): Promise<Hotel> {
    return this.hotelRepository.updateHotel(id, hotel);
  }
}

export class DeleteHotelUseCase {
  private hotelRepository: HotelRepository;

  constructor(hotelRepository: HotelRepository) {
    this.hotelRepository = hotelRepository;
  }

  async execute(id: string): Promise<void> {
    return this.hotelRepository.deleteHotel(id);
  }
}

export class GetHotelEssentialInfoUseCase {
  private hotelRepository: HotelRepository;

  constructor(hotelRepository: HotelRepository) {
    this.hotelRepository = hotelRepository;
  }

  async execute(id: string): Promise<HotelEssentialInfo | null> {
    return this.hotelRepository.getHotelEssentialInfo(id);
  }
}

export class ToggleHotelStatusUseCase {
  private hotelRepository: HotelRepository;

  constructor(hotelRepository: HotelRepository) {
    this.hotelRepository = hotelRepository;
  }

  async execute(id: string): Promise<boolean> {
    return this.hotelRepository.toggleHotelStatus(id);
  }
}

export class GetFeaturedHotelsUseCase {
  private hotelRepository: HotelRepository;

  constructor(hotelRepository: HotelRepository) {
    this.hotelRepository = hotelRepository;
  }

  async execute(): Promise<Hotel[]> {
    return this.hotelRepository.getFeaturedHotels();
  }
}
