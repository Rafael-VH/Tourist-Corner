import { useEffect, useState } from "react";
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
  LogIn,
  LogOut,
  AlertTriangle,
  Loader2,
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
  "checked-in": {
    label: "Check-in realizado",
    icon: LogIn,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  "checked-out": {
    label: "Check-out realizado",
    icon: LogOut,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
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
  "no-show": {
    label: "No se presento",
    icon: AlertTriangle,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
  },
};

export function ClientReservationsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    reservations,
    isLoading,
    error,
    getReservationsByUser,
    cancelWithPolicy,
  } = useReservationStore();
  const { fetchRoomById } = useRoomStore();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (user) {
      getReservationsByUser(user.id);
    }
  }, [user, getReservationsByUser]);

  const handleViewRoom = (roomId: string) => {
    fetchRoomById(roomId);
    navigate(`/room/${roomId}`);
  };

  const handleCancelClick = (id: string) => {
    setShowCancelModal(id);
    setCancelReason("");
  };

  const handleCancelConfirm = async () => {
    if (!showCancelModal) return;
    setCancellingId(showCancelModal);
    try {
      await cancelWithPolicy(showCancelModal, {
        reason: cancelReason || undefined,
      });
    } catch {
      // Error handled by store
    } finally {
      setCancellingId(null);
      setShowCancelModal(null);
      setCancelReason("");
    }
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
              const StatusIcon = config?.icon ?? Timer;
              const canCancel =
                reservation.status === "pending" ||
                reservation.status === "accepted";

              return (
                <motion.div
                  key={reservation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white dark:bg-[#1A2028] rounded-2xl border ${config?.border || "border-[#E8D9C8] dark:border-[#2D3748]"} p-6`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config?.bg || "bg-gray-50 dark:bg-gray-900/20"} ${config?.color || "text-gray-600"}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {config?.label || reservation.status}
                        </span>
                        <span className="text-xs text-[#96785A] dark:text-[#64748B]">
                          #{reservation.id.slice(-6).toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-[#5E4836] dark:text-[#94A3B8]">
                          <Calendar className="w-4 h-4 text-[#B89A7A]" />
                          <span>
                            Check-in:{" "}
                            {new Date(reservation.checkIn).toLocaleDateString(
                              "es-ES",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#5E4836] dark:text-[#94A3B8]">
                          <Calendar className="w-4 h-4 text-[#B89A7A]" />
                          <span>
                            Check-out:{" "}
                            {new Date(reservation.checkOut).toLocaleDateString(
                              "es-ES",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#5E4836] dark:text-[#94A3B8]">
                          <Clock className="w-4 h-4 text-[#B89A7A]" />
                          <span>
                            Creada:{" "}
                            {new Date(reservation.createdAt).toLocaleDateString(
                              "es-ES",
                              { day: "numeric", month: "short" },
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#5E4836] dark:text-[#94A3B8]">
                          <DollarSign className="w-4 h-4 text-[#B89A7A]" />
                          <span className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                            ${reservation.totalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {reservation.actualCheckIn && (
                        <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">
                          Check-in real:{" "}
                          {new Date(
                            reservation.actualCheckIn,
                          ).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                      {reservation.actualCheckOut && (
                        <div className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                          Check-out real:{" "}
                          {new Date(
                            reservation.actualCheckOut,
                          ).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                      {reservation.cancellationReason && (
                        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                          Motivo: {reservation.cancellationReason}
                        </div>
                      )}
                      {reservation.cancellationFee > 0 && (
                        <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                          Penalizacion: $
                          {reservation.cancellationFee.toLocaleString()}
                        </div>
                      )}
                      {reservation.refundAmount > 0 && (
                        <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                          Reembolso: $
                          {reservation.refundAmount.toLocaleString()}
                        </div>
                      )}

                      {reservation.notes && (
                        <p className="mt-3 text-sm text-[#96785A] dark:text-[#64748B] italic">
                          Nota: {reservation.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewRoom(reservation.roomId)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#FFF8F1] dark:bg-[#242B35] text-[#5E4836] dark:text-[#94A3B8] hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] rounded-xl transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Ver habitacion
                      </button>
                      {canCancel && (
                        <button
                          onClick={() => handleCancelClick(reservation.id)}
                          disabled={cancellingId === reservation.id}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          {cancellingId === reservation.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-[#F5EDE3] dark:border-[#2D3748]">
              <h3 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                Cancelar Reservacion
              </h3>
              <p className="text-sm text-[#96785A] dark:text-[#64748B] mt-1">
                Esta accion no se puede deshacer.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0] mb-2">
                  Motivo de cancelacion (opcional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8D9C8] dark:border-[#2D3748] bg-white dark:bg-[#242B35] text-[#2D1F14] dark:text-[#E2E8F0] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50"
                  rows={3}
                  placeholder="Indica el motivo de tu cancelacion..."
                />
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-sm text-amber-700 dark:text-amber-400">
                <p className="font-medium mb-1">Politica de cancelacion:</p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>Mas de 7 dias antes: reembolso completo</li>
                  <li>3-7 dias antes: 50% de penalizacion</li>
                  <li>Menos de 3 dias o aceptada: sin reembolso</li>
                </ul>
              </div>
            </div>
            <div className="p-4 border-t border-[#F5EDE3] dark:border-[#2D3748] flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(null);
                  setCancelReason("");
                }}
                className="px-4 py-2 text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] hover:bg-[#FDF8F3] dark:hover:bg-[#242B35] rounded-xl transition-colors"
              >
                Volver
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancellingId === showCancelModal}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {cancellingId === showCancelModal ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Confirmar cancelacion
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
