import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useRoomStore } from "@/presentation/providers/useRoomStore";
import { supabase } from "@/data/datasources/SupabaseClient";
import { ImageUpload } from "@/presentation/components/ImageUpload";
import { getContainer } from "@/core/di/Container";
import type { RoomStatus } from "@/domain/entities/Room";
import type { ImageRecord } from "@/domain/repositories/ImageRepository";
import {
  Bed,
  Save,
  X,
  Users,
  DollarSign,
  Maximize,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";

export function RoomManagementPage() {
  const { id } = useParams<{ id: string }>();

  const container = getContainer();

  const { rooms, fetchRoomById, isLoading, updateRoomStatus, updateRoom } =
    useRoomStore();

  const selectedRoom = rooms.find((r) => r.id === id) || null;

  const [isEditing, setIsEditing] = useState(true);

  const [editForm, setEditForm] = useState({
    name: selectedRoom?.name || "",
    description: selectedRoom?.description || "",
    pricePerNight: selectedRoom?.pricePerNight || 0,
    capacity: selectedRoom?.capacity || 2,
    bedType: selectedRoom?.bedType || "",
    size: selectedRoom?.size || 0,
    status: (selectedRoom?.status || "available") as RoomStatus,
  });

  const [dbImages, setDbImages] = useState<ImageRecord[]>([]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const fetchDbImages = useCallback(async (roomId: string) => {
    const images = await container.imageRepository.getEntityImages(
      "room",
      roomId,
    );
    setDbImages(images);
  }, [container]);

  useEffect(() => {
    if (id) {
      fetchRoomById(id);
    }
  }, [id, fetchRoomById]);

  useEffect(() => {
    if (id) {
      fetchDbImages(id);
    }
  }, [id, fetchDbImages]);

  if (isLoading || !selectedRoom) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E8850C]/30 border-t-[#E8850C] rounded-full animate-spin" />
      </div>
    );
  }

  const room = selectedRoom;

  const handleToggleStatus = async () => {
    const newStatus: RoomStatus =
      room.status === "available" ? "occupied" : "available";
    await updateRoomStatus(room.id, newStatus);
  };

  const handleDelete = async () => {
    if (!room) return;
    try {
      await supabase.from("rooms").delete().eq("id", room.id);
      navigate(`/dashboard/hotel/${room.hotel_id}`);
    } catch (err) {
      console.error("Error al eliminar habitacion:", err);
    }
  };

  const handleSave = async () => {
    if (!room) return;
    await updateRoom(room.id, {
      name: editForm.name,
      description: editForm.description,
      pricePerNight: editForm.pricePerNight,
      capacity: editForm.capacity,
      bedType: editForm.bedType,
      size: editForm.size,
      status: editForm.status,
      isAvailable: editForm.status === "available",
    });
    setIsEditing(false);
  };

  const handleUploadImages = async (files: File[]) => {
    if (!id) return [];
    setUploadProgress({ current: 0, total: files.length });
    try {
      const records = await container.imageRepository.uploadMultipleRoomImages(
        id,
        files,
        (current, total) => setUploadProgress({ current, total }),
      );
      await fetchDbImages(id);
      const urls = records.map((r) => r.url);
      await updateImageUrlsInDb(urls);
      return urls;
    } finally {
      setUploadProgress(null);
    }
  };

  const updateImageUrlsInDb = async (newUrls: string[]) => {
    if (!id || !selectedRoom) return;
    const existingUrls = selectedRoom.images || [];
    const allUrls = [...existingUrls, ...newUrls];
    await supabase.from("rooms").update({ images: allUrls }).eq("id", id);
    await fetchRoomById(id);
  };

  const handleDeleteImage = async (imageUrl: string) => {
    const image = dbImages.find((img) => img.url === imageUrl);
    if (image) {
      await container.imageRepository.deleteImage(image.id);
    } else {
      await container.imageRepository.deleteRoomImage(imageUrl);
    }
    await fetchDbImages(id!);
    if (selectedRoom) {
      const updatedUrls = (selectedRoom.images || []).filter(
        (url) => url !== imageUrl,
      );
      await supabase.from("rooms").update({ images: updatedUrls }).eq("id", id);
      await fetchRoomById(id!);
    }
  };

  const handleImagesChange = async (images: string[]) => {
    if (id) {
      await supabase.from("rooms").update({ images: images }).eq("id", id);
      await fetchRoomById(id);
    }
  };

  return (
    <div key={room.id} className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1A2028] border-b border-[#E8D9C8] dark:border-[#2D3748]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E8850C] hover:bg-[#C46A08] text-white rounded-xl text-sm font-medium transition-colors"
                  >
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
                    Guardar Cambios
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Basic Info */}
            <div className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]">
              <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-4">
                Informacion Basica
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    Nombre de la Habitacion
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
              </div>
            </div>

            {/* Pricing & Capacity */}
            <div className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]">
              <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-4">
                Precio y Capacidad
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Precio por Noche
                  </label>
                  <input
                    type="number"
                    value={editForm.pricePerNight}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        pricePerNight: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    <Users className="w-4 h-4 inline mr-1" />
                    Capacidad
                  </label>
                  <input
                    type="number"
                    value={editForm.capacity}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        capacity: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    <Bed className="w-4 h-4 inline mr-1" />
                    Tipo de Cama
                  </label>
                  <input
                    type="text"
                    value={editForm.bedType}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bedType: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    <Maximize className="w-4 h-4 inline mr-1" />
                    Tamano (m²)
                  </label>
                  <input
                    type="number"
                    value={editForm.size}
                    onChange={(e) =>
                      setEditForm({ ...editForm, size: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-[#E8850C]" />
                <h2 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                  Imagenes
                </h2>
              </div>
              <ImageUpload
                images={selectedRoom?.images || []}
                onImagesChange={handleImagesChange}
                onCoverChange={() => {}}
                onUpload={handleUploadImages}
                onDelete={handleDeleteImage}
              />
              {uploadProgress && uploadProgress.total > 0 && (
                <div className="mt-4 p-3 bg-[#FFF8F1] dark:bg-[#242B35] rounded-xl">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-[#5E4836] dark:text-[#94A3B8]">
                      Subiendo imagenes...
                    </span>
                    <span className="font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                      {uploadProgress.current}/{uploadProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-[#E8D9C8] dark:bg-[#2D3748] rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                      }}
                      className="bg-[#E8850C] h-2 rounded-full transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Status Card */}
            <div className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]">
              <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-4">
                Estado
              </h3>
              <div className="flex items-center justify-between p-4 bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl">
                <div>
                  <p className="text-sm font-medium text-[#5E4836] dark:text-[#94A3B8]">
                    Disponibilidad
                  </p>
                  <p
                    className={`text-sm ${room.isAvailable ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {room.isAvailable ? "Disponible" : "Ocupada"}
                  </p>
                </div>
                <button
                  onClick={handleToggleStatus}
                  className="text-[#E8850C] hover:scale-105 transition-transform"
                >
                  {room.isAvailable ? (
                    <ToggleRight className="w-10 h-10" />
                  ) : (
                    <ToggleLeft className="w-10 h-10" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]">
              <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-4">
                Resumen
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#96785A] dark:text-[#64748B]">
                    Tipo
                  </span>
                  <span className="text-[#2D1F14] dark:text-[#E2E8F0] font-medium">
                    {room.type}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#96785A] dark:text-[#64748B]">
                    Estado
                  </span>
                  <span
                    className={`font-medium ${room.isAvailable ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {room.status === "available"
                      ? "Disponible"
                      : room.status === "occupied"
                        ? "Ocupada"
                        : "Mantenimiento"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#96785A] dark:text-[#64748B]">
                    Precio
                  </span>
                  <span className="text-[#E8850C] font-bold">
                    ${room.pricePerNight}/noche
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#96785A] dark:text-[#64748B]">
                    Capacidad
                  </span>
                  <span className="text-[#2D1F14] dark:text-[#E2E8F0] font-medium">
                    {room.capacity} personas
                  </span>
                </div>
                {room.size && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#96785A] dark:text-[#64748B]">
                      Tamano
                    </span>
                    <span className="text-[#2D1F14] dark:text-[#E2E8F0] font-medium">
                      {room.size} m²
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities Preview */}
            <div className="bg-white dark:bg-[#1A2028] rounded-2xl p-6 border border-[#E8D9C8] dark:border-[#2D3748]">
              <h3 className="font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-3">
                Comodidades
              </h3>
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-3 py-1.5 bg-[#FFF8F1] dark:bg-[#242B35] rounded-lg text-xs text-[#5E4836] dark:text-[#94A3B8]"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden shadow-2xl"
          >
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0] mb-2">
                Eliminar Habitacion
              </h3>
              <p className="text-sm text-[#96785A] dark:text-[#64748B] mb-6">
                Estas seguro que deseas eliminar "{room?.name}"? Esta accion no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] text-[#5E4836] dark:text-[#94A3B8] rounded-xl text-sm font-medium hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
