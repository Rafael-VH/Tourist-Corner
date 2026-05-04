import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/data/datasources/SupabaseClient";
import {
  Users,
  Search,
  X,
} from "lucide-react";

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userFilter, setUserFilter] = useState<"all" | "client" | "owner" | "admin">("all");
  const [userSearch, setUserSearch] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await supabase
        .from("users")
        .select("id, email, name, role")
        .order("created_at", { ascending: false });

      if (err) throw err;
      setUsers(data || []);
    } catch (err: unknown) {
      setError((err as Error).message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users
    .filter((u) => userFilter === "all" || u.role === userFilter)
    .filter(
      (u) =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2D1F14] dark:text-[#E2E8F0] flex items-center gap-2">
          <Users className="w-6 h-6 text-[#E8850C]" />
          Usuarios Registrados
        </h1>
        <p className="text-[#96785A] dark:text-[#64748B] mt-1">
          {users.length} usuarios en total
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#96785A]" />
        <input
          type="text"
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#1A2028] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-sm text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#96785A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50"
        />
      </div>

      {/* Role Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white dark:bg-[#1A2028] rounded-xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-x-auto mb-4">
        {[
          { key: "all" as const, label: "Todos", count: users.length, color: "" },
          {
            key: "client" as const,
            label: "Clientes",
            count: users.filter((u) => u.role === "client").length,
            color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
          },
          {
            key: "owner" as const,
            label: "Dueños",
            count: users.filter((u) => u.role === "owner").length,
            color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
          },
          {
            key: "admin" as const,
            label: "Admins",
            count: users.filter((u) => u.role === "admin").length,
            color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setUserFilter(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              userFilter === tab.key
                ? "bg-[#E8850C] text-white"
                : "text-[#5E4836] dark:text-[#94A3B8] hover:text-[#2D1F14] dark:hover:text-[#E2E8F0]"
            }`}
          >
            {tab.label}
            <span
              className={`px-1.5 py-0.5 text-xs rounded-md ${
                userFilter === tab.key
                  ? "bg-white/20 text-white"
                  : tab.color || "bg-[#E8D9C8] dark:bg-[#2D3748] text-[#96785A] dark:text-[#64748B]"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#E8850C]/30 border-t-[#E8850C] rounded-full animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-[#D4BEA5] dark:text-[#2D3748] mb-3" />
          <p className="text-[#96785A] dark:text-[#64748B]">
            No se encontraron usuarios
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-[#1A2028] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl"
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
      )}
    </div>
  );
}
