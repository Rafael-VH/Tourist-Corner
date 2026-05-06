import { create } from 'zustand';
import type { User, UserRole } from '@/domain/entities/User';
import { getContainer } from '@/core/di/Container';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (email: string, password: string) => Promise<User | undefined>;
  signUp: (email: string, password: string, name: string, role: UserRole, registrationCode?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (userId: string, data: Partial<User>) => Promise<void>;
  uploadAvatar: (userId: string, file: File) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { signIn } = getContainer();
      const user = await signIn.execute(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false, isAuthenticated: false });
      throw error;
    }
  },

  signUp: async (email, password, name, role, registrationCode) => {
    set({ isLoading: true, error: null });
    try {
      const { signUp } = getContainer();
      const user = await signUp.execute(email, password, name, role, registrationCode);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      const { signOut } = getContainer();
      await signOut.execute();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateProfile: async (userId, data) => {
    set({ isLoading: true, error: null });
    try {
      const { updateProfile } = getContainer();
      const updatedUser = await updateProfile.execute(userId, data);
      set({ user: updatedUser, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  uploadAvatar: async (userId, file) => {
    set({ isLoading: true, error: null });
    try {
      const { uploadAvatar } = getContainer();
      const avatarUrl = await uploadAvatar.execute(userId, file);
      const currentUser = get().user;
      if (currentUser) {
        const updatedUser = await getContainer().updateProfile.execute(currentUser.id, { avatarUrl });
        set({ user: updatedUser, isLoading: false });
      }
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updatePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const { updatePassword } = getContainer();
      await updatePassword.execute(currentPassword, newPassword);
      set({ isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const { resetPassword } = getContainer();
      await resetPassword.execute(email);
      set({ isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));
