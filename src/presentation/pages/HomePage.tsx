import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useHotelStore } from '@/presentation/providers/useHotelStore';
import type { Hotel } from '@/domain/entities/Hotel';
import type { HotelType } from '@/domain/entities/Hotel';
import {
  Search,
  MapPin,
  Star,
  Hotel as HotelIcon,
  TreePine,
  Home,
  Building,
  ArrowRight,
  Filter,
  X,
  Wifi,
  Waves,
  UtensilsCrossed,
  Car,
  Dumbbell,
  Wine,
  Bath,
} from 'lucide-react';

const hotelTypeIcons: Record<HotelType, React.ReactNode> = {
  hotel: <HotelIcon className="w-4 h-4" />,
  resort: <TreePine className="w-4 h-4" />,
  motel: <Home className="w-4 h-4" />,
  residential: <Building className="w-4 h-4" />,
};

const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="w-3.5 h-3.5" />,
  'Piscina': <Waves className="w-3.5 h-3.5" />,
  'Restaurante': <UtensilsCrossed className="w-3.5 h-3.5" />,
  'Estacionamiento': <Car className="w-3.5 h-3.5" />,
  'Gimnasio': <Dumbbell className="w-3.5 h-3.5" />,
  'Bar': <Wine className="w-3.5 h-3.5" />,
  'Spa': <Bath className="w-3.5 h-3.5" />,
};

