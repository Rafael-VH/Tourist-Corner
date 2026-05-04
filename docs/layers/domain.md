# Capa de Dominio — `src/domain/`

La capa más interna de la arquitectura. Define **qué** es el negocio sin importar **cómo** se implementa.

**Regla**: No importa de ninguna otra carpeta del proyecto. Es 100% independiente.

## Estructura

```text
src/domain/
├── entities/        # Modelos de datos (interfaces puras)
│   ├── User.ts
│   ├── Hotel.ts
│   ├── Room.ts
│   └── Comment.ts
├── repositories/    # Interfaces de repositorio (contratos)
│   ├── AuthRepository.ts
│   ├── HotelRepository.ts
│   ├── RoomRepository.ts
│   └── CommentRepository.ts
└── usecases/        # Casos de uso (lógica de negocio)
    ├── AuthUseCases.ts
    ├── HotelUseCases.ts
    ├── RoomUseCases.ts
    ├── CommentUseCases.ts
    └── index.ts
```

---

## Entidades (`domain/entities/`)

Las entidades son interfaces TypeScript que definen la estructura de los datos del dominio. No tienen métodos ni lógica.

### `User.ts` — Usuario del sistema

```typescript
type UserRole = 'tourist' | 'manager';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
}
```

También define perfiles especializados:

- `TouristProfile` — Usuario turista con `favoriteHotels?` y `bookingsCount?`
- `ManagerProfile` — Usuario manager con `hotelIds[]` y `subscriptionPlan`

### `Hotel.ts` — Establecimiento hotelero

```typescript
type HotelType = 'hotel' | 'resort' | 'motel' | 'residential';

interface Hotel {
  id: string;
  name: string;
  type: HotelType;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  images: string[];
  coverImage?: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
  latitude: number;
  longitude: number;
  priceRange: { min: number; max: number };
  managerId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

`HotelEssentialInfo` — Versión ligera para listados (sin descripción completa ni coordenadas).

### `Room.ts` — Habitación de hotel

```typescript
type RoomStatus = 'available' | 'occupied' | 'maintenance';

