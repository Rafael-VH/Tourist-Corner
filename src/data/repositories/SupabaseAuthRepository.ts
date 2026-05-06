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

  async signUp(email: string, password: string, name: string, role: UserRole, registrationCode?: string): Promise<User> {
    if (role === 'owner') {
      if (!registrationCode) throw new Error('Codigo de registro requerido para dueños');
      const { data: codeData, error: codeError } = await supabase
        .from('registration_codes')
        .select('code, used')
        .eq('code', registrationCode)
        .single();
      if (codeError || !codeData) throw new Error('Codigo de registro invalido');
      if (codeData.used) throw new Error('Este codigo ya ha sido utilizado');
    }

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

    // Mark registration code as used if owner
    if (role === 'owner' && registrationCode) {
      await supabase
        .from('registration_codes')
        .update({ used: true, used_by: data.user.id })
        .eq('code', registrationCode);
    }

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
    const dbData: Record<string, unknown> = {};
    if (data.name !== undefined) dbData.name = data.name;
    if (data.phone !== undefined) dbData.phone = data.phone;
    if (data.avatarUrl !== undefined) dbData.avatar_url = data.avatarUrl;

    const { data: updated, error } = await supabase
      .from('users')
      .update(dbData)
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

  async updatePassword(_currentPassword: string, newPassword: string): Promise<void> {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) handleSupabaseError(error);
    if (!data.user) throw new Error('No se pudo actualizar la contraseña');
  }

  async resetPasswordEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?reset=true`,
    });

    if (error) handleSupabaseError(error);
  }

  private mapToUser(authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }, profile: Partial<UserRecord> | null): User {
    return {
      id: authUser.id,
      email: profile?.email || authUser.email || '',
      name: profile?.name || (authUser.user_metadata?.name as string) || '',
      role: (profile?.role || 'client') as UserRole,
      avatarUrl: profile?.avatar_url,
      phone: profile?.phone,
      createdAt: profile?.created_at ? new Date(profile.created_at) : new Date(),
    };
  }
}
