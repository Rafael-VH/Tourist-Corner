import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

type UserRole = "tourist" | "manager";
type AuthTab = "login" | "register";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, isLoading } = useAuthStore();

  const [activeTab, setActiveTab] = useState<AuthTab>(
    searchParams.get("tab") === "register" ? "register" : "login",
  );
  const [role, setRole] = useState<UserRole>("tourist");
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Por favor ingresa tu correo y contrasena");
      return;
    }
    try {
      await signIn(email, password);
      navigate("/");
    } catch (err: unknown) {
      setError((err as Error).message || "Error al iniciar sesion");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("Por favor completa todos los campos obligatorios");
      return;
    }
    try {
      await signUp(email, password, name, role);
      navigate("/");
    } catch (err: unknown) {
      setError((err as Error).message || "Error al registrarse");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#E8850C] flex items-center justify-center shadow-lg shadow-[#E8850C]/30">
            <MapPin className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
            Turismo<span className="text-[#E8850C]">Ciudad</span>
          </span>
        </Link>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1A2028] rounded-2xl shadow-xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden"
        >
          {/* Tabs */}
          <div className="flex border-b border-[#E8D9C8] dark:border-[#2D3748]">
            <button
              onClick={() => {
                setActiveTab("login");
                setError("");
              }}
              className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
                activeTab === "login"
                  ? "text-[#E8850C]"
                  : "text-[#96785A] dark:text-[#64748B] hover:text-[#5E4836] dark:hover:text-[#94A3B8]"
              }`}
            >
              Iniciar Sesion
              {activeTab === "login" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8850C]"
                />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("register");
                setError("");
              }}
              className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
                activeTab === "register"
                  ? "text-[#E8850C]"
                  : "text-[#96785A] dark:text-[#64748B] hover:text-[#5E4836] dark:hover:text-[#94A3B8]"
              }`}
            >
              Crear Cuenta
              {activeTab === "register" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8850C]"
                />
              )}
            </button>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "login" ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="text-xl font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-1">
                    Bienvenido de vuelta
                  </h2>
                  <p className="text-sm text-[#96785A] dark:text-[#64748B] mb-6">
                    Ingresa tus credenciales para continuar
                  </p>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1.5">
                        Correo Electronico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B89A7A]" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tu@email.com"
                          className="w-full pl-10 pr-4 py-3 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1.5">
                        Contrasena
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B89A7A]" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Tu contrasena"
                          className="w-full pl-10 pr-12 py-3 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B89A7A] hover:text-[#E8850C] transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg"
                      >
                        {error}
                      </motion.p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-[#E8850C] hover:bg-[#C46A08] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Iniciar Sesion
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-xl font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-1">
                    Crear cuenta nueva
                  </h2>
                  <p className="text-sm text-[#96785A] dark:text-[#64748B] mb-6">
                    Unete a nuestra comunidad de viajeros
                  </p>

                  {/* Role Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-2">
                      Tipo de Cuenta
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole("tourist")}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          role === "tourist"
                            ? "border-[#E8850C] bg-[#FFF8F1] dark:bg-[#242B35]"
                            : "border-[#E8D9C8] dark:border-[#2D3748] hover:border-[#E8850C]/50"
                        }`}
                      >
                        <Users
                          className={`w-5 h-5 ${role === "tourist" ? "text-[#E8850C]" : "text-[#B89A7A]"}`}
                        />
                        <div className="text-left">
                          <p
                            className={`text-sm font-medium ${role === "tourist" ? "text-[#E8850C]" : "text-[#5E4836] dark:text-[#94A3B8]"}`}
                          >
                            Turista
                          </p>
                          <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                            Explora hoteles
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("manager")}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          role === "manager"
                            ? "border-[#E8850C] bg-[#FFF8F1] dark:bg-[#242B35]"
                            : "border-[#E8D9C8] dark:border-[#2D3748] hover:border-[#E8850C]/50"
                        }`}
                      >
                        <Building2
                          className={`w-5 h-5 ${role === "manager" ? "text-[#E8850C]" : "text-[#B89A7A]"}`}
                        />
                        <div className="text-left">
                          <p
                            className={`text-sm font-medium ${role === "manager" ? "text-[#E8850C]" : "text-[#5E4836] dark:text-[#94A3B8]"}`}
                          >
                            Gestion
                          </p>
                          <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                            Administra hotel
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1.5">
                        Nombre Completo *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B89A7A]" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Tu nombre completo"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1.5">
                        Correo Electronico *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B89A7A]" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tu@email.com"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1.5">
                        Telefono
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B89A7A]" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+591 77712345"
                          className="w-full pl-10 pr-4 py-3 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1.5">
                        Contrasena *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B89A7A]" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimo 6 caracteres"
                          required
                          className="w-full pl-10 pr-12 py-3 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B89A7A] hover:text-[#E8850C] transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg"
                      >
                        {error}
                      </motion.p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-[#E8850C] hover:bg-[#C46A08] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Crear Cuenta
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
