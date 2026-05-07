export interface ImageRecord {
  id: string;
  entity_type: "hotel" | "room" | "user";
  entity_id: string;
  url: string;
  storage_path: string;
  bucket: string;
  file_size?: number;
  width?: number;
  height?: number;
  mime_type?: string;
  is_cover: boolean;
  sort_order: number;
  created_at: string;
}

export type UploadProgressCallback = (
  completed: number,
  total: number,
) => void;

export interface ImageRepository {
  uploadHotelImage(
    hotelId: string,
    file: File,
    onProgress?: UploadProgressCallback,
  ): Promise<ImageRecord>;
  uploadRoomImage(
    roomId: string,
    file: File,
    onProgress?: UploadProgressCallback,
  ): Promise<ImageRecord>;
  uploadUserAvatar(
    userId: string,
    file: File,
    onProgress?: UploadProgressCallback,
  ): Promise<ImageRecord>;
  uploadMultipleHotelImages(
    hotelId: string,
    files: File[],
    onProgress?: UploadProgressCallback,
  ): Promise<ImageRecord[]>;
  uploadMultipleRoomImages(
    roomId: string,
    files: File[],
    onProgress?: UploadProgressCallback,
  ): Promise<ImageRecord[]>;
  deleteImage(imageId: string): Promise<void>;
  deleteHotelImage(imageUrl: string): Promise<void>;
  deleteRoomImage(imageUrl: string): Promise<void>;
  getEntityImages(
    entityType: "hotel" | "room" | "user",
    entityId: string,
  ): Promise<ImageRecord[]>;
  setCoverImage(imageId: string): Promise<void>;
  reorderImages(imageIds: string[]): Promise<void>;
}
