import { useEffect } from "react";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
import { useReservationStore } from "@/presentation/providers/useReservationStore";
import { useRoomStore } from "@/presentation/providers/useRoomStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
  ArrowLeft,
  Eye,
} from "lucide-react";

const statusConfig = {
  pending: {
    label: "Pendiente",
    icon: Timer,
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  accepted: {
    label: "Aceptada",
    icon: CheckCircle2,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
  },
  completed: {
    label: "Completada",
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
  },
  cancelled: {
    label: "Cancelada",
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
  },
};

export function ClientReservationsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { reservations, isLoading, error, getReservationsByUser } = useReservationStore();
  const { fetchRoomById } = useRoomStore();

  useEffect(() => {
    if (user) {
      getReservationsByUser(user.id);
    }
  }, [user, getReservationsByUser]);

  const handleViewRoom = (roomId: string) => {
    fetchRoomById(roomId);
    navigate(`/room/${roomId}`);
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#5E4836] dark:text-[#94A3B8] hover:text-[#E8850C] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <h1 className="text-2xl font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-8">
          Mis Reservaciones
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]"
              >
                <div className="h-5 bg-[#E8D9C8] dark:bg-[#2D3748] rounded w-1/4 mb-4" />
                <div className="h-4 bg-[#E8D9C8] dark:bg-[#2D3748] rounded w-1/2 mb-2" />
                <div className="h-4 bg-[#E8D9C8] dark:bg-[#2D3748] rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748]">
            <Calendar className="w-16 h-16 mx-auto text-[#D4BEA5] dark:text-[#2D3748] mb-4" />
            <h3 className="text-lg font-medium text-[#5E4836] dark:text-[#94A3B8]">
              No tienes reservaciones
            </h3>
            <p className="text-sm text-[#96785A] dark:text-[#64748B] mt-1 mb-6">
              Explora nuestros hoteles y haz tu primera reserva
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-[#E8850C] hover:bg-[#C46A08] text-white font-medium rounded-xl transition-colors"
            >
              Explorar hoteles
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation, index) => {
              const config = statusConfig[reservation.status];
              const StatusIcon = config.icon;

              return (
                <motion.div
                  key={reservation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white dark:bg-[#1A2028] rounded-2xl border ${config.border} p-6`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                        <span className="text-xs text-[#96785A] dark:text-[#64748B]">
                          #{reservation.id.slice(-6).toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-[#5E4836] dark:text-[#94A3B8]">
                          <Calendar className="w-4 h-4 text-[#B89A7A]" />
                          <span>
                            Check-in: {new Date(reservation.checkIn).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#5E4836] dark:text-[#94A3B8]">
                          <Calendar className="w-4 h-4 text-[#B89A7A]" />
                          <span>
                            Check-out: {new Date(reservation.checkOut).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#5E4836] dark:text-[#94A3B8]">
                          <Clock className="w-4 h-4 text-[#B89A7A]" />
                          <span>
                            Creada: {new Date(reservation.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#5E4836] dark:text-[#94A3B8]">
                          <DollarSign className="w-4 h-4 text-[#B89A7A]" />
                          <span className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                            ${reservation.totalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {reservation.notes && (
                        <p className="mt-3 text-sm text-[#96785A] dark:text-[#64748B] italic">
                          Nota: {reservation.notes}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleViewRoom(reservation.roomId)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#FFF8F1] dark:bg-[#242B35] text-[#5E4836] dark:text-[#94A3B8] hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] rounded-xl transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Ver habitacion
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
