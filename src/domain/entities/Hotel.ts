export type HotelType = 'hotel' | 'resort' | 'motel' | 'residential';

export interface Hotel {
  id: string;
  name: string;
  type: HotelType;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  images: string[];
  coverImage?: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
  latitude: number;
  longitude: number;
  priceRange: {
    min: number;
    max: number;
  };
  managerId: string;
  branchOf?: string | null;
  isMain: boolean;
  branches?: Hotel[];
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface HotelEssentialInfo {
  id: string;
  name: string;
  type: HotelType;
  coverImage?: string;
  rating: number;
  priceRange: {
    min: number;
    max: number;
  };
  city: string;
  amenities: string[];
  roomCount: number;
  reviewCount: number;
}
