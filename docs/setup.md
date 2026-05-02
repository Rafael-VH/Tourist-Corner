# Configuración del Entorno

## Requisitos

| Herramienta | Versión mínima |
|-------------|---------------|
| Node.js | 20.x |
| npm | 10.x |
| Git | 2.x |

## Instalación

```bash
# 1. Clonar repositorio
git clone <url-del-repo>
cd Tourist-Corner

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
```

## Variables de Entorno

Editar `.env.local` con las credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### Obtener credenciales de Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Crear o seleccionar un proyecto
3. Settings → API
4. Copiar **Project URL** → `VITE_SUPABASE_URL`
5. Copiar **anon public** → `VITE_SUPABASE_ANON_KEY`

## Comandos Disponibles

```bash
npm run dev          # Servidor de desarrollo (http://localhost:5173)
npm run build        # Compilar para producción
npm run preview      # Vista previa del build de producción
npm run lint         # Ejecutar ESLint
npx tsc --noEmit     # Verificar tipos sin compilar
```

## Estructura del Proyecto

Ver [README.md](./README.md) para el árbol completo de carpetas.

## Supabase — Tablas Requeridas

Para que el proyecto funcione correctamente, la base de datos de Supabase debe tener las siguientes tablas:

### `users`

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK, referencia auth.users |
| `email` | `text` | NO | — | Email del usuario |
| `name` | `text` | NO | — | Nombre completo |
| `avatar_url` | `text` | YES | NULL | URL del avatar |
| `role` | `text` | NO | `'tourist'` | `'tourist'` o `'manager'` |
| `phone` | `text` | YES | NULL | Teléfono |
| `created_at` | `timestamptz` | NO | `now()` | Fecha de creación |

### `hotels`

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | `uuid` | NO | PK |
| `name` | `text` | NO | Nombre del hotel |
| `type` | `text` | NO | `'hotel'`, `'resort'`, `'motel'`, `'residential'` |
| `description` | `text` | NO | Descripción |
| `address` | `text` | NO | Dirección |
| `city` | `text` | NO | Ciudad |
| `phone` | `text` | NO | Teléfono |
| `email` | `text` | NO | Email de contacto |
| `images` | `text[]` | NO | Array de URLs de imágenes |
| `cover_image` | `text` | YES | URL de imagen de portada |
| `rating` | `numeric` | NO | Rating (0-5) |
| `review_count` | `integer` | NO | Número de reseñas |
| `amenities` | `text[]` | NO | Array de comodidades |
| `latitude` | `numeric` | NO | Latitud |
| `longitude` | `numeric` | NO | Longitud |
| `price_range_min` | `numeric` | NO | Precio mínimo |
| `price_range_max` | `numeric` | NO | Precio máximo |
| `manager_id` | `uuid` | NO | ID del manager (FK → users) |
| `created_at` | `timestamptz` | NO | Fecha de creación |
| `updated_at` | `timestamptz` | NO | Fecha de actualización |
| `is_active` | `boolean` | NO | Estado activo/inactivo |

### `rooms`

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | `uuid` | NO | PK |
| `hotel_id` | `uuid` | NO | FK → hotels |
| `name` | `text` | NO | Nombre de la habitación |
| `description` | `text` | NO | Descripción |
| `type` | `text` | NO | Tipo (Suite, Deluxe, Estándar, etc.) |
| `price_per_night` | `numeric` | NO | Precio por noche |
| `capacity` | `integer` | NO | Capacidad de personas |
| `bed_type` | `text` | NO | Tipo de cama |
| `size` | `numeric` | YES | Tamaño en m² |
| `images` | `text[]` | NO | Array de URLs |
| `amenities` | `text[]` | NO | Comodidades de la habitación |
| `status` | `text` | NO | `'available'`, `'occupied'`, `'maintenance'` |
| `is_available` | `boolean` | NO | Disponibilidad |
| `created_at` | `timestamptz` | NO | Fecha de creación |
| `updated_at` | `timestamptz` | NO | Fecha de actualización |

### `room_availability`

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `room_id` | `uuid` | NO | FK → rooms |
| `date` | `date` | NO | Fecha de disponibilidad |
| `is_available` | `boolean` | NO | Disponible o no |
| `price_override` | `numeric` | YES | Precio alternativo |

### `comments`

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | `uuid` | NO | PK |
| `target_id` | `uuid` | NO | ID del hotel o habitación |
| `target_type` | `text` | NO | `'hotel'` o `'room'` |
| `user_id` | `uuid` | NO | FK → users |
| `user_name` | `text` | NO | Nombre del usuario |
| `user_avatar` | `text` | YES | Avatar del usuario |
| `rating` | `integer` | NO | Rating (1-5) |
| `content` | `text` | NO | Contenido del comentario |
| `images` | `text[]` | YES | Imágenes adjuntas |
| `likes` | `integer` | NO | Número de likes |
| `created_at` | `timestamptz` | NO | Fecha de creación |
| `updated_at` | `timestamptz` | NO | Fecha de actualización |

### Supabase Storage

Crear un bucket llamado `avatars` con política pública de lectura para almacenar avatares de usuarios.

## Supabase — Row Level Security (RLS)

Se recomienda configurar las siguientes políticas:

### Tabla `users`
- SELECT: autenticados pueden ver todos los perfiles
- INSERT: solo durante registro
- UPDATE: solo el propio usuario

### Tabla `hotels`
- SELECT: todos pueden ver hoteles activos
- INSERT/UPDATE/DELETE: solo managers

### Tabla `rooms`
- SELECT: todos pueden ver
- INSERT/UPDATE/DELETE: solo el manager del hotel padre

### Tabla `comments`
- SELECT: todos pueden ver
- INSERT: usuarios autenticados
- UPDATE/DELETE: solo el autor
