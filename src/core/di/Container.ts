import { SupabaseAuthRepository } from '@/data/repositories/SupabaseAuthRepository';
import { SupabaseHotelRepository } from '@/data/repositories/SupabaseHotelRepository';
import { SupabaseRoomRepository } from '@/data/repositories/SupabaseRoomRepository';
import { SupabaseCommentRepository } from '@/data/repositories/SupabaseCommentRepository';
import { SupabaseReservationRepository } from '@/data/repositories/SupabaseReservationRepository';
import { SupabaseImageRepository } from '@/data/repositories/SupabaseImageRepository';

import {
  SignInUseCase,
  SignUpUseCase,
  SignOutUseCase,
  GetCurrentUserUseCase,
  UpdateProfileUseCase,
  UploadAvatarUseCase,
} from '@/domain/usecases/AuthUseCases';

import {
  GetHotelsUseCase,
  GetHotelByIdUseCase,
  GetManagerHotelsUseCase,
  CreateHotelUseCase,
  UpdateHotelUseCase,
  DeleteHotelUseCase,
  GetHotelEssentialInfoUseCase,
  ToggleHotelStatusUseCase,
  GetFeaturedHotelsUseCase,
} from '@/domain/usecases/HotelUseCases';

import {
  GetRoomsByHotelUseCase,
  GetRoomByIdUseCase,
  CreateRoomUseCase,
  UpdateRoomUseCase,
  DeleteRoomUseCase,
  GetRoomAvailabilityUseCase,
  UpdateRoomAvailabilityUseCase,
  UpdateRoomStatusUseCase,
  GetFeaturedRoomsUseCase,
  GetFeaturedRoomsByHotelUseCase,
} from '@/domain/usecases/RoomUseCases';

import {
  GetCommentsByTargetUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  LikeCommentUseCase,
  GetUserCommentsUseCase,
} from '@/domain/usecases/CommentUseCases';

import {
  CreateReservationUseCase,
  GetReservationByIdUseCase,
  GetReservationsByUserUseCase,
  UpdateReservationStatusUseCase,
  CancelReservationUseCase,
} from '@/domain/usecases/ReservationUseCases';

let _container: ReturnType<typeof createContainer> | null = null;

function createContainer() {
  // Repositories
  const authRepository = new SupabaseAuthRepository();
  const hotelRepository = new SupabaseHotelRepository();
  const roomRepository = new SupabaseRoomRepository();
  const commentRepository = new SupabaseCommentRepository();
  const reservationRepository = new SupabaseReservationRepository();
  const imageRepository = new SupabaseImageRepository();

  return {
    // Auth use cases
    signIn: new SignInUseCase(authRepository),
    signUp: new SignUpUseCase(authRepository),
    signOut: new SignOutUseCase(authRepository),
    getCurrentUser: new GetCurrentUserUseCase(authRepository),
    updateProfile: new UpdateProfileUseCase(authRepository),
    uploadAvatar: new UploadAvatarUseCase(authRepository),

    // Hotel use cases
    getHotels: new GetHotelsUseCase(hotelRepository),
    getHotelById: new GetHotelByIdUseCase(hotelRepository),
    getManagerHotels: new GetManagerHotelsUseCase(hotelRepository),
    createHotel: new CreateHotelUseCase(hotelRepository),
    updateHotel: new UpdateHotelUseCase(hotelRepository),
    deleteHotel: new DeleteHotelUseCase(hotelRepository),
    getHotelEssentialInfo: new GetHotelEssentialInfoUseCase(hotelRepository),
    toggleHotelStatus: new ToggleHotelStatusUseCase(hotelRepository),
    getFeaturedHotels: new GetFeaturedHotelsUseCase(hotelRepository),

    // Room use cases
    getRoomsByHotel: new GetRoomsByHotelUseCase(roomRepository),
    getRoomById: new GetRoomByIdUseCase(roomRepository),
    createRoom: new CreateRoomUseCase(roomRepository),
    updateRoom: new UpdateRoomUseCase(roomRepository),
    deleteRoom: new DeleteRoomUseCase(roomRepository),
    getRoomAvailability: new GetRoomAvailabilityUseCase(roomRepository),
    updateRoomAvailability: new UpdateRoomAvailabilityUseCase(roomRepository),
    updateRoomStatus: new UpdateRoomStatusUseCase(roomRepository),
    getFeaturedRooms: new GetFeaturedRoomsUseCase(roomRepository),
    getFeaturedRoomsByHotel: new GetFeaturedRoomsByHotelUseCase(roomRepository),

    // Comment use cases
    getCommentsByTarget: new GetCommentsByTargetUseCase(commentRepository),
    createComment: new CreateCommentUseCase(commentRepository),
    updateComment: new UpdateCommentUseCase(commentRepository),
    deleteComment: new DeleteCommentUseCase(commentRepository),
    likeComment: new LikeCommentUseCase(commentRepository),
    getUserComments: new GetUserCommentsUseCase(commentRepository),

    // Reservation use cases
    createReservation: new CreateReservationUseCase(reservationRepository),
    getReservationById: new GetReservationByIdUseCase(reservationRepository),
    getReservationsByUser: new GetReservationsByUserUseCase(reservationRepository),
    updateReservationStatus: new UpdateReservationStatusUseCase(reservationRepository),
    cancelReservation: new CancelReservationUseCase(reservationRepository),

    // Image repository (used directly, no use case needed)
    imageRepository,
  };
}

export function getContainer() {
  if (!_container) {
    _container = createContainer();
  }
  return _container;
}

export function resetContainer() {
  _container = null;
}
