# Diagrama de Casos de Uso — Tourist Corner

## Actores del Sistema

| Actor | Descripcion |
| --- | --- |
| **Cliente** | Usuario que busca hoteles, reserva habitaciones y deja comentarios |
| **Owner** | Dueno de hotel que gestiona propiedades, habitaciones y reservas |
| **Admin** | Administrador de la plataforma que gestiona usuarios, codigos de registro y hoteles destacados |

---

## Casos de Uso por Actor

### Cliente

```mermaid
graph TD
    A[Explorar Hoteles] --> B[Filtrar por Tipo]
    A --> C[Buscar por Ciudad]
    A --> D[Ver Detalle de Hotel]
    D --> E[Ver Habitaciones Disponibles]
    D --> F[Leer Comentarios]
    D --> G[Dejar Comentario y Calificacion]
    E --> H[Reservar Habitacion]
    H --> I[Seleccionar Fechas Check-in/Check-out]
    I --> J[Confirmar Reservacion]
    J --> K[Ver Estado de Reservacion]
```

### Owner

```mermaid
graph TD
    A[Ver Dashboard Owner] --> B[Crear Hotel]
    A --> C[Gestionar Hotel Existente]
    C --> D[Editar Informacion del Hotel]
    C --> E[Gestionar Sucursales]
    C --> F[Gestionar Habitaciones]
    F --> G[Crear Habitacion]
    F --> H[Actualizar Disponibilidad]
    C --> I[Gestionar Tipos de Habitacion]
    C --> J[Gestionar Servicios]
    A --> K[Ver Calendario de Reservas]
    K --> L[Aceptar Reservacion]
    K --> M[Cancelar Reservacion]
    K --> N[Ver Detalle de Reservacion]
    A --> O[Ver Reportes]
    A --> P[Configuracion]
```

### Admin

```mermaid
graph TD
    A[Ver Dashboard Admin] --> B[Estadisticas Globales]
    A --> C[Generar Codigo de Registro]
    A --> D[Gestionar Codigos de Registro]
    D --> E[Revocar Codigo]
    D --> F[Eliminar Codigo]
    A --> G[Gestionar Usuarios]
    G --> H[Ver Lista de Usuarios]
    G --> I[Eliminar Usuario]
    A --> J[Gestionar Hoteles Destacados]
    J --> K[Marcar como Destacado]
    J --> L[Quitar Destacado]
```

---

## Tabla Completa de Casos de Uso

| ID | Caso de Uso | Actor | Precondicion | Postcondicion |
| --- | --- | --- | --- | --- |
| UC-01 | Registrarse | Cliente/Owner | Ninguna | Cuenta creada con rol asignado |
| UC-02 | Iniciar Sesion | Todos | Cuenta registrada | Sesion activa |
| UC-03 | Explorar Hoteles | Todos | Ninguna | Lista de hoteles visible |
| UC-04 | Filtrar/Buscar | Todos | Ninguna | Resultados filtrados |
| UC-05 | Ver Detalle Hotel | Todos | Hotel existe | Info completa visible |
| UC-06 | Reservar Habitacion | Cliente | Sesion iniciada | Reservacion creada (pending) |
| UC-07 | Dejar Comentario | Todos | Sesion iniciada | Comentario publicado |
| UC-08 | Crear Hotel | Owner | Sesion iniciada, hotel creado | Hotel registrado |
| UC-09 | Gestionar Habitaciones | Owner | Hotel existe | Habitaciones actualizadas |
| UC-10 | Aceptar Reservacion | Owner | Reservacion pending | Status = accepted |
| UC-11 | Cancelar Reservacion | Owner/Cliente | Reservacion existe | Status = cancelled |
| UC-12 | Ver Calendario | Owner | Sesion iniciada | Vista calendario |
| UC-13 | Generar Codigo Registro | Admin | Sesion admin | Codigo creado |
| UC-14 | Gestionar Usuarios | Admin | Sesion admin | Lista usuarios visible |
| UC-15 | Gestionar Destacados | Admin | Sesion admin | Hotel destacado actualizado |
