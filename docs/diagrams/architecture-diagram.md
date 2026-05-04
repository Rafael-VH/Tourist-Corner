# Diagrama de Arquitectura — Tourist Corner

## Arquitectura Clean Architecture + DDD

```mermaid
graph TB
    subgraph Presentation["Presentation Layer (src/presentation)"]
        P1[Pages: LoginPage, HomePage,<br/>HotelDetailPage, Dashboard, etc]
        P2[Components: UI (shadcn/ui),<br/>Formularios, Modales]
        P3[Widgets: Navbar, Layout, Sidebar]
        P4[Providers/Stores: Zustand<br/>(useAuthStore, useHotelStore, etc)]
    end

    subgraph Core["Core Layer (src/core)"]
        C1[DI Container]
        C2[Router: AppRouter]
        C3[Guards: ProtectedRoute]
    end

    subgraph Data["Data Layer (src/data)"]
        D1[Repositories: Supabase implementations]
        D2[DataSources: SupabaseClient]
        D3[DTOs: CreateReservationDto,<br/>CommentInput, etc]
    end

    subgraph Domain["Domain Layer (src/domain)"]
        DM1[Entities: User, Hotel, Room,<br/>Reservation, Comment]
        DM2[UseCases: SignIn, SignUp,<br/>CreateReservation, etc]
        DM3[Repository Interfaces:<br/>AuthRepository, HotelRepository, etc]
    end

    subgraph External["External Services"]
        E1[(Supabase Database<br/>PostgreSQL)]
        E2[Supabase Auth]
        E3[Supabase Storage]
        E4[Supabase Realtime]
    end

    P1 --> P4
    P1 --> C2
    P2 --> P4
    P4 --> C1
    C1 --> DM2
    DM2 --> DM3
    D1 -.-> DM3
    D1 --> D2
    D2 --> E1
    D2 --> E2
    D2 --> E3

    classDef presentation fill:#e8d5c4,stroke:#5e4836
    classDef core fill:#c4d5e8,stroke:#36485e
    classDef data fill:#d5e8c4,stroke:#485e36
    classDef domain fill:#f0c4c4,stroke:#5e3636
    classDef external fill:#d5c4e8,stroke:#48365e

    class P1,P2,P3,P4 presentation
    class C1,C2,C3 core
    class D1,D2,D3 data
    class DM1,DM2,DM3 domain
    class E1,E2,E3,E4 external
```

## Dependencias entre Capas

```text
Presentation  ───depende───▶  Core
Presentation  ───depende───▶  Data (via Stores)
Core          ───depende───▶  Domain (UseCases, Entities)
Data          ───implementa──▶ Domain (Repository Interfaces)
Domain        ───NO depende de nadie (capa mas interna)
```

## Flujo de Datos

```text
Usuario → Pages → Stores → DI Container → UseCases → Repositories → Supabase
                ↑                                                        ↓
                ←────────────── Actualizacion de Estado ←────────────────┘
```

## Estructura de Directorios

```text
src/
├── core/                    # Framework-agnostic core
│   ├── di/                  # Dependency Injection Container
│   ├── router/              # React Router config + Guards
│   └── lib/                 # Shared utilities (cn, etc)
│
├── domain/                  # Business rules (NO dependencias externas)
│   ├── entities/            # User, Hotel, Room, Reservation, Comment
│   ├── repositories/        # Interfaces (contratos)
│   └── usecases/            # Casos de uso (SignIn, CreateReservation, etc)
│
├── data/                    # Data access layer
│   ├── datasources/         # SupabaseClient
│   └── repositories/        # Supabase implementations
│
├── presentation/            # UI layer
│   ├── pages/               # Route-level components
│   │   ├── admin/           # AdminDashboardPage
│   │   ├── client/          # HomePage, HotelDetailPage, RoomDetailPage
│   │   └── manager/         # Owner dashboard, CRUD pages
│   ├── components/          # Reusable UI (shadcn/ui)
│   ├── widgets/             # Navbar, Layout, Sidebar
│   └── providers/           # Zustand stores
│
└── components/ui/           # shadcn/ui component library
```
