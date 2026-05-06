import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
import { useHotelStore } from "@/presentation/providers/useHotelStore";
import { supabase } from "@/data/datasources/SupabaseClient";
import {
  LayoutDashboard,
  Hotel,
  Bed,
  Calendar,
  DollarSign,
  ChevronRight,
  Clock,
  ArrowUpRight,
} from "lucide-react";

interface RoomData {
  id: string;
  name: string;
  is_available: boolean;
  status: string;
  hotel_id: string;
}

interface ReservationSummary {
  pending: number;
  active: number;
  recent: {
    id: string;
    guest_name: string;
    status: string;
    check_in: string;
    room: { name: string } | { name: string }[] | null;
  }[];
}

export function ManagerDashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { hotels, fetchManagerHotels, isLoading } = useHotelStore();
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [reservationSummary, setReservationSummary] =
    useState<ReservationSummary>({
      pending: 0,
      active: 0,
      recent: [],
    });

  useEffect(() => {
    if (user?.id) {
      fetchManagerHotels(user.id);
    }
  }, [user?.id, fetchManagerHotels]);

  useEffect(() => {
    if (hotels.length > 0) {
      const fetchData = async () => {
        try {
          const hotelIds = hotels.map((h) => h.id);

          const { data: roomsData } = await supabase
            .from("rooms")
            .select("id, name, is_available, status, hotel_id")
            .in("hotel_id", hotelIds);
          setRooms(roomsData || []);

          const { data: resData } = await supabase
            .from("reservations")
            .select(
              `
              id, guest_name, status, check_in,
              room:room_id (name)
            `,
            )
            .in("hotel_id", hotelIds)
            .order("created_at", { ascending: false })
            .limit(5);

          const reservations = resData || [];
          setReservationSummary({
            pending: reservations.filter((r) => r.status === "pending").length,
            active: reservations.filter(
              (r) =>
                r.status === "pending" ||
                r.status === "accepted" ||
                r.status === "checked-in",
            ).length,
            recent: reservations,
          });
        } catch {
          setRooms([]);
          setReservationSummary({ pending: 0, active: 0, recent: [] });
        }
      };
      fetchData();
    }
  }, [hotels]);

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.is_available).length;
  const totalRevenue = hotels.reduce(
    (sum, h) => sum + h.priceRange.min * h.reviewCount,
    0,
  );

  const stats = [
    {
      label: "Hoteles",
      value: String(hotels.length),
      icon: <Hotel className="w-5 h-5" />,
      color: "bg-[#E8850C]",
      link: "/dashboard/hotels",
    },
    {
      label: "Habitaciones",
      value: `${availableRooms}/${totalRooms}`,
      icon: <Bed className="w-5 h-5" />,
      color: "bg-[#FF7A52]",
      link: "/dashboard/rooms",
    },
    {
      label: "Reservas Activas",
      value: String(reservationSummary.active),
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-emerald-500",
      link: "/dashboard/calendar",
    },
    {
      label: "Ingreso Ref.",
      value: `$${(totalRevenue / 1000).toFixed(1)}k`,
      icon: <DollarSign className="w-5 h-5" />,
      color: "bg-blue-500",
      link: "/dashboard/reports",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[#96785A] dark:text-[#64748B]">
          Cargando dashboard...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#E8850C] flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
              Hola, {user?.name}
            </h1>
            <p className="text-sm text-[#96785A] dark:text-[#64748B]">
              Resumen de tu actividad
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="bg-white dark:bg-[#1A2028] rounded-2xl p-5 border border-[#E8D9C8] dark:border-[#2D3748] hover:border-[#E8850C]/50 dark:hover:border-[#E8850C]/30 transition-colors group"
          >
            <div
              className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.color} text-white mb-3`}
            >
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
              {stat.value}
            </p>
            <p className="text-sm text-[#96785A] dark:text-[#64748B]">
              {stat.label}
            </p>
          </Link>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Reservations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden"
          >
            <div className="p-6 border-b border-[#F5EDE3] dark:border-[#2D3748] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                  Reservaciones Recientes
                </h2>
                <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                  Ultimas 5 reservaciones
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/calendar")}
                className="text-sm text-[#E8850C] hover:text-[#C46A08] font-medium flex items-center gap-1"
              >
                Ver todas
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {reservationSummary.recent.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-10 h-10 text-[#D4BEA5] dark:text-[#2D3748] mx-auto mb-3" />
                <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                  No hay reservaciones aun
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#F5EDE3] dark:divide-[#2D3748]">
                {reservationSummary.recent.map((res) => {
                  const statusColors: Record<string, string> = {
                    pending:
                      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
                    accepted:
                      "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                    "checked-in":
                      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
                    "checked-out":
                      "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
                    completed:
                      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
                    cancelled:
                      "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
                    "no-show":
                      "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
                  };
                  const statusLabels: Record<string, string> = {
                    pending: "Solicitada",
                    accepted: "Aceptada",
                    "checked-in": "Check-in",
                    "checked-out": "Check-out",
                    completed: "Finalizada",
                    cancelled: "Cancelada",
                    "no-show": "No-show",
                  };

                  return (
                    <Link
                      key={res.id}
                      to={`/dashboard/reservation/${res.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-[#FFF8F1] dark:hover:bg-[#242B35]/50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#FDF8F3] dark:bg-[#242B35] flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-[#B89A7A]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0] group-hover:text-[#E8850C] transition-colors">
                          {res.guest_name}
                        </p>
                        <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                          {Array.isArray(res.room) ? res.room[0]?.name : res.room?.name || "Sin habitacion"} ·{" "}
                          {new Date(res.check_in).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[res.status] || "bg-gray-50 text-gray-600"}`}
                      >
                        {statusLabels[res.status] || res.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#B89A7A] group-hover:text-[#E8850C] group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Quick Hotel Overview */}
          {hotels.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden"
            >
              <div className="p-6 border-b border-[#F5EDE3] dark:border-[#2D3748] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                    Mis Hoteles
                  </h2>
                  <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                    Vista rapida
                  </p>
                </div>
                <Link
                  to="/dashboard/hotels"
                  className="text-sm text-[#E8850C] hover:text-[#C46A08] font-medium flex items-center gap-1"
                >
                  Gestionar
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="divide-y divide-[#F5EDE3] dark:divide-[#2D3748]">
                {hotels.map((hotel) => {
                  const hotelRooms = rooms.filter(
                    (r) => r.hotel_id === hotel.id,
                  );
                  const available = hotelRooms.filter(
                    (r) => r.is_available,
                  ).length;

                  return (
                    <Link
                      key={hotel.id}
                      to={`/dashboard/hotel/${hotel.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-[#FFF8F1] dark:hover:bg-[#242B35]/50 transition-colors group"
                    >
                      <img
                        src={hotel.coverImage || hotel.images[0]}
                        alt={hotel.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0] group-hover:text-[#E8850C] transition-colors">
                            {hotel.name}
                          </p>
                          {hotel.isMain && (
                            <span className="px-1.5 py-0.5 bg-[#E8850C]/10 text-[#E8850C] text-xs font-medium rounded">
                              Principal
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                          {hotel.type} · {hotel.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                          {available}/{hotelRooms.length}
                        </p>
                        <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                          disponibles
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#B89A7A] group-hover:text-[#E8850C] group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]"
          >
            <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-4">
              Acciones Rapidas
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/dashboard/hotel/new")}
                className="w-full flex items-center gap-3 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl text-left hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748] transition-colors"
              >
                <Hotel className="w-5 h-5 text-[#E8850C]" />
                <div>
                  <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                    Nuevo Hotel
                  </p>
                  <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                    Crear hotel principal
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigate("/dashboard/room/new")}
                className="w-full flex items-center gap-3 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl text-left hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748] transition-colors"
              >
                <Bed className="w-5 h-5 text-[#E8850C]" />
                <div>
                  <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                    Nueva Habitacion
                  </p>
                  <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                    Agregar a un hotel
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigate("/dashboard/calendar")}
                className="w-full flex items-center gap-3 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl text-left hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748] transition-colors"
              >
                <Calendar className="w-5 h-5 text-[#E8850C]" />
                <div>
                  <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                    Ver Calendario
                  </p>
                  <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                    Gestionar reservaciones
                  </p>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Pending Reservations */}
          {reservationSummary.pending > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Pendientes
                </h3>
                <span className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full">
                  {reservationSummary.pending}
                </span>
              </div>
              <p className="text-sm text-[#96785A] dark:text-[#64748B] mb-3">
                Tienes {reservationSummary.pending} reservacion
                {reservationSummary.pending !== 1 ? "es" : ""} por revisar
              </p>
              <button
                onClick={() => navigate("/dashboard/calendar")}
                className="w-full py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              >
                Ver Pendientes
              </button>
            </motion.div>
          )}

          {/* Rooms Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]"
          >
            <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-4 flex items-center gap-2">
              <Bed className="w-5 h-5 text-[#E8850C]" />
              Estado de Habitaciones
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-center">
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {availableRooms}
                </p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                  Disponibles
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl text-center">
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {totalRooms - availableRooms}
                </p>
                <p className="text-xs text-red-600/70 dark:text-red-400/70">
                  Ocupadas
                </p>
              </div>
            </div>
            <Link
              to="/dashboard/rooms"
              className="w-full mt-3 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] text-[#5E4836] dark:text-[#94A3B8] rounded-xl text-sm font-medium hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748] transition-colors flex items-center justify-center gap-1"
            >
              Ver Todas
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
