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
  LogIn,
  LogOut,
  AlertTriangle,
  CalendarDays,
  History,
  Check,
} from "lucide-react";

type ReservationStatus = "pending" | "accepted" | "checked-in" | "checked-out" | "completed" | "cancelled" | "no-show";

const statusConfig: Record<
  ReservationStatus,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  pending: {
    label: "Solicitada",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    icon: Clock,
  },
  accepted: {
    label: "Aceptada",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    icon: CheckCircle,
  },
  "checked-in": {
    label: "Check-in realizado",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800",
    icon: LogIn,
  },
  "checked-out": {
    label: "Check-out realizado",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    icon: LogOut,
  },
  completed: {
    label: "Finalizada",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
    icon: AlertCircle,
  },
  cancelled: {
    label: "Cancelada",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    icon: XCircle,
  },
  "no-show": {
    label: "No se presento",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
    icon: AlertTriangle,
  },
};

interface RoomInfo {
  name: string;
  hotel: { name: string };
}

export function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    getReservationById,
    selectedReservation,
    updateReservationStatus,
    checkIn,
    checkOut,
    markNoShow,
    extendReservation,
    getStatusHistory,
    statusHistory,
    isLoading,
  } = useReservationStore();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendDate, setExtendDate] = useState("");
  const [showHistory, setShowHistory] = useState(false);

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
        await getStatusHistory(id);
      }
    };
    fetch();
  }, [id, getReservationById, getStatusHistory]);

  const handleAction = async (action: "accept" | "cancel" | "check-in" | "check-out" | "no-show") => {
    if (!id || !selectedReservation) return;
    setIsActionLoading(true);
    try {
      switch (action) {
        case "accept":
          await updateReservationStatus(id, "accepted");
          break;
        case "cancel":
          await updateReservationStatus(id, "cancelled");
          break;
        case "check-in":
          await checkIn(id);
          break;
        case "check-out":
          await checkOut(id);
          break;
        case "no-show":
          await markNoShow(id);
          break;
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleExtend = async () => {
    if (!id || !extendDate) return;
    setIsActionLoading(true);
    try {
      await extendReservation(id, { newCheckOut: extendDate });
      setShowExtendModal(false);
      setExtendDate("");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (!id) return null;

  const config = selectedReservation
    ? statusConfig[selectedReservation.status]
    : null;
  const Icon = config?.icon ?? Clock;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const nights = selectedReservation
    ? Math.ceil(
        (new Date(selectedReservation.checkOut).getTime() -
          new Date(selectedReservation.checkIn).getTime()) /
          (1000 * 60 * 60 * 24),
      )
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
              Reservacion
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && !selectedReservation ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#E8850C] animate-spin mb-4" />
            <p className="text-sm text-[#96785A] dark:text-[#64748B]">
              Cargando reservacion...
            </p>
          </div>
        ) : !selectedReservation ? (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-[#D4BEA5] dark:text-[#2D3748] mx-auto mb-4" />
            <p className="text-sm text-[#96785A] dark:text-[#64748B] mb-4">
              Reservacion no encontrada
            </p>
            <Link
              to="/dashboard/calendar"
              className="text-[#E8850C] text-sm font-medium hover:underline"
            >
              Volver al calendario
            </Link>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 20 }}
              className="mb-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center ${config?.bg}`}
                  >
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
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 border ${config?.bg} ${config?.color}`}
                  >
                    <Icon className="w-4 h-4" />
                    {config?.label}
                  </span>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-2 hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] rounded-lg transition-colors"
                    title="Ver historial"
                  >
                    <History className="w-4 h-4 text-[#B89A7A]" />
                  </button>
                </div>
              </div>
            </motion.div>

            {selectedReservation.status === "pending" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-6 flex flex-wrap gap-3"
              >
                <button
                  onClick={() => handleAction("accept")}
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Aceptar Reservacion
                </button>
                <button
                  onClick={() => handleAction("cancel")}
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Cancelar Reservacion
                </button>
              </motion.div>
            )}

            {selectedReservation.status === "accepted" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-6 flex flex-wrap gap-3"
              >
                <button
                  onClick={() => handleAction("check-in")}
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  Check-in
                </button>
                <button
                  onClick={() => handleAction("cancel")}
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Cancelar
                </button>
                <button
                  onClick={() => handleAction("no-show")}
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                  Marcar No-show
                </button>
              </motion.div>
            )}

            {selectedReservation.status === "checked-in" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-6 flex flex-wrap gap-3"
              >
                <button
                  onClick={() => handleAction("check-out")}
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  Check-out (auto-completa)
                </button>
                <button
                  onClick={() => {
                    setShowExtendModal(true);
                    setExtendDate(selectedReservation.checkOut.toISOString().split("T")[0]);
                  }}
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E8850C] hover:bg-[#C46A08] text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Extend className="w-4 h-4" />}
                  Extender Estadia
                </button>
              </motion.div>
            )}

            {showHistory && statusHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] p-6"
              >
                <h2 className="text-sm font-medium text-[#96785A] dark:text-[#64748B] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Historial de Estados
                </h2>
                <div className="space-y-3">
                  {statusHistory.map((entry) => {
                    const fromConfig = entry.fromStatus ? statusConfig[entry.fromStatus] : null;
                    const toConfig = statusConfig[entry.toStatus];
                    return (
                      <div key={entry.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#E8850C]/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-[#E8850C]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {entry.fromStatus && fromConfig && (
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${fromConfig.bg} ${fromConfig.color}`}>
                                {fromConfig.label}
                              </span>
                            )}
                            <span className="text-[#B89A7A]">→</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${toConfig.bg} ${toConfig.color}`}>
                              {toConfig.label}
                            </span>
                          </div>
                          <p className="text-xs text-[#96785A] dark:text-[#64748B] mt-1">
                            {formatDateTime(entry.changedAt)}
                            {entry.reason && ` — ${entry.reason}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] p-6">
                <h2 className="text-sm font-medium text-[#96785A] dark:text-[#64748B] uppercase tracking-wider mb-4">
                  Habitacion y Hotel
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
                      <p className="text-xs text-[#96785A] dark:text-[#64748B]">Habitacion</p>
                      <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                        {roomInfo?.name ?? "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

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
                  {selectedReservation.actualCheckIn && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                        <LogIn className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400">Check-in real</p>
                        <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                          {formatDateTime(selectedReservation.actualCheckIn)}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedReservation.actualCheckOut && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                        <LogOut className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-purple-600 dark:text-purple-400">Check-out real</p>
                        <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                          {formatDateTime(selectedReservation.actualCheckOut)}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="pt-2 border-t border-[#F5EDE3] dark:border-[#2D3748]">
                    <p className="text-sm font-medium text-[#E8850C]">
                      {nights} noche{nights !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] p-6">
                <h2 className="text-sm font-medium text-[#96785A] dark:text-[#64748B] uppercase tracking-wider mb-4">
                  Huesped
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
                        <p className="text-xs text-[#96785A] dark:text-[#64748B]">Telefono</p>
                        <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                          {selectedReservation.guestPhone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] p-6">
                <h2 className="text-sm font-medium text-[#96785A] dark:text-[#64748B] uppercase tracking-wider mb-4">
                  Precio
                </h2>
                <div className="space-y-3">
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
                  {selectedReservation.cancellationFee > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs text-red-600 dark:text-red-400">Penalizacion</p>
                        <p className="font-medium text-red-600 dark:text-red-400">
                          Bs {selectedReservation.cancellationFee}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedReservation.refundAmount > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-green-600 dark:text-green-400">Reembolso</p>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          Bs {selectedReservation.refundAmount}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedReservation.cancellationReason && (
                <div className="md:col-span-2 bg-white dark:bg-[#1A2028] rounded-2xl border border-red-200 dark:border-red-800 p-6">
                  <h2 className="text-sm font-medium text-red-600 dark:text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Cancelacion
                  </h2>
                  <p className="text-sm text-[#5E4836] dark:text-[#94A3B8]">
                    Motivo: {selectedReservation.cancellationReason}
                  </p>
                  {selectedReservation.cancelledAt && (
                    <p className="text-xs text-[#96785A] dark:text-[#64748B] mt-2">
                      Cancelada el: {formatDateTime(selectedReservation.cancelledAt)}
                    </p>
                  )}
                </div>
              )}

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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-6 flex flex-wrap gap-4 text-xs text-[#96785A] dark:text-[#64748B]"
            >
              <span>
                Creada: {formatDateTime(selectedReservation.createdAt)}
              </span>
              <span>
                Actualizada: {formatDateTime(selectedReservation.updatedAt)}
              </span>
              {selectedReservation.noShowFlag && (
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  No-show registrado
                </span>
              )}
            </motion.div>
          </>
        )}
      </div>

      {showExtendModal && selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden shadow-2xl"
          >
            <div className="p-5 border-b border-[#F5EDE3] dark:border-[#2D3748]">
              <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                Extender Estadia
              </h3>
              <p className="text-xs text-[#96785A] dark:text-[#64748B] mt-0.5">
                {selectedReservation.guestName} — {roomInfo?.name}
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0] mb-2">
                  Nueva fecha de check-out
                </label>
                <input
                  type="date"
                  value={extendDate}
                  min={selectedReservation.checkOut.toISOString().split("T")[0]}
                  onChange={(e) => setExtendDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8D9C8] dark:border-[#2D3748] bg-white dark:bg-[#242B35] text-[#2D1F14] dark:text-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50"
                />
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-700 dark:text-blue-400">
                <p className="font-medium mb-1">Informacion:</p>
                <p className="text-xs">
                  El precio se recalculara automaticamente. Se verificara disponibilidad.
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-[#F5EDE3] dark:border-[#2D3748] flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowExtendModal(false); setExtendDate(""); }}
                className="px-4 py-2 text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] hover:bg-[#FDF8F3] dark:hover:bg-[#242B35] rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleExtend}
                disabled={isActionLoading || !extendDate}
                className="px-4 py-2 bg-[#E8850C] hover:bg-[#C46A08] text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
