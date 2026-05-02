import { create } from 'zustand';
import type { Hotel } from '@/domain/entities/Hotel';

export interface HotelFilters {
  city?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  rating?: number;
  searchQuery?: string;
}

interface HotelState {
  hotels: Hotel[];
  selectedHotel: Hotel | null;
  isLoading: boolean;
  error: string | null;
  filters: HotelFilters;
  
  // Actions
  setHotels: (hotels: Hotel[]) => void;
  setSelectedHotel: (hotel: Hotel | null) => void;
  setLoading: (loading: boolean) => void;
  setFilters: (filters: HotelFilters) => void;
  fetchHotels: (filters?: HotelFilters) => Promise<void>;
  fetchHotelById: (id: string) => Promise<void>;
}

// Demo hotels data
const demoHotels: Hotel[] = [
  {
    id: '1',
    name: 'Hotel Plaza Grande',
    type: 'hotel',
    description: 'Elegante hotel de 5 estrellas en el corazon de la ciudad. Ofrecemos servicio de primera clase con vistas panoramicas, restaurante gourmet, spa completo y piscina climatizada. Ideal para viajes de negocios y placer.',
    address: 'Av. 16 de Julio, El Prado',
    city: 'La Paz',
    phone: '+591 2 2158070',
    email: 'info@plazagrande.com',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    ],
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    rating: 4.8,
    reviewCount: 234,
    amenities: ['WiFi', 'Piscina', 'Spa', 'Restaurante', 'Gimnasio', 'Estacionamiento', 'Bar', 'Room Service'],
    latitude: -16.5,
    longitude: -68.15,
    priceRange: { min: 120, max: 450 },
    managerId: '2',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '2',
    name: 'Resort Los Tajibos',
    type: 'resort',
    description: 'Un oasis tropical con extensos jardines, piscinas naturales y bungalows privados. Perfecto para escapadas romanticas y familiares. Disfruta de actividades al aire libre y cocina local de clase mundial.',
    address: 'Carretera al Norte Km 7',
    city: 'Santa Cruz',
    phone: '+591 3 3426000',
    email: 'reservas@lostajibos.com',
    images: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
    ],
    coverImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
    rating: 4.6,
    reviewCount: 189,
    amenities: ['WiFi', 'Piscina', 'Spa', 'Restaurante', 'Gimnasio', 'Estacionamiento', 'Bar', 'Tennis'],
    latitude: -17.78,
    longitude: -63.18,
    priceRange: { min: 200, max: 800 },
    managerId: '3',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '3',
    name: 'Motel Luna de Miel',
    type: 'motel',
    description: 'El lugar perfecto para escapadas romanticas. Suites tematicas con jacuzzi privado, iluminacion ambiental y servicio discreto 24 horas.',
    address: 'Zona Sur, Calle 12',
    city: 'La Paz',
    phone: '+591 2 2794567',
    email: 'contacto@lunademiel.com',
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
    ],
    coverImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
    rating: 4.2,
    reviewCount: 156,
    amenities: ['WiFi', 'Jacuzzi', 'Room Service', 'Estacionamiento Privado', 'TV Premium'],
    latitude: -16.55,
    longitude: -68.08,
    priceRange: { min: 50, max: 150 },
    managerId: '4',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '4',
    name: 'Residencial Copacabana',
    type: 'residential',
    description: 'Alojamiento economico y comodo ideal para estancias prolongadas. Apartamentos completamente equipados con cocina, sala y dormitorio separado. Ambiente familiar y seguro.',
    address: 'Calle Sagarnaga 321',
    city: 'La Paz',
    phone: '+591 2 2289012',
    email: 'info@copacabana.com',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    ],
    coverImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    rating: 4.0,
    reviewCount: 98,
    amenities: ['WiFi', 'Cocina Equipada', 'Lavadora', 'TV', 'Estacionamiento'],
    latitude: -16.495,
    longitude: -68.14,
    priceRange: { min: 30, max: 80 },
    managerId: '5',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '5',
    name: 'Hotel Europa',
    type: 'hotel',
    description: 'Hotel boutique con diseno contemporaneo y ambiente sofisticado. Habitaciones elegantes, restaurante de autor y terraza con vistas espectaculares de la ciudad.',
    address: 'Calle Illampu 775',
    city: 'La Paz',
    phone: '+591 2 2115555',
    email: 'reservas@hoteleuropa.com',
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
    ],
    coverImage: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    rating: 4.5,
    reviewCount: 167,
    amenities: ['WiFi', 'Restaurante', 'Bar', 'Gimnasio', 'Business Center', 'Room Service'],
    latitude: -16.498,
    longitude: -68.137,
    priceRange: { min: 90, max: 320 },
    managerId: '6',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: '6',
    name: 'Resort Camino Real',
    type: 'resort',
    description: 'Resort de lujo con campos de golf, spa holistico y experiencias gastronomicas unicas. Situado en un entorno natural privilegiado con vistas a la Cordillera Real.',
    address: 'Zona Los Pinos, Calle 8',
    city: 'Cochabamba',
    phone: '+591 4 4521000',
    email: 'info@caminoreal.com',
    images: [
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
      'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?w=800',
    ],
    coverImage: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
    rating: 4.9,
    reviewCount: 312,
    amenities: ['WiFi', 'Piscina', 'Spa', 'Restaurante', 'Golf', 'Gimnasio', 'Estacionamiento', 'Bar', 'Tennis'],
    latitude: -17.38,
    longitude: -66.15,
    priceRange: { min: 250, max: 1200 },
    managerId: '7',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
];

export const useHotelStore = create<HotelState>((set, get) => ({
  hotels: demoHotels,
  selectedHotel: null,
  isLoading: false,
  error: null,
  filters: {},

  setHotels: (hotels) => set({ hotels }),
  setSelectedHotel: (hotel) => set({ selectedHotel: hotel }),
  setLoading: (isLoading) => set({ isLoading }),
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),

  fetchHotels: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      let filtered = [...demoHotels];
      
      if (filters.city) {
        filtered = filtered.filter((h) => h.city.toLowerCase().includes(filters.city!.toLowerCase()));
      }
      if (filters.type) {
        filtered = filtered.filter((h) => h.type === filters.type);
      }
      if (filters.minPrice) {
        filtered = filtered.filter((h) => h.priceRange.min >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        filtered = filtered.filter((h) => h.priceRange.max <= filters.maxPrice!);
      }
      if (filters.rating) {
        filtered = filtered.filter((h) => h.rating >= filters.rating!);
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (h) => h.name.toLowerCase().includes(q) || h.description.toLowerCase().includes(q)
        );
      }
      
      set({ hotels: filtered, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchHotelById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const hotel = demoHotels.find((h) => h.id === id) || null;
      set({ selectedHotel: hotel, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
