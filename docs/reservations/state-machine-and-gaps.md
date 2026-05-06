# Reserva: Maquina de Estados y Analisis de Flujos

## 1. Estado Actual — Maquina de Estados

### Estados existentes
| Estado | Descripcion | Quien puede transicionar |
|--------|-------------|-------------------------|
| `pending` | Reservacion creada, esperando confirmacion del manager | Manager (accept/cancel), Client (cancel) |
| `accepted` | Manager confirmo la reservacion | Manager (complete/cancel) |
| `completed` | Estadia finalizada exitosamente | Terminal (no sale) |
| `cancelled` | Reservacion cancelada por cualquiera de las partes | Terminal (no sale) |

### Transiciones actuales implementadas
```
[CREATE]       pending
[PENDING] → [ACCEPTED]    (updateReservationStatus)
[PENDING] → [CANCELLED]   (cancelReservation)
[ACCEPTED] → [COMPLETED]  (updateReservationStatus)
[ACCEPTED] → [CANCELLED]  (cancelReservation)
```

### Diagrama de estados actual
```
            ┌──────────┐
            │  CREATE  │
            └─────┬────┘
                  │
                  ▼
            ┌──────────┐     accept      ┌───────────┐
      ┌─────┤ PENDING  ├────────────────>│ ACCEPTED  │
      │     └──────────┘                 └─────┬─────┘
      │           │                            │
  cancel│         │cancel                 cancel│
      │           ▼                            ▼
      │     ┌──────────┐     complete    ┌───────────┐
      └────>│CANCELLED │<────────────────│ COMPLETED │
            └──────────┘                 └───────────┘
```

---

## 2. Gaps Identificados — Lo que FALTA

### 2.1 Check-in Logico
**Problema**: No existe distincion entre "reservacion aceptada" y "huesped hizo check-in". El campo `checkIn` en la entidad es solo una fecha planificada, no un evento registrado.

**Necesario**: 
- Campo `actualCheckIn` (Date | null) en la entidad Reservation
- Transicion: `accepted` → `checked-in`
- UseCase: `CheckInUseCase`
- Quien lo ejecuta: Manager en el dashboard o self-check-in del cliente

### 2.2 Check-out Logico
**Problema**: El estado `completed` se usa para todo, pero no hay registro de cuando ocurrio el check-out real ni si hubo extension.

**Necesario**:
- Campo `actualCheckOut` (Date | null) en la entidad Reservation
- Transicion: `checked-in` → `checked-out` (que luego puede auto-transicionar a `completed`)
- UseCase: `CheckOutUseCase`
- Quien lo ejecuta: Manager

### 2.3 Extension de Reserva
**Problema**: No hay forma de extender una reservacion existente. Si el huesped quiere quedarse mas dias, tendria que crear otra reserva.

**Necesario**:
- Metodo `extendReservation(id, newCheckOut)` en el repositorio
- Validacion de disponibilidad de la habitacion para las nuevas fechas
- Recalculo de `totalPrice`
- Transicion: `accepted` o `checked-in` → misma estado (solo actualiza fechas)

### 2.4 No-Show
**Problema**: Si el huesped nunca llega y la fecha de check-in pasa, la reservacion queda en `pending` o `accepted` indefinidamente.

**Necesario**:
- Estado `no-show` (opcional, o puede ser un flag `isNoShow`)
- Job automatico o accion manual del manager para marcar no-show
- Posible penalizacion para el cliente (registro historico)
- Transicion: `pending` → `no-show` o `accepted` → `no-show`
- Liberar la habitacion automaticamente

### 2.5 Cancelacion con Penalizacion
**Problema**: `cancelReservation` solo cambia el estado. No calcula penalizaciones ni reembolsos.

**Necesario**:
- Campo `cancelledAt` (Date | null)
- Campo `cancellationReason` (string | null)
- Campo `cancellationFee` (number | null)
- Campo `refundAmount` (number | null)
- Reglas de cancelacion:
  - > 7 dias antes del check-in: sin penalizacion (100% reembolso)
  - 3-7 dias antes: 50% penalizacion
  - < 3 dias o ya accepted: sin reembolso
- Transicion: cualquier estado activo → `cancelled`

### 2.6 Calculo Automatico de Precio
**Problema**: `createReservation` inserta `total_price: 0` hardcoded. El precio nunca se calcula automaticamente.

**Necesario**:
- El `CreateReservationUseCase` debe:
  1. Buscar la habitacion por ID
  2. Calcular noches = checkOut - checkIn
  3. totalPrice = noches × pricePerNight
  4. Validar que checkOut > checkIn
  5. Validar disponibilidad de la habitacion para esas fechas

### 2.7 Validacion de Disponibilidad
**Problema**: No hay validacion de que la habitacion este disponible para las fechas seleccionadas. Dos clientes pueden reservar la misma habitacion para las mismas fechas.

**Necesario**:
- Query que busque reservas existentes con overlapping de fechas para la misma habitacion
- Bloquear creacion si hay conflicto
- Estados a considerar: `pending`, `accepted`, `checked-in` (las `cancelled` y `completed` no bloquean)

