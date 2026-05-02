# Capa de Datos — `src/data/`

Implementa las interfaces del Domain conectándose a Supabase. Traduce entre el formato de base de datos (snake_case) y las entidades del dominio (camelCase).

## Estructura

```
src/data/
├── datasources/
│   └── SupabaseClient.ts    # Cliente de Supabase + manejo de errores
└── repositories/
    ├── index.ts              # Barrel export
    ├── SupabaseAuthRepository.ts
    ├── SupabaseHotelRepository.ts
    ├── SupabaseRoomRepository.ts
    └── SupabaseCommentRepository.ts
```

---

## Datasource (`data/datasources/`)

### `SupabaseClient.ts`

Configura el cliente de Supabase usando variables de entorno:

```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

**Exports**:
- `supabase` — Cliente configurado con persistencia de sesión y auto-refresh de tokens
- `handleSupabaseError(error)` — Función que lanza una excepción con el mensaje del error

**Variables de entorno requeridas** (ver `.env.example`):
- `VITE_SUPABASE_URL` — URL del proyecto Supabase
- `VITE_SUPABASE_ANON_KEY` — Clave pública anon

---

## Repositorios (`data/repositories/`)

Cada repositorio implementa la interfaz correspondiente del domain y traduce entre:
- **Entidades del dominio** (camelCase, tipos TypeScript)
- **Registros de Supabase** (snake_case, tipos de PostgreSQL)

### `SupabaseAuthRepository.ts`

Implementa `AuthRepository`.

**Métodos**:

| Método | Operación Supabase | Notas |
|--------|-------------------|-------|
| `signIn()` | `auth.signInWithPassword()` + `getCurrentUser()` | Obtiene perfil de tabla `users` después del login |
| `signUp()` | `auth.signUp()` + insert en tabla `users` | Crea registro en `users` con `id`, `email`, `name`, `role` |
| `signOut()` | `auth.signOut()` | — |
| `getCurrentUser()` | `auth.getUser()` + select de `users` | Join implícito entre auth y tabla users |
| `updateProfile()` | update en `users` | Actualiza campos del perfil |
| `uploadAvatar()` | `storage.from('avatars').upload()` | Sube a `avatars/{userId}/avatar.ext` |

**Helper privado**: `mapToUser(authUser, profile)` — Combina datos de auth con perfil de la tabla.

### `SupabaseHotelRepository.ts`

Implementa `HotelRepository`.

**Mappers**:
- `mapToHotel(record)` → `Hotel` — snake_case → camelCase
- `mapToRecord(hotel)` → `Partial<HotelRecord>` — camelCase → snake_case para insert/update

**Métodos clave**:

| Método | Lógica |
|--------|--------|
| `getAllHotels()` | Query dinámica con filtros opcionales (city, type, price, rating, search). Siempre filtra `is_active = true` |
| `getHotelById()` | Select single por ID |
| `getHotelsByManager()` | Filtra por `manager_id` |
| `createHotel()` | Insert + select returning |
| `updateHotel()` | Campos individuales + `updated_at` automático |
| `deleteHotel()` | Delete por ID |
| `getHotelEssentialInfo()` | Select de columnas específicas + count de habitaciones |
| `toggleHotelStatus()` | Lee `is_active` actual, invierte, actualiza con timestamp |

**Interfaz interna `HotelRecord`**: Define la forma de los datos tal como vienen de Supabase (snake_case).

### `SupabaseRoomRepository.ts`

Implementa `RoomRepository`.

**Mappers**:
- `mapToRoom(record)` → `Room`
- `mapToRecord(room)` → `Partial<RoomRecord>`
- `mapToAvailability(record)` → `RoomAvailability`

**Métodos clave**:

| Método | Lógica |
|--------|--------|
| `getRoomsByHotel()` | Filtra por `hotel_id` |
| `getRoomById()` | Select single por ID |
| `createRoom()` | Insert + select returning |
| `updateRoom()` | Campos individuales + `updated_at` |
| `deleteRoom()` | Delete por ID |
| `getRoomAvailability()` | Rango de fechas en `room_availability` |
| `updateRoomAvailability()` | Upsert de registros de disponibilidad |
| `updateRoomStatus()` | Actualiza `status` + `is_available` simultáneamente |

### `SupabaseCommentRepository.ts`

Implementa `CommentRepository`.

**Mapper**: `mapToComment(record)` → `Comment`

**Métodos clave**:

| Método | Lógica |
|--------|--------|
| `getCommentsByTarget()` | Filtra por `target_id` + `target_type`, ordena por `created_at DESC` |
| `createComment()` | Insert con todos los campos + `likes: 0` + timestamps |
| `updateComment()` | Actualiza `content`, `rating`, `updated_at` |
| `deleteComment()` | Delete por ID |
| `likeComment()` | Lee likes actuales, incrementa, actualiza (NOTA: no atómico, considerar RPC) |
| `getUserComments()` | Filtra por `user_id`, ordena DESC |

---

## Cómo Modificar la Capa de Datos

### Cambiar a otro proveedor de base de datos

1. Crear nuevo repositorio (ej. `FirebaseHotelRepository.ts`)
2. Implementar la interfaz del domain (`HotelRepository`)
3. Registrar en `core/di/Container.ts` reemplazando el repositorio de Supabase
4. No tocar domain ni presentation

### Agregar un nuevo repositorio

1. Crear archivo en `data/repositories/`
2. Implementar la interfaz del domain correspondiente
3. Exportar desde `data/repositories/index.ts`
4. Registrar en `core/di/Container.ts`

### Agregar un nuevo campo a una entidad

1. Agregar en la entidad del domain (`domain/entities/`)
2. Agregar en el `HotelRecord`/`RoomRecord` del data
3. Actualizar `mapToXxx()` y `mapToRecord()` en el repositorio
4. Si es para update, agregar en la lógica de `updateXxx()`
5. Crear migración SQL en Supabase

### Consideraciones de rendimiento

- `likeComment` hace read + write separado → considerar función RPC de Supabase para hacerlo atómico
- `getHotelEssentialInfo` hace 2 queries separadas → podría optimizarse con join
- Los repositorios no implementan paginación → agregar `limit`/`offset` cuando crezca el dataset
