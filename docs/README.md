# TurismoCiudad — Documentación del Proyecto

Plataforma web de descubrimiento y gestión de alojamientos turísticos (hoteles, resorts, moteles y residenciales) con sistema de autenticación, panel de gestión para administradores y comentarios de usuarios.

## Tecnologías

| Categoría | Tecnología |
| ----------- | ----------- |
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Routing | React Router v7 |
| State | Zustand |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| UI | Tailwind CSS + shadcn/ui |
| Animaciones | Framer Motion |
| Iconos | Lucide React |

## Estructura de Carpetas

```text
Tourist-Corner/
├── docs/                       # Documentación del proyecto (esta carpeta)
│   ├── README.md               # Índice general
│   ├── architecture.md         # Arquitectura y principios
│   ├── setup.md                # Configuración del entorno
│   ├── integration-guide.md    # Guía para conectar datos reales
│   └── layers/                 # Documentación por capa
│       ├── domain.md           # Capa de Dominio
│       ├── data.md             # Capa de Datos
│       ├── core.md             # Capa Core (DI, Router, Theme)
│       └── presentation.md     # Capa de Presentación
├── src/
│   ├── domain/                 # Capa de Dominio (empresas, reglas de negocio)
│   │   ├── entities/           # Modelos de dominio (User, Hotel, Room, Comment)
│   │   ├── repositories/       # Interfaces de repositorio (contratos)
│   │   └── usecases/           # Casos de uso (lógica de negocio pura)
│   ├── data/                   # Capa de Datos (infraestructura externa)
│   │   ├── datasources/        # Conexión a Supabase
│   │   └── repositories/       # Implementaciones concretas de repositorios
│   ├── core/                   # Capa Core (utilidades transversales)
│   │   ├── di/                 # Inyección de dependencias (DI Container)
│   │   ├── router/             # Configuración de rutas
│   │   └── theme/              # Tokens de diseño (colores, sombras)
│   ├── presentation/           # Capa de Presentación (UI)
│   │   ├── pages/              # Vistas/páginas completas
│   │   ├── widgets/            # Componentes reutilizables (Navbar, Footer, Layout)
│   │   └── providers/          # Stores Zustand (estado global)
│   ├── components/ui/          # Componentes base de shadcn/ui (55 componentes)
│   ├── hooks/                  # Hooks personalizados
│   └── lib/                    # Utilidades generales
├── .env.example                # Variables de entorno de ejemplo
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Arquitectura

El proyecto sigue **Clean Architecture** (Arquitectura Limpia) con separación estricta de capas:

```text
Presentation  →  Core  →  Data  →  Domain
(UI/Stores)      (DI)     (Supabase)  (Entities/Contracts)
```

**Regla de dependencia**: Las capas internas NO conocen las capas externas. El Domain es completamente independiente.

| Capa | Responsabilidad | Depende de |
| ------ | ---------------- | ------------ |
| **Domain** | Entidades, interfaces de repositorio, casos de uso | Nada (capa más interna) |
| **Data** | Implementaciones de repositorios con Supabase | Domain |
| **Core** | DI Container, Router, Theme | Data + Domain |
| **Presentation** | Componentes React, stores Zustand, páginas | Core + Domain |

## Guía Rápida de Lectura

1. **[architecture.md](./architecture.md)** — Principios de arquitectura, reglas de dependencia, patrones
2. **[setup.md](./setup.md)** — Configuración del entorno de desarrollo
3. **[layers/domain.md](./layers/domain.md)** — Entidades, interfaces de repositorio y casos de uso
4. **[layers/data.md](./layers/data.md)** — Conexión a Supabase y repositorios concretos
5. **[layers/core.md](./layers/core.md)** — DI Container, routing y tema visual
6. **[layers/presentation.md](./layers/presentation.md)** — Páginas, widgets y stores Zustand
7. **[integration-guide.md](./integration-guide.md)** — Cómo conectar datos reales de Supabase (pasos detallados)

## Flujo de una petición típica

```text
Usuario hace clic en "Iniciar Sesión"
  ↓
LoginPage (presentation/pages)
  ↓
useAuthStore (presentation/providers) — llama signIn()
  ↓
getContainer() → signIn use case (core/di)
  ↓
SignInUseCase.execute() (domain/usecases)
  ↓
SupabaseAuthRepository.signIn() (data/repositories)
  ↓
supabase.auth.signInWithPassword() (data/datasources)
  ↓
Supabase (servicio externo)
```
