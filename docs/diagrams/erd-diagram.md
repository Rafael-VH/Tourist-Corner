# Diagrama Entidad-Relacion (ERD) — Tourist Corner

## Tablas de Supabase

```mermaid
erDiagram
    users {
        uuid id PK
        text email UK
        text name
        text avatar_url
        varchar role "client | owner | admin"
        text phone
        timestamp created_at
    }

    hotels {
        uuid id PK
        text name
        varchar type "hotel | resort | motel | residential"
        text description
        text address
        text city
        text phone
        text email
        text[] images
        text cover_image
        float rating
        int review_count
        text[] amenities
        float latitude
        float longitude
        jsonb price_range
        uuid manager_id FK
        uuid branch_of FK
        boolean is_main
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    room_types {
        uuid id PK
        uuid hotel_id FK
        text name
        text description
        timestamp created_at
    }

    services {
        uuid id PK
        uuid hotel_id FK
        text name
        text description
        text icon
        timestamp created_at
    }

    rooms {
        uuid id PK
        uuid hotel_id FK
        uuid room_type_id FK
        text name
        text description
        text type
        int price_per_night
        int capacity
        text bed_type
        float size
        text[] images
        text[] amenities
        varchar status "available | occupied | maintenance"
        boolean is_available
        timestamp created_at
        timestamp updated_at
    }

    reservations {
        uuid id PK
        uuid room_id FK
        uuid user_id FK
        text guest_name
        text guest_email
        text guest_phone
        date check_in
        date check_out
        int total_price
        varchar status "pending | accepted | completed | cancelled"
        text notes
        timestamp created_at
        timestamp updated_at
    }

    comments {
        uuid id PK
        uuid target_id
        varchar target_type "hotel | room"
        uuid user_id FK
        text user_name
        text user_avatar
        int rating
        text content
        text[] images
        int likes
        timestamp created_at
        timestamp updated_at
    }

    registration_codes {
        uuid id PK
        text code UK
        boolean used
        text used_by FK
        timestamp used_at
        timestamp created_at
    }

    featured_hotels {
        uuid id PK
        uuid hotel_id FK
        boolean is_featured
        timestamp created_at
    }

    users ||--o{ hotels : "manages (owner)"
    hotels ||--o{ rooms : "contains"
    hotels ||--o{ room_types : "defines"
    hotels ||--o{ services : "offers"
    hotels ||--o{ comments : "receives"
    hotels ||--o{ featured_hotels : "can be"
    hotels }o--o| hotels : "branches of"

    rooms ||--o{ reservations : "has"
    rooms ||--o{ comments : "receives"

    users ||--o{ reservations : "makes"
    users ||--o{ comments : "writes"
    users ||--o{ registration_codes : "uses"

    room_types ||--o{ rooms : "categorized as"
```

## Descripcion de Tablas

### users

Almacena los usuarios del sistema con su rol (`client`, `owner`, `admin`). Vinculada con Supabase Auth.

### hotels

Propiedades hoteleras. Soporta sucursales mediante `branchOf` (autorelacion). `isMain` indica si es la sucursal principal.

### room_types

Tipos de habitacion definidos por cada hotel (ej: "Suite Deluxe", "Habitacion Estandar").

### services

Servicios adicionales del hotel (ej: "Spa", "Lavanderia").

### rooms

Habitaciones individuales dentro de un hotel. `status` indica disponibilidad operativa, `isAvailable` indica si se puede reservar.

### reservations

Solicitudes de reserva con flujo de estados: `pending → accepted → completed` o `pending → cancelled`.

### comments

Opiniones y calificaciones (1-5 estrellas) sobre hoteles o habitaciones.

### registration_codes

Codigos de invitacion requeridos para registro como `owner`. Generados por el admin.

### featured_hotels

Hoteles destacados mostrados en la pagina principal. Gestionados por el admin.

## Reglas de Integridad (RLS)

- **users**: Solo el propio usuario puede leer/editar su perfil. Admin puede ver todos.
- **hotels**: Owner solo ve sus hoteles. Admin y clientes ven todos los activos.
- **rooms**: Owner ve rooms de sus hoteles. Clientes ven rooms disponibles.
- **reservations**: Owner ve reservas de sus hoteles. Cliente ve sus propias reservas.
- **comments**: Todos leen. Solo el autor puede editar/eliminar su comentario.
- **registration_codes**: Solo admin puede crear y gestionar.
- **featured_hotels**: Solo admin puede gestionar.
