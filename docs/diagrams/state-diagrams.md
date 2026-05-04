# Diagramas de Estado — Tourist Corner

---

## 1. Estado de Reservacion

```mermaid
stateDiagram-v2
    [*] --> pending : Cliente crea reserva

    pending --> accepted : Owner acepta
    pending --> cancelled : Owner o cliente cancela

    accepted --> completed : Check-out realizado
    accepted --> cancelled : Cancelacion post-aceptacion

    completed --> [*]
    cancelled --> [*]

    note right of pending
        Reservacion creada
        Esperando confirmacion
        del owner
    end note

    note right of accepted
        Confirmada por el owner
        Habitacion marcada como
        ocupada en las fechas
    end note

    note right of completed
        Estadia finalizada
        Se puede dejar un comentario
    end note

    note right of cancelled
        Cancelada por cualquiera
        de las partes
        Habitacion liberada
    end note
```

---

## 2. Estado de Habitacion (Room)

```mermaid
stateDiagram-v2
    [*] --> available : Habitacion creada

    available --> occupied : Reservacion aceptada
    available --> maintenance : Owner marca en mantenimiento

    occupied --> available : Check-out / Reservacion completada
    occupied --> maintenance : Problema detectado

    maintenance --> available : Reparacion completada

    note right of available
        Disponible para reserva
        isAvailable = true
        status = 'available'
    end note

    note right of occupied
        Reservada/ocupada
        isAvailable = false
        status = 'occupied'
    end note

    note right of maintenance
        No disponible
        isAvailable = false
        status = 'maintenance'
    end note
```

---

## 3. Estado de Autenticacion del Usuario

```mermaid
stateDiagram-v2
    [*] --> unauthenticated : App iniciada

    unauthenticated --> authenticating : Usuario envia login/registro
    authenticating --> authenticated : Credenciales validas
    authenticating --> unauthenticated : Credenciales invalidas

    authenticated --> unauthenticated : Logout / Session expirada

    state authenticated {
        [*] --> client : Rol = client
        [*] --> owner : Rol = owner
        [*] --> admin : Rol = admin

        client --> home_page : Redirige a /
        owner --> dashboard : Redirige a /dashboard
        admin --> admin_panel : Redirige a /admin
    }

    note right of authenticating
        Loading state mostrado
        Mientras Supabase
        verifica credenciales
    end note
```

---

## 4. Estado de Hotel

```mermaid
stateDiagram-v2
    [*] --> active : Owner crea hotel

    active --> inactive : Owner desactiva hotel

    inactive --> active : Owner reactiva hotel

    note right of active
        Visible para clientes
        Reservas permitidas
        is_active = true
    end note

    note right of inactive
        No visible en busquedas
        No acepta nuevas reservas
        is_active = false
    end note
```

---

## 5. Flujo de Registro (Owner)

```mermaid
stateDiagram-v2
    [*] --> form : Usuario abre registro

    form --> validating : Usuario envia formulario
    validating --> checking_code : Rol = owner
    checking_code --> code_valid : Codigo existe y no usado
    checking_code --> code_invalid : Codigo no existe o ya usado

    code_valid --> creating_account : Supabase createUser
    code_invalid --> form : Muestra error

    creating_account --> account_created : Exito
    creating_account --> form : Error (email duplicado, etc)

    account_created --> logged_in : Auto-login tras registro
    logged_in --> [*]

    note right of checking_code
        Solo owner requiere
        codigo de registro
        generado por admin
    end note
```

---

## 6. Flujo de Reserva Completa

```mermaid
stateDiagram-v2
    [*] --> browsing : Cliente explora hoteles

    browsing --> viewing_hotel : Selecciona hotel
    viewing_hotel --> viewing_rooms : Ve habitaciones
    viewing_rooms --> selecting_room : Selecciona habitacion

    selecting_room --> filling_dates : Abre modal reserva
    filling_dates --> submitting : Completa fechas y datos
    submitting --> reservation_pending : Envia reserva

    reservation_pending --> waiting_owner : Reserva en estado pending
    waiting_owner --> reservation_accepted : Owner acepta
    waiting_owner --> reservation_rejected : Owner cancela/rechaza

    reservation_accepted --> confirmation : Ve confirmacion
    confirmation --> staying : Llegada al hotel
    staying --> completed : Check-out

    reservation_rejected --> viewing_rooms : Puede reservar otra

    completed --> leaving_comment : Deja comentario
    leaving_comment --> browsing : Vuelve a explorar
```
