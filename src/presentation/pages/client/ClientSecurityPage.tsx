import { useState } from "react";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
import { motion } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ClientSecurityPage() {
  const navigate = useNavigate();
  const { updatePassword, resetPassword, isLoading, error, clearError } = useAuthStore();
  const [success, setSuccess] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [resetEmail, setResetEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);

  const handlePasswordChange = async () => {
    setValidationError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setValidationError("Completa todos los campos");
      return;
    }

    if (newPassword.length < 6) {
      setValidationError("La nueva contrasena debe tener al menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError("Las contrasenas no coinciden");
      return;
    }

    if (newPassword === currentPassword) {
      setValidationError("La nueva contrasena debe ser diferente a la actual");
      return;
    }

    try {
      await updatePassword(currentPassword, newPassword);
      setSuccess("Contrasena actualizada correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      // error handled by store
    }
  };

  const handleResetPassword = async () => {
    setValidationError(null);

    if (!resetEmail) {
      setValidationError("Ingresa tu correo electronico");
      return;
    }

    try {
      await resetPassword(resetEmail);
      setSuccess("Se envio un enlace de recuperacion a tu correo");
      setResetEmail("");
      setShowResetForm(false);
      setTimeout(() => setSuccess(null), 5000);
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
          Seguridad
        </h1>

        {(error || validationError) && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error || validationError}</p>
            <button onClick={clearError} className="ml-auto text-red-400 hover:text-red-600">
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
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          </motion.div>
        )}

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-5 h-5 text-[#E8850C]" />
              <h2 className="text-lg font-semibold text-[#2D1F14] dark:text-[#E2E8F0]">
                Cambiar contrasena
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-2">
                  Contrasena actual
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-[#FDF8F3] dark:bg-[#0F1419] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B89A7A] hover:text-[#5E4836]"
                  >
                    {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-2">
                  Nueva contrasena
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-[#FDF8F3] dark:bg-[#0F1419] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B89A7A] hover:text-[#5E4836]"
                  >
                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-2">
                  Confirmar nueva contrasena
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FDF8F3] dark:bg-[#0F1419] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]"
                />
              </div>
            </div>

            <button
              onClick={handlePasswordChange}
              disabled={isLoading}
              className="mt-6 px-6 py-3 bg-[#E8850C] hover:bg-[#C46A08] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
            >
              {isLoading ? "Actualizando..." : "Actualizar contrasena"}
            </button>
          </div>

          <div className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-[#E8850C]" />
              <h2 className="text-lg font-semibold text-[#2D1F14] dark:text-[#E2E8F0]">
                Recuperar acceso
              </h2>
            </div>

            <p className="text-sm text-[#96785A] dark:text-[#64748B] mb-4">
              Si olvidaste tu contrasena, te enviaremos un enlace de recuperacion a tu correo.
            </p>

            {!showResetForm ? (
              <button
                onClick={() => setShowResetForm(true)}
                className="px-6 py-3 bg-[#FFF8F1] dark:bg-[#242B35] text-[#5E4836] dark:text-[#94A3B8] hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] font-medium rounded-xl transition-colors"
              >
                Enviar enlace de recuperacion
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-2">
                    Correo electronico
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full px-4 py-3 bg-[#FDF8F3] dark:bg-[#0F1419] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C] placeholder-[#B89A7A]"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleResetPassword}
                    disabled={isLoading}
                    className="px-6 py-3 bg-[#E8850C] hover:bg-[#C46A08] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                  >
                    {isLoading ? "Enviando..." : "Enviar enlace"}
                  </button>
                  <button
                    onClick={() => {
                      setShowResetForm(false);
                      setResetEmail("");
                    }}
                    className="px-6 py-3 bg-[#FFF8F1] dark:bg-[#242B35] text-[#5E4836] dark:text-[#94A3B8] hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] font-medium rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
