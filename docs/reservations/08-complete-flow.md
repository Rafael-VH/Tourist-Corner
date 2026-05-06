# Flujo Completo de Reservacion — End-to-End

## Diagrama de Secuencia Completo

```mermaid
sequenceDiagram
    autonumber
    
    actor Client as Cliente
    actor Manager as Manager
    actor System as Sistema
    
    participant ClientUI as Client UI
    participant ManagerUI as Manager UI
    participant Store as Stores
    participant UC as UseCases
    participant Repo as Repository
    participant DB as Supabase
    participant Notify as Notifications (FUTURO)
    
    %% === CREACION ===
    rect rgb(200, 230, 200)
        Note over Client,DB: FASE 1: CREACION DE RESERVA
        Client->>ClientUI: Selecciona habitacion + fechas
        ClientUI->>ClientUI: Calcula total = noches × precio
        Client->>ClientUI: Envia formulario de reserva
        ClientUI->>Store: createReservation(dto)
        Store->>UC: CreateReservation.execute(dto)
        UC->>Repo: createReservation(dto)
        Repo->>DB: INSERT INTO reservations (status='pending')
        DB-->>Repo: New reservation
        Repo-->>Store: Reservation (pending)
        Store-->>ClientUI: Success
        ClientUI-->>Client: Reserva creada — esperando confirmacion
    end
    
    %% === NOTIFICACION ===
    rect rgb(230, 230, 200)
        Note over Client,DB: FASE 2: NOTIFICACION AL MANAGER
        DB->>Notify: Trigger: new reservation pending
        Notify-->>Manager: Email: "Nueva reserva pendiente"
    end
    
    %% === ACEPTACION ===
    rect rgb(200, 200, 230)
        Note over Manager,DB: FASE 3: CONFIRMACION DEL MANAGER
        Manager->>ManagerUI: Ve lista de reservas pending
        ManagerUI->>Store: getReservationsByHotelIds
        Store->>Repo: getReservationsByHotelIds
        DB-->>ManagerUI: Pending reservations
        Manager->>ManagerUI: Click "Aceptar"
        ManagerUI->>Store: updateReservationStatus(id, 'accepted')
        Store->>UC: UpdateStatus.execute(id, 'accepted')
        UC->>Repo: updateStatus(id, 'accepted')
        Repo->>DB: UPDATE SET status='accepted'
        DB-->>Repo: Updated
        Repo-->>ManagerUI: Reservation (accepted)
        ManagerUI-->>Manager: Reserva aceptada
    end
    
    %% === NOTIFICACION AL CLIENTE ===
    rect rgb(230, 230, 200)
        Note over Client,DB: FASE 4: NOTIFICACION AL CLIENTE
        DB->>Notify: Trigger: reservation accepted
        Notify-->>Client: Email: "Reserva confirmada"
    end
    
    %% === CHECK-IN ===
    rect rgb(230, 200, 200)
        Note over Manager,DB: FASE 5: CHECK-IN DEL HUESPED
        Manager->>ManagerUI: Ve reservas accepted del dia
        Manager->>ManagerUI: Click "Check-in"
        ManagerUI->>Store: checkIn(id)
        Store->>UC: CheckIn.execute(id)
        UC->>Repo: checkIn(id)
        Repo->>DB: UPDATE SET status='checked-in',<br/>actual_check_in=NOW()
        Repo->>DB: UPDATE rooms SET is_available=false
        DB-->>Repo: Updated
        Repo-->>ManagerUI: Reservation (checked-in)
        ManagerUI-->>Manager: Check-in exitoso
    end
    
    %% === EXTENSION (OPCIONAL) ===
    rect rgb(200, 230, 230)
        Note over Manager,DB: FASE 6: EXTENSION (OPCIONAL)
        Manager->>ManagerUI: Click "Extender reserva"
        Manager->>ManagerUI: Nueva fecha de check-out
        ManagerUI->>Store: extendReservation(id, newDate)
        Store->>UC: ExtendReservation.execute(id, newDate)
        UC->>Repo: checkAvailability(roomId, newDate)
        Repo->>DB: SELECT overlapping reservations
        DB-->>Repo: No conflicts
        UC->>Repo: extend(id, newDate, newPrice)
        Repo->>DB: UPDATE SET check_out=newDate, total_price=newTotal
        DB-->>Repo: Updated
        Repo-->>ManagerUI: Reservation (extended)
        ManagerUI-->>Manager: Extension exitosa
    end
    
    %% === CHECK-OUT ===
    rect rgb(230, 200, 230)
        Note over Manager,DB: FASE 7: CHECK-OUT
        Manager->>ManagerUI: Click "Check-out"
        ManagerUI->>Store: checkOut(id)
        Store->>UC: CheckOut.execute(id)
        UC->>Repo: checkOut(id)
        Repo->>DB: UPDATE SET status='checked-out',<br/>actual_check_out=NOW()
        Repo->>DB: UPDATE rooms SET is_available=true
        DB-->>Repo: Updated
        
        UC->>UC: Auto-complete
        UC->>Repo: updateStatus(id, 'completed')
        Repo->>DB: UPDATE SET status='completed'
        DB-->>Repo: Completed
        Repo-->>ManagerUI: Reservation (completed)
        ManagerUI-->>Manager: Check-out exitoso, reserva completada
    end
    
    %% === NOTIFICACION FINAL ===
    rect rgb(230, 230, 200)
        Note over Client,DB: FASE 8: NOTIFICACION FINAL
        DB->>Notify: Trigger: reservation completed
        Notify-->>Client: Email: "Gracias por su estadia"
    end
```

## Resumen de Estados en el Flujo Completo

| Fase | Estado | Actor | Accion |
|------|--------|-------|--------|
| 1 | `pending` | Client | Crea reserva |
| 3 | `accepted` | Manager | Acepta reserva |
| 5 | `checked-in` | Manager | Registra llegada |
| 6 | `accepted` o `checked-in` | Manager | Extiende (opcional) |
| 7 | `checked-out` → `completed` | Manager | Registra salida |

## Flujos Alternativos

### A: Cancelacion por Cliente
```
pending → cancelled (cliente cancela antes de aceptacion)
accepted → cancelled (cliente cancela despues de aceptacion, con penalizacion)
```

### B: No-Show
```
pending → no-show (cliente nunca llego, fecha paso)
accepted → no-show (cliente nunca llego, fecha paso)
```

### C: Cancelacion por Manager
```
pending → cancelled (manager rechaza reserva)
accepted → cancelled (manager cancela por fuerza mayor)
```
