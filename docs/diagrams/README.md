# Documentacion de Diagramas — Tourist Corner

Indice de diagramas para el proyecto Tourist Corner.

---

## Diagramas Disponibles

| Diagrama | Archivo | Descripcion |
| --- | --- | --- |
| **Casos de Uso** | [use-case-diagram.md](./use-case-diagram.md) | Actores (Cliente, Owner, Admin) y sus 15 casos de uso |
| **Secuencia** | [sequence-diagrams.md](./sequence-diagrams.md) | 7 diagramas: Auth, Reservas, Gestion de Hoteles, Comentarios |
| **Arquitectura** | [architecture-diagram.md](./architecture-diagram.md) | Clean Architecture + DDD, capas, flujo de datos |
| **ERD** | [erd-diagram.md](./erd-diagram.md) | 9 tablas de Supabase con relaciones y reglas RLS |
| **Estado** | [state-diagrams.md](./state-diagrams.md) | 6 diagramas: Reservas, Habitaciones, Auth, Hoteles, Registro |

---

## Actores del Sistema

### Cliente

- Explora y busca hoteles
- Reserva habitaciones
- Deja comentarios y calificaciones
- Ve estado de sus reservas

### Owner (Dueno)

- Crea y gestiona hoteles
- Gestiona habitaciones, tipos y servicios
- Acepta/cancela reservas desde calendario
- Ve reportes y configuracion

### Admin

- Genera y gestiona codigos de registro
- Gestiona usuarios de la plataforma
- Gestiona hoteles destacados
- Ve estadisticas globales

---

## Tecnologias de Diagramas

Todos los diagramas usan **Mermaid.js** que se renderiza automaticamente en:

- GitHub (issues, pull requests, README)
- Editores con soporte Mermaid (VS Code con extension)
- [Mermaid Live Editor](https://mermaid.live/) — para visualizar y exportar como imagen
