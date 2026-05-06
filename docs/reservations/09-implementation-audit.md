# Auditoria de Reservaciones — Implementado vs No Implementado

## Metodologia
Se comparo el codigo fuente (`src/`), las migraciones de Supabase (`supabase/migrations/`), y la documentacion en `docs/reservations/` para determinar que esta implementado y que no.

---

## 1. Entidad Reservation (`src/domain/entities/Reservation.ts`)

### Campos en la entidad (TypeScript)
| Campo | Tipo | DB Column | Implementado? |
|-------|------|-----------|---------------|
| `id` | string | `id uuid` | SI |
| `roomId` | string | `room_id uuid` | SI |
| `userId` | string \| null | `user_id uuid` | SI (agregado en migration 20260508) |
| `guestName` | string | `guest_name text` | SI |
| `guestEmail` | string | `guest_email text` | SI |
| `guestPhone` | string \| null | `guest_phone text` | SI |
| `checkIn` | Date | `check_in date` | SI |
| `checkOut` | Date | `check_out date` | SI |
| `totalPrice` | number | `total_price numeric` | SI (columna existe) |
| `status` | 4 estados | `status text CHECK` | SI |
| `notes` | string \| null | `notes text` | SI |
| `createdAt` | Date | `created_at timestamptz` | SI |
| `updatedAt` | Date | `updated_at timestamptz` | SI |

### Campos FALTANTES (documentados en docs pero NO en codigo)
| Campo | Estado en docs | Realidad |
|-------|---------------|----------|
| `actualCheckIn` | Documentado como nuevo | NO EXISTE en DB ni en entidad |
| `actualCheckOut` | Documentado como nuevo | NO EXISTE en DB ni en entidad |
| `cancellationReason` | Documentado como nuevo | NO EXISTE en DB ni en entidad |
| `cancellationFee` | Documentado como nuevo | NO EXISTE en DB ni en entidad |
| `refundAmount` | Documentado como nuevo | NO EXISTE en DB ni en entidad |
| `cancelledAt` | Documentado como nuevo | NO EXISTE en DB ni en entidad |
| `noShowFlag` | Documentado como nuevo | NO EXISTE en DB ni en entidad |

### Estados del Status
| Estado | En DB (CHECK constraint) | En TypeScript | Implementado en UI? |
|--------|-------------------------|---------------|---------------------|
| `pending` | SI | SI | SI (CalendarPage, ReservationDetailPage, ClientReservationsPage) |
| `accepted` | SI | SI | SI (CalendarPage, ReservationDetailPage) |
| `completed` | SI | SI | SI (CalendarPage — sin accion, solo visualizacion) |
| `cancelled` | SI | SI | SI (CalendarPage, ReservationDetailPage, ClientReservationsPage) |
| `checked-in` | NO | NO | NO |
| `checked-out` | NO | NO | NO |
| `no-show` | NO | NO | NO |

**Problema critico**: La DB tiene un CHECK constraint que solo permite 4 estados. Agregar nuevos estados requiere ALTER TABLE.

---

## 2. Repository (`SupabaseReservationRepository.ts`)

### Metodos implementados
| Metodo | Implementado? | Notas |
|--------|---------------|-------|
| `createReservation` | SI | Pero `total_price: 0` hardcoded |
| `getReservationById` | SI | Funcional |
| `getReservationsByUser` | SI | Funcional |
| `getReservationsByHotelIds` | SI | Funcional, con nested room+hotel |
| `updateReservationStatus` | SI | Solo cambia status + updated_at |
| `cancelReservation` | SI | Solo llama updateReservationStatus con 'cancelled' |

### Metodos FALTANTES (documentados en docs)
| Metodo | Estado en docs | Realidad |
|--------|---------------|----------|
| `checkIn(id)` | Documentado | NO EXISTE |
| `checkOut(id)` | Documentado | NO EXISTE |
| `extendReservation(id, newCheckOut)` | Documentado | NO EXISTE |
| `markNoShow(id)` | Documentado | NO EXISTE |
| `checkAvailability(roomId, checkIn, checkOut)` | Documentado | NO EXISTE |
| `cancelWithPolicy(id, reason)` | Documentado | NO EXISTE |

---

## 3. UseCases (`ReservationUseCases.ts`)

### Implementados (5)
| UseCase | Implementado? | Logica |
|---------|---------------|--------|
| `CreateReservationUseCase` | SI | Solo delega al repo — SIN validacion de disponibilidad, SIN calculo de precio |
| `GetReservationByIdUseCase` | SI | Delegacion directa |
| `GetReservationsByUserUseCase` | SI | Delegacion directa |
| `UpdateReservationStatusUseCase` | SI | Delegacion directa |
| `CancelReservationUseCase` | SI | Delegacion directa |