export function HomePage() {
  const { hotels, fetchHotels, isLoading, filters, setFilters } = useHotelStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleSearch = () => {
    setFilters({ searchQuery: searchQuery || undefined });
    fetchHotels({ ...filters, searchQuery: searchQuery || undefined });
  };

  const handleTypeFilter = (type: string) => {
    const newType = selectedType === type ? '' : type;
    setSelectedType(newType);
    setFilters({ type: newType || undefined });
    fetchHotels({ ...filters, type: newType || undefined });
  };

  const handleCityFilter = (city: string) => {
    const newCity = selectedCity === city ? '' : city;
    setSelectedCity(newCity);
    setFilters({ city: newCity || undefined });
    fetchHotels({ ...filters, city: newCity || undefined });
  };

  const cities = [...new Set(hotels.map((h) => h.city))];
  const types: HotelType[] = ['hotel', 'resort', 'motel', 'residential'];

  return (
    <div className="bg-[#FDF8F3] dark:bg-[#0F1419]">
      {/* Hero Section */}
      <section className="relative bg-[#2D1F14] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400"
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
              Descubre los mejores{' '}
              <span className="text-[#FFB84D]">hoteles</span> de la ciudad
            </h1>
            <p className="text-lg text-[#E8D9C8] mb-8 leading-relaxed">
              Encuentra hospedaje perfecto para tu viaje. Desde hoteles boutique hasta resorts de lujo, 
              todos en un solo lugar.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B89A7A]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
              { label: 'Hoteles', value: '120+', icon: <HotelIcon className="w-6 h-6" /> },
              { label: 'Resorts', value: '35+', icon: <TreePine className="w-6 h-6" /> },
              { label: 'Ciudades', value: '8', icon: <MapPin className="w-6 h-6" /> },
              { label: 'Opiniones', value: '10k+', icon: <Star className="w-6 h-6" /> },
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
                <p className="text-2xl font-bold text-[#2D1F14] dark:text-[#E2E8F0]">{stat.value}</p>
                <p className="text-sm text-[#96785A] dark:text-[#64748B]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
              <Filter className="w-4 h-4" />
              Filtros
              {showFilters ? <X className="w-4 h-4" /> : null}
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-6 bg-white dark:bg-[#1A2028] rounded-2xl border border-[#E8D9C8] dark:border-[#2D3748] space-y-4"
            >
              {/* Type Filter */}
              <div>
                <p className="text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-2">Tipo de Alojamiento</p>
                <div className="flex flex-wrap gap-2">
                  {types.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeFilter(type)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedType === type
                          ? 'bg-[#E8850C] text-white'
                          : 'bg-[#FDF8F3] dark:bg-[#242B35] text-[#5E4836] dark:text-[#94A3B8] hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748]'
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
                  <p className="text-sm font-medium text-[#5E4836] dark:text-[#94A3B8] mb-2">Ciudad</p>
                  <div className="flex flex-wrap gap-2">
                    {cities.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleCityFilter(city)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          selectedCity === city
                            ? 'bg-[#E8850C] text-white'
                            : 'bg-[#FDF8F3] dark:bg-[#242B35] text-[#5E4836] dark:text-[#94A3B8] hover:bg-[#FFF8F1] dark:hover:bg-[#2D3748]'
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
              onClick={() => handleTypeFilter('')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedType === ''
                  ? 'bg-[#E8850C] text-white shadow-md shadow-[#E8850C]/20'
                  : 'bg-white dark:bg-[#1A2028] text-[#5E4836] dark:text-[#94A3B8] border border-[#E8D9C8] dark:border-[#2D3748] hover:border-[#E8850C]'
              }`}
            >
              Todos
            </button>
            {types.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeFilter(type)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedType === type
                    ? 'bg-[#E8850C] text-white shadow-md shadow-[#E8850C]/20'
                    : 'bg-white dark:bg-[#1A2028] text-[#5E4836] dark:text-[#94A3B8] border border-[#E8D9C8] dark:border-[#2D3748] hover:border-[#E8850C]'
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
              {[1, 2, 3].map((i) => (
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
            <div id="featured" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel, index) => (
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

function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <Link
      to={`/hotel/${hotel.id}`}
      className="group block bg-white dark:bg-[#1A2028] rounded-2xl overflow-hidden border border-[#E8D9C8] dark:border-[#2D3748] hover:shadow-xl hover:shadow-[#E8850C]/10 hover:border-[#E8850C]/30 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={hotel.coverImage || hotel.images[0]}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-[#2D1F14]/20 group-hover:bg-[#2D1F14]/10 transition-colors" />
        
        {/* Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-lg text-xs font-medium text-[#5E4836] flex items-center gap-1.5">
            {hotelTypeIcons[hotel.type]}
            {hotel.type.charAt(0).toUpperCase() + hotel.type.slice(1)}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-[#E8850C] rounded-lg text-xs font-bold text-white flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-white" />
            {hotel.rating}
          </span>
        </div>

        {/* Price */}
        <div className="absolute bottom-4 right-4">
          <span className="px-4 py-2 bg-white/95 backdrop-blur rounded-xl text-sm font-bold text-[#E8850C]">
            ${hotel.priceRange.min}
            <span className="text-[#96785A] font-normal">/noche</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0] group-hover:text-[#E8850C] transition-colors">
          {hotel.name}
        </h3>
        
        <div className="flex items-center gap-1 mt-1.5 text-[#96785A] dark:text-[#64748B]">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{hotel.city}</span>
        </div>

        <p className="text-sm text-[#96785A] dark:text-[#64748B] mt-2.5 line-clamp-2 leading-relaxed">
          {hotel.description}
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mt-4">
          {hotel.amenities.slice(0, 4).map((amenity) => (
            <span
              key={amenity}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFF8F1] dark:bg-[#242B35] rounded-lg text-xs text-[#5E4836] dark:text-[#94A3B8]"
            >
              {amenityIcons[amenity] || null}
              {amenity}
            </span>
          ))}
          {hotel.amenities.length > 4 && (
            <span className="px-2.5 py-1 text-xs text-[#96785A] dark:text-[#64748B]">
              +{hotel.amenities.length - 4}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#F5EDE3] dark:border-[#2D3748]">
          <span className="text-sm text-[#96785A] dark:text-[#64748B]">
            {hotel.reviewCount} opiniones
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-[#E8850C] group-hover:gap-2 transition-all">
            Ver detalles
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
