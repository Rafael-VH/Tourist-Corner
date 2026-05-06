# Flujo de Check-in

## Diagrama de Secuencia

```mermaid
sequenceDiagram
    autonumber
    actor Manager as Manager
    participant UI as Manager Dashboard
    participant Store as useReservationStore
    participant UC as CheckInUseCase
    participant Repo as SupabaseReservationRepository
    participant DB as Supabase DB
    participant Room as Room Availability
    
    Manager->>UI: Navega a reservas aceptadas del dia
    UI->>Store: getReservationsByHotelIds(hotelIds)
    Store->>UC: GetReservationsByHotel
    UC->>Repo: getReservationsByHotelIds(hotelIds)
    Repo->>DB: SELECT * FROM reservations<br/>WHERE status='accepted' AND hotel_id IN (...)
    DB-->>Repo: Accepted reservations
    Repo-->>UC: Reservation[] entities
    UC-->>Store: Reservations
    Store-->>UI: Renderiza lista de accepted
    
    Manager->>UI: Click "Check-in" en reserva
    UI->>Store: checkIn(reservationId)
    Store->>Store: setLoading(true)
    
    Store->>UC: execute(id)
    UC->>Repo: getReservationById(id)
    Repo-->>UC: Reservation
    
    UC->>UC: Valida: status === 'accepted'
    UC->>UC: Valida: checkIn date <= hoy
    
    UC->>Repo: updateReservation(id,<br/>{ status: 'checked-in',<br/>actualCheckIn: NOW() })
    Repo->>DB: UPDATE reservations<br/>SET status='checked-in',<br/>actual_check_in=NOW(),<br/>updated_at=NOW()<br/>WHERE id=?
    
    Repo->>Room: Mark room as occupied
    Room->>DB: UPDATE rooms SET is_available=false<br/>WHERE id=?
    
    DB-->>Repo: Updated reservation + room
    Repo-->>UC: Updated Reservation
    UC-->>Store: Reservation (checked-in)
    Store->>Store: Update local state
    Store->>Store: setLoading(false)
    Store-->>UI: Promise resolve
    UI-->>Manager: Check-in exitoso
    
    Note over DB: La habitacion se marca como no disponible
```

## Notas

- **No implementado actualmente** — estado `checked-in` no existe
- El manager verifica la identidad del huesped antes de hacer check-in
- La habitacion se marca como ocupada (is_available = false)
- FUTURO: Self check-in para clientes desde la app
- FUTURO: Enviar notificacion de confirmacion de check-in al cliente

## Estados relacionados

```
accepted → checked-in → checked-out → completed
```

## Validaciones

- La reserva debe estar en estado `accepted`
- La fecha de check-in planificada debe ser hoy o en el pasado
- La habitacion debe estar disponible
