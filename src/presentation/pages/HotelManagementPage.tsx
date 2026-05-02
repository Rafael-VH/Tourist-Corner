import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useHotelStore } from "@/presentation/providers/useHotelStore";
import { useRoomStore } from "@/presentation/providers/useRoomStore";
import {
  ArrowLeft,
  Plus,
  Bed,
  Star,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Image,
} from "lucide-react";

export function HotelManagementPage() {
  const { id } = useParams<{ id: string }>();
  const { selectedHotel, fetchHotelById, isLoading, updateHotel } =
    useHotelStore();
  const { rooms, fetchRoomsByHotel } = useRoomStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: selectedHotel?.name || "",
    description: selectedHotel?.description || "",
    phone: selectedHotel?.phone || "",
    email: selectedHotel?.email || "",
    address: selectedHotel?.address || "",
  });

  useEffect(() => {
    if (id) {
      fetchHotelById(id);
      fetchRoomsByHotel(id);
    }
  }, [id, fetchHotelById, fetchRoomsByHotel]);

  if (isLoading || !selectedHotel) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E8850C]/30 border-t-[#E8850C] rounded-full animate-spin" />
      </div>
    );
  }

  const hotel = selectedHotel;

  const handleSave = async () => {
    if (!id) return;
    await updateHotel(id, {
      name: editForm.name,
      description: editForm.description,
      phone: editForm.phone,
      email: editForm.email,
      address: editForm.address,
    });
    setIsEditing(false);
  };

  return (
    <div key={hotel.id} className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1A2028] border-b border-[#E8D9C8] dark:border-[#2D3748]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 text-[#5E4836] dark:text-[#94A3B8] hover:text-[#E8850C] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Panel</span>
              </Link>
              <span className="text-[#D4BEA5]">/</span>
              <span className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                {hotel.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <Link
                    to={`/hotel/${hotel.id}`}
                    className="flex items-center gap-2 px-4 py-2 border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-sm text-[#5E4836] dark:text-[#94A3B8] hover:border-[#E8850C] transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Publico
                  </Link>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E8850C] hover:bg-[#C46A08] text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-sm text-[#5E4836] dark:text-[#94A3B8] hover:border-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hotel Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden mb-8"
        >
          {/* Cover */}
          <div className="relative h-48 md:h-64">
            <img
              src={hotel.coverImage || hotel.images[0]}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#2D1F14]/30" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {hotel.name}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-white/80">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    {hotel.address}, {hotel.city}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur rounded-xl">
                <Star className="w-4 h-4 text-[#E8850C] fill-[#E8850C]" />
                <span className="font-bold text-[#2D1F14]">{hotel.rating}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    Descripcion
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                      Telefono
                    </label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    Direccion
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    Descripcion
                  </h3>
                  <p className="text-[#2D1F14] dark:text-[#E2E8F0] leading-relaxed">
                    {hotel.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#F5EDE3] dark:border-[#2D3748]">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#E8850C]" />
                    <div>
                      <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                        Telefono
                      </p>
                      <p className="text-sm text-[#2D1F14] dark:text-[#E2E8F0]">
                        {hotel.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#E8850C]" />
                    <div>
                      <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                        Email
                      </p>
                      <p className="text-sm text-[#2D1F14] dark:text-[#E2E8F0]">
                        {hotel.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#E8850C]" />
                    <div>
                      <p className="text-xs text-[#96785A] dark:text-[#64748B]">
                        Ciudad
                      </p>
                      <p className="text-sm text-[#2D1F14] dark:text-[#E2E8F0]">
                        {hotel.city}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Images Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748] mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
              Galeria de Imagenes
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#E8850C] hover:bg-[#C46A08] text-white rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {hotel.images.map((img, index) => (
              <div
                key={index}
                className="relative group rounded-xl overflow-hidden aspect-square"
              >
                <img
                  src={img}
                  alt={`${hotel.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button className="p-2 bg-white/90 rounded-lg text-red-500 hover:bg-white transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button className="border-2 border-dashed border-[#E8D9C8] dark:border-[#2D3748] rounded-xl aspect-square flex flex-col items-center justify-center gap-2 text-[#96785A] dark:text-[#64748B] hover:border-[#E8850C] hover:text-[#E8850C] transition-colors">
              <Image className="w-8 h-8" />
              <span className="text-xs font-medium">Subir Imagen</span>
            </button>
          </div>
        </motion.div>

        {/* Rooms Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden"
        >
          <div className="p-6 border-b border-[#F5EDE3] dark:border-[#2D3748]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                  Habitaciones
                </h2>
                <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                  {rooms.length} habitaciones registradas
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#E8850C] hover:bg-[#C46A08] text-white rounded-xl text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" />
                Nueva Habitacion
              </button>
            </div>
          </div>

          <div className="divide-y divide-[#F5EDE3] dark:divide-[#2D3748]">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="p-5 hover:bg-[#FFF8F1] dark:hover:bg-[#242B35]/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={room.images[0]}
                    alt={room.name}
                    className="w-24 h-24 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                          {room.name}
                        </h3>
                        <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                          {room.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            room.isAvailable
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                              : "bg-red-50 text-red-600 dark:bg-red-900/20"
                          }`}
                        >
                          {room.isAvailable ? "Disponible" : "Ocupada"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-[#96785A] dark:text-[#64748B]">
                        <Bed className="w-4 h-4 inline mr-1" />
                        {room.bedType}
                      </span>
                      <span className="text-sm text-[#96785A] dark:text-[#64748B]">
                        Capacidad: {room.capacity}
                      </span>
                      <span className="text-sm font-medium text-[#E8850C]">
                        ${room.pricePerNight}/noche
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      to={`/dashboard/room/${room.id}`}
                      className="p-2 hover:bg-[#E8D9C8] dark:hover:bg-[#2D3748] rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-[#B89A7A]" />
                    </Link>
                    <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
