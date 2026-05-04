import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRoomStore } from "@/presentation/providers/useRoomStore";
import { useHotelStore } from "@/presentation/providers/useHotelStore";
import { useCommentStore } from "@/presentation/providers/useCommentStore";
import { useReservationStore } from "@/presentation/providers/useReservationStore";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
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
  Calendar,
  X,
  CheckCircle,
} from "lucide-react";

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-5 h-5" />,
  "WiFi Premium": <Wifi className="w-5 h-5" />,
  Jacuzzi: <Bath className="w-5 h-5" />,
  "Aire Acondicionado": <Wind className="w-5 h-5" />,
  "Smart TV": <Tv className="w-5 h-5" />,
  TV: <Tv className="w-5 h-5" />,
  "TV Premium": <Tv className="w-5 h-5" />,
  "Caja Fuerte": <Lock className="w-5 h-5" />,
  "Mini Bar": <Wine className="w-5 h-5" />,
  "Vista Panoramica": <Check className="w-5 h-5" />,
  "Ducha Lluvia": <Bath className="w-5 h-5" />,
  "Vista Ciudad": <Check className="w-5 h-5" />,
};

export function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    selectedRoom,
    fetchRoomById,
    isLoading: roomLoading,
  } = useRoomStore();
  const { hotels } = useHotelStore();
  const { comments, fetchCommentsByTarget, addComment } = useCommentStore();

  const [activeImage, setActiveImage] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    checkIn: "",
    checkOut: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    notes: "",
  });

  const { user } = useAuthStore();
  const { createReservation } = useReservationStore();

  useEffect(() => {
    if (id) {
      fetchRoomById(id);
      fetchCommentsByTarget(id, "room");
    }
  }, [id, fetchRoomById, fetchCommentsByTarget]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;

    await addComment(
      {
        targetId: id,
        targetType: "room",
        rating: commentRating,
        content: commentText,
      },
      "current-user",
      "Usuario Anonimo",
    );
    setCommentText("");
    setCommentRating(5);
  };

  const calculateTotal = () => {
    if (!reservationForm.checkIn || !reservationForm.checkOut || !room)
      return 0;
    const start = new Date(reservationForm.checkIn);
    const end = new Date(reservationForm.checkOut);
    const nights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return nights > 0 ? nights * room.pricePerNight : 0;
  };

  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !reservationForm.checkIn || !reservationForm.checkOut) return;

    try {
      await createReservation({
        roomId: id,
        userId: user?.id || null,
        guestName: reservationForm.guestName || user?.name || "",
        guestEmail: reservationForm.guestEmail || user?.email || "",
        guestPhone: reservationForm.guestPhone || undefined,
        checkIn: reservationForm.checkIn,
        checkOut: reservationForm.checkOut,
        notes: reservationForm.notes || undefined,
      });
      setReservationSuccess(true);
      setTimeout(() => {
        setShowReservationModal(false);
        setReservationSuccess(false);
        setReservationForm({
          checkIn: "",
          checkOut: "",
          guestName: "",
          guestEmail: "",
          guestPhone: "",
          notes: "",
        });
      }, 2000);
    } catch {
      // Error handled by store
    }
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
              to={hotel ? `/hotel/${hotel.id}` : "/"}
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
              <span
                className={`px-4 py-1.5 rounded-xl text-sm font-medium ${
                  room.isAvailable
                    ? "bg-emerald-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {room.isAvailable ? "Disponible" : "No Disponible"}
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
                      ? "border-[#E8850C] shadow-md"
                      : "border-transparent hover:border-[#E8D9C8]"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${room.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Quick Info */}
            <div className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                  {room.name}
                </h1>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#E8850C]">
                    ${room.pricePerNight}
                  </p>
                  <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                    por noche
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl">
                  <Users className="w-5 h-5 text-[#E8850C]" />
                  <div>
                    <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                      Capacidad
                    </p>
                    <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                      {room.capacity} personas
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl">
                  <Bed className="w-5 h-5 text-[#E8850C]" />
                  <div>
                    <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                      Cama
                    </p>
                    <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                      {room.bedType}
                    </p>
                  </div>
                </div>
                {room.size && (
                  <div className="flex items-center gap-2 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl">
                    <Maximize className="w-5 h-5 text-[#E8850C]" />
                    <div>
                      <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                        Tamaño
                      </p>
                      <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                        {room.size} m²
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl">
                  <Star className="w-5 h-5 text-[#E8850C]" />
                  <div>
                    <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                      Tipo
                    </p>
                    <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                      {room.type}
                    </p>
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
          <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-3">
            Descripcion
          </h2>
          <p className="text-[#5E4836] dark:text-[#94A3B8] leading-relaxed">
            {room.description}
          </p>
        </motion.div>

        {/* Amenities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748] mb-6"
        >
          <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-4">
            Comodidades de la Habitacion
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {room.amenities.map((amenity) => (
              <div
                key={amenity}
                className="flex items-center gap-3 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl"
              >
                <span className="text-[#E8850C]">
                  {amenityIcons[amenity] || <Check className="w-5 h-5" />}
                </span>
                <span className="text-sm text-[#5E4836] dark:text-[#94A3B8]">
                  {amenity}
                </span>
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
              <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                Reserva esta habitacion
              </h2>
              <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                Precio por noche:{" "}
                <span className="font-bold text-[#E8850C]">
                  ${room.pricePerNight}
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/hotel/${room.hotelId}`}
                className="px-6 py-3 border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#5E4836] dark:text-[#94A3B8] hover:border-[#E8850C] hover:text-[#E8850C] transition-colors font-medium"
              >
                Ver Hotel
              </Link>
              <button
                onClick={() => setShowReservationModal(true)}
                className="px-6 py-3 bg-[#E8850C] hover:bg-[#C46A08] text-white font-medium rounded-xl transition-colors shadow-md shadow-[#E8850C]/20"
              >
                Reservar Ahora
              </button>
            </div>
          </div>
        </motion.div>

        {/* Reservation Modal */}
        <AnimatePresence>
          {showReservationModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
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
                        {room.name}
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
                      Tu solicitud ha sido enviada. Recibiras una confirmacion
                      pronto.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmitReservation}
                    className="p-5 space-y-4"
                  >
                    {/* Price Info */}
                    <div className="p-3 bg-[#FFF8F1] dark:bg-[#242B35] rounded-xl flex items-center justify-between">
                      <span className="text-sm text-[#5E4836] dark:text-[#94A3B8]">
                        Precio por noche
                      </span>
                      <span className="text-lg font-bold text-[#E8850C]">
                        ${room.pricePerNight}
                      </span>
                    </div>

                    {/* Dates */}
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
                            setReservationForm({
                              ...reservationForm,
                              checkIn: e.target.value,
                            })
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
                          min={
                            reservationForm.checkIn ||
                            new Date().toISOString().split("T")[0]
                          }
                          onChange={(e) =>
                            setReservationForm({
                              ...reservationForm,
                              checkOut: e.target.value,
                            })
                          }
                          required
                          className="w-full px-3 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 text-sm"
                        />
                      </div>
                    </div>

                    {/* Total */}
                    {calculateTotal() > 0 && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl flex items-center justify-between border border-emerald-200 dark:border-emerald-800">
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                          Total (
                          {Math.ceil(
                            (new Date(reservationForm.checkOut).getTime() -
                              new Date(reservationForm.checkIn).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}{" "}
                          noches)
                        </span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          Bs {calculateTotal()}
                        </span>
                      </div>
                    )}

                    {/* Guest Info */}
                    <div>
                      <label className="block text-xs font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={reservationForm.guestName}
                        onChange={(e) =>
                          setReservationForm({
                            ...reservationForm,
                            guestName: e.target.value,
                          })
                        }
                        placeholder={user?.name || "Tu nombre"}
                        className="w-full px-3 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={reservationForm.guestEmail}
                        onChange={(e) =>
                          setReservationForm({
                            ...reservationForm,
                            guestEmail: e.target.value,
                          })
                        }
                        placeholder={user?.email || "tu@email.com"}
                        required
                        className="w-full px-3 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                        Telefono (opcional)
                      </label>
                      <input
                        type="tel"
                        value={reservationForm.guestPhone}
                        onChange={(e) =>
                          setReservationForm({
                            ...reservationForm,
                            guestPhone: e.target.value,
                          })
                        }
                        placeholder="+591 77712345"
                        className="w-full px-3 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                        Notas (opcional)
                      </label>
                      <textarea
                        value={reservationForm.notes}
                        onChange={(e) =>
                          setReservationForm({
                            ...reservationForm,
                            notes: e.target.value,
                          })
                        }
                        placeholder="Solicitudes especiales..."
                        rows={2}
                        className="w-full px-3 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 text-sm resize-none"
                      />
                    </div>

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

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]"
        >
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-[#E8850C]" />
            <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
              Comentarios
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
              Comparte tu experiencia
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
                      {new Date(comment.createdAt).toLocaleDateString("es-ES")}
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
