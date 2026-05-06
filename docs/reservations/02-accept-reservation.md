# Flujo de Aceptacion de Reservacion

## Diagrama de Secuencia

```mermaid
sequenceDiagram
    autonumber
    actor Manager as Manager
    participant UI as Manager Dashboard
    participant Store as useReservationStore
    participant UC as UpdateReservationStatusUseCase
    participant Repo as SupabaseReservationRepository
    participant DB as Supabase DB
    
    Manager->>UI: Navega a lista de reservas pendientes
    UI->>Store: getReservationsByHotelIds(hotelIds)
    Store->>UC: GetReservationsByHotel
    UC->>Repo: getReservationsByHotelIds(hotelIds)
    Repo->>DB: SELECT * FROM reservations<br/>JOIN rooms ON room_id<br/>JOIN hotels ON hotel_id<br/>WHERE hotel_id IN (...) AND status='pending'
    DB-->>Repo: Reservation records with nested data
    Repo-->>UC: Reservation[] entities
    UC-->>Store: Reservations
    Store->>Store: setReservations(list)
    Store-->>UI: Renderiza lista con estado pending
    
    Manager->>UI: Click "Aceptar" en reserva
    UI->>Manager: Confirm dialog
    
    Manager->>UI: Confirma aceptacion
    UI->>Store: updateReservationStatus(id, 'accepted')
    Store->>Store: setLoading(true)
    
    Store->>UC: execute(id, 'accepted')
    UC->>Repo: updateReservationStatus(id, 'accepted')
    Repo->>DB: UPDATE reservations<br/>SET status='accepted', updated_at=NOW()<br/>WHERE id=?
    DB-->>Repo: Updated record
    Repo-->>UC: Updated Reservation
    UC-->>Store: Reservation (accepted)
    Store->>Store: Update local state
    Store->>Store: setLoading(false)
    Store-->>UI: Promise resolve
    UI-->>Manager: Reserva aceptada exitosamente
    
    Note over UI,Manager: FUTURO: Enviar notificacion<br/>al cliente por email
```

## Notas

- Solo el manager del hotel puede aceptar reservas
- La reserva pasa de `pending` a `accepted`
- No se bloquea la habitacion al aceptar (GAP: deberia marcar disponibilidad)
- FUTURO: Notificacion automatica al cliente cuando se acepta
