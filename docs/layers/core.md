# Capa Core — `src/core/`

Utilidades transversales que toda la aplicación necesita: inyección de dependencias, routing y tema visual.

## Estructura

```text
src/core/
├── di/
│   └── Container.ts     # Dependency Injection Container (singleton)
├── router/
│   └── AppRouter.tsx    # Configuración de rutas + ProtectedRoute
└── theme/
    └── theme.ts          # Tokens de diseño (colores, sombras, bordes)
```

---

## DI Container (`core/di/Container.ts`)

**Patrón**: Singleton que crea todas las dependencias una sola vez y las mantiene en memoria.

### Flujo de creación

```text
1. Crear repositorios (new SupabaseXxxRepository())
     ↓
2. Crear use cases inyectando repositorios
     ↓
3. Retornar objeto con todos los use cases como propiedades
```

### Use cases disponibles

```typescript
const container = getContainer();

// Auth
container.signIn.execute(email, password)
container.signUp.execute(email, password, name, role)
container.signOut.execute()
container.getCurrentUser.execute()
container.updateProfile.execute(userId, data)
container.uploadAvatar.execute(userId, file)

// Hotels
container.getHotels.execute(filters)
container.getHotelById.execute(id)
container.getManagerHotels.execute(managerId)
container.createHotel.execute(hotel)
container.updateHotel.execute(id, hotel)
container.deleteHotel.execute(id)
container.getHotelEssentialInfo.execute(id)
container.toggleHotelStatus.execute(id)

// Rooms
container.getRoomsByHotel.execute(hotelId)
container.getRoomById.execute(id)
container.createRoom.execute(room)
container.updateRoom.execute(id, room)
container.deleteRoom.execute(id)
container.getRoomAvailability.execute(roomId, start, end)
container.updateRoomAvailability.execute(roomId, availability)
container.updateRoomStatus.execute(roomId, status)

// Comments
container.getCommentsByTarget.execute(targetId, targetType)
container.createComment.execute(input, userId, userName, userAvatar?)
container.updateComment.execute(id, content, rating)
container.deleteComment.execute(id)
container.likeComment.execute(id)
container.getUserComments.execute(userId)
```

### `resetContainer()`

Resetea el singleton (útil para testing).

### Cómo agregar un nuevo use case al Container

1. Importar el use case del domain
2. Crear el repositorio si es una nueva entidad
3. Instanciar el use case con su repositorio
4. Agregar al objeto retornado por `createContainer()`

---

## Router (`core/router/AppRouter.tsx`)

Configura las rutas de la aplicación usando React Router v7 con rutas protegidas.

### Rutas públicas

| Ruta | Componente | Descripción |
| ------ | ----------- | ------------- |
| `/login` | `LoginPage` | Login y registro |
| `/` | `HomePage` | Listado de hoteles |
| `/hotel/:id` | `HotelDetailPage` | Detalle de hotel |
| `/room/:id` | `RoomDetailPage` | Detalle de habitación |

### Rutas protegidas (requiere autenticación + rol manager)

| Ruta | Componente | Descripción |
| ------ | ----------- | ------------- |
| `/dashboard` | `ManagerDashboardPage` | Panel del manager |
| `/dashboard/hotel/:id` | `HotelManagementPage` | Gestión de hotel |
| `/dashboard/room/:id` | `RoomManagementPage` | Gestión de habitación |

### Componente `ProtectedRoute`

```typescript
<ProtectedRoute requireManager={true}>
  <ManagerDashboardPage />
</ProtectedRoute>
```

- Si no está autenticado → redirige a `/login`
- Si `requireManager=true` y el usuario no es manager → redirige a `/`

### Cómo agregar una nueva ruta

1. Importar el componente página
2. Agregar `<Route>` dentro de `<Routes>`
3. Si es protegida, envolver con `<ProtectedRoute>`

---

## Theme (`core/theme/theme.ts`)

Define tokens de diseño consistentes para toda la aplicación. Exporta un objeto inmutable (`as const`).

### Paleta de colores

**Primary (naranja cálido)** — Color principal de marca

| Token | Light | Uso |
| ------- | ------- | ----- |
| `primary.50` | `#FFF8F1` | Fondos muy claros |
| `primary.500` | `#E8850C` | Botones primarios, acentos |
| `primary.600` | `#C46A08` | Hover states |

**Secondary (terracotta)** — Color secundario

| Token           | Light     | Uso                  |
|-----------------|-----------|----------------------|
| `secondary.500` | `#E85D35` | Elementos de énfasis |

**Warm neutrals** — Escala de grises cálidos

| Token | Light | Uso |
| ------- | ------- | ----- |
| `warm.50` | `#FDF8F3` | Background general |
| `warm.100` | `#F5EDE3` | Bordes sutiles |
| `warm.500` | `#96785A` | Texto secundario |
| `warm.700` | `#5E4836` | Texto principal |

**Dark mode** — Colores específicos para modo oscuro

| Token | Dark | Uso |
| ------- | ------ | ----- |
| `dark.bg` | `#0F1419` | Fondo general |
| `dark.surface` | `#1A2028` | Cards, superficies |
| `dark.accent` | `#FF9F1C` | Acentos en dark mode |

### Bordes y sombras

| Token | Valor | Uso |
| ------- | ------- | ----- |
| `borderRadius.md` | `12px` | Cards, inputs |
| `borderRadius.xl` | `24px` | Contenedores grandes |
| `shadows.warm` | `rgba(232,133,12,0.15)` | Sombras con tinte naranja |

### Transiciones

| Token                 | Valor              | Uso                    |
|-----------------------|--------------------|------------------------|
| `transitions.default` | `0.2s ease-in-out` | Hover, toggle          |
| `transitions.slow`    | `0.3s ease-in-out` | Animaciones de entrada |
