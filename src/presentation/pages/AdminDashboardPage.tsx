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
  created_at: string;
}

interface Hotel {
  id: string;
  name: string;
  city: string;
  is_featured: boolean;
  featured_order: number;
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({ totalClients: 0, totalOwners: 0, totalHotels: 0 });
  const [loading, setLoading] = useState(true);
  const [codes, setCodes] = useState<RegistrationCode[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [clientsRes, ownersRes, hotelsRes, codesRes, allUsersRes, featuredRes] = await Promise.all([
        supabase.from("users").select("id", { count: "exact" }).eq("role", "client"),
        supabase.from("users").select("id", { count: "exact" }).eq("role", "owner"),
        supabase.from("hotels").select("id", { count: "exact" }),
        supabase.from("registration_codes").select("*").order("created_at", { ascending: false }),
        supabase.from("users").select("id, email, name, role").order("created_at", { ascending: false }),
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
        (featuredRes.data || []).map((f) => [f.hotel_id, { order: f.featured_order }])
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
        }))
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
      const { error } = await supabase.from("registration_codes").delete().eq("id", id);
      if (error) throw error;
      await loadData();
    } catch (err: unknown) {
      setError((err as Error).message || "Error al eliminar codigo");
    }
  };

  const toggleFeatured = async (hotelId: string, isFeatured: boolean) => {
    try {
      if (isFeatured) {
        await supabase.from("featured_hotels").delete().eq("hotel_id", hotelId);
      } else {
        const maxOrder = Math.max(...hotels.filter((h) => h.is_featured).map((h) => h.featured_order), 0);
        await supabase.from("featured_hotels").insert({ hotel_id: hotelId, featured_order: maxOrder + 1 });
      }
      await loadData();
    } catch (err: unknown) {
      setError((err as Error).message || "Error al actualizar destacado");
    }
  };

  const moveFeatured = async (hotelId: string, direction: "up" | "down") => {
    const sorted = hotels.filter((h) => h.is_featured).sort((a, b) => a.featured_order - b.featured_order);
    const idx = sorted.findIndex((h) => h.id === hotelId);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[swapIdx];

    try {
      await Promise.all([
        supabase.from("featured_hotels").update({ featured_order: b.featured_order }).eq("hotel_id", a.id),
        supabase.from("featured_hotels").update({ featured_order: a.featured_order }).eq("hotel_id", b.id),
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: "Total Clientes", value: stats.totalClients, icon: Users, bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
                { label: "Total Dueños", value: stats.totalOwners, icon: Building2, bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400" },
                { label: "Total Hoteles", value: stats.totalHotels, icon: Building2, bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
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
                      <p className="text-sm text-[#96785A] dark:text-[#64748B]">{stat.label}</p>
                      <p className="text-3xl font-bold text-[#2D1F14] dark:text-[#E2E8F0] mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
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
                        className="flex items-center justify-between p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl"
                      >
                        <div className="flex items-center gap-3">
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
                        {!code.used && (
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
                <h2 className="text-xl font-bold text-[#2D1F14] dark:text-[#E2E8F0] flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#E8850C]" />
                  Hoteles Destacados
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {hotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      className="flex items-center justify-between p-3 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">{hotel.name}</p>
                        <p className="text-sm text-[#96785A] dark:text-[#64748B]">{hotel.city}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {hotel.is_featured && (
                          <div className="flex items-center gap-1 mr-2">
                            <button
                              onClick={() => moveFeatured(hotel.id, "up")}
                              className="p-1 hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] rounded transition-colors"
                            >
                              <ArrowUp className="w-4 h-4 text-[#96785A]" />
                            </button>
                            <button
                              onClick={() => moveFeatured(hotel.id, "down")}
                              className="p-1 hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] rounded transition-colors"
                            >
                              <ArrowDown className="w-4 h-4 text-[#96785A]" />
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => toggleFeatured(hotel.id, hotel.is_featured)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            hotel.is_featured
                              ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                              : "bg-[#E8850C] hover:bg-[#C46A08] text-white"
                          }`}
                        >
                          {hotel.is_featured ? "Quitar" : "Destacar"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

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
                        <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">{u.name}</p>
                        <p className="text-sm text-[#96785A] dark:text-[#64748B]">{u.email}</p>
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
                        {u.role === "admin" ? "Admin" : u.role === "owner" ? "Dueño" : "Cliente"}
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
