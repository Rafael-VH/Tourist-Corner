import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
import { supabase } from "@/data/datasources/SupabaseClient";
import { Key, RefreshCw, Check, X, Trash2 } from "lucide-react";

interface RegistrationCode {
  id: string;
  code: string;
  used: boolean;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  used_by_user: { name: string; email: string } | null;
}

export function AdminCodesPage() {
  const { user } = useAuthStore();
  const [codes, setCodes] = useState<RegistrationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const loadCodes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await supabase
        .from("registration_codes")
        .select("*, used_by_user:used_by(name, email)")
        .order("created_at", { ascending: false });

      if (err) throw err;
      setCodes(data || []);
    } catch (err: unknown) {
      setError((err as Error).message || "Error al cargar codigos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCodes();
  }, [loadCodes]);

  const generateCode = async () => {
    setGenerating(true);
    setError("");
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const { error } = await supabase
        .from("registration_codes")
        .insert({ code, created_by: user?.id });
      if (error) throw error;
      await loadCodes();
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
      await loadCodes();
    } catch (err: unknown) {
      setError((err as Error).message || "Error al eliminar codigo");
    }
  };

  const unusedCodes = codes.filter((c) => !c.used);
  const usedCodes = codes.filter((c) => c.used);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2D1F14] dark:text-[#E2E8F0] flex items-center gap-2">
          <Key className="w-6 h-6 text-[#E8850C]" />
          Codigos de Registro
        </h1>
        <p className="text-[#96785A] dark:text-[#64748B] mt-1">
          Genera y gestiona codigos de registro para nuevos dueños
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

      {/* Generate button */}
      <button
        onClick={generateCode}
        disabled={generating}
        className="mb-6 px-4 py-2.5 bg-[#E8850C] hover:bg-[#C46A08] text-white rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 text-sm font-medium"
      >
        {generating ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        Generar Codigo
      </button>

      {/* Unused codes */}
      {unusedCodes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#5E4836] dark:text-[#94A3B8] uppercase tracking-wide mb-3">
            Codigos Disponibles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unusedCodes.map((code) => (
              <div
                key={code.id}
                className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-mono font-bold text-[#2D1F14] dark:text-[#E2E8F0] tracking-widest">
                    {code.code}
                  </span>
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Disponible
                  </span>
                </div>
                <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                  {new Date(code.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Used codes */}
      {usedCodes.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#5E4836] dark:text-[#94A3B8] uppercase tracking-wide mb-3">
            Codigos Usados
          </h2>
          <div className="space-y-3">
            {usedCodes.map((code) => (
              <div
                key={code.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl gap-3"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-lg font-mono font-bold text-[#2D1F14]/50 dark:text-[#E2E8F0]/50 tracking-widest line-through">
                    {code.code}
                  </span>
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full flex items-center gap-1">
                    <X className="w-3 h-3" />
                    Usado
                  </span>
                </div>
                {code.used_by_user ? (
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
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#E8850C]/30 border-t-[#E8850C] rounded-full animate-spin" />
        </div>
      )}

      {codes.length === 0 && !loading && (
        <div className="text-center py-12">
          <Key className="w-12 h-12 mx-auto text-[#D4BEA5] dark:text-[#2D3748] mb-3" />
          <p className="text-[#96785A] dark:text-[#64748B]">
            No hay codigos generados
          </p>
        </div>
      )}
    </div>
  );
}
