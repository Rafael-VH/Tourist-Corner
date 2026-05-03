import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
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
  ChevronRight,
} from "lucide-react";

type ReservationStatus = "pending" | "accepted" | "completed" | "cancelled";

interface Reservation {
  id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  status: ReservationStatus;
  total_price: number;
  created_at: string;
  room: {
    id: string;
    name: string;
    hotel: {
      id: string;
      name: string;
    };
  };
}

const statusConfig: Record<ReservationStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending: { label: "Solicitada", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", icon: Clock },
  accepted: { label: "Aceptada", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", icon: CheckCircle },
  completed: { label: "Finalizada", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: AlertCircle },
  cancelled: { label: "Cancelada", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", icon: XCircle },
};

export function CalendarPage() {
  const { user } = useAuthStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState<ReservationStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const { data: hotelsData } = await supabase
          .from("hotels")
          .select("id")
          .eq("manager_id", user.id);

        if (!hotelsData || hotelsData.length === 0) {
          setReservations([]);
          return;
        }

        const hotelIds = hotelsData.map((h) => h.id);

        const { data } = await supabase
          .from("reservations")
          .select(`
            id,
            guest_name,
            guest_email,
            check_in,
            check_out,
            status,
            total_price,
            created_at,
            room:room_id (
              id,
              name,
              hotel:hotel_id (
                id,
                name
              )
            )
          `)
          .in("room.hotel_id", hotelIds)
          .order("check_in", { ascending: false });

        setReservations(data || []);
      } catch {
        setReservations([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReservations();
  }, [user?.id]);

  const filtered = filter === "all" ? reservations : reservations.filter((r) => r.status === filter);

  const counts = {
    all: reservations.length,
    pending: reservations.filter((r) => r.status === "pending").length,
    accepted: reservations.filter((r) => r.status === "accepted").length,
    completed: reservations.filter((r) => r.status === "completed").length,
    cancelled: reservations.filter((r) => r.status === "cancelled").length,
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419]">
      <div className="bg-white dark:bg-[#1A2028] border-b border-[#E8D9C8] dark:border-[#2D3748]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-[#5E4836] dark:text-[#94A3B8] hover:text-[#E8850C] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Panel</span>
            </Link>
            <span className="text-[#D4BEA5]">/</span>
            <span className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
              Calendario
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#E8850C] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                Calendario de Reservaciones
              </h1>
              <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                Gestiona las reservaciones de tus hoteles
              </p>
            </div>
          </div>
        </motion.div>

        {/* Status Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "accepted", "completed", "cancelled"] as const).map((status) => {
              const config = status === "all"
                ? { label: "Todas", color: "text-[#2D1F14] dark:text-[#E2E8F0]", bg: "bg-white dark:bg-[#1A2028]" }
                : { ...statusConfig[status], label: statusConfig[status].label };
              return (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    filter === status
                      ? "border-[#E8850C] bg-[#FFF8F1] dark:bg-[#242B35] text-[#E8850C]"
                      : "border-[#E8D9C8] dark:border-[#2D3748] bg-white dark:bg-[#1A2028] text-[#5E4836] dark:text-[#94A3B8] hover:border-[#E8850C]/50"
                  }`}
                >
                  {status !== "all" && (
                    <statusConfig[status as ReservationStatus].icon className="w-4 h-4" />
                  )}
                  {status === "all" ? "Todas" : statusConfig[status as ReservationStatus].label}
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    filter === status
                      ? "bg-[#E8850C]/20 text-[#E8850C]"
                      : "bg-[#FDF8F3] dark:bg-[#242B35] text-[#96785A] dark:text-[#64748B]"
                  }`}>
                    {counts[status]}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Reservations List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden"
        >
          <div className="divide-y divide-[#F5EDE3] dark:divide-[#2D3748]">
            {filtered.map((reservation) => {
              const config = statusConfig[reservation.status];
              const Icon = config.icon;
              return (
                <div
                  key={reservation.id}
                  className="p-5 hover:bg-[#FFF8F1] dark:hover:bg-[#242B35]/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.bg}`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                            {reservation.guest_name}
                          </h3>
                          <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                            {reservation.guest_email}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 ${config.bg} ${config.color}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <span className="text-sm text-[#5E4836] dark:text-[#94A3B8] flex items-center gap-1.5">
                          <Hotel className="w-4 h-4 text-[#E8850C]" />
                          {reservation.room?.hotel?.name}
                        </span>
                        <span className="text-sm text-[#5E4836] dark:text-[#94A3B8] flex items-center gap-1.5">
                          <Bed className="w-4 h-4 text-[#E8850C]" />
                          {reservation.room?.name}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <span className="text-sm text-[#96785A] dark:text-[#64748B]">
                          {formatDate(reservation.check_in)} → {formatDate(reservation.check_out)}
                        </span>
                        <span className="text-sm font-medium text-[#E8850C]">
                          Bs {reservation.total_price}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/dashboard/reservation/${reservation.id}`}
                      className="p-2 hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] rounded-lg transition-colors shrink-0"
                    >
                      <ChevronRight className="w-5 h-5 text-[#B89A7A]" />
                    </Link>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && !isLoading && (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-[#D4BEA5] dark:text-[#2D3748] mx-auto mb-4" />
                <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                  {filter === "all"
                    ? "No hay reservaciones aun"
                    : `No hay reservaciones ${statusConfig[filter as ReservationStatus]?.label.toLowerCase()}`}
                </p>
              </div>
            )}
            {isLoading && (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-4 border-[#E8850C]/30 border-t-[#E8850C] rounded-full animate-spin mx-auto" />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
