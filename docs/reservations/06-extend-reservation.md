# Flujo de Extension de Reservacion

## Diagrama de Secuencia

```mermaid
sequenceDiagram
    autonumber
    actor Manager as Manager
    participant UI as Manager Dashboard
    participant Store as useReservationStore
    participant UC as ExtendReservationUseCase
    participant Repo as SupabaseReservationRepository
    participant DB as Supabase DB
    
    Manager->>UI: Selecciona reserva activa
    UI->>UI: Abre modal de extension
    UI->>Manager: Input: nueva fecha de check-out
    
    Manager->>UI: Ingresa nueva fecha y envia
    UI->>Store: extendReservation(id, newCheckOut)
    Store->>Store: setLoading(true)
    
    Store->>UC: execute(id, newCheckOut)
    
    UC->>Repo: getReservationById(id)
    Repo-->>UC: Reservation
    
    UC->>UC: Valida: status en ('accepted', 'checked-in')
    UC->>UC: Valida: newCheckOut > currentCheckOut
    UC->>UC: Valida: newCheckOut > checkIn
    
    UC->>Repo: checkAvailability(roomId, currentCheckOut, newCheckOut)
    Repo->>DB: SELECT * FROM reservations<br/>WHERE room_id = ?<br/>AND status IN ('pending', 'accepted', 'checked-in')<br/>AND check_in < newCheckOut<br/>AND check_out > currentCheckOut
    DB-->>Repo: Overlapping reservations
    
    UC->>UC: Si hay overlap → throw Error
    
    UC->>Repo: getRoomById(roomId)
    Repo-->>UC: Room entity
    
    UC->>UC: Calcula noches adicionales<br/>newCheckOut - currentCheckOut
    UC->>UC: Calcula precio adicional<br/>noches_adicionales × pricePerNight
    UC->>UC: Nuevo total = old_total + adicional
    
    UC->>Repo: extendReservation(id,<br/>{ checkOut: newCheckOut,<br/>totalPrice: newTotal })
    Repo->>DB: UPDATE reservations<br/>SET check_out=?, total_price=?,<br/>updated_at=NOW()<br/>WHERE id=?
    DB-->>Repo: Updated record
    Repo-->>UC: Updated Reservation
    UC-->>Store: Reservation (extended)
    Store->>Store: Update local state
    Store->>Store: setLoading(false)
    Store-->>UI: Promise resolve
    UI-->>Manager: Extension exitosa, nuevo total mostrado
```

## Notas

- **No implementado actualmente** — el cliente tendria que crear otra reserva
- Funciona para reservas en estado `accepted` o `checked-in`
- Valida que no haya conflictos de disponibilidad para las nuevas fechas
- Recalcula el precio total automaticamente
- El estado NO cambia, solo se actualizan las fechas y el precio

## Estados donde aplica

```
accepted → accepted (mismo estado, nuevas fechas)
checked-in → checked-in (mismo estado, nuevas fechas)
```

## Validaciones

- newCheckOut debe ser posterior al checkOut actual
- newCheckOut debe ser posterior al checkIn
- No debe haber reservas overlapping en las fechas extendidas
- La habitacion debe estar disponible para el periodo adicional
