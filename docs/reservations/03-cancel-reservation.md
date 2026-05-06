# Flujo de Cancelacion de Reservacion

## Diagrama de Secuencia

```mermaid
sequenceDiagram
    autonumber
    actor Actor as Cliente o Manager
    participant UI as UI (ClientReservations/Manager)
    participant Store as useReservationStore
    participant UC as CancelReservationUseCase
    participant Repo as SupabaseReservationRepository
    participant DB as Supabase DB
    
    Actor->>UI: Click "Cancelar Reserva"
    UI->>Actor: Confirm dialog + reason (FUTURO)
    
    Actor->>UI: Confirma cancelacion
    UI->>Store: cancelReservation(id)
    Store->>Store: setLoading(true)
    
    Store->>UC: execute(id)
    UC->>Repo: cancelReservation(id)
    Repo->>Repo: updateReservationStatus(id, 'cancelled')
    Repo->>DB: UPDATE reservations<br/>SET status='cancelled', updated_at=NOW()<br/>WHERE id=?
    DB-->>Repo: Updated record
    Repo-->>UC: Updated Reservation
    UC-->>Store: Reservation (cancelled)
    Store->>Store: Update local state
    Store->>Store: setLoading(false)
    Store-->>UI: Promise resolve
    UI-->>Actor: Reserva cancelada exitosamente
    
    Note over Actor,DB: ACTUAL: Sin penalizacion ni calculo<br/>de reembolso — solo cambia estado
```

## Reglas de Cancelacion Actuales

- **Cliente**: Puede cancelar reservas en cualquier estado (pending o accepted)
- **Manager**: Puede cancelar cualquier reserva de sus hoteles
- **Sin penalizacion**: No se calcula ningun fee ni reembolso
- **Sin motivo**: No se registra razon de cancelacion

## Reglas de Cancelacion Futuras (Propuestas)

| Tiempo antes del check-in | Penalizacion | Reembolso |
|---------------------------|--------------|-----------|
| > 7 dias | 0% | 100% |
| 3-7 dias | 50% | 50% |
| < 3 dias | 100% | 0% |
| Ya accepted | 100% | 0% |

### Flujo de cancelacion propuesto

```mermaid
sequenceDiagram
    autonumber
    actor Client as Cliente
    participant UI as ClientReservationsPage
    participant Store as useReservationStore
    participant UC as CancelWithPolicyUseCase
    participant Repo as ReservationRepository
    participant DB as Supabase DB
    
    Client->>UI: Click "Cancelar Reserva"
    UI->>Client: Dialog: motivo de cancelacion
    Client->>UI: Ingresa motivo y confirma
    
    UI->>Store: cancelWithPolicy(id, reason)
    Store->>UC: execute(id, reason)
    
    UC->>Repo: getReservationById(id)
    Repo-->>UC: Reservation
    
    UC->>UC: Calcula dias hasta check-in
    UC->>UC: Aplica politica de cancelacion
    UC->>UC: Calcula cancellationFee y refundAmount
    
    UC->>Repo: cancelReservation(id, reason, fee, refund)
    Repo->>DB: UPDATE reservations<br/>SET status='cancelled',<br/>cancellation_reason=?,<br/>cancellation_fee=?,<br/>refund_amount=?,<br/>cancelled_at=NOW()<br/>WHERE id=?
    DB-->>Repo: Updated record
    Repo-->>UC: Updated Reservation
    UC-->>Store: Reservation with cancellation details
    Store-->>UI: Promise resolve
    
    UI->>Client: Muestra resumen de cancelacion<br/>(reembolso, penalizacion)
    
    Note over Client,DB: FUTURO: Procesar reembolso<br/>automatico via pasarela de pago
```
