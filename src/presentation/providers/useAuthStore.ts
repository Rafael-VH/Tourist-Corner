import { create } from 'zustand';
import type { User, UserRole } from '@/domain/entities/User';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// Demo data for development
const demoUsers: Record<string, User> = {
  'demo@turista.com': {
    id: '1',
    email: 'demo@turista.com',
    name: 'Carlos Turista',
    role: 'tourist',
    avatarUrl: 'https://i.pravatar.cc/150?u=1',
    phone: '+591 77712345',
    createdAt: new Date(),
  },
  'demo@hotel.com': {
    id: '2',
    email: 'demo@hotel.com',
    name: 'Hotel Administrator',
    role: 'manager',
    avatarUrl: 'https://i.pravatar.cc/150?u=2',
    phone: '+591 77767890',
    createdAt: new Date(),
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  signIn: async (email, password) => {
    void password;
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const user = demoUsers[email] || {
        id: '3',
        email,
        name: email.split('@')[0],
        role: 'tourist' as UserRole,
        createdAt: new Date(),
      };
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  signUp: async (email, password, name, role) => {
    void password;
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        role,
        createdAt: new Date(),
      };
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
