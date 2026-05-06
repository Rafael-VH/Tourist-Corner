import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
import { useHotelStore } from "@/presentation/providers/useHotelStore";
import { supabase } from "@/data/datasources/SupabaseClient";
import {
  Bed,
  Plus,
  ChevronRight,
  Search,
  DollarSign,
  Users,
} from "lucide-react";

interface RoomData {
  id: string;
  name: string;
  type: string;
  price_per_night: number;
  is_available: boolean;
  status: string;
  images: string[];
  bed_type: string;
  capacity: number;
  hotel_id: string;
  custom_room_types?: { name: string } | null;
}

interface HotelGroup {
  hotel: { id: string; name: string; isMain: boolean };
  rooms: RoomData[];
}

export function DashboardRoomsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { hotels, fetchManagerHotels } = useHotelStore();
  const [roomsByHotel, setRoomsByHotel] = useState<HotelGroup[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchManagerHotels(user.id);
    }
  }, [user?.id, fetchManagerHotels]);

  useEffect(() => {
    if (hotels.length > 0) {
      const fetchRooms = async () => {
        setIsLoading(true);
        try {
          const allRooms = await Promise.all(
            hotels.map((hotel) =>
              supabase
                .from("rooms")
                .select("*, custom_room_types(id, name)")
                .eq("hotel_id", hotel.id),
            ),
          );

          const flatRooms: RoomData[] = allRooms.flatMap((r) => r.data || []);

          const groups: HotelGroup[] = hotels.map((hotel) => ({
            hotel,
            rooms: flatRooms.filter((r) => r.hotel_id === hotel.id),
          }));

          setRoomsByHotel(groups);
        } catch {
          setRoomsByHotel([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRooms();
    }
  }, [hotels]);

  const totalRooms = roomsByHotel.reduce((sum, g) => sum + g.rooms.length, 0);
  const totalAvailable = roomsByHotel.reduce(
    (sum, g) => sum + g.rooms.filter((r) => r.is_available).length,
    0,
  );

  const filteredGroups = roomsByHotel
    .map((group) => ({
      ...group,
      rooms: group.rooms.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          (r.custom_room_types?.name || r.type)
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    }))
    .filter((g) => g.rooms.length > 0);

  const mainHotel = hotels.find((h) => h.isMain);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
            Habitaciones
          </h1>
          <p className="text-sm text-[#96785A] dark:text-[#64748B] mt-1">
            {totalRooms} habitaciones en total · {totalAvailable} disponibles
          </p>
        </div>
        <button
          onClick={() =>
            mainHotel
              ? navigate(`/dashboard/room/new?hotelId=${mainHotel.id}`)
              : navigate("/dashboard/hotel/new")
          }
          className="flex items-center gap-2 px-4 py-2.5 bg-[#E8850C] hover:bg-[#C46A08] text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Habitacion
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#96785A] dark:text-[#64748B]" />
        <input
          type="text"
          placeholder="Buscar habitaciones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A2028] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-sm text-[#2D1F14] dark:text-[#E2E8F0] placeholder:text-[#96785A] dark:placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/30 focus:border-[#E8850C]"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-[#96785A] dark:text-[#64748B]">
            Cargando habitaciones...
          </div>
        </div>
      ) : totalRooms === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] p-12 text-center"
        >
          <Bed className="w-12 h-12 text-[#D4BEA5] dark:text-[#2D3748] mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-2">
            No hay habitaciones registradas
          </h2>
          <p className="text-sm text-[#96785A] dark:text-[#64748B] mb-6">
            Primero necesitas crear un hotel para agregar habitaciones
          </p>
          <button
            onClick={() => navigate("/dashboard/hotel/new")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#E8850C] hover:bg-[#C46A08] text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Hotel
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredGroups.map((group) => (
            <motion.div
              key={group.hotel.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden"
            >
              <div className="p-4 bg-[#FFF8F1] dark:bg-[#242B35] border-b border-[#F5EDE3] dark:border-[#2D3748]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!group.hotel.isMain && (
                      <span className="text-[#B89A7A]">└─</span>
                    )}
                    <span className="font-semibold text-[#2D1F14] dark:text-[#E2E8F0]">
                      {group.hotel.name}
                    </span>
                    {group.hotel.isMain && (
                      <span className="px-2 py-0.5 bg-[#E8850C]/10 text-[#E8850C] text-xs font-medium rounded-full">
                        Principal
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {group.rooms.filter((r) => r.is_available).length} disp.
                    </span>
                    <span className="text-red-500 dark:text-red-400 font-medium">
                      {group.rooms.filter((r) => !r.is_available).length} ocup.
                    </span>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-[#F5EDE3] dark:divide-[#2D3748]">
                {group.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center gap-3 p-4 hover:bg-[#FFF8F1] dark:hover:bg-[#242B35]/50 transition-colors group"
                  >
                    <img
                      src={room.images?.[0] || "/placeholder-room.jpg"}
                      alt={room.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[#2D1F14] dark:text-[#E2E8F0] text-sm group-hover:text-[#E8850C] transition-colors">
                        {room.name}
                      </h4>
                      <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                        {room.custom_room_types?.name || room.type} ·{" "}
                        {room.bed_type}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-[#96785A] dark:text-[#64748B]">
                        <Users className="w-3.5 h-3.5" />
                        {room.capacity}
                      </span>
                      <span className="flex items-center gap-1 text-sm font-semibold text-[#E8850C]">
                        <DollarSign className="w-3.5 h-3.5" />
                        {room.price_per_night}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          room.is_available
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                            : room.status === "maintenance"
                              ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20"
                              : "bg-red-50 text-red-600 dark:bg-red-900/20"
                        }`}
                      >
                        {room.is_available
                          ? "Disponible"
                          : room.status === "maintenance"
                            ? "Mantenimiento"
                            : "Ocupada"}
                      </span>
                      <Link
                        to={`/dashboard/room/${room.id}`}
                        className="p-1.5 hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-[#B89A7A]" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {filteredGroups.length === 0 && search && (
            <div className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] p-8 text-center">
              <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                No se encontraron habitaciones para "{search}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
