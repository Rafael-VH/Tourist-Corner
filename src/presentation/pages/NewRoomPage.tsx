import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/data/datasources/SupabaseClient";
import {
  ArrowLeft,
  Bed,
  Users,
  DollarSign,
  Maximize,
  Save,
  AlertTriangle,
  Tag,
  Wrench,
  Check,
} from "lucide-react";

interface CustomRoomType {
  id: string;
  name: string;
  description: string | null;
}

interface CustomService {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

export function NewRoomPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get("hotelId") || "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [customTypes, setCustomTypes] = useState<CustomRoomType[]>([]);
  const [customServices, setCustomServices] = useState<CustomService[]>([]);
  const [selectedCustomServices, setSelectedCustomServices] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: "",
    type: "standard",
    customRoomTypeId: "",
    description: "",
    pricePerNight: "",
    capacity: "2",
    bedType: "Queen",
    size: "",
    amenities: [] as string[],
  });

  useEffect(() => {
    const fetchCustomTypes = async () => {
      try {
        const { data, error } = await supabase
          .from("custom_room_types")
          .select("id, name, description")
          .order("name");
        if (error) throw error;
        setCustomTypes(data || []);
      } catch (err: unknown) {
        console.error("Error fetching custom room types:", err);
      }
    };
    fetchCustomTypes();
  }, []);

  useEffect(() => {
    const fetchCustomServices = async () => {
      try {
        const { data, error } = await supabase
          .from("custom_services")
          .select("id, name, description, icon")
          .order("name");
        if (error) throw error;
        setCustomServices(data || []);
      } catch (err: unknown) {
        console.error("Error fetching custom services:", err);
      }
    };
    fetchCustomServices();
  }, []);

  const commonAmenities = [
    "WiFi",
    "Aire Acondicionado",
    "TV Cable",
    "Minibar",
    "Caja Fuerte",
    "Balcon",
    "Jacuzzi",
    "Vista al Mar",
  ];

  const toggleAmenity = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const toggleCustomService = (serviceId: string) => {
    setSelectedCustomServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelId) return;
    if (!form.name || !form.pricePerNight || !form.capacity) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .insert({
          hotel_id: hotelId,
          name: form.name,
          type: form.customRoomTypeId ? customTypes.find((t) => t.id === form.customRoomTypeId)?.name || form.type : form.type,
          custom_room_type_id: form.customRoomTypeId || null,
          description: form.description,
          price_per_night: Number(form.pricePerNight),
          capacity: Number(form.capacity),
          bed_type: form.bedType,
          size: form.size ? Number(form.size) : null,
          images: [],
          amenities: form.amenities,
          status: "available",
          is_available: true,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      if (selectedCustomServices.length > 0 && roomData?.id) {
        const { error: servicesError } = await supabase
          .from("room_custom_services")
          .insert(
            selectedCustomServices.map((serviceId) => ({
              room_id: roomData.id,
              custom_service_id: serviceId,
            }))
          );
        if (servicesError) throw servicesError;
      }

      navigate(`/dashboard/hotel/${hotelId}`);
    } catch (err: unknown) {
      setSubmitError((err as Error).message || "Error al crear la habitacion");
      setIsSubmitting(false);
    }
  }, [hotelId, form, navigate, customTypes, selectedCustomServices]);

  return (
    <div className="min-h-screen bg-[#FDF8F3] dark:bg-[#0F1419]">
      <div className="bg-white dark:bg-[#1A2028] border-b border-[#E8D9C8] dark:border-[#2D3748]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              to={`/dashboard/hotel/${hotelId}`}
              className="inline-flex items-center gap-2 text-[#5E4836] dark:text-[#94A3B8] hover:text-[#E8850C] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Hotel</span>
            </Link>
            <span className="text-[#D4BEA5]">/</span>
            <span className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
              Nueva Habitacion
            </span>
          </div>
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
            <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
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
                <Bed className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                  Registrar Nueva Habitacion
                </h1>
                <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                  Agrega una habitacion a tu hotel
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
                  Nombre de la Habitacion *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Suite Premium Vista al Mar"
                  required
                  className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                  Tipo de Habitacion
                </label>
                <input
                  type="text"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  placeholder="Ej: standard, deluxe, suite"
                  className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all"
                />
              </div>

              {customTypes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Tipo Personalizado
                  </label>
                  <select
                    value={form.customRoomTypeId}
                    onChange={(e) => {
                      const selected = customTypes.find((t) => t.id === e.target.value);
                      if (selected) {
                        setForm({
                          ...form,
                          customRoomTypeId: selected.id,
                          type: selected.name,
                        });
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all appearance-none"
                  >
                    <option value="">Sin tipo personalizado</option>
                    {customTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  {form.customRoomTypeId && (
                    <p className="text-xs text-[#96785A] dark:text-[#64748B] mt-1">
                      {customTypes.find((t) => t.id === form.customRoomTypeId)?.description}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                  Descripcion
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe la habitacion..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all resize-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-[#5E4836] dark:text-[#94A3B8] uppercase tracking-wide">
                Precio y Capacidad
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Precio por Noche (Bs) *
                  </label>
                  <input
                    type="number"
                    value={form.pricePerNight}
                    onChange={(e) =>
                      setForm({ ...form, pricePerNight: e.target.value })
                    }
                    placeholder="200"
                    required
                    min="0"
                    className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    <Users className="w-4 h-4 inline mr-1" />
                    Capacidad (personas) *
                  </label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm({ ...form, capacity: e.target.value })
                    }
                    placeholder="2"
                    required
                    min="1"
                    className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    <Bed className="w-4 h-4 inline mr-1" />
                    Tipo de Cama
                  </label>
                  <select
                    value={form.bedType}
                    onChange={(e) =>
                      setForm({ ...form, bedType: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all appearance-none"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Doble">Doble</option>
                    <option value="Queen">Queen</option>
                    <option value="King">King</option>
                    <option value="2 Camas Dobles">2 Camas Dobles</option>
                    <option value="2 Camas Queen">2 Camas Queen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-1">
                    <Maximize className="w-4 h-4 inline mr-1" />
                    Tamano (m²)
                  </label>
                  <input
                    type="number"
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    placeholder="30"
                    min="0"
                    className="w-full px-4 py-2.5 bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#2D1F14] dark:text-[#E2E8F0] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C]/50 focus:border-[#E8850C] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-[#5E4836] dark:text-[#94A3B8] uppercase tracking-wide">
                Comodidades
              </h2>

              <div className="flex flex-wrap gap-2">
                {commonAmenities.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      form.amenities.includes(amenity)
                        ? "bg-[#E8850C] text-white"
                        : "bg-[#FDF8F3] dark:bg-[#242B35] border border-[#E8D9C8] dark:border-[#2D3748] text-[#5E4836] dark:text-[#94A3B8] hover:border-[#E8850C]/50"
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            {customServices.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-[#5E4836] dark:text-[#94A3B8] uppercase tracking-wide">
                  Servicios Personalizados
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {customServices.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleCustomService(service.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedCustomServices.includes(service.id)
                          ? "border-[#E8850C] bg-[#FFF8F1] dark:bg-[#242B35]"
                          : "border-[#E8D9C8] dark:border-[#2D3748] hover:border-[#E8850C]/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            selectedCustomServices.includes(service.id)
                              ? "bg-[#E8850C] text-white"
                              : "bg-[#FDF8F3] dark:bg-[#242B35] text-[#96785A] dark:text-[#64748B]"
                          }`}
                        >
                          {selectedCustomServices.includes(service.id) ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Wrench className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[#2D1F14] dark:text-[#E2E8F0]">
                            {service.name}
                          </p>
                          {service.description && (
                            <p className="text-xs text-[#96785A] dark:text-[#64748B] mt-0.5 line-clamp-1">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#F5EDE3] dark:border-[#2D3748]">
              <Link
                to={`/dashboard/hotel/${hotelId}`}
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
                    Registrar Habitacion
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
