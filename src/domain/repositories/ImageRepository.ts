export interface ImageRepository {
  uploadHotelImage(hotelId: string, file: File): Promise<string>;
  uploadRoomImage(roomId: string, file: File): Promise<string>;
  deleteHotelImage(imageUrl: string): Promise<void>;
  deleteRoomImage(imageUrl: string): Promise<void>;
}
