# Guía de Integración — Conectar Datos Reales de Supabase

Este documento explica paso a paso cómo pasar del estado actual (código listo pero sin datos reales) a una aplicación completamente funcional con Supabase.

---

## Paso 1: Crear Proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear una cuenta
2. Click en **New Project**
3. Configurar:
   - **Name**: TouristCorner (o el que prefieras)
   - **Database Password**: guardar en lugar seguro
   - **Region**: elegir la más cercana a tus usuarios
4. Esperar ~2 minutos a que se cree

---

## Paso 2: Configurar Variables de Entorno

```bash
cp .env.example .env.local
```

Editar `.env.local`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Obtener las credenciales en: Supabase Dashboard → Settings → API

---

## Paso 3: Crear Tablas en Supabase

### Opción A: SQL Editor (recomendado)

Ir a Supabase → SQL Editor y ejecutar los siguientes scripts:

#### Tabla `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'tourist' CHECK (role IN ('tourist', 'manager')),
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para crear usuario automáticamente al registrarse
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### Tabla `hotels`

```sql
CREATE TABLE hotels (
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

-- Trigger para actualizar updated_at
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
```

#### Tabla `rooms`

```sql
CREATE TABLE rooms (
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
```

#### Tabla `room_availability`

```sql
CREATE TABLE room_availability (
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  price_override NUMERIC,
  PRIMARY KEY (room_id, date)
);
```

#### Tabla `comments`

```sql
CREATE TABLE comments (
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
```

---

## Paso 4: Configurar Row Level Security (RLS)

```sql
-- === USERS ===
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver perfiles"
  ON users FOR SELECT USING (true);

CREATE POLICY "Solo el propio usuario puede actualizar"
  ON users FOR UPDATE USING (auth.uid() = id);

-- === HOTELS ===
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos ven hoteles activos"
  ON hotels FOR SELECT USING (is_active = true);

CREATE POLICY "Managers pueden crear hoteles"
  ON hotels FOR INSERT
  WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Managers pueden editar sus hoteles"
  ON hotels FOR UPDATE USING (auth.uid() = manager_id);

CREATE POLICY "Managers pueden borrar sus hoteles"
  ON hotels FOR DELETE USING (auth.uid() = manager_id);

-- === ROOMS ===
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver habitaciones"
  ON rooms FOR SELECT USING (true);

CREATE POLICY "Managers del hotel pueden crear habitaciones"
  ON rooms FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT manager_id FROM hotels WHERE id = hotel_id)
  );

CREATE POLICY "Managers del hotel pueden editar habitaciones"
  ON rooms FOR UPDATE USING (
    auth.uid() IN (SELECT manager_id FROM hotels WHERE id = hotel_id)
  );

CREATE POLICY "Managers del hotel pueden borrar habitaciones"
  ON rooms FOR DELETE USING (
    auth.uid() IN (SELECT manager_id FROM hotels WHERE id = hotel_id)
  );

-- === COMMENTS ===
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver comentarios"
  ON comments FOR SELECT USING (true);

CREATE POLICY "Usuarios autenticados pueden crear comentarios"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Solo el autor puede editar comentarios"
  ON comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Solo el autor puede borrar comentarios"
  ON comments FOR DELETE USING (auth.uid() = user_id);
```

---

## Paso 5: Crear Storage Bucket para Avatares

1. Ir a Supabase → Storage
2. Click en **New Bucket**
3. Name: `avatars`
4. **Public**: ✅ Sí (para que las URLs sean accesibles)
5. Ejecutar esta política en SQL Editor:

```sql
CREATE POLICY "Cualquiera puede ver avatares"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Usuarios autenticados pueden subir avatares"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Usuarios pueden actualizar su propio avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Paso 6: Crear Función RPC para Likes Atómicos

El repositorio actual hace read + write separado para `likeComment`. Para hacerlo atómico:

```sql
CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_likes INTEGER;
BEGIN
  UPDATE comments
  SET likes = likes + 1, updated_at = now()
  WHERE id = comment_id
  RETURNING likes INTO new_likes;
  RETURN new_likes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Luego en `SupabaseCommentRepository.ts`, cambiar `likeComment`:

