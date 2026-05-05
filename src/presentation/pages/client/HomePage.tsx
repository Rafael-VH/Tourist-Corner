import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHotelStore } from "@/presentation/providers/useHotelStore";
import { useRoomStore } from "@/presentation/providers/useRoomStore";
import { HotelCard } from "@/presentation/components/HotelCard";
import { RoomCard } from "@/presentation/components/RoomCard";
import { Search, Star, Hotel as HotelIcon, Bed } from "lucide-react";
import { hotelTypeIcons, HOTEL_TYPES } from "@/presentation/utils/iconMaps.tsx";

const ITEMS_PER_PAGE = 9;
const HERO_IMAGE = import.meta.env.VITE_HERO_IMAGE || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400";

export function HomePage() {
  const {
    hotels,
    featuredHotels,
    fetchHotels,
    fetchFeaturedHotels,
    isLoading,
    error,
    filters,
    setFilters,
  } = useHotelStore();
  const { featuredRooms, fetchFeaturedRooms } = useRoomStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cities = useMemo(
    () => [...new Set(hotels.map((h) => h.city).filter(Boolean))],
    [hotels]
  );

  const hotelCount = useMemo(() => hotels.length, [hotels]);
  const resortCount = useMemo(
    () => hotels.filter((h) => h.type === "resort").length,
    [hotels]
  );
  const cityCount = useMemo(() => cities.length, [cities]);
  const reviewCount = useMemo(
    () => hotels.reduce((sum, h) => sum + h.reviewCount, 0),
    [hotels]
  );

  useEffect(() => {
    fetchHotels();
    fetchFeaturedHotels();
    fetchFeaturedRooms();
  }, [fetchHotels, fetchFeaturedHotels, fetchFeaturedRooms]);

  const applyFilters = useCallback(
    (updates: { searchQuery?: string; type?: string; city?: string }) => {
      const newFilters = {
        searchQuery: updates.searchQuery ?? filters.searchQuery,
        type: updates.type ?? filters.type,
        city: updates.city ?? filters.city,
      };
      setFilters(newFilters);
      fetchHotels(newFilters);
    },
    [filters, setFilters, fetchHotels]
  );

  const handleSearch = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      applyFilters({ searchQuery: searchQuery || undefined });
    }, 300);
  }, [searchQuery, applyFilters]);

  const handleTypeFilter = useCallback(
    (type: string) => {
      const newType = selectedType === type ? "" : type;
      setSelectedType(newType);
      applyFilters({ type: newType || undefined });
    },
    [selectedType, applyFilters]
  );

  const handleCityFilter = useCallback(
    (city: string) => {
      const newCity = selectedCity === city ? "" : city;
      setSelectedCity(newCity);
      applyFilters({ city: newCity || undefined });
    },
    [selectedCity, applyFilters]
  );

  const handleLoadMore = useCallback(() => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
  }, []);

  const visibleHotels = useMemo(
    () => hotels.slice(0, displayCount),
    [hotels, displayCount]
  );
  const hasMore = displayCount < hotels.length;

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <div className="bg-[#FDF8F3] dark:bg-[#0F1419]">
      {/* Hero Section */}
      <section className="relative bg-[#2D1F14] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Hero"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-[#2D1F14]/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Descubre los mejores{" "}
              <span className="text-[#FFB84D]">hoteles</span> de la ciudad
            </h1>
            <p className="text-lg text-[#E8D9C8] mb-8 leading-relaxed">
              Encuentra hospedaje perfecto para tu viaje. Desde hoteles boutique
              hasta resorts de lujo, todos en un solo lugar.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B89A7A]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Buscar por nombre, ciudad o tipo..."
                  className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur rounded-xl text-[#2D1F14] placeholder-[#B89A7A] focus:outline-none focus:ring-2 focus:ring-[#E8850C] shadow-lg"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-4 bg-[#E8850C] hover:bg-[#C46A08] text-white font-medium rounded-xl transition-colors shadow-lg flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Buscar</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-[#1A2028] border-b border-[#E8D9C8] dark:border-[#2D3748]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                label: "Hoteles",
                value: hotelCount > 0 ? `${hotelCount}+` : "120+",
                icon: <HotelIcon className="w-6 h-6" />,
              },
              {
                label: "Resorts",
                value: resortCount > 0 ? `${resortCount}+` : "35+",
                icon: <HotelIcon className="w-6 h-6" />,
              },
              {
                label: "Ciudades",
                value: cityCount > 0 ? `${cityCount}` : "8",
                icon: <Star className="w-6 h-6" />,
              },
              {
                label: "Opiniones",
                value: reviewCount > 0 ? `${reviewCount.toLocaleString()}+` : "10k+",
                icon: <Star className="w-6 h-6" />,
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FFF8F1] dark:bg-[#242B35] text-[#E8850C] mb-3">
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                  {stat.value}
                </p>
                <p className="text-sm text-[#96785A] dark:text-[#64748B]">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-700 dark:text-red-300">
              Error al cargar los datos: {error}
            </p>
          </div>
        </div>
      )}

      {/* Featured Hotels Section */}
      {featuredHotels.length > 0 && (
        <section id="featured-hotels" className="py-16 bg-white dark:bg-[#1A2028]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[#2D1F14] dark:text-[#E2E8F0] flex items-center gap-2">
                <Star className="w-6 h-6 text-[#E8850C]" />
                Hoteles Destacados
              </h2>
              <p className="text-[#96785A] dark:text-[#64748B] mt-1">
                Seleccionados especialmente para ti
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredHotels.map((hotel, index) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <HotelCard hotel={hotel} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Rooms Section */}
      {featuredRooms.length > 0 && (
        <section id="featured-rooms" className="py-16 bg-[#FDF8F3] dark:bg-[#0F1419]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[#2D1F14] dark:text-[#E2E8F0] flex items-center gap-2">
                <Bed className="w-6 h-6 text-[#E8850C]" />
                Habitaciones Destacadas
              </h2>
              <p className="text-[#96785A] dark:text-[#64748B] mt-1">
                Las mejores habitaciones seleccionadas para ti
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <RoomCard room={room} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Explore Section */}
      <section id="explore" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">
                Explora Hospedajes
              </h2>
              <p className="text-[#96785A] dark:text-[#64748B] mt-1">
                Encuentra el lugar perfecto para tu estancia
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1A2028] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#5E4836] dark:text-[#94A3B8] hover:border-[#E8850C] transition-colors"
            >
              <span>Filtros</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={showFilters ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                >
                  {showFilters ? "✕" : "▾"}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-6 bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] space-y-4"
            >
              {/* Type Filter */}
              <div>
                <p className="text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-2">
                  Tipo de Alojamiento
                </p>
                <div className="flex flex-wrap gap-2">
                  {HOTEL_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeFilter(type)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedType === type
                          ? "bg-[#E8850C] text-white"
                          : "bg-[#FDF8F3] dark:bg-[#242B35] text-[#5E4836] dark:text-[#94A3B8] hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748]"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* City Filter */}
              {cities.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-2">
                    Ciudad
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cities.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleCityFilter(city)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          selectedCity === city
                            ? "bg-[#E8850C] text-white"
                            : "bg-[#FDF8F3] dark:bg-[#242B35] text-[#5E4836] dark:text-[#94A3B8] hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748]"
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Type Quick Filter */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            <button
              onClick={() => handleTypeFilter("")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedType === ""
                  ? "bg-[#E8850C] text-white shadow-md shadow-[#E8850C]/20"
                  : "bg-white dark:bg-[#1A2028] text-[#5E4836] dark:text-[#94A3B8] border border-[#E8D9C8] dark:border-[#2D3748] hover:border-[#E8850C]"
              }`}
            >
              Todos
            </button>
            {HOTEL_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeFilter(type)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedType === type
                    ? "bg-[#E8850C] text-white shadow-md shadow-[#E8850C]/20"
                    : "bg-white dark:bg-[#1A2028] text-[#5E4836] dark:text-[#94A3B8] border border-[#E8D9C8] dark:border-[#2D3748] hover:border-[#E8850C]"
                }`}
              >
                {hotelTypeIcons[type]}
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </button>
            ))}
          </div>

          {/* Hotel Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-56 bg-[#E8D9C8] dark:bg-[#2D3748] rounded-t-2xl" />
                  <div className="p-5 bg-white dark:bg-[#1A2028] rounded-b-2xl space-y-3">
                    <div className="h-5 bg-[#E8D9C8] dark:bg-[#2D3748] rounded w-3/4" />
                    <div className="h-4 bg-[#E8D9C8] dark:bg-[#2D3748] rounded w-1/2" />
                    <div className="h-4 bg-[#E8D9C8] dark:bg-[#2D3748] rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div
                id="hotel-grid"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {visibleHotels.map((hotel, index) => (
                  <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <HotelCard hotel={hotel} />
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    className="px-8 py-3 bg-white dark:bg-[#1A2028] border border-[#E8D9C8] dark:border-[#2D3748] rounded-xl text-[#5E4836] dark:text-[#94A3B8] font-medium hover:border-[#E8850C] hover:text-[#E8850C] transition-colors"
                  >
                    Cargar más ({hotels.length - displayCount} restantes)
                  </button>
                </div>
              )}
            </>
          )}

          {hotels.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <HotelIcon className="w-16 h-16 mx-auto text-[#D4BEA5] dark:text-[#2D3748] mb-4" />
              <h3 className="text-lg font-medium text-[#5E4836] dark:text-[#94A3B8]">
                No se encontraron hoteles
              </h3>
              <p className="text-sm text-[#96785A] dark:text-[#64748B] mt-1">
                Intenta con otros filtros de busqueda
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