### 2.8 Notificaciones
**Problema**: No hay sistema de notificaciones para cambios de estado.

**Necesario** (fuera de scope inmediato pero importante):
- Email al cliente cuando: reserva creada, aceptada, cancelada, check-in confirmado
- Notificacion al manager cuando: nueva reserva pending, check-in proximo

### 2.9 Historial y Audit Trail
**Problema**: Solo hay `createdAt` y `updatedAt`. No hay registro de quien cambio el estado ni cuando.

**Necesario**:
- Tabla `reservation_status_history`: id, reservation_id, from_status, to_status, changed_by, changed_at, reason

---

## 3. Estados Propuestos — Maquina de Estados Completa

### Nuevos estados
| Estado | Descripcion |
|--------|-------------|
| `checked-in` | Huesped llego y hizo check-in |
| `checked-out` | Huesped hizo check-out (transitorio hacia completed) |
| `no-show` | Huesped nunca llego |

### Transiciones completas propuestas
```
[CREATE] → pending

pending → accepted       (manager acepta)
pending → cancelled      (cliente o manager cancela)
pending → no-show        (fecha de check-in paso sin arrival)

accepted → checked-in    (huesped hace check-in)
accepted → cancelled      (cancelacion despues de aceptar)
accepted → no-show        (huesped no llego en fecha)
accepted → accepted       (extension de fechas - mismo estado)

checked-in → checked-out  (huesped hace check-out)
checked-in → no-show      (teorico, no deberia pasar)

checked-out → completed   (finalizacion automatica con calculo de cargos)

cancelled → cancelled     (terminal)
completed → completed     (terminal)
no-show → no-show         (terminal)
```

### Diagrama de estados propuesto
```
                    ┌──────────┐
                    │  CREATE  │
                    └─────┬────┘
                          │
                          ▼
                    ┌──────────┐
              ┌─────┤ PENDING  ├─────┐
              │     └──────────┘     │
          accept       │cancel    no-show
              │        ▼             │
              ▼     ┌──────────┐     ▼
        ┌──────────┐│CANCELLED │<────┤
        │ ACCEPTED │└──────────┘     │
        └─────┬────┘                 │
              │                      │
    check-in  │       cancel         │
              ▼                      │
        ┌──────────┐                 │
        │CHECKED-IN├─────────────────┘
        └─────┬────┘
              │
  check-out   │
              ▼
        ┌───────────┐
        │CHECKED-OUT│
        └─────┬─────┘
              │ auto-complete + calculate
              ▼
        ┌───────────┐
        │ COMPLETED │
        └───────────┘
```

---

## 4. Casos de Uso a Implementar

| # | Caso de Uso | Actor | Estado Origen | Estado Destino | Prioridad |
|---|-------------|-------|---------------|----------------|-----------|
| 1 | `CheckIn` | Manager/Client | accepted | checked-in | ALTA |
| 2 | `CheckOut` | Manager | checked-in | checked-out | ALTA |
| 3 | `ExtendReservation` | Manager | accepted/checked-in | mismo estado | ALTA |
| 4 | `MarkNoShow` | Manager/Sistema | pending/accepted | no-show | MEDIA |
| 5 | `CancelWithPolicy` | Client/Manager | pending/accepted | cancelled | ALTA |
| 6 | `CalculateTotalPrice` | Sistema | any | any (update price) | ALTA |
| 7 | `ValidateAvailability` | Sistema | - | - (validation) | ALTA |
| 8 | `AutoCompleteAfterCheckout` | Sistema | checked-out | completed | MEDIA |
| 9 | `AutoNoShowAfterCheckInDate` | Sistema (cron) | pending | no-show | BAJA |
| 10 | `RecordStatusHistory` | Sistema | any | any (side effect) | MEDIA |

---

## 5. Cambios en la Entidad Reservation

```typescript
export interface Reservation {
  // ... existente
  status: ReservationStatus;
  
  // NUEVOS CAMPOS
  actualCheckIn: Date | null;      // Cuando el huesped realmente llego
  actualCheckOut: Date | null;     // Cuando el huesped realmente se fue
  cancellationReason: string | null;
  cancellationFee: number | null;
  refundAmount: number | null;
  cancelledAt: Date | null;
  noShowFlag: boolean;             // Flag explicito de no-show
}

export type ReservationStatus =
  | 'pending'
  | 'accepted'
  | 'checked-in'
  | 'checked-out'
  | 'completed'
  | 'cancelled'
  | 'no-show';
```

---

## 6. Archivos de Referencia

- `src/domain/entities/Reservation.ts` — Entidad y DTOs
- `src/domain/repositories/ReservationRepository.ts` — Interfaz del repositorio
- `src/data/repositories/SupabaseReservationRepository.ts` — Implementacion Supabase
- `src/domain/usecases/ReservationUseCases.ts` — Casos de uso actuales
- `src/presentation/pages/client/HotelDetailPage.tsx` — Creacion de reservas (cliente)
- `src/presentation/pages/client/ClientReservationsPage.tsx` — Vista de reservas (cliente)
- `src/presentation/pages/manager/ManagerDashboardPage.tsx` — Dashboard del manager
