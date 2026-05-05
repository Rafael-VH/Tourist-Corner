import { Link } from "react-router-dom";
import { Star, Bed, Users, ArrowRight } from "lucide-react";
import type { Room } from "@/domain/entities/Room";
import { amenityIcons } from "@/presentation/utils/iconMaps.tsx";

export function RoomCard({ room }: { room: Room }) {
  return (
    <Link
      to={`/room/${room.id}`}
      className="group block bg-white dark:bg-[#1A2028] rounded-2xl overflow-hidden border border-[#E8D9C8] dark:border-[#2D3748] hover:shadow-xl hover:shadow-[#E8850C]/10 hover:border-[#E8850C]/30 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={
            room.images[0] ||
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800"
          }
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-[#2D1F14]/20 group-hover:bg-[#2D1F14]/10 transition-colors" />

        {/* Featured Badge */}
        {room.isFeatured && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-[#E8850C] rounded-lg text-xs font-bold text-white flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-white" />
              Destacada
            </span>
          </div>
        )}

        {/* Price */}
        <div className="absolute bottom-4 right-4">
          <span className="px-4 py-2 bg-white/95 backdrop-blur rounded-xl text-sm font-bold text-[#E8850C]">
            ${room.pricePerNight}
            <span className="text-[#96785A] font-normal">/noche</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-[#2D1F14] dark:text-[#E2E8F0] group-hover:text-[#E8850C] transition-colors">
          {room.name}
        </h3>

        <p className="text-sm text-[#96785A] dark:text-[#64748B] mt-1">
          {room.type}
        </p>

        <div className="flex items-center gap-4 mt-3 text-sm text-[#5E4836] dark:text-[#94A3B8]">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {room.capacity} personas
          </span>
          <span className="flex items-center gap-1.5">
            <Bed className="w-4 h-4" />
            {room.bedType}
          </span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mt-4">
          {room.amenities.slice(0, 4).map((amenity) => (
            <span
              key={amenity}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFF8F1] dark:bg-[#242B35] rounded-lg text-xs text-[#5E4836] dark:text-[#94A3B8]"
            >
              {amenityIcons[amenity] || null}
              {amenity}
            </span>
          ))}
          {room.amenities.length > 4 && (
            <span className="px-2.5 py-1 text-xs text-[#96785A] dark:text-[#64748B]">
              +{room.amenities.length - 4}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#F5EDE3] dark:border-[#2D3748]">
          <span
            className={`text-sm ${room.isAvailable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {room.isAvailable ? "Disponible" : "No disponible"}
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
