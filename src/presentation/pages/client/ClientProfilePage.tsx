import { useState, useRef } from "react";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ClientProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, uploadAvatar, isLoading, error, clearError } =
    useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadAvatar(user.id, file);
        setSuccess("Foto de perfil actualizada");
        setTimeout(() => setSuccess(null), 3000);
      } catch {
        // error handled by store
      }
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(user.id, { name, phone });
      setSuccess("Perfil actualizado correctamente");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      // error handled by store
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#5E4836] dark:text-[#94A3B8] hover:text-[#E8850C] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <h1 className="text-2xl font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-8">
          Mi Perfil
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={clearError}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-600 dark:text-green-400">
              {success}
            </p>
          </motion.div>
        )}

        <div className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#FFF8F1] dark:bg-[#242B35] flex items-center justify-center overflow-hidden">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-[#B89A7A]" />
                )}
              </div>
              <button
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#E8850C] rounded-full flex items-center justify-center hover:bg-[#C46A08] transition-colors"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#2D1F14] dark:text-[#E2E8F0]">
                {user.name}
              </h2>
              <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                {user.email}
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-[#FFF8F1] dark:bg-[#242B35] text-[#5E4836] dark:text-[#94A3B8] text-xs font-medium rounded-full">
                Cliente
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nombre completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[#FDF8F3] dark:bg-[#0F1419] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Correo electronico
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-3 bg-[#F5F0EB] dark:bg-[#151A20] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#96785A] dark:text-[#64748B] cursor-not-allowed"
              />
              <p className="text-xs text-[#96785A] dark:text-[#64748B] mt-1">
                El correo electronico no se puede cambiar
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Telefono (opcional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                className="w-full px-4 py-3 bg-[#FDF8F3] dark:bg-[#0F1419] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C] placeholder-[#B89A7A]"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isLoading}
            className="mt-8 w-full sm:w-auto px-6 py-3 bg-[#E8850C] hover:bg-[#C46A08] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
