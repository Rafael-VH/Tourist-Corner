import { supabase, handleSupabaseError } from "../datasources/SupabaseClient";
import type {
  ImageRecord,
  ImageRepository,
  UploadProgressCallback,
} from "@/domain/repositories/ImageRepository";
import { convertToWebP } from "@/core/utils/imageConverter";

export class SupabaseImageRepository implements ImageRepository {
  async uploadHotelImage(
    hotelId: string,
    file: File,
    onProgress?: UploadProgressCallback,
  ): Promise<ImageRecord> {
    const images = await this.uploadMultipleHotelImages(
      hotelId,
      [file],
      onProgress,
    );
    return images[0];
  }

  async uploadRoomImage(
    roomId: string,
    file: File,
    onProgress?: UploadProgressCallback,
  ): Promise<ImageRecord> {
    const images = await this.uploadMultipleRoomImages(
      roomId,
      [file],
      onProgress,
    );
    return images[0];
  }

  async uploadUserAvatar(
    userId: string,
    file: File,
    onProgress?: UploadProgressCallback,
  ): Promise<ImageRecord> {
    const webpFile = await convertToWebP(file, {
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.85,
    });

    onProgress?.(0, 1);

    const fileName = `${userId}/avatar.webp`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, webpFile, { upsert: true });

    if (uploadError) handleSupabaseError(uploadError);

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const { data: dbRecord, error: dbError } = await supabase
      .from("images")
      .insert({
        entity_type: "user",
        entity_id: userId,
        url: urlData.publicUrl,
        storage_path: fileName,
        bucket: "avatars",
        file_size: webpFile.size,
        width: 512,
        height: 512,
        mime_type: "image/webp",
        is_cover: true,
        sort_order: 0,
        uploaded_by: userId,
      })
      .select()
      .single();

    if (dbError) handleSupabaseError(dbError);

    onProgress?.(1, 1);

    return dbRecord as ImageRecord;
  }

  async uploadMultipleHotelImages(
    hotelId: string,
    files: File[],
    onProgress?: UploadProgressCallback,
  ): Promise<ImageRecord[]> {
    const results: ImageRecord[] = [];
    const total = files.length;

    await Promise.all(
      files.map(async (file, index) => {
        const webpFile = await convertToWebP(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.8,
        });

        const timestamp = Date.now() + index;
        const fileName = `${hotelId}/${timestamp}.webp`;

        const { error: uploadError } = await supabase.storage
          .from("hotel-images")
          .upload(fileName, webpFile);

        if (uploadError) handleSupabaseError(uploadError);

        const { data: urlData } = supabase.storage
          .from("hotel-images")
          .getPublicUrl(fileName);

        const dimensions = await getImageDimensions(webpFile);

        const { data: dbRecord, error: dbError } = await supabase
          .from("images")
          .insert({
            entity_type: "hotel",
            entity_id: hotelId,
            url: urlData.publicUrl,
            storage_path: fileName,
            bucket: "hotel-images",
            file_size: webpFile.size,
            width: dimensions.width,
            height: dimensions.height,
            mime_type: "image/webp",
            is_cover: false,
            sort_order: index,
            uploaded_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .select()
          .single();

        if (dbError) handleSupabaseError(dbError);

        results[index] = dbRecord as ImageRecord;
        onProgress?.(index + 1, total);
      }),
    );

    return results;
  }

  async uploadMultipleRoomImages(
    roomId: string,
    files: File[],
    onProgress?: UploadProgressCallback,
  ): Promise<ImageRecord[]> {
    const results: ImageRecord[] = [];
    const total = files.length;

    await Promise.all(
      files.map(async (file, index) => {
        const webpFile = await convertToWebP(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.8,
        });

        const timestamp = Date.now() + index;
        const fileName = `${roomId}/${timestamp}.webp`;

        const { error: uploadError } = await supabase.storage
          .from("room-images")
          .upload(fileName, webpFile);

        if (uploadError) handleSupabaseError(uploadError);

        const { data: urlData } = supabase.storage
          .from("room-images")
          .getPublicUrl(fileName);

        const dimensions = await getImageDimensions(webpFile);

        const { data: dbRecord, error: dbError } = await supabase
          .from("images")
          .insert({
            entity_type: "room",
            entity_id: roomId,
            url: urlData.publicUrl,
            storage_path: fileName,
            bucket: "room-images",
            file_size: webpFile.size,
            width: dimensions.width,
            height: dimensions.height,
            mime_type: "image/webp",
            is_cover: false,
            sort_order: index,
            uploaded_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .select()
          .single();

        if (dbError) handleSupabaseError(dbError);

        results[index] = dbRecord as ImageRecord;
        onProgress?.(index + 1, total);
      }),
    );

    return results;
  }

  async deleteImage(imageId: string): Promise<void> {
    const { data: image, error: fetchError } = await supabase
      .from("images")
      .select("id")
      .eq("id", imageId)
      .single();

    if (fetchError) handleSupabaseError(fetchError);
    if (!image) return;

    const { error: deleteError } = await supabase
      .from("images")
      .delete()
      .eq("id", imageId);

    if (deleteError) handleSupabaseError(deleteError);
  }

  async deleteHotelImage(imageUrl: string): Promise<void> {
    const path = this.extractPath(imageUrl, "hotel-images");
    if (!path) return;

    const { error } = await supabase.storage
      .from("hotel-images")
      .remove([path]);

    if (error) handleSupabaseError(error);
  }

  async deleteRoomImage(imageUrl: string): Promise<void> {
    const path = this.extractPath(imageUrl, "room-images");
    if (!path) return;

    const { error } = await supabase.storage
      .from("room-images")
      .remove([path]);

    if (error) handleSupabaseError(error);
  }

  async getEntityImages(
    entityType: "hotel" | "room" | "user",
    entityId: string,
  ): Promise<ImageRecord[]> {
    const { data, error } = await supabase
      .from("images")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("sort_order", { ascending: true });

    if (error) handleSupabaseError(error);

    return (data || []) as ImageRecord[];
  }

  async setCoverImage(imageId: string): Promise<void> {
    const { data: image, error: fetchError } = await supabase
      .from("images")
      .select("entity_type", "entity_id")
      .eq("id", imageId)
      .single();

    if (fetchError) handleSupabaseError(fetchError);
    if (!image) return;

    const { error: resetError } = await supabase
      .from("images")
      .update({ is_cover: false })
      .eq("entity_type", image.entity_type)
      .eq("entity_id", image.entity_id);

    if (resetError) handleSupabaseError(resetError);

    const { error: updateError } = await supabase
      .from("images")
      .update({ is_cover: true })
      .eq("id", imageId);

    if (updateError) handleSupabaseError(updateError);

    if (image.entity_type === "hotel") {
      const { data: coverData } = await supabase
        .from("images")
        .select("url")
        .eq("id", imageId)
        .single();

      if (coverData) {
        await supabase
          .from("hotels")
          .update({ cover_image: coverData.url })
          .eq("id", image.entity_id);
      }
    }
  }

  async reorderImages(imageIds: string[]): Promise<void> {
    for (let i = 0; i < imageIds.length; i++) {
      await supabase
        .from("images")
        .update({ sort_order: i })
        .eq("id", imageIds[i]);
    }
  }

  private extractPath(url: string, bucket: string): string | null {
    const pattern = `/storage/v1/object/public/${bucket}/`;
    const index = url.indexOf(pattern);
    if (index === -1) return null;
    return url.substring(index + pattern.length);
  }
}

async function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = URL.createObjectURL(file);
  });
}
