# Flujo de Check-out

## Diagrama de Secuencia

```mermaid
sequenceDiagram
    autonumber
    actor Manager as Manager
    participant UI as Manager Dashboard
    participant Store as useReservationStore
    participant UC as CheckOutUseCase
    participant Repo as SupabaseReservationRepository
    participant DB as Supabase DB
    participant Room as Room Availability
    participant Payment as Payment System (FUTURO)
    
    Manager->>UI: Navega a huespedes con check-in activo
    UI->>Store: getReservationsByHotelIds(hotelIds)
    Store->>UC: GetReservationsByHotel
    UC->>Repo: getReservationsByHotelIds(hotelIds)
    Repo->>DB: SELECT * FROM reservations<br/>WHERE status='checked-in'
    DB-->>Repo: Checked-in reservations
    Repo-->>UC: Reservation[] entities
    UC-->>Store: Reservations
    Store-->>UI: Renderiza lista de checked-in
    
    Manager->>UI: Click "Check-out" en reserva
    UI->>Store: checkOut(reservationId)
    Store->>Store: setLoading(true)
    
    Store->>UC: execute(id)
    UC->>Repo: getReservationById(id)
    Repo-->>UC: Reservation
    
    UC->>UC: Valida: status === 'checked-in'
    
    UC->>UC: Calcula noches reales<br/>actualCheckOut - actualCheckIn
    UC->>UC: Recalcula total si hay diferencia<br/>con fechas originales
    
    UC->>Repo: updateReservation(id,<br/>{ status: 'checked-out',<br/>actualCheckOut: NOW() })
    Repo->>DB: UPDATE reservations<br/>SET status='checked-out',<br/>actual_check_out=NOW(),<br/>updated_at=NOW()<br/>WHERE id=?
    
    Repo->>Room: Mark room as available
    Room->>DB: UPDATE rooms SET is_available=true<br/>WHERE id=?
    
    DB-->>Repo: Updated reservation + room
    Repo-->>UC: Updated Reservation
    
    UC->>UC: Auto-complete after checkout
    UC->>Repo: updateReservation(id,<br/>{ status: 'completed' })
    Repo->>DB: UPDATE reservations<br/>SET status='completed'<br/>WHERE id=?
    
    UC-->>Store: Reservation (completed)
    Store->>Store: Update local state
    Store->>Store: setLoading(false)
    Store-->>UI: Promise resolve
    UI-->>Manager: Check-out exitoso, reserva completada
    
    Note over Payment: FUTURO: Procesar cargos adicionales<br/>y generar factura
```

## Notas

- **No implementado actualmente** — se salta directo a `completed` sin registro de check-out
- El manager verifica el estado de la habitacion antes de check-out
- Se recalcula el precio total si las fechas reales difieren de las planificadas
- La habitacion se libera automaticamente (is_available = true)
- Transicion automatica a `completed` despues del check-out
- FUTURO: Procesar cargos adicionales (minibar, room service, etc.)
- FUTURO: Generar factura/recibo para el cliente

## Estados relacionados

```
checked-in → checked-out → completed (automatico)
```

## Validaciones

- La reserva debe estar en estado `checked-in`
- La fecha de check-out debe ser >= fecha de check-in real
- La habitacion debe estar asociada correctamente
