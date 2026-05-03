import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useHotelStore } from "@/presentation/providers/useHotelStore";
import { useRoomStore } from "@/presentation/providers/useRoomStore";
import { useCommentStore } from "@/presentation/providers/useCommentStore";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
import { useReservationStore } from "@/presentation/providers/useReservationStore";
import type { HotelType, Room } from "@/domain/entities/Hotel";
import {
  MapPin,
  Star,
  Phone,
  Mail,
  ArrowLeft,
  Wifi,
  Waves,
  UtensilsCrossed,
  Car,
  Dumbbell,
  Wine,
  Bath,
  Bed,
  Users,
  ChevronRight,
  Send,
  ThumbsUp,
  MessageSquare,
  Calendar,
  X,
  CheckCircle,
} from "lucide-react";

const hotelTypeLabels: Record<HotelType, string> = {
  hotel: "Hotel",
  resort: "Resort",
  motel: "Motel",
  residential: "Residencial",
};

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-5 h-5" />,
  Piscina: <Waves className="w-5 h-5" />,
  Restaurante: <UtensilsCrossed className="w-5 h-5" />,
  Estacionamiento: <Car className="w-5 h-5" />,
  Gimnasio: <Dumbbell className="w-5 h-5" />,
  Bar: <Wine className="w-5 h-5" />,
  Spa: <Bath className="w-5 h-5" />,
  Jacuzzi: <Bath className="w-5 h-5" />,
  "Room Service": <Bed className="w-5 h-5" />,
};

