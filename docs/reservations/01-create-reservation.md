# Flujo de Creacion de Reservacion

## Diagrama de Secuencia

```mermaid
sequenceDiagram
    autonumber
    actor Client as Cliente
    participant UI as HotelDetailPage
    participant Store as useReservationStore
    participant UC as CreateReservationUseCase
    participant Repo as SupabaseReservationRepository
    participant DB as Supabase DB
    
    Client->>UI: Selecciona habitacion y fechas
    UI->>UI: Calcula total = noches × pricePerNight
    UI->>UI: Abre modal de reserva
    
    Client->>UI: Completa datos y envia
    UI->>Store: createReservation(dto)
    Store->>Store: setLoading(true)
    
    Store->>UC: execute(dto)
    UC->>Repo: createReservation(dto)
    Repo->>DB: INSERT INTO reservations<br/>(room_id, guest_name, guest_email,<br/>check_in, check_out, total_price, status)
    DB-->>Repo: Returns new record (status='pending')
    Repo-->>UC: Reservation entity
    UC-->>Store: Reservation
    Store->>Store: setReservation(new)
    Store->>Store: setLoading(false)
    Store-->>UI: Promise resolve
    UI->>UI: Muestra confirmacion exitosa
    UI-->>Client: Reserva creada exitosamente
    
    Note over DB: La habitacion NO se bloquea<br/>hasta que el manager acepte
```

## Notas

- `total_price` se envia como 0 (GAP: debe calcularse automaticamente)
- `user_id` se envia si el usuario esta autenticado
- No hay validacion de disponibilidad (GAP: debe verificar overlapping de fechas)
- La reserva queda en estado `pending` hasta que el manager la acepte
