import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/data/datasources/SupabaseClient";
import { Tag, Wrench, Plus, Trash2 } from "lucide-react";

interface CustomRoomType {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface CustomService {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export function CustomizePage() {
  const navigate = useNavigate();
  const [customRoomTypes, setCustomRoomTypes] = useState<CustomRoomType[]>([]);
  const [customServices, setCustomServices] = useState<CustomService[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: typesData, error: typesError } = await supabase
          .from("custom_room_types")
          .select("id, name, description, created_at")
          .order("created_at", { ascending: false });
        if (typesError) throw typesError;
        setCustomRoomTypes(typesData || []);
      } catch (err: unknown) {
        console.error("Error fetching custom room types:", err);
      }

      try {
        const { data: servicesData, error: servicesError } = await supabase
          .from("custom_services")
          .select("id, name, description, icon, created_at")
          .order("created_at", { ascending: false });
        if (servicesError) throw servicesError;
        setCustomServices(servicesData || []);
      } catch (err: unknown) {
        console.error("Error fetching custom services:", err);
      }
    };
    fetchData();
  }, []);

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
      console.error("Error deleting room type:", err);
    }
  };

  const deleteCustomService = async (id: string) => {
    if (!confirm("Eliminar este servicio?")) return;
    try {
      const { error } = await supabase
        .from("custom_services")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setCustomServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err: unknown) {
      console.error("Error deleting service:", err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
            Personalizar
          </h1>
          <p className="text-sm text-[#96785A] dark:text-[#64748B] mt-1">
            Tipos de habitacion y servicios personalizados
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custom Room Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden"
        >
          <div className="p-6 border-b border-[#F5EDE3] dark:border-[#2D3748] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF8F1] dark:bg-[#242B35] flex items-center justify-center">
                <Tag className="w-5 h-5 text-[#E8850C]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                  Tipos de Habitacion
                </h2>
                <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                  {customRoomTypes.length} creado{customRoomTypes.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/room-type/new")}
              className="p-2 bg-[#FFF8F1] dark:bg-[#242B35] rounded-lg hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] transition-colors"
            >
              <Plus className="w-4 h-4 text-[#E8850C]" />
            </button>
          </div>

          {customRoomTypes.length === 0 ? (
            <div className="p-8 text-center">
              <Tag className="w-10 h-10 text-[#D4BEA5] dark:text-[#2D3748] mx-auto mb-3" />
              <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                No tienes tipos personalizados
              </p>
              <button
                onClick={() => navigate("/dashboard/room-type/new")}
                className="mt-3 text-sm text-[#E8850C] hover:text-[#C46A08] font-medium"
              >
                Crear tipo de habitacion
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#F5EDE3] dark:divide-[#2D3748]">
              {customRoomTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center gap-3 p-4 hover:bg-[#FFF8F1] dark:hover:bg-[#242B35]/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#FDF8F3] dark:bg-[#242B35] flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4 text-[#B89A7A]" />
                  </div>
                  <div className="flex-1 min-w-0">
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
                    className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Custom Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden"
        >
          <div className="p-6 border-b border-[#F5EDE3] dark:border-[#2D3748] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF8F1] dark:bg-[#242B35] flex items-center justify-center">
                <Wrench className="w-5 h-5 text-[#E8850C]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                  Servicios Personalizados
                </h2>
                <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                  {customServices.length} creado{customServices.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/service/new")}
              className="p-2 bg-[#FFF8F1] dark:bg-[#242B35] rounded-lg hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] transition-colors"
            >
              <Plus className="w-4 h-4 text-[#E8850C]" />
            </button>
          </div>

          {customServices.length === 0 ? (
            <div className="p-8 text-center">
              <Wrench className="w-10 h-10 text-[#D4BEA5] dark:text-[#2D3748] mx-auto mb-3" />
              <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                No tienes servicios personalizados
              </p>
              <button
                onClick={() => navigate("/dashboard/service/new")}
                className="mt-3 text-sm text-[#E8850C] hover:text-[#C46A08] font-medium"
              >
                Crear servicio
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#F5EDE3] dark:divide-[#2D3748]">
              {customServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center gap-3 p-4 hover:bg-[#FFF8F1] dark:hover:bg-[#242B35]/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#FDF8F3] dark:bg-[#242B35] flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4 text-[#B89A7A]" />
                  </div>
                  <div className="flex-1 min-w-0">
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
                    className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
