import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useReservationStore } from "@/presentation/providers/useReservationStore";
import { supabase } from "@/data/datasources/SupabaseClient";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Hotel,
  Bed,
  User,
  Mail,
  Phone,
  FileText,
  DollarSign,
  Loader2,
} from "lucide-react";

type ReservationStatus = "pending" | "accepted" | "completed" | "cancelled";

const statusConfig: Record<ReservationStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending: { label: "Solicitada", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800", icon: Clock },
  accepted: { label: "Aceptada", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800", icon: CheckCircle },
  completed: { label: "Finalizada", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800", icon: AlertCircle },
  cancelled: { label: "Cancelada", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800", icon: XCircle },
};

interface RoomInfo {
  name: string;
  hotel: { name: string };
}

export function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getReservationById, selectedReservation, updateReservationStatus, isLoading } = useReservationStore();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const reservation = await getReservationById(id);
      if (reservation) {
        const { data: roomData } = await supabase
          .from("rooms")
          .select("name, hotel:hotel_id(name)")
          .eq("id", reservation.roomId)
          .single();
        if (roomData) {
          const rd = roomData as Record<string, unknown>;
          const hotelRaw = rd.hotel as { name: string } | undefined;
          setRoomInfo({
            name: rd.name as string,
            hotel: { name: hotelRaw?.name ?? "" },
          });
        }
      }
    };
    fetch();
  }, [id, getReservationById]);

  const handleAccept = async () => {
    if (!id || !selectedReservation) return;
    setIsActionLoading(true);
    try {
      await updateReservationStatus(id, "accepted");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id || !selectedReservation) return;
    setIsActionLoading(true);
    try {
      await updateReservationStatus(id, "cancelled");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (!id) return null;

  const config = selectedReservation ? statusConfig[selectedReservation.status] : null;
  const Icon = config?.icon ?? Clock;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const nights = selectedReservation
    ? Math.ceil((new Date(selectedReservation.checkOut).getTime() - new Date(selectedReservation.checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419]">
      <div className="bg-white dark:bg-[#1A2028] border-b border-[#E8D9C8] dark:border-[#2D3748]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard/calendar"
              className="inline-flex items-center gap-2 text-[#5E4836] dark:text-[#94A3B8] hover:text-[#E8850C] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Calendario</span>
            </Link>
            <span className="text-[#D4BEA5]">/</span>
            <span className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
              Reservación
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && !selectedReservation ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#E8850C] animate-spin mb-4" />
            <p className="text-sm text-[#96785A] dark:text-[#64748B]">Cargando reservación...</p>
          </div>
        ) : !selectedReservation ? (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-[#D4BEA5] dark:text-[#2D3748] mx-auto mb-4" />
            <p className="text-sm text-[#96785A] dark:text-[#64748B] mb-4">Reservación no encontrada</p>
            <Link
              to="/dashboard/calendar"
              className="text-[#E8850C] text-sm font-medium hover:underline"
            >
              Volver al calendario
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${config?.bg}`}>
                    <Icon className={`w-6 h-6 ${config?.color}`} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                      {selectedReservation.guestName}
                    </h1>
                    <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                      {selectedReservation.guestEmail}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 border ${config?.bg} ${config?.color}`}
                >
                  <Icon className="w-4 h-4" />
                  {config?.label}
                </span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            {selectedReservation.status === "pending" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-6 flex flex-wrap gap-3"
              >
                <button
                  onClick={handleAccept}
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  Aceptar Reservación
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4" />
                  Cancelar Reservación
                </button>
              </motion.div>
            )}

            {/* Details Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Room & Hotel */}
              <div className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] p-6">
                <h2 className="text-sm font-medium text-[#96785A] dark:text-[#64748B] uppercase tracking-wider mb-4">
                  Habitación y Hotel
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E8850C]/10 flex items-center justify-center">
                      <Hotel className="w-4 h-4 text-[#E8850C]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#96785A] dark:text-[#64748B]">Hotel</p>
                      <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                        {roomInfo?.hotel?.name ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E8850C]/10 flex items-center justify-center">
                      <Bed className="w-4 h-4 text-[#E8850C]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#96785A] dark:text-[#64748B]">Habitación</p>
                      <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                        {roomInfo?.name ?? "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] p-6">
                <h2 className="text-sm font-medium text-[#96785A] dark:text-[#64748B] uppercase tracking-wider mb-4">
                  Fechas
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E8850C]/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-[#E8850C]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#96785A] dark:text-[#64748B]">Check-in</p>
                      <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                        {formatDate(selectedReservation.checkIn)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E8850C]/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-[#E8850C]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#96785A] dark:text-[#64748B]">Check-out</p>
                      <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                        {formatDate(selectedReservation.checkOut)}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#F5EDE3] dark:border-[#2D3748]">
                    <p className="text-sm font-medium text-[#E8850C]">{nights} noche{nights !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              </div>

              {/* Guest */}
              <div className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] p-6">
                <h2 className="text-sm font-medium text-[#96785A] dark:text-[#64748B] uppercase tracking-wider mb-4">
                  Huésped
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E8850C]/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-[#E8850C]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#96785A] dark:text-[#64748B]">Nombre</p>
                      <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                        {selectedReservation.guestName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E8850C]/10 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-[#E8850C]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#96785A] dark:text-[#64748B]">Email</p>
                      <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                        {selectedReservation.guestEmail}
                      </p>
                    </div>
                  </div>
                  {selectedReservation.guestPhone && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#E8850C]/10 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-[#E8850C]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#96785A] dark:text-[#64748B]">Teléfono</p>
                        <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                          {selectedReservation.guestPhone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] p-6">
                <h2 className="text-sm font-medium text-[#96785A] dark:text-[#64748B] uppercase tracking-wider mb-4">
                  Precio
                </h2>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E8850C]/10 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-[#E8850C]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#96785A] dark:text-[#64748B]">Total</p>
                    <p className="text-xl font-bold text-[#E8850C]">
                      Bs {selectedReservation.totalPrice}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedReservation.notes && (
                <div className="md:col-span-2 bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] p-6">
                  <h2 className="text-sm font-medium text-[#96785A] dark:text-[#64748B] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notas
                  </h2>
                  <p className="text-sm text-[#5E4836] dark:text-[#94A3B8] whitespace-pre-wrap">
                    {selectedReservation.notes}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Meta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-6 flex flex-wrap gap-4 text-xs text-[#96785A] dark:text-[#64748B]"
            >
              <span>Creada: {formatDateTime(selectedReservation.createdAt)}</span>
              <span>Actualizada: {formatDateTime(selectedReservation.updatedAt)}</span>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