interface Room {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  type: string;
  pricePerNight: number;
  capacity: number;
  bedType: string;
  size?: number;
  images: string[];
  amenities: string[];
  status: RoomStatus;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

`RoomAvailability` — Registro de disponibilidad por fecha.

### `Comment.ts` — Comentario/Reseña

```typescript
type CommentTargetType = 'hotel' | 'room';

interface Comment {
  id: string;
  targetId: string;
  targetType: CommentTargetType;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  content: string;
  images?: string[];
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}
```

`CommentInput` — DTO para crear un nuevo comentario.

---

## Repositorios (`domain/repositories/`)

Interfaces que definen **qué operaciones** se pueden realizar sobre cada entidad. La capa de Data las implementa.

### `AuthRepository.ts`

| Método | Descripción |
| -------- | ------------- |
| `signIn(email, password)` | Iniciar sesión |
| `signUp(email, password, name, role)` | Registrar usuario |
| `signOut()` | Cerrar sesión |
| `getCurrentUser()` | Obtener usuario actual |
| `updateProfile(userId, data)` | Actualizar perfil |
| `uploadAvatar(userId, file)` | Subir avatar |

### `HotelRepository.ts`

| Método | Descripción |
| -------- | ------------- |
| `getAllHotels(filters?)` | Listar hoteles con filtros opcionales |
| `getHotelById(id)` | Obtener hotel por ID |
| `getHotelsByManager(managerId)` | Hoteles de un manager |
| `createHotel(hotel)` | Crear hotel |
| `updateHotel(id, hotel)` | Actualizar hotel |
| `deleteHotel(id)` | Eliminar hotel |
| `getHotelEssentialInfo(id)` | Info resumida para cards |
| `toggleHotelStatus(id)` | Activar/desactivar hotel |

`HotelFilters` — Objeto con filtros opcionales: `city`, `type`, `minPrice`, `maxPrice`, `amenities`, `rating`, `searchQuery`.

### `RoomRepository.ts`

| Método | Descripción |
| -------- | ------------- |
| `getRoomsByHotel(hotelId)` | Habitaciones de un hotel |
| `getRoomById(id)` | Obtener habitación por ID |
| `createRoom(room)` | Crear habitación |
| `updateRoom(id, room)` | Actualizar habitación |
| `deleteRoom(id)` | Eliminar habitación |
| `getRoomAvailability(roomId, start, end)` | Disponibilidad en rango de fechas |
| `updateRoomAvailability(roomId, availability)` | Actualizar disponibilidad |
| `updateRoomStatus(roomId, status)` | Cambiar estado de habitación |

### `CommentRepository.ts`

| Método | Descripción |
| -------- | ------------- |
| `getCommentsByTarget(targetId, targetType)` | Comentarios de hotel o habitación |
| `createComment(input, userId, userName, userAvatar?)` | Crear comentario |
| `updateComment(id, content, rating)` | Editar comentario |
| `deleteComment(id)` | Eliminar comentario |
| `likeComment(id)` | Dar like |
| `getUserComments(userId)` | Comentarios de un usuario |

---

## Casos de Uso (`domain/usecases/`)

Cada caso de uso es una clase que envuelve una operación del repositorio. Tienen un método `execute()`.

### `AuthUseCases.ts`

| Clase | `execute()` params | Retorna |
| ------- | ------------------- | --------- |
| `SignInUseCase` | email, password | `User` |
| `SignUpUseCase` | email, password, name, role | `User` |
| `SignOutUseCase` | — | `void` |
| `GetCurrentUserUseCase` | — | `User \| null` |
| `UpdateProfileUseCase` | userId, data | `User` |
| `UploadAvatarUseCase` | userId, file | `string` (URL) |

### `HotelUseCases.ts`

| Clase | `execute()` params | Retorna |
| ------- | ------------------- | --------- |
| `GetHotelsUseCase` | filters? | `Hotel[]` |
| `GetHotelByIdUseCase` | id | `Hotel \| null` |
| `GetManagerHotelsUseCase` | managerId | `Hotel[]` |
| `CreateHotelUseCase` | hotel | `Hotel` |
| `UpdateHotelUseCase` | id, hotel | `Hotel` |
| `DeleteHotelUseCase` | id | `void` |
| `GetHotelEssentialInfoUseCase` | id | `HotelEssentialInfo \| null` |
| `ToggleHotelStatusUseCase` | id | `boolean` |

### `RoomUseCases.ts`

| Clase | `execute()` params | Retorna |
| ------- | ------------------- | --------- |
| `GetRoomsByHotelUseCase` | hotelId | `Room[]` |
| `GetRoomByIdUseCase` | id | `Room \| null` |
| `CreateRoomUseCase` | room | `Room` |
| `UpdateRoomUseCase` | id, room | `Room` |
| `DeleteRoomUseCase` | id | `void` |
| `GetRoomAvailabilityUseCase` | roomId, startDate, endDate | `RoomAvailability[]` |
| `UpdateRoomAvailabilityUseCase` | roomId, availability | `void` |
| `UpdateRoomStatusUseCase` | roomId, status | `Room` |

### `CommentUseCases.ts`

| Clase | `execute()` params | Retorna |
| ------- | ------------------- | --------- |
| `GetCommentsByTargetUseCase` | targetId, targetType | `Comment[]` |
| `CreateCommentUseCase` | input, userId, userName, userAvatar? | `Comment` |
| `UpdateCommentUseCase` | id, content, rating | `Comment` |
| `DeleteCommentUseCase` | id | `void` |
| `LikeCommentUseCase` | id | `number` (nuevo like count) |
| `GetUserCommentsUseCase` | userId | `Comment[]` |

### `index.ts`

Barrel export que reexporta todos los use cases para importación centralizada.

---

## Cómo Modificar la Capa de Dominio

### Agregar una nueva entidad

1. Crear archivo en `domain/entities/` con la interfaz
2. Crear interfaz de repositorio en `domain/repositories/`
3. Crear casos de uso en `domain/usecases/`
4. Exportar desde el `index.ts` correspondiente

### Agregar un nuevo caso de uso

1. Definir la clase en el archivo de use cases correspondiente
2. Registrar en `core/di/Container.ts`
3. Agregar acción en el store Zustand correspondiente

### Cambiar una entidad

- Si agregas/quitas campos: actualizar la entidad, el repositorio, y el repositorio de Supabase (mapper)
- Si cambias tipos: verificar todas las implementaciones
