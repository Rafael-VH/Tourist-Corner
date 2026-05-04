# Capa de Presentación — `src/presentation/`

UI de la aplicación: componentes React, stores Zustand y widgets reutilizables.

## Estructura

```text
src/presentation/
├── pages/           # Vistas completas (7 páginas)
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── HotelDetailPage.tsx
│   ├── RoomDetailPage.tsx
│   ├── ManagerDashboardPage.tsx
│   ├── HotelManagementPage.tsx
│   └── RoomManagementPage.tsx
├── widgets/         # Componentes de layout
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   └── Footer.tsx
└── providers/       # Stores Zustand (estado global)
    ├── useAuthStore.ts
    ├── useHotelStore.ts
    ├── useRoomStore.ts
    └── useCommentStore.ts
```

---

## Stores (`presentation/providers/`)

### `useAuthStore.ts` — Estado de autenticación

**State**:

```typescript
{
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
```

**Actions**:

| Action | Params | Descripción |
| -------- | -------- | ------------- |
| `setUser` | user | Setea usuario + actualiza isAuthenticated |
| `setLoading` | boolean | Controla loading state |
| `setError` | string | Setea mensaje de error |
| `clearError` | — | Limpia error |
| `signIn` | email, password | Llama `container.signIn.execute()` |
| `signUp` | email, password, name, role | Llama `container.signUp.execute()` |
| `signOut` | — | Llama `container.signOut.execute()` + limpia estado |

### `useHotelStore.ts` — Estado de hoteles

**State**:

```typescript
{
  hotels: Hotel[];
  selectedHotel: Hotel | null;
  isLoading: boolean;
  error: string | null;
  filters: HotelFilters;
}
```

**Actions**:

| Action | Params | Descripción |
| -------- | -------- | ------------- |
| `fetchHotels` | filters? | Lista todos los hoteles |
| `fetchHotelById` | id | Obtiene hotel y lo setea como selected |
| `fetchManagerHotels` | managerId | Lista hoteles de un manager |
| `updateHotel` | id, hotel | Actualiza hotel y refresca listas |
| `createHotel` | hotel | Crea hotel y lo agrega a la lista |
| `deleteHotel` | id | Elimina hotel y lo quita de la lista |
| `toggleHotelStatus` | id | Activa/desactiva hotel |
| `setFilters` | filters | Mergea filtros actuales con nuevos |

### `useRoomStore.ts` — Estado de habitaciones

**State**:

```typescript
{
  rooms: Room[];
  selectedRoom: Room | null;
  isLoading: boolean;
  error: string | null;
}
```

**Actions**:

| Action | Params | Descripción |
| -------- | -------- | ------------- |
| `fetchRoomsByHotel` | hotelId | Lista habitaciones de un hotel |
| `fetchRoomById` | id | Obtiene habitación |
| `updateRoom` | roomId, room | Actualiza habitación |
| `updateRoomStatus` | roomId, status | Cambia estado (available/occupied/maintenance) |
| `createRoom` | room | Crea nueva habitación |
| `deleteRoom` | roomId | Elimina habitación |

### `useCommentStore.ts` — Estado de comentarios

**State**:

```typescript
{
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
}
```

**Actions**:

| Action | Params | Descripción |
| -------- | -------- | ------------- |
| `fetchCommentsByTarget` | targetId, targetType | Carga comentarios de hotel o room |
| `addComment` | input, userId, userName, userAvatar? | Crea comentario y lo agrega a la lista |
| `likeComment` | commentId | Incrementa likes en el comentario |

---

## Páginas (`presentation/pages/`)

### `HomePage.tsx` — Página principal

**Funcionalidad**:

- Hero con barra de búsqueda
- Estadísticas (hoteles, resorts, ciudades, opiniones)
- Grid de hoteles con filtros por tipo y ciudad
- Cards de hotel con imagen, rating, precio, amenities
- Estado de carga con skeletons
- Mensaje "no encontrado" cuando no hay resultados

**Dependencias**: `useHotelStore`

### `LoginPage.tsx` — Login y Registro

**Funcionalidad**:

- Tabs para login/registro
- Selector de rol (turista/manager)
- Formulario de login con email + password
- Formulario de registro con nombre, email, teléfono, password
- Toggle de visibilidad de contraseña
- Validación de campos requeridos
- Redirección tras login exitoso

**Dependencias**: `useAuthStore`

### `HotelDetailPage.tsx` — Detalle de Hotel

**Funcionalidad**:

- Galería de imágenes con thumbnails
- Info del hotel (nombre, dirección, rating, precio)
- Descripción completa
- Amenities con iconos
- Lista de habitaciones del hotel
- Sección de comentarios con formulario (rating + texto)
- Like en comentarios

**Dependencias**: `useHotelStore`, `useRoomStore`, `useCommentStore`

