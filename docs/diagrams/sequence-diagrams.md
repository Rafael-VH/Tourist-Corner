# Diagramas de Secuencia — Tourist Corner

---

## 1. Registro de Usuario

```mermaid
sequenceDiagram
    participant U as Usuario
    participant LP as LoginPage
    participant Store as AuthStore
    participant UC as SignUpUseCase
    participant Repo as AuthRepository
    participant Supa as Supabase Auth

    U->>LP: Llena formulario (email, password, name, role)
    U->>LP: Click en "Registrarse"
    LP->>Store: signUp(email, password, name, role, code)
    Store->>UC: execute(email, password, name, role, code)
    UC->>Repo: signUp(email, password, name, role, code)
    Repo->>Supa: createUser(email, password, metadata)

    alt Codigo de registro requerido (role=owner)
        Repo->>Supa: Validate registration code
        alt Codigo valido
            Supa-->>Repo: Codigo valido
            Repo->>Supa: Mark code as used
        else Codigo invalido
            Supa-->>Repo: Error: codigo invalido
            Repo-->>UC: Error
            UC-->>Store: Error
            Store-->>LP: Muestra error
            LP-->>U: "Codigo de registro invalido"
        end
    end

    alt Registro exitoso
        Supa-->>Repo: User creado con metadata
        Repo-->>UC: User
        UC-->>Store: User
        Store->>Store: Actualizar estado (user, isAuthenticated)
        Store-->>LP: Sesion iniciada
        LP-->>U: Redirige al dashboard/home
    else Error (email duplicado, etc)
        Supa-->>Repo: Error
        Repo-->>UC: Error
        UC-->>Store: Error
        Store-->>LP: Muestra error
        LP-->>U: "Error al registrarse"
    end
```

---

## 2. Inicio de Sesion

```mermaid
sequenceDiagram
    participant U as Usuario
    participant LP as LoginPage
    participant Store as AuthStore
    participant UC as SignInUseCase
    participant Repo as AuthRepository
    participant Supa as Supabase Auth

    U->>LP: Llena email y password
    U->>LP: Click en "Iniciar Sesion"
    LP->>Store: signIn(email, password)
    Store->>UC: execute(email, password)
    UC->>Repo: signIn(email, password)
    Repo->>Supa: signInWithEmail(email, password)

    alt Credenciales validas
        Supa-->>Repo: Session {user, session}
        Repo->>Repo: Extraer role de user_metadata
        Repo-->>UC: User con role
        UC-->>Store: User
        Store->>Store: Guardar user y session
        Store-->>LP: Redirigir segun rol
        alt role = admin
            LP-->>U: Redirige a /admin
        else role = owner
            LP-->>U: Redirige a /dashboard
        else role = client
            LP-->>U: Redirige a /
        end
    else Credenciales invalidas
        Supa-->>Repo: Error
        Repo-->>UC: Error
        UC-->>Store: Error
        Store-->>LP: Muestra error
        LP-->>U: "Credenciales incorrectas"
    end
```

---

## 3. Reserva de Habitacion

```mermaid
sequenceDiagram
    participant C as Cliente
    participant HD as HotelDetailPage
    participant RM as ReservationModal
    participant Store as ReservationStore
    participant UC as CreateReservationUseCase
    participant Repo as ReservationRepository
    participant Supa as Supabase DB

    C->>HD: Selecciona habitacion y click "Reservar"
    HD->>RM: Abre modal de reserva
    C->>RM: Ingresa fechas (check-in, check-out)
    C->>RM: Click "Confirmar Reservacion"
    RM->>Store: createReservation(data)
    Store->>UC: execute(data)
    UC->>Repo: createReservation(dto)
    Repo->>Supa: INSERT INTO reservations

    alt Reserva exitosa
        Supa-->>Repo: Reservation creada
        Repo-->>UC: Reservation
        UC-->>Store: Reservation
        Store-->>RM: Exito
        RM->>RM: Muestra "Reservacion Exitosa"
        RM-->>HD: Cierra modal despues de 2s
    else Error (fecha invalida, habitacion no disponible)
        Supa-->>Repo: Error
        Repo-->>UC: Error
        UC-->>Store: Error
        Store-->>RM: Error
        RM-->>C: Muestra mensaje de error
    end
```

