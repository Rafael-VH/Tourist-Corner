import { Link } from "react-router-dom";
import { Star, MapPin, ArrowRight } from "lucide-react";
import type { Hotel } from "@/domain/entities/Hotel";
import { hotelTypeIcons, amenityIcons } from "@/presentation/utils/iconMaps.tsx";

export function HotelCard({ hotel }: { hotel: Hotel }) {
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