```typescript
async likeComment(id: string): Promise<number> {
  const { data, error } = await supabase
    .rpc('increment_comment_likes', { comment_id: id });

  if (error) handleSupabaseError(error);
  return data;
}
```

---

## Paso 7: Insertar Datos de Prueba (Seed)

```sql
-- Crear un manager de prueba
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'manager@turismociudad.com',
  crypt('Manager123!', gen_salt('bf')),
  now(),
  '{"name": "Carlos Manager", "role": "manager"}'
);

INSERT INTO users (id, email, name, role) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'manager@turismociudad.com',
  'Carlos Manager',
  'manager'
);

-- Crear un hotel de prueba
INSERT INTO hotels (id, name, type, description, address, city, phone, email,
  images, cover_image, rating, review_count, amenities,
  latitude, longitude, price_range_min, price_range_max,
  manager_id, is_active)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Hotel Plaza Grande',
  'hotel',
  'Hotel boutique en el centro histórico con arquitectura colonial.',
  'Calle Principal 123',
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
  '00000000-0000-0000-0000-000000000001',
  true
);

-- Crear habitaciones de prueba
INSERT INTO rooms (id, hotel_id, name, description, type, price_per_night,
  capacity, bed_type, size, images, amenities, status, is_available)
VALUES
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111',
   'Suite Presidencial', 'Suite de lujo con vista panorámica', 'Suite', 250,
   2, 'King', 45,
   ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
   ARRAY['WiFi', 'Mini Bar', 'Jacuzzi', 'Vista Panoramica'],
   'available', true),

  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   'Habitación Deluxe', 'Habitación amplia con comodidades premium', 'Deluxe', 150,
   2, 'Queen', 30,
   ARRAY['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'],
   ARRAY['WiFi', 'Smart TV', 'Aire Acondicionado'],
   'available', true),

  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111',
   'Habitación Estándar', 'Habitación cómoda y económica', 'Estándar', 80,
   1, 'Double', 20,
   ARRAY['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
   ARRAY['WiFi', 'TV'],
   'available', true);
```

---

## Paso 8: Probar la Aplicación

```bash
npm run dev
```

1. Ir a `http://localhost:5173`
2. Ver el hotel de prueba en la página principal
3. Registrarse como turista o manager
4. Si es manager: ir al Dashboard → Panel de Gestión
5. Ver el hotel de prueba con sus habitaciones

---

## Qué Hacer Si Algo No Funciona

### Error "relation does not exist"

- Verificar que las tablas estén creadas en Supabase
- Ejecutar los scripts SQL del Paso 3

### Error de autenticación

- Verificar que el trigger `handle_new_user` esté creado
- Revisar que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` sean correctos

### Error "permission denied" (RLS)

- Verificar que RLS esté habilitado en cada tabla
- Revisar las políticas del Paso 4
- Para debug temporal: `ALTER TABLE users DISABLE ROW LEVEL SECURITY;` (SOLO en desarrollo)

### Error "bucket not found" para avatares

- Crear el bucket `avatars` en Storage (Paso 5)
- Verificar las políticas del bucket

---

## Próximos Pasos Después de la Integración

1. **Paginación**: Agregar `limit`/`offset` a `getAllHotels` para listas grandes
2. **Búsqueda full-text**: Usar FTS de PostgreSQL para búsquedas más rápidas
3. **Índices**: Agregar índices en `hotels(city)`, `rooms(hotel_id)`, `comments(target_id, target_type)`
4. **Imágenes reales**: Integrar upload de imágenes de hoteles/habitaciones a Supabase Storage
5. **Sistema de reservas**: Crear tablas `bookings` y `booking_items`
6. **Notificaciones**: Usar Supabase Realtime para notificaciones en vivo
7. **Analytics**: Agregar tracking de vistas y conversiones
