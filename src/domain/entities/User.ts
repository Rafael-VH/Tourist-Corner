export type UserRole = 'client' | 'owner' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
}

export interface ClientProfile extends User {
  role: 'client';
  favoriteHotels?: string[];
  bookingsCount?: number;
}

export interface OwnerProfile extends User {
  role: 'owner';
  hotelIds: string[];
  subscriptionPlan: 'free' | 'premium';
}
