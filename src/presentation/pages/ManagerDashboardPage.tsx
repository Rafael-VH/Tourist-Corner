import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
import { useHotelStore } from "@/presentation/providers/useHotelStore";
import { supabase } from "@/data/datasources/SupabaseClient";
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
  Wrench,
  Tag,
  GitBranch,
  Trash2,
  X,
  ArrowUpRight,
} from "lucide-react";

interface CustomService {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export function ManagerDashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { hotels, fetchManagerHotels, isLoading } = useHotelStore();
  const [roomsFromAllHotels, setRoomsFromAllHotels] = useState<{ id: string; name: string; type: string; price_per_night: number; is_available: boolean; images: string[]; bed_type: string; capacity: number; hotel_id: string; custom_room_types?: { name: string } | null }[]>([]);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">(
    "month",
  );

  const [customRoomTypes, setCustomRoomTypes] = useState<{ id: string; name: string; description: string | null; created_at: string }[]>([]);
  const [customServices, setCustomServices] = useState<CustomService[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchManagerHotels(user.id);
    }
  }, [user?.id, fetchManagerHotels]);

  useEffect(() => {
    if (hotels.length > 0) {
      const fetchAllRooms = async () => {
        try {
          const allRooms = await Promise.all(
            hotels.map((hotel) =>
              supabase
                .from("rooms")
                .select("*, custom_room_types(id, name)")
                .eq("hotel_id", hotel.id)
            )
          );
          const flatRooms = allRooms.flatMap((r) => r.data || []);
          setRoomsFromAllHotels(flatRooms);
        } catch {
          setRoomsFromAllHotels([]);
        }
      };
      fetchAllRooms();
    }
  }, [hotels]);

  useEffect(() => {
    const fetchCustomTypes = async () => {
      try {
        const { data, error } = await supabase
          .from("custom_room_types")
          .select("id, name, description, created_at")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setCustomRoomTypes(data || []);
      } catch (err: unknown) {
        console.error("Error fetching custom room types:", err);
      }
    };
    fetchCustomTypes();
  }, []);

  useEffect(() => {
    const fetchCustomServices = async () => {
      try {
        const { data, error } = await supabase
          .from("custom_services")
          .select("id, name, description, icon, created_at")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setCustomServices(data || []);
      } catch (err: unknown) {
        console.error("Error fetching custom services:", err);
      }
    };
    fetchCustomServices();
  }, []);

  const mainHotels = hotels.filter((h) => h.isMain);
  const branchHotels = hotels.filter((h) => h.branchOf);

  const mainHotelsWithBranches = mainHotels.map((main) => ({
    ...main,
    branches: branchHotels.filter((b) => b.branchOf === main.id),
  }));

  const totalRooms = roomsFromAllHotels.length;
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

  const handleNewRoomType = () => {
    navigate("/dashboard/room-type/new");
  };

  const handleNewService = () => {
    navigate("/dashboard/service/new");
  };

  const handleViewReports = () => {
    navigate("/dashboard/reports");
  };

  const handleSettings = () => {
    navigate("/dashboard/settings");
  };

  const deleteCustomRoomType = async (id: string) => {
    if (!confirm("Eliminar este tipo de habitacion?")) return;
    try {
      const { error } = await supabase
        .from("custom_room_types")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setCustomRoomTypes((prev) => prev.filter((t) => t.id !== id));
    } catch (err: unknown) {
      setError((err as Error).message || "Error al eliminar tipo");
    }
  };

  const deleteCustomService = async (id: string) => {
    if (!confirm("Eliminar este servicio personalizado?")) return;
    try {
      const { error } = await supabase
        .from("custom_services")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setCustomServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err: unknown) {
      setError((err as Error).message || "Error al eliminar servicio");
    }
  };

  const deleteRoom = async (id: string) => {
    if (!confirm("Eliminar esta habitacion? Esta accion no se puede deshacer.")) return;
    try {
      const { error } = await supabase.from("rooms").delete().eq("id", id);
      if (error) throw error;
      setRoomsFromAllHotels((prev) => prev.filter((r) => r.id !== id));
    } catch (err: unknown) {
      setError((err as Error).message || "Error al eliminar habitacion");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419]">
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
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
                Bienvenido, {user?.name} (Dueño)
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
                        {mainHotelsWithBranches.length > 0
                          ? "Gestiona tu hotel y sucursales"
                          : "Gestiona tu hotel"}
                      </p>
                    </div>
                    {mainHotelsWithBranches.length > 0 ? (
                      <button
                        onClick={handleNewHotel}
                        className="flex items-center gap-2 px-4 py-2 bg-[#E8850C] hover:bg-[#C46A08] text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        <GitBranch className="w-4 h-4" />
                        Agregar Sucursal
                      </button>
                    ) : (
                      <button
                        onClick={handleNewHotel}
                        className="flex items-center gap-2 px-4 py-2 bg-[#E8850C] hover:bg-[#C46A08] text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar
                      </button>
                    )}
                  </div>
              </div>

              <div className="divide-y divide-[#F5EDE3] dark:divide-[#2D3748]">
                {mainHotelsWithBranches.map((hotel) => (
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
                        {hotel.branches.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[#F5EDE3] dark:border-[#2D3748]">
                            <p className="text-xs font-medium text-[#5E4836] dark:text-[#94A3B8] mb-2 flex items-center gap-1">
                              <GitBranch className="w-3 h-3" />
                              Sucursales ({hotel.branches.length})
                            </p>
                            <div className="space-y-2">
                              {hotel.branches.map((branch) => (
                                <Link
                                  key={branch.id}
                                  to={`/dashboard/hotel/${branch.id}`}
                                  className="flex items-center justify-between p-2 bg-[#FDF8F3] dark:bg-[#242B35] rounded-lg hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748] transition-colors group"
                                >
                                  <span className="text-sm text-[#2D1F14] dark:text-[#E2E8F0] group-hover:text-[#E8850C] transition-colors">
                                    {branch.name}
                                  </span>
                                  <ChevronRight className="w-4 h-4 text-[#B89A7A] group-hover:text-[#E8850C] group-hover:translate-x-1 transition-all" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
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

            {/* Rooms List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden"
            >
              <div className="p-6 border-b border-[#F5EDE3] dark:border-[#2D3748]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0] flex items-center gap-2">
                      <Bed className="w-5 h-5 text-[#E8850C]" />
                      Habitaciones
                    </h2>
                    <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                      {roomsFromAllHotels.length} habitaciones registradas
                    </p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-[#F5EDE3] dark:divide-[#2D3748]">
                {roomsFromAllHotels.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center gap-4 p-5 hover:bg-[#FFF8F1] dark:hover:bg-[#242B35]/50 transition-colors group"
                  >
                    <Link
                      to={`/dashboard/room/${room.id}`}
                      className="flex items-center gap-4 flex-1 min-w-0"
                    >
                      <img
                        src={room.images?.[0] || "/placeholder-room.jpg"}
                        alt={room.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0] group-hover:text-[#E8850C] transition-colors">
                          {room.name}
                        </h3>
                        <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                          {room.custom_room_types?.name || room.type} · {room.bed_type} · {room.capacity} personas
                        </p>
                      </div>
                      <span className="text-sm font-medium text-[#E8850C]">
                        ${room.price_per_night}
                        <span className="text-xs text-[#96785A]">/noche</span>
                      </span>
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          room.is_available
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                            : "bg-red-50 text-red-600 dark:bg-red-900/20"
                        }`}
                      >
                        {room.is_available ? "Disponible" : "Ocupada"}
                      </span>
                    </Link>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link
                        to={`/dashboard/room/${room.id}`}
                        className="p-2 hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-[#B89A7A]" />
                      </Link>
                      <button
                        onClick={() => deleteRoom(room.id)}
                        className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {roomsFromAllHotels.length === 0 && !isLoading && (
                  <div className="p-8 text-center text-sm text-[#96785A] dark:text-[#64748B]">
                    No hay habitaciones registradas aun
                  </div>
                )}
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
                    {mainHotelsWithBranches.map((hotel) => (
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
                    {mainHotelsWithBranches.length === 0 && !isLoading && (
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
            {/* Gestion Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]"
            >
              <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-4">
                Gestion
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
                      Agregar establecimiento o sucursal
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
                <button
                  onClick={handleNewRoomType}
                  className="w-full flex items-center gap-3 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl text-left hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748] transition-colors"
                >
                  <Tag className="w-5 h-5 text-[#E8850C]" />
                  <div>
                    <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                      Nuevo Tipo de Habitacion
                    </p>
                    <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                      Crear tipo personalizado
                    </p>
                  </div>
                </button>
                <button
                  onClick={handleNewService}
                  className="w-full flex items-center gap-3 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl text-left hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748] transition-colors"
                >
                  <Wrench className="w-5 h-5 text-[#E8850C]" />
                  <div>
                    <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                      Nuevo Servicio
                    </p>
                    <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                      Crear servicio personalizado
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>

            {/* Navegacion Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]"
            >
              <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-4">
                Navegacion
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/dashboard/calendar")}
                  className="w-full flex items-center gap-3 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl text-left hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748] transition-colors"
                >
                  <Calendar className="w-5 h-5 text-[#E8850C]" />
                  <div>
                    <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                      Calendario
                    </p>
                    <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                      Ver reservaciones
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#B89A7A] ml-auto" />
                </button>
                <button
                  onClick={handleViewReports}
                  className="w-full flex items-center gap-3 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl text-left hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748] transition-colors"
                >
                  <BarChart3 className="w-5 h-5 text-[#E8850C]" />
                  <div>
                    <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                      Ver Reportes
                    </p>
                    <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                      Analisis de rendimiento
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#B89A7A] ml-auto" />
                </button>
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center gap-3 p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl text-left hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748] transition-colors"
                >
                  <Settings className="w-5 h-5 text-[#E8850C]" />
                  <div>
                    <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                      Configuracion
                    </p>
                    <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                      Ajustes de la cuenta
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#B89A7A] ml-auto" />
                </button>
              </div>
            </motion.div>

            {/* Custom Room Types */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0] flex items-center gap-2">
                  <Tag className="w-5 h-5 text-[#E8850C]" />
                  Tipos Personalizados
                </h3>
                <button
                  onClick={handleNewRoomType}
                  className="p-1.5 bg-[#FFF8F1] dark:bg-[#242B35] rounded-lg hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#E8850C]" />
                </button>
              </div>
              {customRoomTypes.length > 0 ? (
                <div className="space-y-2">
                  {customRoomTypes.slice(0, 4).map((type) => (
                    <div
                      key={type.id}
                      className="p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-lg flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                          {type.name}
                        </p>
                        {type.description && (
                          <p className="text-xs text-[#96785A] dark:text-[#64748B] mt-0.5 line-clamp-1">
                            {type.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteCustomRoomType(type.id)}
                        className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {customRoomTypes.length > 4 && (
                    <p className="text-xs text-[#96785A] dark:text-[#64748B] text-center">
                      +{customRoomTypes.length - 4} mas
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#96785A] dark:text-[#64748B] text-center py-4">
                  No tienes tipos personalizados
                </p>
              )}
            </motion.div>

            {/* Custom Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.375 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0] flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-[#E8850C]" />
                  Servicios Personalizados
                </h3>
                <button
                  onClick={handleNewService}
                  className="p-1.5 bg-[#FFF8F1] dark:bg-[#242B35] rounded-lg hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#E8850C]" />
                </button>
              </div>
              {customServices.length > 0 ? (
                <div className="space-y-2">
                  {customServices.slice(0, 4).map((service) => (
                    <div
                      key={service.id}
                      className="p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-lg flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                          {service.name}
                        </p>
                        {service.description && (
                          <p className="text-xs text-[#96785A] dark:text-[#64748B] mt-0.5 line-clamp-1">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteCustomService(service.id)}
                        className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {customServices.length > 4 && (
                    <p className="text-xs text-[#96785A] dark:text-[#64748B] text-center">
                      +{customServices.length - 4} mas
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#96785A] dark:text-[#64748B] text-center py-4">
                  No tienes servicios personalizados
                </p>
              )}
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
