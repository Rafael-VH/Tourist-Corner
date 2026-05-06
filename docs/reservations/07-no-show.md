# Flujo de No-Show

## Diagrama de Secuencia

```mermaid
sequenceDiagram
    autonumber
    actor Manager as Manager
    participant UI as Manager Dashboard
    participant Store as useReservationStore
    participant UC as MarkNoShowUseCase
    participant Repo as SupabaseReservationRepository
    participant DB as Supabase DB
    participant Room as Room Availability
    participant Cron as Cron Job (Automatico)
    
    %% Manual no-show
    Manager->>UI: Identifica reserva sin arrival
    Manager->>UI: Click "Marcar como No-Show"
    UI->>Store: markNoShow(reservationId)
    Store->>Store: setLoading(true)
    
    Store->>UC: execute(id)
    UC->>Repo: getReservationById(id)
    Repo-->>UC: Reservation
    
    UC->>UC: Valida: status en ('pending', 'accepted')
    UC->>UC: Valida: checkIn date ya paso
    
    UC->>Repo: markNoShow(id)
    Repo->>DB: UPDATE reservations<br/>SET status='no-show',<br/>no_show_flag=true,<br/>updated_at=NOW()<br/>WHERE id=?
    
    Repo->>Room: Mark room as available (liberar)
    Room->>DB: UPDATE rooms SET is_available=true<br/>WHERE id=?
    
    DB-->>Repo: Updated
    Repo-->>UC: Updated Reservation
    UC-->>Store: Reservation (no-show)
    Store->>Store: Update local state
    Store->>Store: setLoading(false)
    Store-->>UI: Promise resolve
    UI-->>Manager: Reserva marcada como no-show
    
    %% Automatic no-show via cron
    Cron->>Cron: Ejecuta daily a las 11:00 AM
    Cron->>DB: SELECT * FROM reservations<br/>WHERE status IN ('pending', 'accepted')<br/>AND check_in < NOW() - interval '1 day'
    DB-->>Cron: Overdue reservations
    
    loop Para cada reserva vencida
        Cron->>UC: execute(reservationId)
        UC->>Repo: markNoShow(id)
        Repo->>DB: UPDATE reservations SET status='no-show'
        Note over Repo,Room: Libera habitacion automaticamente
    end
    
    Note over Manager,DB: No-show es un estado terminal.<br/>La habitacion se libera para nuevas reservas.
```

## Notas

- **No implementado actualmente** — las reservas pending/accepted permanecen activas indefinidamente
- Puede ser accion manual del manager o automatica via cron job
- La habitacion se libera automaticamente para que pueda ser reservada
- El registro de no-show puede usarse para scoring de clientes (FUTURO)
- FUTURO: Penalizacion para clientes con multiple no-shows

## Estados donde aplica

```
pending → no-show (terminal)
accepted → no-show (terminal)
```

## Validaciones

- La reserva debe estar en estado `pending` o `accepted`
- La fecha de check-in debe haber pasado (al menos 1 dia)
- La habitacion debe estar vinculada para poder liberarla

## Cron Job Propuesto

| Campo | Valor |
|-------|-------|
| Schedule | Daily 11:00 AM |
| Target | Reservas con check_in < ayer |
| Action | Marcar como no-show, liberar habitacion |
| Log | Registrar en reservation_status_history |
