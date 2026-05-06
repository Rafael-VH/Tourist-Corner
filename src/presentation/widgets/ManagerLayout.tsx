import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Hotel,
  Bed,
  BarChart3,
  Settings,
  Menu,
  X,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/presentation/providers/useAuthStore";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/calendar", label: "Calendario", icon: Calendar },
  { to: "/dashboard/hotels", label: "Hoteles", icon: Hotel },
  { to: "/dashboard/rooms", label: "Habitaciones", icon: Bed },
  { to: "/dashboard/customize", label: "Personalizar", icon: Sparkles },
  { to: "/dashboard/reports", label: "Reportes", icon: BarChart3 },
  { to: "/dashboard/settings", label: "Configuracion", icon: Settings },
];

export function ManagerLayout() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error("Error al cerrar sesion:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-[#1A2028] border-r border-[#E8D9C8] dark:border-[#2D3748] z-50 transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-[#E8D9C8] dark:border-[#2D3748] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E8850C] flex items-center justify-center">
                <Hotel className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                  Gestion
                </h1>
                <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                  Panel de Control
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-[#FDF8F3] dark:hover:bg-[#242B35]"
            >
              <X className="w-5 h-5 text-[#96785A]" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#E8850C] text-white shadow-md shadow-[#E8850C]/20"
                      : "text-[#5E4836] dark:text-[#94A3B8] hover:bg-[#FDF8F3] dark:hover:bg-[#242B35]"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#E8D9C8] dark:border-[#2D3748]">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-[#E8850C] flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.[0]?.toUpperCase() || "M"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0] truncate">
                  {user?.name || "Manager"}
                </p>
                <p className="text-xs text-[#96785A] dark:text-[#64748B] truncate">
                  Dueño
                </p>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="p-1.5 text-[#96785A] dark:text-[#64748B] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Cerrar sesion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-[#1A2028] border-b border-[#E8D9C8] dark:border-[#2D3748] px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-[#FDF8F3] dark:hover:bg-[#242B35]"
          >
            <Menu className="w-5 h-5 text-[#5E4836] dark:text-[#94A3B8]" />
          </button>
          <div className="w-7 h-7 rounded-lg bg-[#E8850C] flex items-center justify-center">
            <Hotel className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
            Panel de Gestion
          </h1>
        </div>

        {/* Page content */}
        <div className="p-4 md:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </div>

        {/* Logout confirmation modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden shadow-2xl"
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                  <LogOut className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-2">
                  Cerrar sesion
                </h3>
                <p className="text-sm text-[#96785A] dark:text-[#64748B] mb-6">
                  Estas seguro que deseas cerrar sesion?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] text-[#5E4836] dark:text-[#94A3B8] rounded-xl text-sm font-medium hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    Cerrar sesion
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
