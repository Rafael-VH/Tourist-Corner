import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/data/datasources/SupabaseClient";
import {
  Star,
  Search,
  X,
  Hotel,
  LayoutGrid,
  List,
  ArrowUp,
  ArrowDown,
  Bed,
} from "lucide-react";

interface Room {
  id: string;
  name: string;
  type: string;
  price_per_night: number;
  hotel_id: string;
  is_featured: boolean;
  featured_order: number;
  hotel_name: string;
  hotel_city: string;
}

export function AdminRoomsPage() {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [filterHotel, setFilterHotel] = useState<string>("all");
  const [togglingRoom, setTogglingRoom] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: featuredRes } = await supabase
        .from("featured_rooms")
        .select("room_id, featured_order");

      const featuredMap = new Map(
        (featuredRes || []).map((f) => [
          f.room_id,
          { order: f.featured_order },
        ]),
      );

      const { data: roomsData } = await supabase
        .from("rooms")
        .select("id, name, type, price_per_night, hotel_id")
        .order("name");

      const hotelIds = [...new Set((roomsData || []).map((r) => r.hotel_id))];
      const { data: hotelsData } = await supabase
        .from("hotels")
        .select("id, name, city")
        .in("id", hotelIds);

      const hotelMap = new Map(
        (hotelsData || []).map((h) => [h.id, { name: h.name, city: h.city }]),
      );

      setRooms(
        (roomsData || []).map((r) => ({
          ...r,
          is_featured: featuredMap.has(r.id),
          featured_order: featuredMap.get(r.id)?.order || 0,
          hotel_name: hotelMap.get(r.hotel_id)?.name || "Desconocido",
          hotel_city: hotelMap.get(r.hotel_id)?.city || "",
        })),
      );
    } catch (err: unknown) {
      setError((err as Error).message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleFeatured = async (roomId: string, isFeatured: boolean) => {
    setTogglingRoom(roomId);
    try {
      if (isFeatured) {
        await supabase.from("featured_rooms").delete().eq("room_id", roomId);
      } else {
        const maxOrder = Math.max(
          ...rooms.filter((r) => r.is_featured).map((r) => r.featured_order),
          0,
        );
        await supabase
          .from("featured_rooms")
          .insert({ room_id: roomId, featured_order: maxOrder + 1 });
      }
      await loadData();
    } catch (err: unknown) {
      setError((err as Error).message || "Error al actualizar destacado");
    } finally {
      setTogglingRoom(null);
    }
  };

  const moveFeatured = async (roomId: string, direction: "up" | "down") => {
    const sorted = rooms
      .filter((r) => r.is_featured)
      .sort((a, b) => a.featured_order - b.featured_order);
    const idx = sorted.findIndex((r) => r.id === roomId);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[swapIdx];

    try {
      await Promise.all([
        supabase
          .from("featured_rooms")
          .update({ featured_order: b.featured_order })
          .eq("room_id", a.id),
        supabase
          .from("featured_rooms")
          .update({ featured_order: a.featured_order })
          .eq("room_id", b.id),
      ]);
      await loadData();
    } catch (err: unknown) {
      setError((err as Error).message || "Error al reordenar");
    }
  };

  const filteredRooms = rooms.filter(
    (r) =>
      (filterHotel === "all" || r.hotel_id === filterHotel) &&
      (r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.type.toLowerCase().includes(search.toLowerCase()) ||
        r.hotel_name.toLowerCase().includes(search.toLowerCase()))
  );

  const featuredRooms = rooms
    .filter((r) => r.is_featured)
    .sort((a, b) => a.featured_order - b.featured_order);

  const hotels = [...new Map(rooms.map((r) => [r.hotel_id, r.hotel_name]))].map(
    ([id, name]) => ({ id, name }),
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2D1F14] dark:text-[#E2E8F0] flex items-center gap-2">
          <Bed className="w-6 h-6 text-[#E8850C]" />
          Habitaciones Destacadas
        </h1>
        <p className="text-[#96785A] dark:text-[#64748B] mt-1">
          {featuredRooms.length} de {rooms.length} habitaciones destacadas en HomePage
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Featured Preview */}
      {featuredRooms.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-[#E8850C]" />
            <h2 className="text-sm font-semibold text-[#5E4836] dark:text-[#94A3B8] uppercase tracking-wide">
              Orden Actual en HomePage
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featuredRooms.map((room, index) => (
              <div
                key={room.id}
                className="p-4 bg-gradient-to-br from-[#FFF8F1] to-[#FDF8F3] dark:from-[#2D3748] dark:to-[#242B35] rounded-xl border-2 border-[#E8850C]/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex items-center justify-center w-6 h-6 bg-[#E8850C] text-white text-xs font-bold rounded-full">
                        {index + 1}
                      </span>
                      <p className="font-semibold text-[#2D1F14] dark:text-[#E2E8F0] text-sm truncate">
                        {room.name}
                      </p>
                    </div>
                    <p className="text-xs text-[#96785A] dark:text-[#64748B] ml-8">
                      {room.hotel_name} — {room.hotel_city}
                    </p>
                    <p className="text-sm font-medium text-[#E8850C] mt-1">
                      ${room.price_per_night}/noche
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveFeatured(room.id, "up")}
                      disabled={index === 0}
                      className="p-1 hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="w-3.5 h-3.5 text-[#96785A]" />
                    </button>
                    <button
                      onClick={() => moveFeatured(room.id, "down")}
                      disabled={index === featuredRooms.length - 1}
                      className="p-1 hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowDown className="w-3.5 h-3.5 text-[#96785A]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Rooms */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Hotel className="w-4 h-4 text-[#96785A]" />
            <h2 className="text-sm font-semibold text-[#5E4836] dark:text-[#94A3B8] uppercase tracking-wide">
              Todas las Habitaciones
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterHotel}
              onChange={(e) => setFilterHotel(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-[#1A2028] border border-[#E8D9C8] dark:border-[#2D3748] rounded-lg text-sm text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50"
            >
              <option value="all">Todos los hoteles</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#96785A]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="pl-9 pr-3 py-2 bg-white dark:bg-[#1A2028] border border-[#E8D9C8] dark:border-[#2D3748] rounded-lg text-sm text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#96785A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 w-40"
              />
            </div>
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#1A2028] rounded-lg border border-[#E8D9C8] dark:border-[#2D3748]">
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-md transition-colors ${
                  view === "list"
                    ? "bg-[#E8850C] text-white"
                    : "text-[#96785A] hover:text-[#5E4836] dark:hover:text-[#E2E8F0]"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  view === "grid"
                    ? "bg-[#E8850C] text-white"
                    : "text-[#96785A] hover:text-[#5E4836] dark:hover:text-[#E2E8F0]"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#E8850C]/30 border-t-[#E8850C] rounded-full animate-spin" />
          </div>
        ) : view === "list" ? (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  room.is_featured
                    ? "bg-[#FFF8F1] dark:bg-[#2D3748] border-[#E8850C]/40"
                    : "bg-white dark:bg-[#1A2028] border-[#E8D9C8] dark:border-[#2D3748]"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {room.is_featured && (
                    <Star className="w-4 h-4 text-[#E8850C] flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0] truncate">
                        {room.name}
                      </p>
                      {room.is_featured && (
                        <span className="px-2 py-0.5 bg-[#E8850C] text-white text-xs font-medium rounded-full flex-shrink-0">
                          #{room.featured_order}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                      {room.hotel_name} — {room.type} — ${room.price_per_night}/noche
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFeatured(room.id, room.is_featured)}
                  disabled={togglingRoom === room.id}
                  className={`ml-3 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0 ${
                    togglingRoom === room.id
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  } ${
                    room.is_featured
                      ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                      : "bg-[#E8850C] hover:bg-[#C46A08] text-white"
                  }`}
                >
                  {togglingRoom === room.id ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : room.is_featured ? (
                    <>
                      <X className="w-3.5 h-3.5" />
                      Quitar
                    </>
                  ) : (
                    <>
                      <Star className="w-3.5 h-3.5" />
                      Destacar
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className={`p-4 rounded-xl border transition-all ${
                  room.is_featured
                    ? "bg-[#FFF8F1] dark:bg-[#2D3748] border-[#E8850C]/40"
                    : "bg-white dark:bg-[#1A2028] border-[#E8D9C8] dark:border-[#2D3748]"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0] truncate">
                        {room.name}
                      </p>
                      {room.is_featured && (
                        <span className="px-2 py-0.5 bg-[#E8850C] text-white text-xs font-medium rounded-full flex-shrink-0">
                          #{room.featured_order}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                      {room.hotel_name} — {room.type}
                    </p>
                    <p className="text-sm font-medium text-[#E8850C] mt-1">
                      ${room.price_per_night}/noche
                    </p>
                  </div>
                  {room.is_featured && (
                    <Star className="w-4 h-4 text-[#E8850C] flex-shrink-0 ml-2" />
                  )}
                </div>
                <button
                  onClick={() => toggleFeatured(room.id, room.is_featured)}
                  disabled={togglingRoom === room.id}
                  className={`w-full mt-2 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    togglingRoom === room.id
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  } ${
                    room.is_featured
                      ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                      : "bg-[#E8850C] hover:bg-[#C46A08] text-white"
                  }`}
                >
                  {togglingRoom === room.id ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : room.is_featured ? (
                    <>
                      <X className="w-3.5 h-3.5" />
                      Quitar
                    </>
                  ) : (
                    <>
                      <Star className="w-3.5 h-3.5" />
                      Destacar
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
