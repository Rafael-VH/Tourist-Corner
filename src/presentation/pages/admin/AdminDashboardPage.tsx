import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
import { supabase } from "@/data/datasources/SupabaseClient";
import {
  Users,
  Building2,
  Key,
  Star,
  RefreshCw,
  Check,
  X,
  Trash2,
  ArrowUp,
  ArrowDown,
  Shield,
  GripVertical,
  Search,
  Sparkles,
  Hotel,
  LayoutGrid,
  List,
} from "lucide-react";

interface DashboardStats {
  totalClients: number;
  totalOwners: number;
  totalHotels: number;
}

interface RegistrationCode {
  id: string;
  code: string;
  used: boolean;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  used_by_user: { name: string; email: string } | null;
}

interface Hotel {
  id: string;
  name: string;
  city: string;
  is_featured: boolean;
  featured_order: number;
}

interface OrphanHotel {
  id: string;
  name: string;
  city: string;
  rooms: { id: string; name: string }[];
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalOwners: 0,
    totalHotels: 0,
  });
  const [loading, setLoading] = useState(true);
  const [codes, setCodes] = useState<RegistrationCode[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [orphanHotels, setOrphanHotels] = useState<OrphanHotel[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [featuredView, setFeaturedView] = useState<"grid" | "list">("grid");
  const [featuredSearch, setFeaturedSearch] = useState("");
  const [togglingHotel, setTogglingHotel] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [
        clientsRes,
        ownersRes,
        hotelsRes,
        codesRes,
        allUsersRes,
        featuredRes,
      ] = await Promise.all([
        supabase
          .from("users")
          .select("id", { count: "exact" })
          .eq("role", "client"),
        supabase
          .from("users")
          .select("id", { count: "exact" })
          .eq("role", "owner"),
        supabase.from("hotels").select("id", { count: "exact" }),
        supabase
          .from("registration_codes")
          .select("*, used_by_user:used_by(name, email)")
          .order("created_at", { ascending: false }),
        supabase
          .from("users")
          .select("id, email, name, role")
          .order("created_at", { ascending: false }),
        supabase.from("featured_hotels").select("hotel_id, featured_order"),
      ]);

      setStats({
        totalClients: clientsRes.count || 0,
        totalOwners: ownersRes.count || 0,
        totalHotels: hotelsRes.count || 0,
      });

      setCodes(codesRes.data || []);
      setUsers(allUsersRes.data || []);

      const featuredMap = new Map(
        (featuredRes.data || []).map((f) => [
          f.hotel_id,
          { order: f.featured_order },
        ]),
      );

      const { data: hotelsData } = await supabase
        .from("hotels")
        .select("id, name, city")
        .order("name");

      setHotels(
        (hotelsData || []).map((h) => ({
          ...h,
          is_featured: featuredMap.has(h.id),
          featured_order: featuredMap.get(h.id)?.order || 0,
        })),
      );

      const { data: orphanData } = await supabase
        .from("hotels")
        .select("id, name, city")
        .is("manager_id", null)
        .order("name");

      const orphaned: OrphanHotel[] = [];
      for (const h of orphanData || []) {
        const { data: roomsData } = await supabase
          .from("rooms")
          .select("id, name")
          .eq("hotel_id", h.id);
        orphaned.push({ ...h, rooms: roomsData || [] });
      }
      setOrphanHotels(orphaned);
    } catch (err: unknown) {
      setError((err as Error).message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateCode = async () => {
    setGenerating(true);
    setError("");
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const { error } = await supabase
        .from("registration_codes")
        .insert({ code, created_by: user?.id });
      if (error) throw error;
      await loadData();
    } catch (err: unknown) {
      setError((err as Error).message || "Error al generar codigo");
    } finally {
      setGenerating(false);
    }
  };

  const deleteCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from("registration_codes")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await loadData();
    } catch (err: unknown) {
      setError((err as Error).message || "Error al eliminar codigo");
    }
  };

  const deleteOrphanHotel = async (hotelId: string) => {
    if (!confirm("Eliminar hotel y todas sus habitaciones?")) return;
    try {
      const { error: roomsErr } = await supabase
        .from("rooms")
        .delete()
        .eq("hotel_id", hotelId);
      if (roomsErr) throw roomsErr;
      const { error: hotelErr } = await supabase
        .from("hotels")
        .delete()
        .eq("id", hotelId);
      if (hotelErr) throw hotelErr;
      await loadData();
    } catch (err: unknown) {
      setError((err as Error).message || "Error al eliminar hotel");
    }
  };

  const toggleFeatured = async (hotelId: string, isFeatured: boolean) => {
    setTogglingHotel(hotelId);
    try {
      if (isFeatured) {
        await supabase.from("featured_hotels").delete().eq("hotel_id", hotelId);
      } else {
        const maxOrder = Math.max(
          ...hotels.filter((h) => h.is_featured).map((h) => h.featured_order),
          0,
        );
        await supabase
          .from("featured_hotels")
          .insert({ hotel_id: hotelId, featured_order: maxOrder + 1 });
      }
      await loadData();
    } catch (err: unknown) {
      setError((err as Error).message || "Error al actualizar destacado");
    } finally {
      setTogglingHotel(null);
    }
  };

  const moveFeatured = async (hotelId: string, direction: "up" | "down") => {
    const sorted = hotels
      .filter((h) => h.is_featured)
      .sort((a, b) => a.featured_order - b.featured_order);
    const idx = sorted.findIndex((h) => h.id === hotelId);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[swapIdx];

    try {
      await Promise.all([
        supabase
          .from("featured_hotels")
          .update({ featured_order: b.featured_order })
          .eq("hotel_id", a.id),
        supabase
          .from("featured_hotels")
          .update({ featured_order: a.featured_order })
          .eq("hotel_id", b.id),
      ]);
      await loadData();
    } catch (err: unknown) {
      setError((err as Error).message || "Error al reordenar");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#2D1F14] dark:text-[#E2E8F0] flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#E8850C]" />
            Panel de Administrador
          </h1>
          <p className="text-[#96785A] dark:text-[#64748B] mt-2">
            Gestiona usuarios, hoteles y configuraciones del sistema
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#E8850C]/30 border-t-[#E8850C] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                {
                  label: "Total Clientes",
                  value: stats.totalClients,
                  icon: Users,
                  bg: "bg-blue-100 dark:bg-blue-900/30",
                  text: "text-blue-600 dark:text-blue-400",
                },
                {
                  label: "Total Dueños",
                  value: stats.totalOwners,
                  icon: Building2,
                  bg: "bg-green-100 dark:bg-green-900/30",
                  text: "text-green-600 dark:text-green-400",
                },
                {
                  label: "Total Hoteles",
                  value: stats.totalHotels,
                  icon: Building2,
                  bg: "bg-purple-100 dark:bg-purple-900/30",
                  text: "text-purple-600 dark:text-purple-400",
                },
                {
                  label: "Hoteles Destacados",
                  value: hotels.filter((h) => h.is_featured).length,
                  icon: Star,
                  bg: "bg-amber-100 dark:bg-amber-900/30",
                  text: "text-amber-600 dark:text-amber-400",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748] shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-[#2D1F14] dark:text-[#E2E8F0] mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}
                    >
                      <stat.icon className={`w-6 h-6 ${stat.text}`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Registration Codes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] shadow-sm mb-8"
            >
              <div className="p-6 border-b border-[#E8D9C8] dark:border-[#2D3748] flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#2D1F14] dark:text-[#E2E8F0] flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#E8850C]" />
                  Codigos de Registro
                </h2>
                <button
                  onClick={generateCode}
                  disabled={generating}
                  className="px-4 py-2 bg-[#E8850C] hover:bg-[#C46A08] text-white rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {generating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Generar Codigo
                </button>
              </div>
              <div className="p-6">
                {codes.length === 0 ? (
                  <p className="text-[#96785A] dark:text-[#64748B] text-center py-4">
                    No hay codigos generados
                  </p>
                ) : (
                  <div className="space-y-3">
                    {codes.map((code) => (
                      <div
                        key={code.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl gap-2"
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-lg font-mono font-bold text-[#2D1F14] dark:text-[#E2E8F0] tracking-widest">
                            {code.code}
                          </span>
                          {code.used ? (
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full flex items-center gap-1">
                              <X className="w-3 h-3" />
                              Usado
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Disponible
                            </span>
                          )}
                        </div>
                        {code.used && code.used_by_user ? (
                          <div className="text-sm text-[#5E4836] dark:text-[#94A3B8]">
                            <span className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                              {code.used_by_user.name}
                            </span>
                            <span className="mx-1">—</span>
                            <span>{code.used_by_user.email}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => deleteCode(code.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Featured Hotels */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] shadow-sm mb-8"
            >
              <div className="p-6 border-b border-[#E8D9C8] dark:border-[#2D3748]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#2D1F14] dark:text-[#E2E8F0] flex items-center gap-2">
                      <Star className="w-5 h-5 text-[#E8850C]" />
                      Hoteles Destacados
                    </h2>
                    <p className="text-sm text-[#96785A] dark:text-[#64748B] mt-1">
                      {hotels.filter((h) => h.is_featured).length} de{" "}
                      {hotels.length} hoteles destacados
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#96785A]" />
                      <input
                        type="text"
                        value={featuredSearch}
                        onChange={(e) => setFeaturedSearch(e.target.value)}
                        placeholder="Buscar hotel..."
                        className="pl-9 pr-3 py-2 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-lg text-sm text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#96785A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 w-full sm:w-48"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Hotels Preview */}
              {hotels.filter((h) => h.is_featured).length > 0 && (
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#E8850C]" />
                    <h3 className="text-sm font-semibold text-[#5E4836] dark:text-[#94A3B8] uppercase tracking-wide">
                      Vista Previa del Orden Actual
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {hotels
                      .filter((h) => h.is_featured)
                      .sort((a, b) => a.featured_order - b.featured_order)
                      .map((hotel, index) => (
                        <div
                          key={hotel.id}
                          className="relative p-4 bg-gradient-to-br from-[#FFF8F1] to-[#FDF8F3] dark:from-[#2D3748] dark:to-[#242B35] rounded-xl border-2 border-[#E8850C]/30"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="flex items-center justify-center w-6 h-6 bg-[#E8850C] text-white text-xs font-bold rounded-full">
                                  {index + 1}
                                </span>
                                <p className="font-semibold text-[#2D1F14] dark:text-[#E2E8F0] text-sm truncate">
                                  {hotel.name}
                                </p>
                              </div>
                              <p className="text-xs text-[#96785A] dark:text-[#64748B] ml-8">
                                {hotel.city}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() =>
                                  moveFeatured(hotel.id, "up")
                                }
                                disabled={index === 0}
                                className="p-1 hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ArrowUp className="w-3.5 h-3.5 text-[#96785A]" />
                              </button>
                              <button
                                onClick={() =>
                                  moveFeatured(hotel.id, "down")
                                }
                                disabled={
                                  index ===
                                  hotels.filter((h) => h.is_featured).length - 1
                                }
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

              {/* All Hotels List */}
              <div className="p-6 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Hotel className="w-4 h-4 text-[#96785A]" />
                    <h3 className="text-sm font-semibold text-[#5E4836] dark:text-[#94A3B8] uppercase tracking-wide">
                      Todos los Hoteles
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-[#FDF8F3] dark:bg-[#242B35] rounded-lg border border-[#E8D9C8] dark:border-[#2D3748]">
                    <button
                      onClick={() => setFeaturedView("list")}
                      className={`p-1.5 rounded-md transition-colors ${
                        featuredView === "list"
                          ? "bg-[#E8850C] text-white"
                          : "text-[#96785A] hover:text-[#5E4836] dark:hover:text-[#E2E8F0]"
                      }`}
                      title="Vista lista"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setFeaturedView("grid")}
                      className={`p-1.5 rounded-md transition-colors ${
                        featuredView === "grid"
                          ? "bg-[#E8850C] text-white"
                          : "text-[#96785A] hover:text-[#5E4836] dark:hover:text-[#E2E8F0]"
                      }`}
                      title="Vista cuadricula"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {featuredView === "list" ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {hotels
                      .filter(
                        (h) =>
                          h.name
                            .toLowerCase()
                            .includes(featuredSearch.toLowerCase()) ||
                          h.city.toLowerCase().includes(featuredSearch.toLowerCase())
                      )
                      .map((hotel) => (
                        <motion.div
                          key={hotel.id}
                          layout
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                            hotel.is_featured
                              ? "bg-[#FFF8F1] dark:bg-[#2D3748] border-[#E8850C]/40"
                              : "bg-[#FDF8F3] dark:bg-[#242B35] border-[#E8D9C8] dark:border-[#2D3748]"
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {hotel.is_featured && (
                              <GripVertical className="w-4 h-4 text-[#E8850C] flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0] truncate">
                                  {hotel.name}
                                </p>
                                {hotel.is_featured && (
                                  <span className="px-2 py-0.5 bg-[#E8850C] text-white text-xs font-medium rounded-full flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-white" />
                                    #{hotel.featured_order}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                                {hotel.city}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              toggleFeatured(hotel.id, hotel.is_featured)
                            }
                            disabled={togglingHotel === hotel.id}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                              togglingHotel === hotel.id
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            } ${
                              hotel.is_featured
                                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                                : "bg-[#E8850C] hover:bg-[#C46A08] text-white"
                            }`}
                          >
                            {togglingHotel === hotel.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : hotel.is_featured ? (
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
                        </motion.div>
                      ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {hotels
                      .filter(
                        (h) =>
                          h.name
                            .toLowerCase()
                            .includes(featuredSearch.toLowerCase()) ||
                          h.city.toLowerCase().includes(featuredSearch.toLowerCase())
                      )
                      .map((hotel) => (
                        <motion.div
                          key={hotel.id}
                          layout
                          className={`p-4 rounded-xl border transition-all ${
                            hotel.is_featured
                              ? "bg-[#FFF8F1] dark:bg-[#2D3748] border-[#E8850C]/40"
                              : "bg-[#FDF8F3] dark:bg-[#242B35] border-[#E8D9C8] dark:border-[#2D3748]"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0] truncate">
                                  {hotel.name}
                                </p>
                                {hotel.is_featured && (
                                  <span className="px-2 py-0.5 bg-[#E8850C] text-white text-xs font-medium rounded-full flex items-center gap-1 flex-shrink-0">
                                    <Star className="w-3 h-3 fill-white" />
                                    #{hotel.featured_order}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                                {hotel.city}
                              </p>
                            </div>
                            {hotel.is_featured && (
                              <GripVertical className="w-4 h-4 text-[#E8850C] flex-shrink-0 ml-2" />
                            )}
                          </div>
                          <button
                            onClick={() =>
                              toggleFeatured(hotel.id, hotel.is_featured)
                            }
                            disabled={togglingHotel === hotel.id}
                            className={`w-full mt-2 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                              togglingHotel === hotel.id
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            } ${
                              hotel.is_featured
                                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                                : "bg-[#E8850C] hover:bg-[#C46A08] text-white"
                            }`}
                          >
                            {togglingHotel === hotel.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : hotel.is_featured ? (
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
                        </motion.div>
                      ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Orphaned Hotels */}
            {orphanHotels.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-white dark:bg-[#1A2028] rounded-2xl border border-red-300 dark:border-red-900/50 shadow-sm mb-8"
              >
                <div className="p-6 border-b border-red-200 dark:border-red-900/30">
                  <h2 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Hoteles sin Dueño
                  </h2>
                  <p className="text-sm text-[#96785A] dark:text-[#64748B] mt-1">
                    Estos hoteles no tienen un dueño asignado y pueden ser
                    eliminados
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {orphanHotels.map((hotel) => (
                      <div
                        key={hotel.id}
                        className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                              {hotel.name}
                            </p>
                            <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                              {hotel.city}
                            </p>
                            {hotel.rooms.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {hotel.rooms.map((room) => (
                                  <p
                                    key={room.id}
                                    className="text-xs text-[#5E4836] dark:text-[#94A3B8] pl-2"
                                  >
                                    • {room.name}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => deleteOrphanHotel(hotel.id)}
                            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Eliminar hotel y habitaciones"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Users List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] shadow-sm"
            >
              <div className="p-6 border-b border-[#E8D9C8] dark:border-[#2D3748]">
                <h2 className="text-xl font-bold text-[#2D1F14] dark:text-[#E2E8F0] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#E8850C]" />
                  Usuarios Registrados
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                          {u.name}
                        </p>
                        <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                          {u.email}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                            : u.role === "owner"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        }`}
                      >
                        {u.role === "admin"
                          ? "Admin"
                          : u.role === "owner"
                            ? "Dueño"
                            : "Cliente"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