export function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const {
    selectedHotel,
    fetchHotelById,
    isLoading: hotelLoading,
  } = useHotelStore();
  const { rooms, fetchRoomsByHotel, isLoading: roomsLoading } = useRoomStore();
  const { comments, fetchCommentsByTarget, addComment } = useCommentStore();

  const [activeImage, setActiveImage] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    checkIn: "",
    checkOut: "",
    guests: "2",
  });

  const isOwnerViewing = user?.role === "owner" && searchParams.get("from") === "management";

  useEffect(() => {
    if (id) {
      fetchHotelById(id);
      fetchRoomsByHotel(id);
      fetchCommentsByTarget(id, "hotel");
    }
  }, [id, fetchHotelById, fetchRoomsByHotel, fetchCommentsByTarget]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;

    await addComment(
      {
        targetId: id,
        targetType: "hotel",
        rating: commentRating,
        content: commentText,
      },
      "current-user",
      "Usuario Anonimo",
    );
    setCommentText("");
    setCommentRating(5);
  };

  const calculateTotal = (room: Room) => {
    if (!reservationForm.checkIn || !reservationForm.checkOut) return 0;
    const start = new Date(reservationForm.checkIn);
    const end = new Date(reservationForm.checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights * room.pricePerNight : 0;
  };

  const handleBookRoom = (room: Room) => {
    setSelectedRoomForBooking(room);
    setShowReservationModal(true);
  };

  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForBooking || !reservationForm.checkIn || !reservationForm.checkOut) return;

    try {
      await createReservation({
        roomId: selectedRoomForBooking.id,
        userId: user?.id || null,
        guestName: user?.name || "",
        guestEmail: user?.email || "",
        checkIn: reservationForm.checkIn,
        checkOut: reservationForm.checkOut,
      });
      setReservationSuccess(true);
      setTimeout(() => {
        setShowReservationModal(false);
        setReservationSuccess(false);
        setSelectedRoomForBooking(null);
        setReservationForm({ checkIn: "", checkOut: "", guests: "2" });
      }, 2000);
    } catch {
      // Error handled by store
    }
  };

  if (hotelLoading || !selectedHotel) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E8850C]/30 border-t-[#E8850C] rounded-full animate-spin" />
      </div>
    );
  }

  const hotel = selectedHotel;
  const displayedAmenities = showAllAmenities
    ? hotel.amenities
    : hotel.amenities.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419]">
      {/* Header with Back Button */}
      <div className="bg-white dark:bg-[#1A2028] border-b border-[#E8D9C8] dark:border-[#2D3748]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {isOwnerViewing ? (
            <Link
              to={`/dashboard/hotel/${id}`}
              className="inline-flex items-center gap-2 text-[#5E4836] dark:text-[#94A3B8] hover:text-[#E8850C] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Volver a Gestion</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[#5E4836] dark:text-[#94A3B8] hover:text-[#E8850C] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Volver a explorar</span>
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8"
        >
          {/* Main Image */}
          <div className="lg:col-span-2 relative h-80 md:h-96 rounded-2xl overflow-hidden">
            <img
              src={hotel.images[activeImage]}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#2D1F14]/10" />

            {/* Type Badge */}
            <div className="absolute top-4 left-4">
              <span className="px-4 py-1.5 bg-white/90 backdrop-blur rounded-xl text-sm font-medium text-[#5E4836]">
                {hotelTypeLabels[hotel.type]}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="hidden lg:flex flex-col gap-3">
            {hotel.images.slice(0, 3).map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                className={`relative h-[calc(33.333%-8px)] rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === index
                    ? "border-[#E8850C] shadow-md shadow-[#E8850C]/20"
                    : "border-transparent hover:border-[#E8D9C8]"
                }`}
              >
                <img
                  src={img}
                  alt={`${hotel.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                    {hotel.name}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-[#96785A] dark:text-[#64748B]">
                      <MapPin className="w-4 h-4" />
                      {hotel.address}, {hotel.city}
                    </span>
                    <span className="flex items-center gap-1 px-3 py-1 bg-[#FFF8F1] dark:bg-[#242B35] rounded-lg">
                      <Star className="w-4 h-4 text-[#E8850C] fill-[#E8850C]" />
                      <span className="font-bold text-[#E8850C]">
                        {hotel.rating}
                      </span>
                      <span className="text-sm text-[#96785A] dark:text-[#64748B]">
                        ({hotel.reviewCount} opiniones)
                      </span>
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-3xl font-bold text-[#E8850C]">
                    ${hotel.priceRange.min}
                  </p>
                  <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                    por noche
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]"
            >
              <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-3">
                Descripcion
              </h2>
              <p className="text-[#5E4836] dark:text-[#94A3B8] leading-relaxed">
                {hotel.description}
              </p>
            </motion.div>

            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]"
            >
              <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-4">
                Servicios y Comodidades
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {displayedAmenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl"
                  >
                    <span className="text-[#E8850C]">
                      {amenityIcons[amenity] || <Wifi className="w-5 h-5" />}
                    </span>
                    <span className="text-sm text-[#5E4836] dark:text-[#94A3B8]">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
              {hotel.amenities.length > 8 && (
                <button
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  className="mt-4 text-sm font-medium text-[#E8850C] hover:text-[#C46A08] transition-colors"
                >
                  {showAllAmenities
                    ? "Ver menos"
                    : `Ver todos (${hotel.amenities.length})`}
                </button>
              )}
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]"
            >
              <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-4">
                Informacion de Contacto
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[#5E4836] dark:text-[#94A3B8]">
                  <Phone className="w-5 h-5 text-[#E8850C]" />
                  <span>{hotel.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-[#5E4836] dark:text-[#94A3B8]">
                  <Mail className="w-5 h-5 text-[#E8850C]" />
                  <span>{hotel.email}</span>
                </div>
                <div className="flex items-center gap-3 text-[#5E4836] dark:text-[#94A3B8]">
                  <MapPin className="w-5 h-5 text-[#E8850C]" />
                  <span>
                    {hotel.address}, {hotel.city}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Rooms Section */}
            <motion.div
              id="rooms-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-4">
                Habitaciones Disponibles
              </h2>
              {roomsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-32 bg-[#E8D9C8] dark:bg-[#2D3748] rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : rooms.length > 0 ? (
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex gap-4 bg-white dark:bg-[#1A2028] rounded-2xl overflow-hidden border border-[#E8D9C8] dark:border-[#2D3748] hover:border-[#E8850C]/30 hover:shadow-lg hover:shadow-[#E8850C]/10 transition-all group"
                    >
                      <Link
                        to={`/room/${room.id}`}
                        className="w-32 md:w-48 shrink-0 relative overflow-hidden"
                      >
                        <img
                          src={room.images[0]}
                          alt={room.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      <div className="flex-1 py-4 pr-4">
                        <div className="flex items-start justify-between">
                          <Link to={`/room/${room.id}`}>
                            <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0] group-hover:text-[#E8850C] transition-colors">
                              {room.name}
                            </h3>
                          </Link>
                          <span className="font-bold text-[#E8850C] ml-2 shrink-0">
                            ${room.pricePerNight}
                            <span className="text-xs text-[#96785A]">
                              /noche
                            </span>
                          </span>
                        </div>
                        <Link to={`/room/${room.id}`} className="text-sm text-[#96785A] dark:text-[#64748B] mt-0.5 block hover:text-[#E8850C] transition-colors">
                          {room.type}
                        </Link>
                        <div className="flex items-center gap-4 mt-2 text-sm text-[#96785A] dark:text-[#64748B]">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" /> {room.capacity}{" "}
                            personas
                          </span>
                          <span className="flex items-center gap-1">
                            <Bed className="w-4 h-4" /> {room.bedType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          {room.amenities.slice(0, 3).map((a) => (
                            <span
                              key={a}
                              className="px-2 py-0.5 bg-[#FFF8F1] dark:bg-[#242B35] rounded text-xs text-[#5E4836] dark:text-[#94A3B8]"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Link
                            to={`/room/${room.id}`}
                            className="px-4 py-2 border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] hover:border-[#E8850C] hover:text-[#E8850C] transition-colors"
                          >
                            Ver Detalle
                          </Link>
                          <button
                            onClick={() => handleBookRoom(room)}
                            disabled={!room.isAvailable}
                            className="px-4 py-2 bg-[#E8850C] hover:bg-[#C46A08] text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {room.isAvailable ? "Reservar" : "No Disponible"}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center pr-4">
                        <ChevronRight className="w-5 h-5 text-[#D4BEA5] group-hover:text-[#E8850C] group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748]">
                  <Bed className="w-12 h-12 mx-auto text-[#D4BEA5] dark:text-[#2D3748] mb-2" />
                  <p className="text-[#96785A] dark:text-[#64748B]">
                    No hay habitaciones disponibles
                  </p>
                </div>
              )}
            </motion.div>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]"
            >
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-[#E8850C]" />
                <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                  Comentarios y Opiniones
                </h2>
                <span className="px-2 py-0.5 bg-[#FFF8F1] dark:bg-[#242B35] rounded-lg text-sm text-[#96785A] dark:text-[#64748B]">
                  {comments.length}
                </span>
              </div>

              {/* Comment Form */}
              <form
                onSubmit={handleSubmitComment}
                className="mb-6 p-4 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl"
              >
                <p className="text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-2">
                  Deja tu opinion
                </p>
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
                            ? "text-[#E8850C] fill-[#E8850C]"
                            : "text-[#D4BEA5] dark:text-[#2D3748]"
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
                    placeholder="Comparte tu experiencia..."
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
                  <div
                    key={comment.id}
                    className="flex gap-3 p-4 border-b border-[#F5EDE3] dark:border-[#2D3748] last:border-0"
                  >
                    {comment.userAvatar ? (
                      <img
                        src={comment.userAvatar}
                        alt={comment.userName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#E8850C] flex items-center justify-center text-white font-bold text-sm">
                        {comment.userName.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[#2D1F14] dark:text-[#E2E8F0] text-sm">
                          {comment.userName}
                        </span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= comment.rating
                                  ? "text-[#E8850C] fill-[#E8850C]"
                                  : "text-[#D4BEA5]"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-[#5E4836] dark:text-[#94A3B8] leading-relaxed">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <button className="flex items-center gap-1 text-xs text-[#96785A] dark:text-[#64748B] hover:text-[#E8850C] transition-colors">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          {comment.likes}
                        </button>
                        <span className="text-xs text-[#96785A] dark:text-[#64748B]">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "es-ES",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Quick Book Card */}
              <div className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]">
                <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-4">
                  Reservar Ahora
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={reservationForm.checkIn}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) =>
                        setReservationForm({ ...reservationForm, checkIn: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={reservationForm.checkOut}
                      min={reservationForm.checkIn || new Date().toISOString().split("T")[0]}
                      onChange={(e) =>
                        setReservationForm({ ...reservationForm, checkOut: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                      Huespedes
                    </label>
                    <select
                      value={reservationForm.guests}
                      onChange={(e) =>
                        setReservationForm({ ...reservationForm, guests: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 text-sm"
                    >
                      <option value="1">1 huesped</option>
                      <option value="2">2 huespedes</option>
                      <option value="3">3 huespedes</option>
                      <option value="4">4+ huespedes</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      const el = document.getElementById("rooms-section");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full py-3 bg-[#E8850C] hover:bg-[#C46A08] text-white font-medium rounded-xl transition-colors shadow-md shadow-[#E8850C]/20"
                  >
                    Ver Habitaciones
                  </button>
                </div>
              </div>

              {/* Price Info */}
              <div className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]">
                <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-3">
                  Rango de Precios
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#96785A] dark:text-[#64748B]">
                      Desde
                    </span>
                    <span className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                      ${hotel.priceRange.min}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#96785A] dark:text-[#64748B]">
                      Hasta
                    </span>
                    <span className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                      ${hotel.priceRange.max}
                    </span>
                  </div>
                  <div className="h-2 bg-[#F5EDE3] dark:bg-[#242B35] rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-[#E8850C] rounded-full"
                      style={{ width: "60%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      <AnimatePresence>
        {showReservationModal && selectedRoomForBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-5 border-b border-[#F5EDE3] dark:border-[#2D3748] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8850C] flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                      Reservar Habitacion
                    </h3>
                    <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                      {selectedRoomForBooking.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowReservationModal(false);
                    setReservationSuccess(false);
                  }}
                  className="p-1.5 hover:bg-[#FDF8F3] dark:hover:bg-[#242B35] rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-[#96785A] dark:text-[#64748B]" />
                </button>
              </div>

              {reservationSuccess ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h4 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-2">
                    Reservacion Exitosa
                  </h4>
                  <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                    Tu solicitud ha sido enviada. Recibiras una confirmacion pronto.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReservation} className="p-5 space-y-4">
                  <div className="p-3 bg-[#FFF8F1] dark:bg-[#242B35] rounded-xl flex items-center justify-between">
                    <span className="text-sm text-[#5E4836] dark:text-[#94A3B8]">
                      Precio por noche
                    </span>
                    <span className="text-lg font-bold text-[#E8850C]">
                      ${selectedRoomForBooking.pricePerNight}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                        Check-in
                      </label>
                      <input
                        type="date"
                        value={reservationForm.checkIn}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          setReservationForm({ ...reservationForm, checkIn: e.target.value })
                        }
                        required
                        className="w-full px-3 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                        Check-out
                      </label>
                      <input
                        type="date"
                        value={reservationForm.checkOut}
                        min={reservationForm.checkIn || new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          setReservationForm({ ...reservationForm, checkOut: e.target.value })
                        }
                        required
                        className="w-full px-3 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 text-sm"
                      />
                    </div>
                  </div>

                  {calculateTotal(selectedRoomForBooking) > 0 && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl flex items-center justify-between border border-emerald-200 dark:border-emerald-800">
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        Total ({Math.ceil((new Date(reservationForm.checkOut).getTime() - new Date(reservationForm.checkIn).getTime()) / (1000 * 60 * 60 * 24))} noches)
                      </span>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        Bs {calculateTotal(selectedRoomForBooking)}
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#E8850C] hover:bg-[#C46A08] text-white font-medium rounded-xl transition-colors shadow-md shadow-[#E8850C]/20"
                  >
                    Confirmar Reservacion
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
