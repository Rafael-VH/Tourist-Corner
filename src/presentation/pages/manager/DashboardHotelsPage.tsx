import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
import { useHotelStore } from "@/presentation/providers/useHotelStore";
import {
  Hotel,
  Plus,
  GitBranch,
  ChevronRight,
  Star,
  MapPin,
} from "lucide-react";

export function DashboardHotelsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { hotels, fetchManagerHotels, isLoading } = useHotelStore();

  useEffect(() => {
    if (user?.id) {
      fetchManagerHotels(user.id);
    }
  }, [user?.id, fetchManagerHotels]);

  const mainHotels = hotels.filter((h) => h.isMain);
  const branchHotels = hotels.filter((h) => h.branchOf);

  const mainHotelsWithBranches = mainHotels.map((main) => ({
    ...main,
    branches: branchHotels.filter((b) => b.branchOf === main.id),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
            Mis Hoteles
          </h1>
          <p className="text-sm text-[#96785A] dark:text-[#64748B] mt-1">
            Gestiona tus establecimientos y sucursales
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/hotel/new")}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#E8850C] hover:bg-[#C46A08] text-white rounded-xl text-sm font-medium transition-colors"
        >
          {mainHotels.length > 0 ? (
            <GitBranch className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {mainHotels.length > 0 ? "Agregar Sucursal" : "Crear Hotel"}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-[#96785A] dark:text-[#64748B]">
            Cargando hoteles...
          </div>
        </div>
      ) : mainHotelsWithBranches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] p-12 text-center"
        >
          <Hotel className="w-12 h-12 text-[#D4BEA5] dark:text-[#2D3748] mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-2">
            No tienes hoteles registrados
          </h2>
          <p className="text-sm text-[#96785A] dark:text-[#64748B] mb-6">
            Comienza creando tu primer hotel para gestionar habitaciones y
            reservaciones
          </p>
          <button
            onClick={() => navigate("/dashboard/hotel/new")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#E8850C] hover:bg-[#C46A08] text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Hotel Principal
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {mainHotelsWithBranches.map((hotel) => (
            <motion.div
              key={hotel.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden"
            >
              <div className="p-5 flex items-start gap-4">
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
                      <p className="text-sm text-[#96785A] dark:text-[#64748B] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {hotel.city}
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
                    <span className="flex items-center gap-1 text-sm text-[#E8850C]">
                      <Star className="w-4 h-4 fill-[#E8850C]" />
                      {hotel.rating}
                    </span>
                    <span className="text-sm text-[#96785A] dark:text-[#64748B]">
                      {hotel.type}
                    </span>
                    <span className="text-sm font-medium text-[#E8850C]">
                      ${hotel.priceRange.min} - ${hotel.priceRange.max}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Link
                      to={`/dashboard/hotel/${hotel.id}`}
                      className="px-4 py-2 bg-[#FDF8F3] dark:bg-[#242B35] hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748] text-[#5E4836] dark:text-[#94A3B8] rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      Gestionar
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    {hotel.branches.length > 0 && (
                      <span className="text-xs text-[#96785A] dark:text-[#64748B]">
                        {hotel.branches.length} sucursal
                        {hotel.branches.length !== 1 ? "es" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {hotel.branches.length > 0 && (
                <div className="border-t border-[#F5EDE3] dark:border-[#2D3748] p-4 bg-[#FDF8F3]/50 dark:bg-[#242B35]/50">
                  <p className="text-xs font-medium text-[#5E4836] dark:text-[#94A3B8] mb-2 flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    Sucursales
                  </p>
                  <div className="space-y-2">
                    {hotel.branches.map((branch) => (
                      <div
                        key={branch.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-[#1A2028] rounded-lg hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748] transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#FFF8F1] dark:bg-[#242B35] flex items-center justify-center">
                            <GitBranch className="w-4 h-4 text-[#B89A7A]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0] group-hover:text-[#E8850C] transition-colors">
                              {branch.name}
                            </p>
                            <p className="text-xs text-[#96785A] dark:text-[#64748B] flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {branch.city}
                            </p>
                          </div>
                        </div>
                        <Link
                          to={`/dashboard/hotel/${branch.id}`}
                          className="p-1.5 hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-4 h-4 text-[#B89A7A] group-hover:text-[#E8850C] group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
