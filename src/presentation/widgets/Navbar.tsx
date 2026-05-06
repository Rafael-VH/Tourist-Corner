import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
import { useState, useRef, useEffect } from "react";
import {
  MapPin,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  LayoutDashboard,
  Shield,
  Calendar,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, isAuthenticated, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      document.documentElement.classList.add("dark");
      return true;
    }
    return false;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const isAdmin = isAuthenticated && user?.role === "admin";
  const isOwner = isAuthenticated && user?.role === "owner";
  const isClient = isAuthenticated && user?.role === "client";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  if (isAdmin) {
    return (
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-[#1A2028]/90 backdrop-blur-lg border-b border-[#E8D9C8] dark:border-[#2D3748]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#E8850C] flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                Panel Admin
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-[#FFF8F1] dark:hover:bg-[#242B35] transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-[#FF9F1C]" />
                ) : (
                  <Moon className="w-5 h-5 text-[#5E4836]" />
                )}
              </button>

              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-[#E8850C]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#E8850C] flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                    {user?.name}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                  title="Cerrar sesion"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-[#FFF8F1] dark:hover:bg-[#242B35] transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-[#2D1F14] dark:text-[#E2E8F0]" />
                ) : (
                  <Menu className="w-6 h-6 text-[#2D1F14] dark:text-[#E2E8F0]" />
                )}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-[#1A2028] border-t border-[#E8D9C8] dark:border-[#2D3748]"
            >
              <div className="px-4 py-4 space-y-3">
                <div className="flex items-center gap-2 py-2">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#E8850C] flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                    {user?.name}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 py-2 text-red-500 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesion
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    );
  }

  if (isOwner) {
    return (
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-[#1A2028]/90 backdrop-blur-lg border-b border-[#E8D9C8] dark:border-[#2D3748]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#E8850C] flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                Panel de Gestion
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="hidden md:flex items-center gap-2 px-4 py-2 border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-sm text-[#5E4836] dark:text-[#94A3B8] hover:border-[#E8850C] transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Vista Publica
              </Link>

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-[#FFF8F1] dark:hover:bg-[#242B35] transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-[#FF9F1C]" />
                ) : (
                  <Moon className="w-5 h-5 text-[#5E4836]" />
                )}
              </button>

              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-[#E8850C]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#E8850C] flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                    {user?.name}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                  title="Cerrar sesion"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-[#FFF8F1] dark:hover:bg-[#242B35] transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-[#2D1F14] dark:text-[#E2E8F0]" />
                ) : (
                  <Menu className="w-6 h-6 text-[#2D1F14] dark:text-[#E2E8F0]" />
                )}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-[#1A2028] border-t border-[#E8D9C8] dark:border-[#2D3748]"
            >
              <div className="px-4 py-4 space-y-3">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-[#5E4836] dark:text-[#94A3B8] font-medium"
                >
                  <MapPin className="w-4 h-4" />
                  Vista Publica
                </Link>
                <div className="flex items-center gap-2 py-2">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#E8850C] flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                    {user?.name}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 py-2 text-red-500 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesion
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-[#1A2028]/90 backdrop-blur-lg border-b border-[#E8D9C8] dark:border-[#2D3748]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-[#E8850C] flex items-center justify-center group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
              Turismo<span className="text-[#E8850C]">Ciudad</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                location.pathname === "/"
                  ? "text-[#E8850C]"
                  : "text-[#5E4836] dark:text-[#94A3B8] hover:text-[#E8850C]"
              }`}
            >
              Inicio
            </Link>
            <button
              onClick={() => scrollToSection("explore")}
              className="text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] hover:text-[#E8850C] transition-colors"
            >
              Explorar
            </button>
            <button
              onClick={() => scrollToSection("featured-hotels")}
              className="text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] hover:text-[#E8850C] transition-colors"
            >
              Destacados
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-[#FFF8F1] dark:hover:bg-[#242B35] transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-[#FF9F1C]" />
              ) : (
                <Moon className="w-5 h-5 text-[#5E4836]" />
              )}
            </button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                {isClient && (
                  <div ref={userMenuRef} className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#FFF8F1] dark:hover:bg-[#242B35] transition-colors"
                    >
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-8 h-8 rounded-full border-2 border-[#E8850C]"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#E8850C] flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                        {user?.name}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-[#5E4836] dark:text-[#94A3B8] transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1A2028] rounded-xl border border-[#E8D9C8] dark:border-[#2D3748] shadow-xl overflow-hidden"
                        >
                          <div className="p-4 border-b border-[#E8D9C8] dark:border-[#2D3748]">
                            <p className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">{user?.name}</p>
                            <p className="text-sm text-[#96785A] dark:text-[#64748B] truncate">{user?.email}</p>
                          </div>

                          <div className="py-2">
                            <button
                              onClick={() => { navigate("/profile"); setIsUserMenuOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#5E4836] dark:text-[#94A3B8] hover:bg-[#FFF8F1] dark:hover:bg-[#242B35] transition-colors"
                            >
                              <User className="w-4 h-4" />
                              Mi Perfil
                            </button>
                            <button
                              onClick={() => { navigate("/reservations"); setIsUserMenuOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#5E4836] dark:text-[#94A3B8] hover:bg-[#FFF8F1] dark:hover:bg-[#242B35] transition-colors"
                            >
                              <Calendar className="w-4 h-4" />
                              Mis Reservaciones
                            </button>
                            <button
                              onClick={() => { navigate("/support"); setIsUserMenuOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#5E4836] dark:text-[#94A3B8] hover:bg-[#FFF8F1] dark:hover:bg-[#242B35] transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Soporte
                            </button>
                            <button
                              onClick={() => { navigate("/security"); setIsUserMenuOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#5E4836] dark:text-[#94A3B8] hover:bg-[#FFF8F1] dark:hover:bg-[#242B35] transition-colors"
                            >
                              <Shield className="w-4 h-4" />
                              Seguridad
                            </button>
                          </div>

                          <div className="border-t border-[#E8D9C8] dark:border-[#2D3748] py-2">
                            <button
                              onClick={handleSignOut}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Cerrar Sesion
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {!isClient && (
                  <>
                    <div className="flex items-center gap-2">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-8 h-8 rounded-full border-2 border-[#E8850C]"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#E8850C] flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                        {user?.name}
                      </span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                      title="Cerrar sesion"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-[#E8850C] border border-[#E8850C] rounded-xl hover:bg-[#FFF8F1] dark:hover:bg-[#242B35] transition-colors"
                >
                  Iniciar Sesion
                </Link>
                <Link
                  to="/login?tab=register"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#E8850C] rounded-xl hover:bg-[#C46A08] transition-colors shadow-md hover:shadow-lg"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[#FFF8F1] dark:hover:bg-[#242B35] transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-[#2D1F14] dark:text-[#E2E8F0]" />
              ) : (
                <Menu className="w-6 h-6 text-[#2D1F14] dark:text-[#E2E8F0]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-[#1A2028] border-t border-[#E8D9C8] dark:border-[#2D3748]"
          >
            <div className="px-4 py-4 space-y-3">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-[#2D1F14] dark:text-[#E2E8F0] font-medium"
              >
                Inicio
              </Link>
              <button
                onClick={() => scrollToSection("explore")}
                className="block py-2 text-[#5E4836] dark:text-[#94A3B8] font-medium"
              >
                Explorar
              </button>
               <button
                 onClick={() => scrollToSection("featured-hotels")}
                 className="block py-2 text-[#5E4836] dark:text-[#94A3B8] font-medium"
               >
                 Destacados
               </button>

              <div className="border-t border-[#E8D9C8] dark:border-[#2D3748] pt-3">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#E8850C] flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                        {user?.name}
                      </span>
                    </div>

                    {isClient && (
                      <div className="space-y-1 pt-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 py-2 text-[#5E4836] dark:text-[#94A3B8] font-medium"
                        >
                          <User className="w-4 h-4" />
                          Mi Perfil
                        </Link>
                        <Link
                          to="/reservations"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 py-2 text-[#5E4836] dark:text-[#94A3B8] font-medium"
                        >
                          <Calendar className="w-4 h-4" />
                          Mis Reservaciones
                        </Link>
                        <Link
                          to="/support"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 py-2 text-[#5E4836] dark:text-[#94A3B8] font-medium"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Soporte
                        </Link>
                        <Link
                          to="/security"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 py-2 text-[#5E4836] dark:text-[#94A3B8] font-medium"
                        >
                          <Shield className="w-4 h-4" />
                          Seguridad
                        </Link>
                      </div>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 py-2 text-red-500 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesion
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="py-2 text-center text-[#E8850C] border border-[#E8850C] rounded-xl font-medium"
                    >
                      Iniciar Sesion
                    </Link>
                    <Link
                      to="/login?tab=register"
                      onClick={() => setIsMenuOpen(false)}
                      className="py-2 text-center text-white bg-[#E8850C] rounded-xl font-medium"
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
