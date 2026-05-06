import { useEffect, useState } from "react";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
import { useSupportTicketStore } from "@/presentation/providers/useSupportTicketStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Send,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  X,
  Hotel,
  Clock,
  Mail,
} from "lucide-react";

const statusConfig = {
  open: {
    label: "Abierto",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
  },
  in_progress: {
    label: "En progreso",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  resolved: {
    label: "Resuelto",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
  },
  closed: {
    label: "Cerrado",
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-900/20",
    border: "border-gray-200 dark:border-gray-800",
  },
};

export function ClientSupportPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tickets, isLoading, error, fetchTicketsByUser, createTicket, clearError } = useSupportTicketStore();

  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [hotelId, setHotelId] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTicketsByUser(user.id);
    }
  }, [user, fetchTicketsByUser]);

  const handleSubmit = async () => {
    if (!user || !subject.trim() || !description.trim() || !hotelId) {
      return;
    }

    try {
      await createTicket(user.id, {
        hotelId,
        subject: subject.trim(),
        description: description.trim(),
      });
      setSuccess("Ticket enviado correctamente");
      setSubject("");
      setDescription("");
      setHotelId("");
      setShowForm(false);
      fetchTicketsByUser(user.id);
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      // error handled by store
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#5E4836] dark:text-[#94A3B8] hover:text-[#E8850C] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
            Soporte al Cliente
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#E8850C] hover:bg-[#C46A08] text-white font-medium rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo ticket
          </button>
        </div>

        {(error || success) && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            error
              ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
          }`}>
            {error ? (
              <>
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                <button onClick={clearError} className="ml-auto text-red-400 hover:text-red-600">×</button>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
              </>
            )}
          </div>
        )}

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#2D1F14] dark:text-[#E2E8F0] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#E8850C]" />
                Enviar consulta
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-[#96785A] dark:text-[#64748B] hover:text-[#5E4836]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-2">
                  ID del Hotel
                </label>
                <input
                  type="text"
                  value={hotelId}
                  onChange={(e) => setHotelId(e.target.value)}
                  placeholder="Ingresa el ID del hotel relacionado"
                  className="w-full px-4 py-3 bg-[#FDF8F3] dark:bg-[#0F1419] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C] placeholder-[#B89A7A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-2">
                  Asunto
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Resumen de tu consulta o problema"
                  className="w-full px-4 py-3 bg-[#FDF8F3] dark:bg-[#0F1419] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C] placeholder-[#B89A7A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-2">
                  Descripcion
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe tu consulta o problema en detalle..."
                  className="w-full px-4 py-3 bg-[#FDF8F3] dark:bg-[#0F1419] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C] placeholder-[#B89A7A] resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!subject.trim() || !description.trim() || !hotelId}
                className="px-6 py-3 bg-[#E8850C] hover:bg-[#C46A08] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar ticket
              </button>
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]"
              >
                <div className="h-5 bg-[#E8D9C8] dark:bg-[#2D3748] rounded w-1/4 mb-4" />
                <div className="h-4 bg-[#E8D9C8] dark:bg-[#2D3748] rounded w-1/2 mb-2" />
                <div className="h-4 bg-[#E8D9C8] dark:bg-[#2D3748] rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748]">
            <Mail className="w-16 h-16 mx-auto text-[#D4BEA5] dark:text-[#2D3748] mb-4" />
            <h3 className="text-lg font-medium text-[#5E4836] dark:text-[#94A3B8]">
              No tienes tickets de soporte
            </h3>
            <p className="text-sm text-[#96785A] dark:text-[#64748B] mt-1 mb-6">
              Envia una consulta si tienes algun problema o pregunta
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-[#E8850C] hover:bg-[#C46A08] text-white font-medium rounded-xl transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Crear primer ticket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket, index) => {
              const config = statusConfig[ticket.status];

              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white dark:bg-[#1A2028] rounded-2xl border ${config.border} p-6`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-xs text-[#96785A] dark:text-[#64748B]">
                          #{ticket.id.slice(-6).toUpperCase()}
                        </span>
                      </div>

                      <h3 className="font-medium text-[#2D1F14] dark:text-[#E2E8F0] mb-2">
                        {ticket.subject}
                      </h3>

                      <p className="text-sm text-[#96785A] dark:text-[#64748B] mb-3 line-clamp-2">
                        {ticket.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-[#96785A] dark:text-[#64748B]">
                        <span className="flex items-center gap-1">
                          <Hotel className="w-3.5 h-3.5" />
                          Hotel ID: {ticket.hotelId.slice(-6).toUpperCase()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(ticket.createdAt).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
