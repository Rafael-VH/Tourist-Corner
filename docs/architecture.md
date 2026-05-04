# Arquitectura — Clean Architecture

## Principios Fundamentales

### 1. Separación por Responsabilidades

Cada capa tiene una responsabilidad única y no debe mezclar conceptos de otras capas:

| Capa | Qué hace | Qué NO hace |
| ------ | ---------- | ------------- |
| **Domain** | Define qué es el negocio (entidades, reglas, contratos) | No sabe nada de Supabase, React, ni UI |
| **Data** | Implementa cómo se persisten/recuperan los datos | No tiene lógica de negocio, solo traduce |
| **Core** | Orquesta dependencias y configura la app | No tiene lógica de negocio ni UI |
| **Presentation** | Muestra datos al usuario y captura interacciones | No accede directamente a Supabase |

### 2. Regla de Dependencia (Dependency Rule)

```text
Presentation  →  Core  →  Data  →  Domain
    ↓              ↓         ↓        ↓
  solo importa  solo importa  solo importa  NO importa nada
  Core + Domain  Data + Domain  Domain       (capa más interna)
```

**Prohibido**:

- `domain/` NO importa de `data/`, `core/`, ni `presentation/`
- `data/` NO importa de `core/` ni `presentation/`
- `core/` NO importa de `presentation/`

### 3. Inversión de Dependencias (DIP)

El **Domain** define interfaces (contratos). El **Data** las implementa. El **Core** inyecta las implementaciones en los casos de uso.

```text
┌─────────────────────────────────────────────┐
│  Domain (define contratos)                   │
│  interface HotelRepository { ... }           │
└──────────────┬──────────────────────────────┘
               │ implementa
┌──────────────▼──────────────────────────────┐
│  Data (implementa contratos)                 │
│  class SupabaseHotelRepository              │
│    implements HotelRepository { ... }        │
└──────────────┬──────────────────────────────┘
               │ inyecta en
┌──────────────▼──────────────────────────────┐
│  Core (DI Container)                         │
│  const repo = new SupabaseHotelRepository()  │
│  const uc = new GetHotelsUseCase(repo)       │
└──────────────┬──────────────────────────────┘
               │ usa
┌──────────────▼──────────────────────────────┐
│  Presentation (Zustand Stores + React)       │
│  const { getHotels } = getContainer()        │
│  await getHotels.execute()                   │
└─────────────────────────────────────────────┘
```

## Patrones Utilizados

### Repository Pattern

Cada entidad tiene un repositorio definido en el domain y una implementación en data:

| Entidad | Interfaz (domain) | Implementación (data) |
| --------- | ------------------- | ---------------------- |
| User/Auth | `AuthRepository` | `SupabaseAuthRepository` |
| Hotel | `HotelRepository` | `SupabaseHotelRepository` |
| Room | `RoomRepository` | `SupabaseRoomRepository` |
| Comment | `CommentRepository` | `SupabaseCommentRepository` |

### Use Case Pattern

Cada caso de uso es una clase con un método `execute()`:

```typescript
// Domain define
export class GetHotelsUseCase {
  constructor(private hotelRepository: HotelRepository) {}
  async execute(filters?: HotelFilters): Promise<Hotel[]> {
    return this.hotelRepository.getAllHotels(filters);
  }
}
```

### Dependency Injection Container

Singleton que crea todas las dependencias una vez y las reutiliza:

```typescript
// core/di/Container.ts
const container = createContainer(); // crea repos + use cases
export function getContainer() { return container; }
```

### Estado Global con Zustand

Los stores Zustand son la capa más externa de la arquitectura. Llaman a los use cases del container:

```typescript
// presentation/providers/useHotelStore.ts
export const useHotelStore = create((set, get) => ({
  fetchHotels: async (filters) => {
    const { getHotels } = getContainer();
    const hotels = await getHotels.execute(filters);
    set({ hotels });
  },
}));
```

## Reglas TypeScript

### `erasableSyntaxOnly` habilitado

No se permiten **parameter properties** en constructores. Debe declararse la propiedad y asignarse explícitamente:

```typescript
// ❌ INCORRECTO
class GetHotelsUseCase {
  constructor(private hotelRepository: HotelRepository) {}
}

// ✅ CORRECTO
class GetHotelsUseCase {
  private hotelRepository: HotelRepository;
  constructor(hotelRepository: HotelRepository) {
    this.hotelRepository = hotelRepository;
  }
}
```

### Tipos de dominio

Las entidades son interfaces puras, NO clases con métodos. La lógica va en los casos de uso.

## Cómo Agregar una Nueva Entidad

1. **Domain**: Crear entidad en `domain/entities/`
2. **Domain**: Crear interfaz de repositorio en `domain/repositories/`
3. **Domain**: Crear casos de uso en `domain/usecases/`
4. **Data**: Crear implementación del repositorio en `data/repositories/`
5. **Core**: Registrar repositorio y casos de uso en `core/di/Container.ts`
6. **Presentation**: Crear store Zustand en `presentation/providers/`
7. **Presentation**: Crear página en `presentation/pages/`