### `RoomDetailPage.tsx` — Detalle de Habitación

**Funcionalidad**:

- Galería de imágenes
- Info de la habitación (nombre, capacidad, cama, precio)
- Amenities de la habitación
- Comentarios de la habitación
- Link de vuelta al hotel

**Dependencias**: `useRoomStore`, `useHotelStore`, `useCommentStore`

### `ManagerDashboardPage.tsx` — Panel del Manager

**Funcionalidad**:

- Stats dinámicos (hoteles, habitaciones, reseñas, ingreso estimado)
- Lista de establecimientos del manager
- Tabla resumen con info de cada hotel
- Acciones rápidas (nuevo hotel, nueva habitación)
- Gráfico de rendimiento placeholder
- Selección de rango de tiempo (sem/mes/año)

**Dependencias**: `useAuthStore`, `useHotelStore`, `useRoomStore`

### `HotelManagementPage.tsx` — Gestión de Hotel

**Funcionalidad**:

- Info del hotel con modo edición inline
- Galería de imágenes con botón para eliminar
- Lista de habitaciones con links a edición
- Botones: Ver Público, Editar, Guardar, Cancelar
- Formulario de edición (nombre, descripción, teléfono, email, dirección)

**Dependencias**: `useHotelStore`, `useRoomStore`

### `RoomManagementPage.tsx` — Gestión de Habitación

**Funcionalidad**:

- Formulario de edición (nombre, descripción, precio, capacidad, cama, tamaño)
- Galería de imágenes
- Toggle de disponibilidad (status)
- Sidebar con resumen y comodidades
- Botones: Editar, Guardar, Cancelar

**Dependencias**: `useRoomStore`

---

## Widgets (`presentation/widgets/`)

### `Layout.tsx`

Wrapper de la aplicación. Envuelve todas las rutas protegidas con:

- `Navbar` en la parte superior
- `<main>` con `<Outlet />` (contenido de la ruta activa)
- `Footer` en la parte inferior

### `Navbar.tsx`

Barra de navegación sticky con:

- Logo con link a home
- Links de navegación (Inicio, Explorar, Destacados)
- Link al Panel (solo para managers)
- Toggle de modo oscuro
- Avatar y nombre del usuario autenticado
- Botones de Login/Registro (no autenticado)
- Botón de Logout (autenticado)
- Menú hamburguesa para mobile (con animación)

### `Footer.tsx`

Footer con 4 columnas:

- Brand (logo + descripción)
- Links de exploración
- Links para negocios
- Contacto (email, teléfono, ubicación)
- Copyright en la parte inferior

---

## Componentes UI (`components/ui/`)

55 componentes de shadcn/ui pre-instalados. Son componentes base reutilizables que no tienen lógica de negocio. Se importan en las páginas y widgets según necesidad.

| Categoría | Componentes |
| ----------- | ------------ |
| Formularios | `input`, `form`, `label`, `checkbox`, `select`, `radio-group`, `slider`, `switch`, `textarea`, `calendar`, `input-otp` |
| Layout | `card`, `separator`, `tabs`, `collapsible`, `accordion`, `resizable`, `scroll-area` |
| Navegación | `breadcrumb`, `pagination`, `navigation-menu`, `sidebar`, `menubar`, `dropdown-menu`, `command` |
| Feedback | `alert`, `alert-dialog`, `dialog`, `toast` (sonner), `tooltip`, `popover`, `hover-card`, `sheet`, `drawer`, `empty`, `progress`, `skeleton`, `spinner` |
| Data display | `table`, `chart`, `badge`, `avatar`, `kbd` |
| Buttons | `button`, `button-group`, `toggle`, `toggle-group`, `button-variants`, `toggle-variants` |
| Overlays | `context-menu`, `aspect-ratio`, `carousel` |

---

## Hooks y Utilidades

### `hooks/use-mobile.ts`

Hook que detecta si la pantalla es menor a 768px. Usa `window.matchMedia` con listener reactivo.

### `lib/utils.ts`

Función `cn()` — combina clases de Tailwind con `clsx` + `tailwind-merge` para resolver conflictos de clases CSS.

---

## Cómo Modificar la Capa de Presentación

### Agregar una nueva página

1. Crear archivo en `presentation/pages/`
2. Crear store Zustand si necesita estado nuevo (en `presentation/providers/`)
3. Agregar ruta en `core/router/AppRouter.tsx`
4. Agregar link de navegación si aplica (en Navbar)

### Modificar un store existente

- Agregar estado al interface del store
- Agregar acción que llame al use case correspondiente del container
- Actualizar el componente que usa el store

### Cambiar estilos

- Usar clases de Tailwind directamente en los componentes
- Los colores están en `core/theme/theme.ts` como referencia
- Los componentes shadcn/ui se pueden personalizar en `components/ui/`
