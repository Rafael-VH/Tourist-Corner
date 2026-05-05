import {
  Wifi,
  Waves,
  UtensilsCrossed,
  Car,
  Dumbbell,
  Wine,
  Bath,
  Hotel as HotelIcon,
  TreePine,
  Home,
  Building,
} from "lucide-react";
import type { HotelType } from "@/domain/entities/Hotel";

export const hotelTypeIcons: Record<HotelType, React.ReactNode> = {
  hotel: <HotelIcon className="w-4 h-4" />,
  resort: <TreePine className="w-4 h-4" />,
  motel: <Home className="w-4 h-4" />,
  residential: <Building className="w-4 h-4" />,
};

export const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-3.5 h-3.5" />,
  Piscina: <Waves className="w-3.5 h-3.5" />,
  Restaurante: <UtensilsCrossed className="w-3.5 h-3.5" />,
  Estacionamiento: <Car className="w-3.5 h-3.5" />,
  Gimnasio: <Dumbbell className="w-3.5 h-3.5" />,
  Bar: <Wine className="w-3.5 h-3.5" />,
  Spa: <Bath className="w-3.5 h-3.5" />,
};

export const HOTEL_TYPES: HotelType[] = ["hotel", "resort", "motel", "residential"];
