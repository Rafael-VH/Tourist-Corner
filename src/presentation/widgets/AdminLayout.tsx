import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  LayoutDashboard,
  Key,
  Star,
  Users,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { to: "/admin", label: "Panel", icon: LayoutDashboard },
  { to: "/admin/codes", label: "Codigos", icon: Key },
  { to: "/admin/hotels", label: "Hoteles", icon: Star },
  { to: "/admin/users", label: "Usuarios", icon: Users },
];

export function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
              <Shield className="w-7 h-7 text-[#E8850C]" />
              <div>
                <h1 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                  Admin
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
            {navItems.map((item) => {
              const isActive =
                item.to === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(item.to);
              return (
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
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#E8D9C8] dark:border-[#2D3748]">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-[#E8850C] flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0] truncate">
                  Administrador
                </p>
                <p className="text-xs text-[#96785A] dark:text-[#64748B] truncate">
                  admin@tourist.com
                </p>
              </div>
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
          <Shield className="w-6 h-6 text-[#E8850C]" />
          <h1 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
            Panel de Administrador
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
      </main>
    </div>
  );
}
