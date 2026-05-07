import type { User, UserRole } from '../entities/User';
import type { ImageRecord } from './ImageRepository';

export interface AuthRepository {
  signIn(email: string, password: string): Promise<User>;
  signUp(email: string, password: string, name: string, role: UserRole, registrationCode?: string): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  updateProfile(userId: string, data: Partial<User>): Promise<User>;
  uploadAvatar(userId: string, file: File): Promise<ImageRecord>;
  updatePassword(currentPassword: string, newPassword: string): Promise<void>;
  resetPasswordEmail(email: string): Promise<void>;
}