### Faltantes (7+)
| UseCase | Documentado? | Necesario? |
|---------|-------------|------------|
| `CheckInUseCase` | SI (docs/04) | SI |
| `CheckOutUseCase` | SI (docs/05) | SI |
| `ExtendReservationUseCase` | SI (docs/06) | SI |
| `MarkNoShowUseCase` | SI (docs/07) | SI |
| `CancelWithPolicyUseCase` | SI (docs/03) | SI |
| `ValidateAvailabilityUseCase` | SI (docs) | SI |
| `CalculateTotalPriceUseCase` | SI (docs) | SI |
| `AutoCompleteAfterCheckoutUseCase` | SI (docs/05) | SI |
| `AutoNoShowCronUseCase` | SI (docs/07) | SI (cron job) |
| `RecordStatusHistoryUseCase` | SI (docs) | SI |

---

## 4. UI — Paginas de Presentacion

### ClientReservationsPage.tsx
| Funcionalidad | Implementada? | Detalles |
|---------------|---------------|----------|
| Ver lista de reservas | SI | Filtra por user_id |
| Ver estado con badges | SI | pending, accepted, completed, cancelled |
| Ver fechas check-in/out | SI | Solo fechas planificadas |
| Ver precio total | SI | Pero siempre es 0 o incorrecto |
| Cancelar reserva | NO | No hay boton de cancelar en esta pagina |
| Ver detalles de reserva | Parcial | Boton "Ver habitacion" navega al room, no a detalle de reserva |
| Check-in | NO | No existe |
| Check-out | NO | No existe |
| Extension | NO | No existe |

### CalendarPage.tsx (Manager)
| Funcionalidad | Implementada? | Detalles |
|---------------|---------------|----------|
| Ver todas las reservas | SI | Con filtros por status |
| Aceptar reserva (pending→accepted) | SI | Con logica de disponibilidad de habitacion |
| Cancelar reserva | SI | Cambia status y libera habitacion si no hay otras activas |
| Completar reserva | NO | No hay boton para completar — el manager tendria que usar la DB |
| Ver detalle de reserva | Parcial | Solo inline en la lista, no pagina dedicada |
| Check-in | NO | No existe |
| Check-out | NO | No existe |
| Extension | NO | No existe |
| Marcar no-show | NO | No existe |

### ReservationDetailPage.tsx (Manager)
| Funcionalidad | Implementada? | Detalles |
|---------------|---------------|----------|
| Ver detalle completo | SI | Hotel, habitacion, huesped, fechas, precio, notas |
| Aceptar reserva | SI | Boton visible solo en status 'pending' |
| Cancelar reserva | SI | Boton visible solo en status 'pending' |
| Check-in | NO | No existe |
| Check-out | NO | No existe |
| Extension | NO | No existe |
| Marcar no-show | NO | No existe |

### HotelDetailPage.tsx (Client)
| Funcionalidad | Implementada? | Detalles |
|---------------|---------------|----------|
| Seleccionar habitacion | SI | Desde la lista de rooms |
| Modal de reserva | SI | Con check-in, check-out, guests |
| Calcular total en UI | SI | `calculateTotal()` usa noches × pricePerNight |
| Crear reserva | SI | Llama createReservation del store |
| Enviar user_id | SI | `userId: user?.id || null` |
| Validar disponibilidad | NO | No verifica si la habitacion esta disponible |
| Ver mensaje de exito | SI | Animacion de confirmacion |

---

## 5. Base de Datos — Supabase

### Tabla `reservations` — Columnas actuales
```sql
id uuid PRIMARY KEY
room_id uuid FK → rooms(id)
user_id uuid FK → users(id) -- agregado 2026-05-08
guest_name text
guest_email text
guest_phone text
check_in date
check_out date
status text CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled'))
total_price numeric DEFAULT 0
notes text
created_at timestamptz
updated_at timestamptz
```

### Columnas FALTANTES en DB
| Columna | Tipo | Necesaria para |
|---------|------|----------------|
| `actual_check_in` | timestamptz | Check-in logico |
| `actual_check_out` | timestamptz | Check-out logico |
| `cancellation_reason` | text | Cancelacion con motivo |
| `cancellation_fee` | numeric | Penalizacion por cancelacion |
| `refund_amount` | numeric | Calculo de reembolso |
| `cancelled_at` | timestamptz | Timestamp de cancelacion |
| `no_show_flag` | boolean | Flag de no-show |

### Tablas FALTANTES
| Tabla | Proposito |
|-------|-----------|
| `reservation_status_history` | Audit trail de cambios de estado |

### CHECK Constraint — Bloqueo critico
```sql
CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled'))
```
Este constraint bloquea los nuevos estados (`checked-in`, `checked-out`, `no-show`). Se necesita:
```sql
ALTER TABLE reservations DROP CONSTRAINT reservations_status_check;
ALTER TABLE reservations ADD CONSTRAINT reservations_status_check 
  CHECK (status IN ('pending', 'accepted', 'checked-in', 'checked-out', 'completed', 'cancelled', 'no-show'));
```

---

## 6. Logica de Negocio — GAP Analysis

