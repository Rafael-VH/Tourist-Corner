import { create } from 'zustand';
import type { Room, RoomStatus } from '@/domain/entities/Room';

interface RoomState {
  rooms: Room[];
  selectedRoom: Room | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setRooms: (rooms: Room[]) => void;
  setSelectedRoom: (room: Room | null) => void;
  fetchRoomsByHotel: (hotelId: string) => Promise<void>;
  fetchRoomById: (id: string) => Promise<void>;
  updateRoomStatus: (roomId: string, status: RoomStatus) => Promise<void>;
}

// Demo rooms data
const demoRooms: Record<string, Room[]> = {
  '1': [
    {
      id: '101',
      hotelId: '1',
      name: 'Suite Presidencial',
      description: 'Lujosa suite con vista panoramica a la ciudad, sala de estar separada, bano de marmol con jacuzzi y amenities premium.',
      type: 'Suite',
      pricePerNight: 450,
      capacity: 4,
      bedType: 'King Size + Sofa Cama',
      size: 85,
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
      ],
      amenities: ['Jacuzzi', 'Vista Panoramica', 'Mini Bar', 'Caja Fuerte', 'Aire Acondicionado', 'Smart TV', 'WiFi Premium'],
      status: 'available',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '102',
      hotelId: '1',
      name: 'Habitacion Deluxe',
      description: 'Elegante habitacion con cama king size, escritorio de trabajo, bano moderno y vista a la ciudad.',
      type: 'Deluxe',
      pricePerNight: 220,
      capacity: 2,
      bedType: 'King Size',
      size: 45,
      images: [
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
      ],
      amenities: ['Escritorio', 'Mini Bar', 'Caja Fuerte', 'Aire Acondicionado', 'Smart TV', 'WiFi'],
      status: 'available',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '103',
      hotelId: '1',
      name: 'Habitacion Estandar',
      description: 'Comoda habitacion con todas las comodidades esenciales para una estancia agradable.',
      type: 'Estandar',
      pricePerNight: 120,
      capacity: 2,
      bedType: 'Queen Size',
      size: 32,
      images: [
        'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800',
      ],
      amenities: ['WiFi', 'TV', 'Aire Acondicionado', 'Bano Privado'],
      status: 'occupied',
      isAvailable: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  '2': [
    {
      id: '201',
      hotelId: '2',
      name: 'Bungalow Jardin',
      description: 'Bungalow independiente rodeado de exuberantes jardines tropicales con terraza privada y hamacas.',
      type: 'Bungalow',
      pricePerNight: 600,
      capacity: 3,
      bedType: 'King Size',
      size: 70,
      images: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      ],
      amenities: ['Terraza Privada', 'Jardin', 'Mini Bar', 'Piscina Privada', 'WiFi', 'Smart TV', 'Jacuzzi'],
      status: 'available',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '202',
      hotelId: '2',
      name: 'Suite Familiar',
      description: 'Espaciosa suite con dos habitaciones, perfecta para familias. Incluye cocina equipada y sala de juegos.',
      type: 'Familiar',
      pricePerNight: 800,
      capacity: 6,
      bedType: '2 King Size',
      size: 120,
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      ],
      amenities: ['Cocina Equipada', 'Sala de Juegos', '2 Banos', 'Terraza', 'WiFi', 'Smart TV', 'Lavadora'],
      status: 'available',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  '3': [
    {
      id: '301',
      hotelId: '3',
      name: 'Suite Romance',
      description: 'Suite tematica romantica con jacuzzi en forma de corazon, iluminacion ambiental y petalos de rosa.',
      type: 'Suite Tematica',
      pricePerNight: 150,
      capacity: 2,
      bedType: 'King Size Redonda',
      size: 40,
      images: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
      ],
      amenities: ['Jacuzzi', 'Iluminacion Ambiental', 'WiFi', 'TV Premium', 'Mini Bar'],
      status: 'available',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  '4': [
    {
      id: '401',
      hotelId: '4',
      name: 'Apartamento Estudio',
      description: 'Estudio completamente equipado con cocina, cama queen, bano y area de trabajo. Ideal para estancias largas.',
      type: 'Estudio',
      pricePerNight: 45,
      capacity: 2,
      bedType: 'Queen Size',
      size: 35,
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      ],
      amenities: ['Cocina Equipada', 'WiFi', 'TV', 'Lavadora', 'Escritorio'],
      status: 'available',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  '5': [
    {
      id: '501',
      hotelId: '5',
      name: 'Habitacion Premium',
      description: 'Habitacion de diseno con muebles contemporaneos, vista a la ciudad y bano de lujo con ducha tipo lluvia.',
      type: 'Premium',
      pricePerNight: 280,
      capacity: 2,
      bedType: 'King Size',
      size: 42,
      images: [
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
      ],
      amenities: ['Vista Ciudad', 'Ducha Lluvia', 'Mini Bar', 'Smart TV', 'WiFi', 'Caja Fuerte'],
      status: 'available',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  '6': [
    {
      id: '601',
      hotelId: '6',
      name: 'Villa Golf',
      description: 'Villa privada con acceso directo al campo de golf, piscina privada y servicio de mayordomo.',
      type: 'Villa',
      pricePerNight: 1200,
      capacity: 8,
      bedType: '4 King Size',
      size: 250,
      images: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      ],
      amenities: ['Piscina Privada', 'Campo Golf', 'Mayordomo', 'Cocina Chef', 'Gimnasio Privado', 'WiFi', 'Smart TV', 'Jacuzzi'],
      status: 'available',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

export const useRoomStore = create<RoomState>((set) => ({
  rooms: [],
  selectedRoom: null,
  isLoading: false,
  error: null,

  setRooms: (rooms) => set({ rooms }),
  setSelectedRoom: (room) => set({ selectedRoom: room }),

  fetchRoomsByHotel: async (hotelId) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const rooms = demoRooms[hotelId] || [];
      set({ rooms, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchRoomById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const allRooms = Object.values(demoRooms).flat();
      const room = allRooms.find((r) => r.id === id) || null;
      set({ selectedRoom: room, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateRoomStatus: async (roomId, status) => {
    set({ isLoading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      set((state) => ({
        rooms: state.rooms.map((r) =>
          r.id === roomId ? { ...r, status, isAvailable: status === 'available' } : r
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
