import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRoomStore } from '@/presentation/providers/useRoomStore';
import { useHotelStore } from '@/presentation/providers/useHotelStore';
import { useCommentStore } from '@/presentation/providers/useCommentStore';
import {
  ArrowLeft,
  Users,
  Bed,
  Maximize,
  Star,
  Send,
  ThumbsUp,
  MessageSquare,
  Wifi,
  Bath,
  Wind,
  Tv,
  Lock,
  Wine,
  Check,
} from 'lucide-react';

const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="w-5 h-5" />,
  'WiFi Premium': <Wifi className="w-5 h-5" />,
  'Jacuzzi': <Bath className="w-5 h-5" />,
  'Aire Acondicionado': <Wind className="w-5 h-5" />,
  'Smart TV': <Tv className="w-5 h-5" />,
  'TV': <Tv className="w-5 h-5" />,
  'TV Premium': <Tv className="w-5 h-5" />,
  'Caja Fuerte': <Lock className="w-5 h-5" />,
  'Mini Bar': <Wine className="w-5 h-5" />,
  'Vista Panoramica': <Check className="w-5 h-5" />,
  'Ducha Lluvia': <Bath className="w-5 h-5" />,
  'Vista Ciudad': <Check className="w-5 h-5" />,
};

export function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { selectedRoom, fetchRoomById, isLoading: roomLoading } = useRoomStore();
  const { hotels } = useHotelStore();
  const { comments, fetchCommentsByTarget, addComment } = useCommentStore();
  
  const [activeImage, setActiveImage] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);

  useEffect(() => {
    if (id) {
      fetchRoomById(id);
      fetchCommentsByTarget(id, 'room');
    }
  }, [id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;
    
    await addComment({
      targetId: id,
      targetType: 'room',
      rating: commentRating,
      content: commentText,
      userId: 'current-user',
      userName: 'Usuario Anonimo',
      likes: 0,
    });
    setCommentText('');
    setCommentRating(5);
  };

  if (roomLoading || !selectedRoom) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E8850C]/30 border-t-[#E8850C] rounded-full animate-spin" />
      </div>
    );
  }

  const room = selectedRoom;
  const hotel = hotels.find((h) => h.id === room.hotelId);

  return (
    <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1A2028] border-b border-[#E8D9C8] dark:border-[#2D3748]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              to={hotel ? `/hotel/${hotel.id}` : '/'}
              className="inline-flex items-center gap-2 text-[#5E4836] dark:text-[#94A3B8] hover:text-[#E8850C] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Volver</span>
            </Link>
            {hotel && (
              <>
                <span className="text-[#D4BEA5]">/</span>
                <Link
                  to={`/hotel/${hotel.id}`}
                  className="text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] hover:text-[#E8850C] transition-colors"
                >
                  {hotel.name}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Main Image */}
          <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden">
            <img
              src={room.images[activeImage]}
              alt={room.name}
              className="w-full h-full object-cover"
            />
            {/* Availability Badge */}
            <div className="absolute top-4 left-4">
              <span className={`px-4 py-1.5 rounded-xl text-sm font-medium ${
                room.isAvailable
                  ? 'bg-emerald-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {room.isAvailable ? 'Disponible' : 'No Disponible'}
              </span>
            </div>
          </div>

          {/* Thumbnails and Info */}
          <div className="space-y-4">
            {/* Thumbnails */}
            <div className="grid grid-cols-3 gap-3">
              {room.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`relative h-24 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === index
                      ? 'border-[#E8850C] shadow-md'
                      : 'border-transparent hover:border-[#E8D9C8]'
                  }`}
                >
                  <img src={img} alt={`${room.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Quick Info */}
            <div className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">{room.name}</h1>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#E8850C]">${room.pricePerNight}</p>
                  <p className="text-xs text-[#96785A] dark:text-[#64748B]">por noche</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl">
                  <Users className="w-5 h-5 text-[#E8850C]" />
                  <div>
                    <p className="text-xs text-[#96785A] dark:text-[#64748B]">Capacidad</p>
                    <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">{room.capacity} personas</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl">
                  <Bed className="w-5 h-5 text-[#E8850C]" />
                  <div>
                    <p className="text-xs text-[#96785A] dark:text-[#64748B]">Cama</p>
                    <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">{room.bedType}</p>
                  </div>
                </div>
                {room.size && (
                  <div className="flex items-center gap-2 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl">
                    <Maximize className="w-5 h-5 text-[#E8850C]" />
                    <div>
                      <p className="text-xs text-[#96785A] dark:text-[#64748B]">Tamaño</p>
                      <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">{room.size} m²</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl">
                  <Star className="w-5 h-5 text-[#E8850C]" />
                  <div>
                    <p className="text-xs text-[#96785A] dark:text-[#64748B]">Tipo</p>
                    <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">{room.type}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748] mb-6"
        >
          <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-3">Descripcion</h2>
          <p className="text-[#5E4836] dark:text-[#94A3B8] leading-relaxed">{room.description}</p>
        </motion.div>

        {/* Amenities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748] mb-6"
        >
          <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-4">Comodidades de la Habitacion</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {room.amenities.map((amenity) => (
              <div
                key={amenity}
                className="flex items-center gap-3 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl"
              >
                <span className="text-[#E8850C]">{amenityIcons[amenity] || <Check className="w-5 h-5" />}</span>
                <span className="text-sm text-[#5E4836] dark:text-[#94A3B8]">{amenity}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Book Now */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748] mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0]">Reserva esta habitacion</h2>
              <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                Precio por noche: <span className="font-bold text-[#E8850C]">${room.pricePerNight}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/hotel/${room.hotelId}`}
                className="px-6 py-3 border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#5E4836] dark:text-[#94A3B8] hover:border-[#E8850C] hover:text-[#E8850C] transition-colors font-medium"
              >
                Ver Hotel
              </Link>
              <button className="px-6 py-3 bg-[#E8850C] hover:bg-[#C46A08] text-white font-medium rounded-xl transition-colors shadow-md shadow-[#E8850C]/20">
                Reservar Ahora
              </button>
            </div>
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]"
        >
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-[#E8850C]" />
            <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0]">Comentarios</h2>
            <span className="px-2 py-0.5 bg-[#FFF8F1] dark:bg-[#242B35] rounded-lg text-sm text-[#96785A] dark:text-[#64748B]">
              {comments.length}
            </span>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-6 p-4 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl">
            <p className="text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-2">Comparte tu experiencia</p>
            <div className="flex items-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCommentRating(star)}
                  className="transition-colors"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= commentRating
                        ? 'text-[#E8850C] fill-[#E8850C]'
                        : 'text-[#D4BEA5] dark:text-[#2D3748]'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Que te parecio esta habitacion?"
                className="flex-1 px-4 py-2.5 bg-white dark:bg-[#1A2028] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#E8850C] hover:bg-[#C46A08] text-white rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-4 border-b border-[#F5EDE3] dark:border-[#2D3748] last:border-0">
                {comment.userAvatar ? (
                  <img src={comment.userAvatar} alt={comment.userName} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#E8850C] flex items-center justify-center text-white font-bold text-sm">
                    {comment.userName.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-[#2D1F14] dark:text-[#E2E8F0] text-sm">{comment.userName}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= comment.rating ? 'text-[#E8850C] fill-[#E8850C]' : 'text-[#D4BEA5]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-[#5E4836] dark:text-[#94A3B8] leading-relaxed">{comment.content}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button className="flex items-center gap-1 text-xs text-[#96785A] dark:text-[#64748B] hover:text-[#E8850C] transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {comment.likes}
                    </button>
                    <span className="text-xs text-[#96785A] dark:text-[#64748B]">
                      {new Date(comment.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
