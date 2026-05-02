import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
import { useHotelStore } from "@/presentation/providers/useHotelStore";
import { useRoomStore } from "@/presentation/providers/useRoomStore";
import {
  LayoutDashboard,
  Hotel,
  Plus,
  Bed,
  Star,
  DollarSign,
  Settings,
  ChevronRight,
  BarChart3,
  Calendar,
  Users,
} from "lucide-react";

export function ManagerDashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { hotels, fetchManagerHotels, isLoading } = useHotelStore();
  const { rooms } = useRoomStore();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">(
    "month",
  );

  useEffect(() => {
    if (user?.id) {
      fetchManagerHotels(user.id);
    }
  }, [user?.id, fetchManagerHotels]);

  const totalRooms = rooms.length;
  const totalRevenue = hotels.reduce(
    (sum, h) => sum + h.priceRange.min * h.reviewCount,
    0,
  );

  const stats = [
    {
      label: "Mis Hoteles",
      value: String(hotels.length),
      icon: <Hotel className="w-5 h-5" />,
      color: "bg-[#E8850C]",
    },
    {
      label: "Habitaciones",
      value: String(totalRooms),
      icon: <Bed className="w-5 h-5" />,
      color: "bg-[#FF7A52]",
    },
    {
      label: "Resenas",
      value: String(
        hotels.reduce((sum, h) => sum + h.reviewCount, 0),
      ),
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-emerald-500",
    },
    {
      label: "Ingreso Ref.",
      value: `$${(totalRevenue / 1000).toFixed(1)}k`,
      icon: <DollarSign className="w-5 h-5" />,
      color: "bg-blue-500",
    },
  ];

  const handleNewHotel = () => {
    navigate("/dashboard/hotel/new");
  };

  const handleNewRoom = (hotelId: string) => {
    navigate(`/dashboard/room/new?hotelId=${hotelId}`);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                Panel de Gestion
              </h1>
              <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                Bienvenido, {user?.name}
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
            <div
              key={stat.label}
              className="bg-white dark:bg-[#1A2028] rounded-2xl p-5 border border-[#E8D9C8] dark:border-[#2D3748]"
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
            </div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hotels Section */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden"
            >
              <div className="p-6 border-b border-[#F5EDE3] dark:border-[#2D3748]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                      Mis Establecimientos
                    </h2>
                    <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                      Gestiona tus hoteles y habitaciones
                    </p>
                  </div>
                    <button
                      onClick={handleNewHotel}
                      className="flex items-center gap-2 px-4 py-2 bg-[#E8850C] hover:bg-[#C46A08] text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar
                    </button>
                </div>
              </div>

              <div className="divide-y divide-[#F5EDE3] dark:divide-[#2D3748]">
                {hotels.slice(0, 4).map((hotel) => (
                  <div
                    key={hotel.id}
                    className="p-5 hover:bg-[#FFF8F1] dark:hover:bg-[#242B35]/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={hotel.coverImage || hotel.images[0]}
                        alt={hotel.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                              {hotel.name}
                            </h3>
                            <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                              {hotel.type} · {hotel.city}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              hotel.isActive
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                                : "bg-red-50 text-red-600 dark:bg-red-900/20"
                            }`}
                          >
                            {hotel.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-sm text-[#96785A] dark:text-[#64748B]">
                            <Star className="w-4 h-4 text-[#E8850C] fill-[#E8850C]" />
                            {hotel.rating}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-[#96785A] dark:text-[#64748B]">
                            <Users className="w-4 h-4" />
                            {hotel.reviewCount} opiniones
                          </span>
                          <span className="text-sm font-medium text-[#E8850C]">
                            ${hotel.priceRange.min} - ${hotel.priceRange.max}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/dashboard/hotel/${hotel.id}`}
                        className="p-2 hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] rounded-lg transition-colors shrink-0"
                      >
                        <ChevronRight className="w-5 h-5 text-[#B89A7A]" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hotel Summary Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden"
            >
              <div className="p-6 border-b border-[#F5EDE3] dark:border-[#2D3748]">
                <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                  Resumen de Hoteles
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#F5EDE3] dark:border-[#2D3748]">
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#96785A] dark:text-[#64748B] uppercase">
                        Hotel
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#96785A] dark:text-[#64748B] uppercase">
                        Tipo
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#96785A] dark:text-[#64748B] uppercase">
                        Ciudad
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#96785A] dark:text-[#64748B] uppercase">
                        Rating
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#96785A] dark:text-[#64748B] uppercase">
                        Estado
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#96785A] dark:text-[#64748B] uppercase">
                        Precio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5EDE3] dark:divide-[#2D3748]">
                    {hotels.map((hotel) => (
                      <tr
                        key={hotel.id}
                        className="hover:bg-[#FFF8F1] dark:hover:bg-[#242B35]/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                          {hotel.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#5E4836] dark:text-[#94A3B8] capitalize">
                          {hotel.type}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#96785A] dark:text-[#64748B]">
                          {hotel.city}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#E8850C] font-medium">
                          {hotel.rating}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              hotel.isActive
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                                : "bg-red-50 text-red-600 dark:bg-red-900/20"
                            }`}
                          >
                            {hotel.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-[#E8850C]">
                          ${hotel.priceRange.min}
                        </td>
                      </tr>
                    ))}
                    {hotels.length === 0 && !isLoading && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-sm text-[#96785A] dark:text-[#64748B]"
                        >
                          No tienes hoteles registrados aun
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]"
            >
              <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-4">
                Acciones Rapidas
              </h3>
              <div className="space-y-2">
                <button
                  onClick={handleNewHotel}
                  className="w-full flex items-center gap-3 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl text-left hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748] transition-colors"
                >
                  <Plus className="w-5 h-5 text-[#E8850C]" />
                  <div>
                    <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                      Nuevo Hotel
                    </p>
                    <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                      Agregar un establecimiento
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => hotels[0] && handleNewRoom(hotels[0].id)}
                  disabled={hotels.length === 0}
                  className="w-full flex items-center gap-3 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl text-left hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748] transition-colors disabled:opacity-50"
                >
                  <Bed className="w-5 h-5 text-[#E8850C]" />
                  <div>
                    <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                      Nueva Habitacion
                    </p>
                    <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                      Agregar habitacion a un hotel
                    </p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl text-left hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748] transition-colors">
                  <BarChart3 className="w-5 h-5 text-[#E8850C]" />
                  <div>
                    <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                      Ver Reportes
                    </p>
                    <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                      Analisis de rendimiento
                    </p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl text-left hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748] transition-colors">
                  <Settings className="w-5 h-5 text-[#E8850C]" />
                  <div>
                    <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                      Configuracion
                    </p>
                    <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                      Ajustes de la cuenta
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>

            {/* Performance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                  Rendimiento
                </h3>
                <div className="flex bg-[#FDF8F3] dark:bg-[#242B35] rounded-lg p-0.5">
                  {(["week", "month", "year"] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        timeRange === range
                          ? "bg-white dark:bg-[#1A2028] text-[#E8850C] shadow-sm"
                          : "text-[#96785A] dark:text-[#64748B]"
                      }`}
                    >
                      {range === "week"
                        ? "Sem"
                        : range === "month"
                          ? "Mes"
                          : "Ano"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart placeholder */}
              <div className="h-40 flex items-end gap-2">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map(
                  (height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-[#E8850C] rounded-t-md opacity-80 hover:opacity-100 transition-opacity"
                      style={{ height: `${height}%` }}
                    />
                  ),
                )}
              </div>
              <div className="flex justify-between mt-2 text-xs text-[#96785A] dark:text-[#64748B]">
                <span>Ene</span>
                <span>Mar</span>
                <span>May</span>
                <span>Jul</span>
                <span>Sep</span>
                <span>Nov</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
