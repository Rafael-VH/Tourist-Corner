import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/presentation/providers/useAuthStore";
import { supabase } from "@/data/datasources/SupabaseClient";
import { ImageUpload } from "@/presentation/components/ImageUpload";
import { getContainer } from "@/core/di/Container";
import {
  MapPin,
  Building2,
  Phone,
  Mail,
  DollarSign,
  Save,
  AlertTriangle,
  GitBranch,
  Image,
  SkipForward,
} from "lucide-react";

export function NewHotelPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const container = getContainer();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [checkingHotel, setCheckingHotel] = useState(true);
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [mainHotel, setMainHotel] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [createdHotelId, setCreatedHotelId] = useState<string | null>(null);
  const [hotelImages, setHotelImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState("");
  const [savingImages, setSavingImages] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "hotel",
    description: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    priceMin: "",
    priceMax: "",
  });

  useEffect(() => {
    const checkExistingHotel = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("hotels")
        .select("id, name, is_main")
        .eq("manager_id", user.id)
        .eq("is_main", true)
        .limit(1);

      if (data && data.length > 0) {
        setMainHotel(data[0]);
        setIsCreatingBranch(true);
      } else {
        setCheckingHotel(false);
      }
      setCheckingHotel(false);
    };

    checkExistingHotel();
  }, [user?.id, navigate]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      if (!form.name || !form.city || !form.priceMin || !form.priceMax) return;

      setIsSubmitting(true);
      setSubmitError("");

      try {
        const { data, error } = await supabase
          .from("hotels")
          .insert({
            name: form.name,
            type: form.type,
            description: form.description,
            address: form.address,
            city: form.city,
            phone: form.phone,
            email: form.email,
            images: [],
            cover_image: "",
            rating: 0,
            review_count: 0,
            amenities: [],
            latitude: 0,
            longitude: 0,
            price_range_min: Number(form.priceMin),
            price_range_max: Number(form.priceMax),
            manager_id: user.id,
            is_main: !isCreatingBranch,
            branch_of: isCreatingBranch ? mainHotel?.id : null,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;

        setCreatedHotelId(data.id);
      } catch (err: unknown) {
        setSubmitError((err as Error).message || "Error al crear el hotel");
        setIsSubmitting(false);
      }
    },
    [user, form, isCreatingBranch, mainHotel],
  );

  const handleUploadImages = async (files: File[]) => {
    if (!createdHotelId) return [];
    const urls: string[] = [];
    for (const file of files) {
      const url = await container.imageRepository.uploadHotelImage(
        createdHotelId,
        file,
      );
      urls.push(url);
    }
    return urls;
  };

  const handleDeleteImage = async (imageUrl: string) => {
    await container.imageRepository.deleteHotelImage(imageUrl);
  };

  const handleSaveImages = async () => {
    if (!createdHotelId) return;
    setSavingImages(true);
    try {
      await supabase
        .from("hotels")
        .update({ images: hotelImages, cover_image: coverImage })
        .eq("id", createdHotelId);
      navigate(`/dashboard/hotel/${createdHotelId}`);
    } catch (err: unknown) {
      setSubmitError((err as Error).message || "Error al guardar imagenes");
    } finally {
      setSavingImages(false);
    }
  };

  const handleSkipImages = () => {
    if (createdHotelId) {
      navigate(`/dashboard/hotel/${createdHotelId}`);
    }
  };

  if (createdHotelId) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419]">
        <div className="bg-white dark:bg-[#1A2028] border-b border-[#E8D9C8] dark:border-[#2D3748]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <span className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
              {form.name} — Agregar imagenes
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {submitError}
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden"
          >
            <div className="p-6 border-b border-[#F5EDE3] dark:border-[#2D3748]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8850C] flex items-center justify-center">
                  <Image className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                    Imagenes del Hotel
                  </h1>
                  <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                    Agrega fotos para mostrar a los turistas
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <ImageUpload
                images={hotelImages}
                coverImage={coverImage}
                onImagesChange={setHotelImages}
                onCoverChange={setCoverImage}
                onUpload={handleUploadImages}
                onDelete={handleDeleteImage}
              />
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#F5EDE3] dark:border-[#2D3748]">
              <button
                onClick={handleSkipImages}
                className="flex items-center gap-2 px-6 py-2.5 border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] hover:border-[#E8850C] hover:text-[#E8850C] transition-colors"
              >
                <SkipForward className="w-4 h-4" />
                Saltar por ahora
              </button>
              <button
                onClick={handleSaveImages}
                disabled={savingImages}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#E8850C] hover:bg-[#C46A08] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                {savingImages ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar y continuar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (checkingHotel) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E8850C]/30 border-t-[#E8850C] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419]">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">
              {submitError}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] overflow-hidden"
        >
          <div className="p-6 border-b border-[#F5EDE3] dark:border-[#2D3748]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8850C] flex items-center justify-center">
                {isCreatingBranch ? (
                  <GitBranch className="w-5 h-5 text-white" />
                ) : (
                  <Building2 className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                  {isCreatingBranch
                    ? `Nueva Sucursal de ${mainHotel?.name}`
                    : "Registrar Nuevo Hotel"}
                </h1>
                <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                  {isCreatingBranch
                    ? "Completa la informacion de la nueva sucursal"
                    : "Completa la informacion basica de tu establecimiento"}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-[#5E4836] dark:text-[#94A3B8] uppercase tracking-wide">
                Informacion Basica
              </h2>

              <div>
                <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                  Nombre del Hotel *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Hotel Grand Paradise"
                  required
                  className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                  Tipo de Establecimiento *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(["hotel", "resort", "motel", "residential"] as const).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm({ ...form, type })}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all capitalize ${
                          form.type === type
                            ? "border-[#E8850C] bg-[#FFF8F1] dark:bg-[#242B35] text-[#E8850C]"
                            : "border-[#E8D9C8] dark:border-[#2D3748] text-[#5E4836] dark:text-[#94A3B8] hover:border-[#E8850C]/50"
                        }`}
                      >
                        {type}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                  Descripcion
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe tu hotel..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all resize-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-[#5E4836] dark:text-[#94A3B8] uppercase tracking-wide">
                Ubicacion y Contacto
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Ej: Santa Cruz"
                    required
                    className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    Direccion
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    placeholder="Av. Principal #123"
                    className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="+591 77712345"
                    className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="contacto@hotel.com"
                    className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-[#5E4836] dark:text-[#94A3B8] uppercase tracking-wide">
                Rango de Precios
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Precio Minimo (Bs) *
                  </label>
                  <input
                    type="number"
                    value={form.priceMin}
                    onChange={(e) =>
                      setForm({ ...form, priceMin: e.target.value })
                    }
                    placeholder="100"
                    required
                    min="0"
                    className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Precio Maximo (Bs) *
                  </label>
                  <input
                    type="number"
                    value={form.priceMax}
                    onChange={(e) =>
                      setForm({ ...form, priceMax: e.target.value })
                    }
                    placeholder="500"
                    required
                    min="0"
                    className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#F5EDE3] dark:border-[#2D3748]">
              <Link
                to="/dashboard"
                className="px-6 py-2.5 border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] hover:border-red-400 hover:text-red-500 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#E8850C] hover:bg-[#C46A08] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isCreatingBranch
                      ? "Registrar Sucursal"
                      : "Registrar Hotel"}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