### GAP-1: Calculo de precio total
**Estado**: `total_price: 0` hardcoded en `createReservation`
**Impacto**: ALTO — Las reservas siempre muestran $0
**Solucion**: El `CreateReservationUseCase` debe:
1. Buscar la habitacion por ID
2. Calcular noches = checkOut - checkIn
3. totalPrice = noches × pricePerNight
4. Enviar el precio calculado al repo

### GAP-2: Validacion de disponibilidad
**Estado**: No existe ninguna validacion
**Impacto**: CRITICO — Dos clientes pueden reservar la misma habitacion para las mismas fechas
**Solucion**: Antes de insertar, verificar que no existan reservas con fechas overlapping para la misma habitacion:
```sql
SELECT COUNT(*) FROM reservations
WHERE room_id = ?
AND status IN ('pending', 'accepted', 'checked-in')
AND check_in < ?  -- new checkOut
AND check_out > ?  -- new checkIn
```

### GAP-3: Check-in logico
**Estado**: No existe
**Impacto**: ALTO — No hay forma de registrar que el huesped llego
**Solucion**: Nuevo estado `checked-in`, campo `actual_check_in`, marcar habitacion como ocupada

### GAP-4: Check-out logico
**Estado**: No existe (se salta directo a `completed`)
**Impacto**: ALTO — No hay registro de cuando el huesped se fue
**Solucion**: Nuevo estado `checked-out`, campo `actual_check_out`, transicion automatica a `completed`

### GAP-5: Extension de reserva
**Estado**: No existe
**Impacto**: MEDIO — El huesped tendria que crear otra reserva
**Solucion**: Validar disponibilidad, recalcular precio, actualizar checkOut

### GAP-6: No-show
**Estado**: No existe
**Impacto**: MEDIO — Las reservas pending/accepted quedan activas indefinidamente
**Solucion**: Nuevo estado `no-show`, accion manual del manager + cron job automatico

### GAP-7: Cancelacion con penalizacion
**Estado**: Solo cambia status
**Impacto**: MEDIO — No hay registro de motivo, fees, ni reembolsos
**Solucion**: Nuevos campos en DB, politica de cancelacion con reglas de tiempo

### GAP-8: Historial de estados
**Estado**: Solo `created_at` y `updated_at`
**Impacto**: BAJO — No hay audit trail
**Solucion**: Nueva tabla `reservation_status_history`

### GAP-9: Notificaciones
**Estado**: No existe
**Impacto**: BAJO — El cliente no sabe cuando su reserva cambia de estado
**Solucion**: Sistema de notificaciones por email (fuera de scope inmediato)

### GAP-10: Boton de cancelar en ClientReservationsPage
**Estado**: No hay boton de cancelar
**Impacto**: ALTO — El cliente no puede cancelar desde su pagina de reservas
**Solucion**: Agregar boton de cancelar con confirmacion

---

## 7. Resumen Ejecutivo

### Implementado (funcional)
- [x] Crear reserva desde HotelDetailPage (cliente)
- [x] Ver reservas del cliente en ClientReservationsPage
- [x] Ver calendario de reservas del manager en CalendarPage
- [x] Ver detalle de reserva en ReservationDetailPage
- [x] Aceptar reserva (pending → accepted)
- [x] Cancelar reserva (cualquier estado → cancelled)
- [x] RLS policies para clientes y managers
- [x] user_id vinculado a reservas

### Parcialmente implementado
- [~] Calculo de precio en UI (HotelDetailPage lo calcula, pero no se guarda en DB)
- [~] Disponibilidad de habitacion (CalendarPage marca is_available al aceptar, pero no valida al crear)
- [~] Liberacion de habitacion al cancelar/completar (funciona en CalendarPage pero no en otros lados)

### NO implementado (requiere trabajo)
- [ ] Calculo automatico de precio en CreateReservationUseCase
- [ ] Validacion de disponibilidad al crear reserva
- [ ] Estados: checked-in, checked-out, no-show
- [ ] Campos: actualCheckIn, actualCheckOut, cancellationReason, cancellationFee, refundAmount, cancelledAt, noShowFlag
- [ ] UseCases: CheckIn, CheckOut, ExtendReservation, MarkNoShow, CancelWithPolicy, ValidateAvailability
- [ ] Metodos de repositorio correspondientes
- [ ] UI de check-in/check-out en CalendarPage y ReservationDetailPage
- [ ] Boton de cancelar en ClientReservationsPage
- [ ] Tabla reservation_status_history
- [ ] Cron job para auto no-show

---

## 8. Orden Recomendado de Implementacion

1. **Migracion DB**: Nuevos campos + nuevos estados + tabla de historial
2. **Validacion de disponibilidad**: En CreateReservationUseCase (bloquea el bug mas critico)
3. **Calculo automatico de precio**: En CreateReservationUseCase
4. **Boton cancelar en ClientReservationsPage**: UX basica del cliente
5. **Check-in/Check-out**: Nuevos estados, usecases, repositorio, UI
6. **Extension de reserva**: UseCase + UI
7. **No-show**: Estado + accion manual + cron job
8. **Cancelacion con penalizacion**: Campos + logica + UI
9. **Historial de estados**: Tabla + triggers
