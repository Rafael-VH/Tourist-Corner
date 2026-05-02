import { supabase, handleSupabaseError } from '../datasources/SupabaseClient';
import type { AuthRepository } from '@/domain/repositories/AuthRepository';
import type { User, UserRole } from '@/domain/entities/User';

interface UserRecord {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  phone?: string;
  created_at: string;
}

export class SupabaseAuthRepository implements AuthRepository {
  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) handleSupabaseError(error);
    if (!data.user) throw new Error('No se pudo obtener el usuario');

    const user = await this.getCurrentUser();
    if (!user) throw new Error('No se pudo obtener el usuario actual');
    return user;
  }

  async signUp(email: string, password: string, name: string, role: UserRole): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    });

    if (error) handleSupabaseError(error);
    if (!data.user) throw new Error('No se pudo crear el usuario');

    // Profile is auto-created by the handle_new_user trigger
    // Wait a moment for the trigger to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Auto sign-in after registration
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) handleSupabaseError(signInError);
    if (!signInData?.user) throw new Error('No se pudo iniciar sesion despues del registro');

    return this.mapToUser(signInData.user, { name, role });
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) handleSupabaseError(error);
  }

  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error) handleSupabaseError(error);
    if (!data.user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') handleSupabaseError(profileError);

    return this.mapToUser(data.user, profile);
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const { data: updated, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId)
      .select()
      .single();

    if (error) handleSupabaseError(error);

    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) throw new Error('Usuario no autenticado');

    return this.mapToUser(authUser.user, updated);
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) handleSupabaseError(uploadError);

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  private mapToUser(authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }, profile: Partial<UserRecord> | null): User {
    return {
      id: authUser.id,
      email: profile?.email || authUser.email || '',
      name: profile?.name || (authUser.user_metadata?.name as string) || '',
      role: (profile?.role || 'tourist') as UserRole,
      avatarUrl: profile?.avatar_url,
      phone: profile?.phone,
      createdAt: profile?.created_at ? new Date(profile.created_at) : new Date(),
    };
  }
}
