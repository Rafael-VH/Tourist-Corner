import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/data/datasources/SupabaseClient";
import {
  Users,
  Building2,
  Star,
  X,
} from "lucide-react";

interface DashboardStats {
  totalClients: number;
  totalOwners: number;
  totalHotels: number;
  totalFeaturedHotels: number;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalOwners: 0,
    totalHotels: 0,
    totalFeaturedHotels: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [clientsRes, ownersRes, hotelsRes, featuredRes] = await Promise.all([
        supabase
          .from("users")
          .select("id", { count: "exact" })
          .eq("role", "client"),
        supabase
          .from("users")
          .select("id", { count: "exact" })
          .eq("role", "owner"),
        supabase.from("hotels").select("id", { count: "exact" }),
        supabase.from("featured_hotels").select("id", { count: "exact" }),
      ]);

      setStats({
        totalClients: clientsRes.count || 0,
        totalOwners: ownersRes.count || 0,
        totalHotels: hotelsRes.count || 0,
        totalFeaturedHotels: featuredRes.count || 0,
      });
    } catch (err: unknown) {
      setError((err as Error).message || "Error al cargar estadisticas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
          Panel de Administrador
        </h1>
        <p className="text-[#96785A] dark:text-[#64748B] mt-1">
          Resumen general del sistema
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm"
        >
          <X className="w-4 h-4" />
          {error}
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#E8850C]/30 border-t-[#E8850C] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              value: stats.totalFeaturedHotels,
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
      )}
    </div>
  );
}
