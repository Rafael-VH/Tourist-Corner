import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
import { supabase } from "@/data/datasources/SupabaseClient";
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  Bed,
} from "lucide-react";

export function NewRoomTypePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (user && user.role !== "owner") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.name) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const { error } = await supabase
        .from("custom_room_types")
        .insert({
          name: form.name,
          description: form.description,
          created_by: user.id,
        });

      if (error) throw error;

      navigate("/dashboard");
    } catch (err: unknown) {
      setSubmitError((err as Error).message || "Error al crear tipo de habitacion");
      setIsSubmitting(false);
    }
  }, [user, form, navigate]);

  return (
    <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-[#96785A] dark:text-[#64748B] hover:text-[#E8850C] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Panel
          </button>
          <h1 className="text-3xl font-bold text-[#2D1F14] dark:text-[#E2E8F0] flex items-center gap-3">
            <Bed className="w-8 h-8 text-[#E8850C]" />
            Nuevo Tipo de Habitacion
          </h1>
          <p className="text-[#96785A] dark:text-[#64748B] mt-2">
            Crea un tipo personalizado de habitacion para tus hoteles
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 md:p-8 border border-[#E8D9C8] dark:border-[#2D3748] shadow-sm space-y-6"
        >
          {submitError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" />
              {submitError}
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1.5">
              Nombre del Tipo *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Suite Presidencial"
              required
              className="w-full px-4 py-3 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1.5">
              Descripcion
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe las caracteristicas de este tipo de habitacion..."
              rows={4}
              className="w-full px-4 py-3 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !form.name}
            className="w-full py-3 bg-[#E8850C] hover:bg-[#C46A08] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Crear Tipo de Habitacion
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
