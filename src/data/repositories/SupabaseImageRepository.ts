import { supabase, handleSupabaseError } from '../datasources/SupabaseClient';
import type { ImageRepository } from '@/domain/repositories/ImageRepository';

export class SupabaseImageRepository implements ImageRepository {
  async uploadHotelImage(hotelId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${hotelId}/${timestamp}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('hotel-images')
      .upload(fileName, file);

    if (uploadError) handleSupabaseError(uploadError);

    const { data } = supabase.storage
      .from('hotel-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async uploadRoomImage(roomId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${roomId}/${timestamp}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('room-images')
      .upload(fileName, file);

    if (uploadError) handleSupabaseError(uploadError);

    const { data } = supabase.storage
      .from('room-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async deleteHotelImage(imageUrl: string): Promise<void> {
    const path = this.extractPath(imageUrl, 'hotel-images');
    if (!path) return;

    const { error } = await supabase.storage
      .from('hotel-images')
      .remove([path]);

    if (error) handleSupabaseError(error);
  }

  async deleteRoomImage(imageUrl: string): Promise<void> {
    const path = this.extractPath(imageUrl, 'room-images');
    if (!path) return;

    const { error } = await supabase.storage
      .from('room-images')
      .remove([path]);

    if (error) handleSupabaseError(error);
  }

  private extractPath(url: string, bucket: string): string | null {
    const pattern = `/storage/v1/object/public/${bucket}/`;
    const index = url.indexOf(pattern);
    if (index === -1) return null;
    return url.substring(index + pattern.length);
  }
}
