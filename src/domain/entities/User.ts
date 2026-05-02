export type UserRole = 'tourist' | 'manager';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
}

export interface TouristProfile extends User {
  role: 'tourist';
  favoriteHotels?: string[];
  bookingsCount?: number;
}

export interface ManagerProfile extends User {
  role: 'manager';
  hotelIds: string[];
  subscriptionPlan: 'free' | 'premium';
}