---

## 4. Aceptacion/Cancelacion de Reserva (Owner)

```mermaid
sequenceDiagram
    participant O as Owner
    participant Cal as CalendarPage
    participant Store as ReservationStore
    participant UC as UpdateReservationStatusUseCase
    participant Repo as ReservationRepository
    participant Supa as Supabase DB
    participant Room as Room

    O->>Cal: Ve lista de reservas
    O->>Cal: Click "Aceptar" o "Cancelar"
    Cal->>Store: updateReservationStatus(id, newStatus)
    Store->>UC: execute(id, status)
    UC->>Repo: updateReservationStatus(id, status)
    Repo->>Supa: UPDATE reservations SET status

    alt Status = accepted
        Supa-->>Repo: Reservation actualizada
        Repo->>Room: updateRoomStatus(roomId, 'occupied')
        Room->>Supa: UPDATE rooms SET isAvailable = false
    end

    Repo-->>UC: Reservation actualizada
    UC-->>Store: Reservation
    Store-->>Cal: UI actualizada
    Cal-->>O: Reserva marcada como aceptada/cancelada
```

---

## 5. Creacion de Hotel (Owner)

```mermaid
sequenceDiagram
    participant O as Owner
    participant NP as NewHotelPage
    participant Store as HotelStore
    participant Supa as Supabase DB

    O->>NP: Llena formulario del hotel
    NP->>NP: Valida datos (nombre, ciudad, tipo, etc)
    O->>NP: Click "Guardar Hotel"
    NP->>Supa: INSERT INTO hotels

    alt Exito
        Supa-->>NP: Hotel creado con id
        NP-->>O: Redirige a HotelManagementPage
    else Error (datos invalidos, limite alcanzado)
        Supa-->>NP: Error
        NP-->>O: Muestra error de validacion
    end
```

---

## 6. Gestion de Habitaciones (Owner)

```mermaid
sequenceDiagram
    participant O as Owner
    participant NR as NewRoomPage
    participant Supa as Supabase DB

    O->>NR: Selecciona hotel y tipo de habitacion
    O->>NR: Llena datos (nombre, precio, capacidad, amenidades)
    O->>NR: Click "Crear Habitacion(es)"
    alt Modo multiple
        NR->>NR: Genera N habitaciones segun cantidad
        loop Por cada habitacion
            NR->>Supa: INSERT INTO rooms
        end
    else Modo individual
        NR->>Supa: INSERT INTO rooms
    end

    alt Exito
        Supa-->>NR: Habitaciones creadas
        NR-->>O: Redirige a RoomManagementPage
    else Error
        Supa-->>NR: Error
        NR-->>O: Muestra error
    end
```

---

## 7. Comentario en Hotel/Room

```mermaid
sequenceDiagram
    participant U as Usuario
    participant Page as DetailPage
    participant Store as CommentStore
    participant UC as AddCommentUseCase
    participant Repo as CommentRepository
    participant Supa as Supabase DB

    U->>Page: Escribe comentario y selecciona calificacion
    U->>Page: Click en enviar
    Page->>Store: addComment(input, userId, userName)
    Store->>UC: execute(input)
    UC->>Repo: addComment(commentInput)
    Repo->>Supa: INSERT INTO comments

    alt Exito
        Supa-->>Repo: Comment creado
        Repo-->>UC: Comment
        UC-->>Store: Comment
        Store->>Store: Agregar comment a lista local
        Store-->>Page: Lista actualizada
        Page-->>U: Comentario visible en la lista
    else Error
        Supa-->>Repo: Error
        Repo-->>UC: Error
        UC-->>Store: Error
        Store-->>Page: Error
        Page-->>U: "Error al publicar comentario"
    end
```
