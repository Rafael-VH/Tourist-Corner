import { MapPin, Mail, Phone, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[#2D1F14] dark:bg-[#0F1419] border-t border-[#5E4836]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#E8850C] flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Turismo<span className="text-[#E8850C]">Ciudad</span>
              </span>
            </Link>
            <p className="text-sm text-[#D4BEA5] leading-relaxed">
              Descubre los mejores hoteles, resorts y alojamientos de la ciudad. Tu proxima aventura comienza aqui.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Explorar</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-[#D4BEA5] hover:text-[#FFB84D] transition-colors">Inicio</Link></li>
              <li><Link to="/" className="text-sm text-[#D4BEA5] hover:text-[#FFB84D] transition-colors">Hoteles</Link></li>
              <li><Link to="/" className="text-sm text-[#D4BEA5] hover:text-[#FFB84D] transition-colors">Resorts</Link></li>
              <li><Link to="/" className="text-sm text-[#D4BEA5] hover:text-[#FFB84D] transition-colors">Residenciales</Link></li>
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Para Negocios</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-sm text-[#D4BEA5] hover:text-[#FFB84D] transition-colors">Registra tu Hotel</Link></li>
              <li><Link to="/login" className="text-sm text-[#D4BEA5] hover:text-[#FFB84D] transition-colors">Panel de Gestion</Link></li>
              <li><Link to="/login" className="text-sm text-[#D4BEA5] hover:text-[#FFB84D] transition-colors">Iniciar Sesion</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-[#D4BEA5]">
                <Mail className="w-4 h-4 text-[#E8850C]" />
                info@turismociudad.com
              </li>
              <li className="flex items-center gap-2 text-sm text-[#D4BEA5]">
                <Phone className="w-4 h-4 text-[#E8850C]" />
                +591 2 1234567
              </li>
              <li className="flex items-center gap-2 text-sm text-[#D4BEA5]">
                <MapPin className="w-4 h-4 text-[#E8850C]" />
                La Paz, Bolivia
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-[#5E4836]/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#96785A] dark:text-[#64748B]">
            &copy; 2024 TurismoCiudad. Todos los derechos reservados.
          </p>
          <p className="flex items-center gap-1 text-xs text-[#96785A] dark:text-[#64748B]">
            Hecho con <Heart className="w-3 h-3 text-[#E8850C] fill-[#E8850C]" /> para viajeros
          </p>
        </div>
      </div>
    </footer>
  );
}
