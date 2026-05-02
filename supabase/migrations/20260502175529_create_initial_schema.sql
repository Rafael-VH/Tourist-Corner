-- ============================================================
-- TurismoCiudad — Initial Schema Migration
-- ============================================================

-- ============================================================
-- 1. TABLE: users (profiles linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'tourist' CHECK (role IN ('tourist', 'manager')),
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'tourist')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. TABLE: hotels
-- ============================================================
CREATE TABLE IF NOT EXISTS hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hotel', 'resort', 'motel', 'residential')),
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  cover_image TEXT,
  rating NUMERIC NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  price_range_min NUMERIC NOT NULL,
  price_range_max NUMERIC NOT NULL,
  manager_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hotels_updated_at
  BEFORE UPDATE ON hotels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. TABLE: rooms
-- ============================================================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  price_per_night NUMERIC NOT NULL,
  capacity INTEGER NOT NULL,
  bed_type TEXT NOT NULL,
  size NUMERIC,
  images TEXT[] NOT NULL DEFAULT '{}',
  amenities TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. TABLE: room_availability
-- ============================================================
CREATE TABLE IF NOT EXISTS room_availability (
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  price_override NUMERIC,
  PRIMARY KEY (room_id, date)
);

-- ============================================================
-- 5. TABLE: comments
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('hotel', 'room')),
  user_id UUID NOT NULL REFERENCES users(id),
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. ROW LEVEL SECURITY — users
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_all"
  ON users FOR SELECT USING (true);

CREATE POLICY "users_insert_own"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON users FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- 7. ROW LEVEL SECURITY — hotels
-- ============================================================
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hotels_select_active"
  ON hotels FOR SELECT USING (is_active = true);

CREATE POLICY "hotels_select_manager"
  ON hotels FOR SELECT USING (auth.uid() = manager_id);

CREATE POLICY "hotels_insert_manager"
  ON hotels FOR INSERT
  WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "hotels_update_manager"
  ON hotels FOR UPDATE USING (auth.uid() = manager_id);

CREATE POLICY "hotels_delete_manager"
  ON hotels FOR DELETE USING (auth.uid() = manager_id);

-- ============================================================
-- 8. ROW LEVEL SECURITY — rooms
-- ============================================================
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rooms_select_all"
  ON rooms FOR SELECT USING (true);

CREATE POLICY "rooms_insert_manager"
  ON rooms FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT manager_id FROM hotels WHERE id = hotel_id)
  );

CREATE POLICY "rooms_update_manager"
  ON rooms FOR UPDATE USING (
    auth.uid() IN (SELECT manager_id FROM hotels WHERE id = hotel_id)
  );

CREATE POLICY "rooms_delete_manager"
  ON rooms FOR DELETE USING (
    auth.uid() IN (SELECT manager_id FROM hotels WHERE id = hotel_id)
  );

-- ============================================================
-- 9. ROW LEVEL SECURITY — comments
-- ============================================================
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select_all"
  ON comments FOR SELECT USING (true);

CREATE POLICY "comments_insert_auth"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_update_own"
  ON comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "comments_delete_own"
  ON comments FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 10. INDEXES
-- ============================================================
CREATE INDEX idx_hotels_city ON hotels(city);
CREATE INDEX idx_hotels_type ON hotels(type);
CREATE INDEX idx_hotels_manager ON hotels(manager_id);
CREATE INDEX idx_hotels_active ON hotels(is_active);
CREATE INDEX idx_rooms_hotel ON rooms(hotel_id);
CREATE INDEX idx_comments_target ON comments(target_id, target_type);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_room_availability_date ON room_availability(date);

-- ============================================================
-- 11. SEED DATA (development)
-- ============================================================

-- Manager user (password: Manager123!)
-- Note: In real usage, sign up through the app. This seed requires
-- auth.users entry which is normally created via signUp.
-- For local dev with supabase db reset, we insert directly:

INSERT INTO users (id, email, name, role, phone) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'manager@turismociudad.com',
   'Carlos Manager',
   'manager',
   '+591 77712345')
ON CONFLICT (id) DO NOTHING;

-- Tourist user
INSERT INTO users (id, email, name, role, phone) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'turista@turismociudad.com',
   'Maria Turista',
   'tourist',
   '+591 66698765')
ON CONFLICT (id) DO NOTHING;

-- Sample hotel
INSERT INTO hotels (id, name, type, description, address, city, phone, email,
  images, cover_image, rating, review_count, amenities,
  latitude, longitude, price_range_min, price_range_max,
  manager_id, is_active)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Hotel Plaza Grande',
  'hotel',
  'Hotel boutique en el centro histórico con arquitectura colonial renovada. Ofrece una experiencia única con servicio personalizado y vistas panorámicas de la ciudad.',
  'Calle Principal 123, Zona Central',
  'La Paz',
  '+591 2 1234567',
  'info@hotelplaza.com',
  ARRAY[
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
  ],
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  4.5, 128,
  ARRAY['WiFi', 'Restaurante', 'Estacionamiento', 'Gimnasio', 'Spa'],
  -16.5000, -68.1500, 80, 250,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  true
) ON CONFLICT (id) DO NOTHING;

-- Sample rooms
INSERT INTO rooms (id, hotel_id, name, description, type, price_per_night,
  capacity, bed_type, size, images, amenities, status, is_available)
VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
   'Suite Presidencial', 'Suite de lujo con vista panorámica a la ciudad, jacuzzi privado y sala de estar independiente.', 'Suite', 250,
   2, 'King', 45,
   ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
   ARRAY['WiFi', 'Mini Bar', 'Jacuzzi', 'Vista Panoramica', 'Ducha Lluvia'],
   'available', true),

  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
   'Habitación Deluxe', 'Habitación amplia con comodidades premium, balcón privado y decoración elegante.', 'Deluxe', 150,
   2, 'Queen', 30,
   ARRAY['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'],
   ARRAY['WiFi', 'Smart TV', 'Aire Acondicionado', 'Caja Fuerte'],
   'available', true),

  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
   'Habitación Estándar', 'Habitación cómoda y económica, ideal para viajeros solitarios o parejas.', 'Estándar', 80,
   1, 'Double', 20,
   ARRAY['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
   ARRAY['WiFi', 'TV'],
   'available', true)
ON CONFLICT (id) DO NOTHING;

-- Sample comment
INSERT INTO comments (id, target_id, target_type, user_id, user_name, user_avatar,
  rating, content, images, likes)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'hotel',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Maria Turista',
  NULL,
  5,
  'Excelente hotel, la atención fue increíble y las habitaciones muy limpias. Definitivamente volvería.',
  ARRAY[],
  12
) ON CONFLICT (id) DO NOTHING;
