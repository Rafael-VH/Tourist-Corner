# Auditoría Completa — Tourist-Corner

**Fecha**: 2026-09-04
**Método**: Auditoría estática del código (`src/`, configs) + migraciones SQL (`supabase/migrations/`, raíz) + verificación del estado git. Sin modificación de archivos.
**Agentes**: Arquitectura, Frontend/UX, Seguridad, Base de Datos/SQL, Capa de Datos y Lógica de Negocio (5 agentes en paralelo).

---

## Scores por Área

| Área | Score | Estado |
|------|:-----:|:------:|
| **Arquitectura** | **5.5/10** | ⚠️ Domain limpio, pero la presentación bypasea las capas |
| **Frontend/UX** | **5.4/10** | ⚠️ Base visual sólida, accesibilidad y feedback pobres |
| **Seguridad** | **2/10** | ❌ Escalada a admin, RLS de reservations abierta, secrets expuestos |
| **Base de Datos** | **3.5/10** | ❌ Migraciones no reproducibles, drift con BD real |
| **Lógica de Negocio / Datos** | **5/10** | ⚠️ Comentarios rotos, disponibilidad sin atomicidad, dashboard manager roto |
| **Global** | **4.5/10** | ❌ Requiere intervención prioritaria en seguridad y BD |

---

## Contexto del Repo

- **Stack**: React 19.2, TypeScript 5.9 (strict), Vite 7, Tailwind 3, shadcn/ui, Zustand 5, Supabase JS v2, framer-motion, react-router v7.
- **Arquitectura declarada**: capas `src/core` (router/di/theme), `src/domain` (entities/repositories/usecases), `src/data` (datasources/repos Supabase), `src/presentation` (pages/providers/widgets), `components/ui` (shadcn).
- **Rutas**: clientes bajo `Layout` (Navbar+Footer), admin bajo `AdminLayout`, manager bajo `ManagerLayout`.
- **DB**: proyecto Supabase `cgiqnpwlswqahrabcplh`. Roles de la app: `client`, `owner`, `admin`.
- **Estado git**: branch `main`, últimos commits dedicados a delete room / RoomManagementPage. Working tree con cambios sin commit en `LoginPage.tsx`, `RoomManagementPage.tsx`, `package-lock.json` y archivos nuevos (`.commandcode/`, `.opencode/`, `AGENTS.md`, `docs/coding/`).

---

## 🔴 HALLAZGOS CRÍTICOS

### Seguridad y RLS

1. **Escalada a `admin` en el registro** — El trigger `handle_new_user()` (`supabase/migrations/20260502190453_create_initial_schema.sql:21-33` y `20260509000001_add_avatars_bucket_and_fix_rls.sql:65-77`) inserta `COALESCE(raw_user_meta_data->>'role', 'client')` sin validar. Cualquiera puede llamar `auth.signUp()` con `role:'admin'` en metadata y nacer admin. La UI solo ofrece `client|owner`, pero la API no valida.
2. **Auto-elevación de rol vía UPDATE propio** — Políticas `users_update_own` / `"Users can update own profile"` permiten `UPDATE public.users` con `auth.uid() = id` **sin `WITH CHECK` ni restricción de columna `role`**. Un `client` puede ejecutar `UPDATE users SET role='admin' WHERE id=auth.uid()`.
3. **RLS de `reservations` abierta (PII + forja)** — `20260503060000_create_reservations_table.sql` creó `"Clients can view own reservations" FOR SELECT USING (true)` y `"Clients can insert reservations" WITH CHECK (true)`. Las migraciones posteriores dropean/recrean políticas **con otros nombres**, así que ambas quedan vivas (las policies se combinan con OR): cualquiera (anon incluido) lee guest_name/email/phone de todas las reservas y puede insertar reservas arbitrarias (spam, bloquear disponibilidad). *Nota: la auditoría de mayo (docs/coding/001) verificó contra la BD real que el USING(true) de reservations ya no existe en producción; los archivos de migración siguen sin reflejarlo (drift).*
4. **`registration_codes` expuesto** — Política `"Public can select unused registration codes"` (`20260503001131:4-5`) deja a anónimos listar todos los códigos sin usar (6 dígitos, brute-forceable: 900k combinaciones, sin rate-limit). El marcado de `used` falla silenciosamente (no hay policy de UPDATE en `registration_codes` y `SupabaseAuthRepository.ts:60-65` no chequea error) → el código se reutiliza indefinidamente.
5. **Secrets expuestos en disco** — `supabase/.temp/info.txt` contiene la **service_role key**, la nueva `sb_secret_*`, anon y project-ref. `supabase/run_migration.js:5-6` hardcodea URL + anon key con fallback. `.temp/` y `run_migration.js` están gitignored pero existen en el working tree; `RAN_SQL_MIGRATION.sql` (raíz) **sí está trackeado**. Acción: rotar service_role/sb_secret/anon y verificar historial git.
6. **Storage/images sin ownership** — Buckets `hotel-images`/`room-images`: policy de INSERT solo exige `auth.role()='authenticated'` (rutas `<hotelId>/...` públicas → cualquier usuario sube a la carpeta de cualquier hotel). Tabla `images`: INSERT con `WITH CHECK (auth.role()='authenticated')` sin validar `entity_id`. El trigger `cleanup_image_storage()` (SECURITY DEFINER, **sin `SET search_path`**) permite borrado cross-tenant de objetos de storage vía delete de fila ajena.
7. **`users` legible por todos** — `users_select_all` `USING (true)` expone name/email/phone de todos los usuarios.

### Código y arquitectura

8. **La presentación bypasea domain/data y consulta Supabase directo** — Al menos 14 páginas/widgets importan `@/data/datasources/SupabaseClient` y ejecutan queries ad-hoc (`AdminHotelsPage`, `AdminDashboardPage`, `AdminUsersPage`, `AdminCodesPage`, `ManagerDashboardPage`, `DashboardHotelsPage`, `DashboardRoomsPage`, `HotelManagementPage`, `RoomManagementPage`, `NewHotelPage`, `NewRoomPage`, `NewRoomTypePage`, `NewServicePage`, `CustomizePage`, `CalendarPage`, `ReservationDetailPage`). Tablas tocadas directo: `featured_hotels`, `registration_codes`, `users`, `custom_room_types`, `custom_services`, `room_custom_services`, `room_availability`, `reservations`, `rooms`, `hotels`, `images`. Esto duplica lógica de negocio inline y anula la capa de repositorios.
9. **Lógica de ocupar/liberar habitación duplicada y contradictoria** — `CalendarPage` (aceptar/cancelar, líneas 288-329) y `SupabaseReservationRepository.checkIn/checkOut/markNoShow` implementan versiones distintas. `updateReservationStatus(id,'cancelled')` **no libera la habitación** (a diferencia del flujo de Calendar). Estado de la room divergente según qué pantalla ejecute la acción.
10. **Comentarios rotos: `userId` hardcodeado `"current-user"`** — `HotelDetailPage.tsx:97-106` y `RoomDetailPage.tsx:83-92` llaman `addComment(..., "current-user", "Usuario Anonimo")` en vez del `user.id` real → viola FK `user_id→users(id)` y RLS `WITH CHECK (auth.uid() = user_id)` → **todo comentario nuevo falla**.
11. **Manager dashboard roto** — `ManagerDashboardPage.tsx:76` filtra `.in("hotel_id", hotelIds)` sobre `reservations`, tabla que **no tiene columna `hotel_id`** (es `room_id → room.hotel_id`). El catch traga el error → "Reservaciones Recientes" y contadores siempre en cero.
12. **`AppRouter.tsx:139` — ruta `</Route>` extra** que parte el árbol del `Layout`; estructura de rutas inválida/inconsistente que deja admin/manager como rutas sueltas de nivel raíz.

---

## 🟠 HALLAZGOS ALTOS

- **Sin bootstrap de sesión**: `useAuthStore` arranca `user:null`, no hay `getSession()`/`onAuthStateChange` al montar la app → **refrescar la página "desloguea"** aunque el token viva en localStorage (`ProtectedRoute` redirige a `/login`).
- **`signUp` no re-lanza el error y navega igual**: `useAuthStore.ts:46-57` captura sin re-throw; `LoginPage.handleRegister` navega a `/dashboard` incondicionalmente aunque el registro falle.
- **Reset de password roto de punta a punta**: `resetPasswordEmail` apunta a `/login?reset=true`, pero ninguna ruta procesa el token para fijar password nueva.
- **Cancelación inconsistente**: la cancelación por manager (`ReservationDetailPage`, `CalendarPage`) no setea `cancellation_reason/fee/refund/cancelled_at`, y `ReservationDetailPage` no libera la habitación. El cliente sí calcula fees (`cancelWithPolicy`).
- **Checks de rol invertidos en páginas New***: `NewRoomTypePage.tsx:18-22`, `NewServicePage.tsx:51-55`: `if (user && user.role !== "owner")` — si `user` es null (no autenticado) **no redirige**.
- **Disponibilidad TOCTOU**: `ValidateAvailability` y `createReservation` son dos pasos sin transacción ni constraint de exclusión → dos reservas solapadas simultáneas posibles. Además `checkAvailability` ignora `rooms.status`/`is_available` y convive un segundo modelo `room_availability` que ningún flujo de reserva usa.
- **Componentes monstruo**: `HotelDetailPage` 895 líneas, `ReservationDetailPage` 767, `CalendarPage` 721, `RoomDetailPage` 704, `Navbar` 644 (3 navbars inline), `HotelManagementPage` 610, `RoomManagementPage` 529. Patrón `isLoading+error+load()` duplicado en ~10 páginas.
- **Dependencias declaradas sin usar**: `sonner` (no hay `<Toaster>` ni un solo toast), `react-hook-form` + `zod` + `@hookform/resolvers` (0 formularios los usan), `react-day-picker`, `next-themes` (sin ThemeProvider), `vaul`. El kit shadcn (`Button`, `Dialog`, `AlertDialog`, `Card`, `Spinner`, `Empty`, `Table`...) **no se importa en `src/presentation`**: 0 usos de `empty.tsx`/`spinner.tsx`; modales caseros sin `role="dialog"`, sin foco trampa ni Escape; `confirm()`/`alert()` nativos en `HotelManagementPage`, `RoomManagementPage`, `CustomizePage`, `AdminHotelsPage`.
- **Moneda inconsistente**: zonas manager usan `Bs`, zonas cliente/catálogo usan `$` sobre el mismo campo `total_price`; `ManagerDashboardPage:102-105` calcula un "Ingreso Ref." inventado (`priceRange.min * reviewCount`).
- **Estados de error silenciosos**: `HotelDetailPage`/`RoomDetailPage` tienen `catch {}` vacíos al crear reserva; `CalendarPage:237`, `ManagerDashboardPage:91` tragan errores; errores de fetch de detalle no se pintan.
- **Dark mode sin persistencia y triplicado**: estado `isDark` solo en primer render, sin `localStorage`; toggle duplicado 3 veces en `Navbar`; `theme.ts` muerto (0 imports); 1232 colores hardcodeados; `sonner.tsx` usa `next-themes` sin provider (recibe siempre `undefined`).
- **Stores globales sin `reset()`**: `useHotelStore`/`useRoomStore`/`useReservationStore` conservan datos del usuario anterior tras logout (fuga entre usuarios); `hotels` del manager pisa los del catálogo.
- **`AdminLayout`/`ManagerLayout` duplicados** (~100% iguales, 193 vs 199 líneas), incluido modal de logout inline idéntico.
- **SQL de páginas vs repositorios sin reconciliar**: tipos locales snake_case redefinidos en `CalendarPage` (con `as unknown as` para forzar), DTOs duplicados en 5+ páginas, `NewHotelPage` inserta directo por fuera del repo con campos hardcodeados (`latitude:0, longitude:0`).
- **Botón "Eliminar" sin `onClick`** en `HotelManagementPage.tsx:598-600`.
- **Cálculo de fechas con husos**: `check_in` date se mapea a medianoche UTC y se formatea en hora local → reservas mostradas "un día antes"; `min` de inputs con `toISOString()` corre el rango; `Math.ceil(diff/86400000)` incorrecto con DST.

---

## 🟡 HALLAZGOS MEDIOS (selección)

- **Migraciones no reproducibles**: `20260503020000`/`20260503040000` crean policies y FK sobre `created_by` **sin agregar la columna** (las tablas tienen `owner_id NOT NULL`); `20260510000000:143` referencia `h.owner_id` inexistente (hotels usa `manager_id`) → falla al aplicar.
- **Drift de migraciones**: 3 fuentes de verdad (`supabase/migrations/`, `supabase_migration.sql` legacy con roles `tourist/manager`, `RAN_SQL_MIGRATION.sql`). `run_migration.js` ejecuta SQL partido por `;` ignorando errores por statement. BD real tiene 3 migraciones que no están en local y viceversa (documentado en 001/002).
- **Policies viejas nunca dropeadas**: `"Anyone can view custom room types"`/`custom services` (`USING(true)`) siguen vivas (los DROP usan otro nombre) → catálogos de owners visibles públicamente.
- **RLS rompe features**: sin policy de UPDATE en `registration_codes` (el marcado `used` falla), `comments` con `WITH CHECK` que la UI no cumple (ver crítico 10), `updatePassword` sin verificar password actual, reset password sin destino.
- **Faltan índices** sobre FKs de `support_tickets`, `hotels.branch_of`, `rooms.custom_room_type_id`, `custom_*`.
- **`room_availability.price_override` nunca se aplica** al precio.
- **`likeComment` read-then-write no atómico** (likes inflables, sin dedupe).
- **`dist/` y `RAN_SQL_MIGRATION.sql` en el repo**; nombre de paquete `"my-app"`; `components.json` apunta tailwind a `postcss.config.js`; `vite.config.ts` usa plugin `inspectAttr()` de desarrollo en build de prod.
- **Transiciones de estado de reserva sin máquina de estados**: `updateReservationStatus` permite `pending→completed`, `cancelled→accepted`; `getOverduePendingReservations` registrado en DI sin consumidores.
- **Imágenes**: doble escritura (`hotels.images text[]` + tabla `images`) sin reconciliación; delete de hotel/room no limpia filas de `images` ni storage → huérfanos.
- **Fecha hardcodeada `© 2024`** en Footer; stats falsas en HomePage cuando no hay datos ("120+", "10k+"); botones de iconos sin `aria-label`; `#96785A` no pasa WCAG AA en texto chico; `<Link>` anidados en cards; `overflow-hidden` + `overflow-y-auto` en el mismo modal → contenido cortado en mobile.

---

## 🟢 BAJOS / POSITIVOS

- **Positivo**: anon key como única credencial en `src/`; RLS habilitada en casi todas las tablas; WebP obligatorio vía canvas neutraliza SVG/HTML-polyglot; `get_hotel_manager_id` con `SECURITY DEFINER` y `search_path` correcto; triggers de `updated_at` y status history; `persistSession`+`autoRefreshToken` activos; domain desacoplado y limpio; DI singleton coherente en stores y páginas cliente; sin fugas de memoria por suscripciones.
- ESLint básico sin `recommendedTypeChecked` ni `no-restricted-imports` de capas; `tsconfig` sin `noUncheckedIndexedAccess`/`exactOptionalPropertyTypes`; alias `@` en 3 lugares.

---

## Resumen Ejecutivo por Severidad

| Severidad | Cantidad aprox. | Ejemplos |
|---|---|---|
| Crítico | 12 | Escalada a admin ×2, RLS reservations, registration_codes, secrets, storage, SQL directo en 14+ páginas, comentarios rotos, dashboard manager, lógica habitación duplicada, router partido, sin bootstrap de sesión |
| Alto | ~18 | Reset password roto, signUp navega igual, cancelación inconsistente, componentes monstruo, kit UI sin usar, moneda, dark mode, stores sin reset, migraciones no reproducibles |
| Medio | ~20 | Policies viejas vivas, índices faltantes, doble escritura imágenes, transiciones de estado, fechas con huso, accesibilidad |
| Bajo | varios | Detalles de config, hardcodeos, fecha footer |

---

## Prioridad de Remediación Sugerida

**FASE 0 — Seguridad (bloqueante, en Supabase, no en código)**
1. Rotar `service_role` / `sb_secret_*` / anon key y limpiar historial git (`.temp/`, `run_migration.js`).
2. Trigger `handle_new_user`: fijar rol `'client'` siempre (ignorar metadata) — elimina la escalada vía signUp.
3. RLS `users`: `UPDATE` con `WITH CHECK` que impida cambiar `role` (o revoke UPDATE).
4. `reservations`: dropear las policies `USING(true)`/`WITH CHECK(true)` residuales y reemplazar por policies limpias (verificar contra BD real con `pg_policies` antes).
5. Mover validación de `registration_codes` a un RPC `SECURITY DEFINER` (marcar `used` en la misma transacción), eliminar el SELECT público, usar códigos más largos/aleatorios + rate-limit.
6. Storage/`images`: policies de INSERT con ownership (`<hotelId>` → manager, etc.) y `WITH CHECK` en UPDATE.

**FASE 1 — Bugs activos de funcionalidad**
7. Comentarios: usar `user.id` real en vez de `"current-user"`.
8. `ManagerDashboardPage`: `.in("room.hotel_id", hotelIds)`.
9. Bootstrap de sesión (`getSession`/`onAuthStateChange` en raíz) + `resetAllStores()` en `signOut`.
10. `signUp`: re-lanzar error; no navegar si falla.
11. Unificar ocupar/liberar habitación en el repositorio de reservas; centralizar cancelación con fees y liberación.
12. Reset de password: ruta que procese `access_token` y permita fijar password nueva.
13. Arreglar `AppRouter.tsx` (ruta `</Route>` huérfana) y agregar catch-all 404.

**FASE 2 — Deuda de arquitectura/UX**
14. Mover todo acceso directo a Supabase desde páginas hacia repositorios/usecases.
15. Extraer `DashboardLayout` de Admin/Manager; trocear `Navbar`, `HotelDetailPage`, `RoomDetailPage`.
16. Montar `<Toaster>`, adoptar `Dialog/AlertDialog/Empty/Spinner`; reemplazar `alert/confirm`.
17. Unificar moneda (Bs/$) en utilidad de formato y dark mode en un provider único.
18. `recommendedTypeChecked` + `no-restricted-imports` para prohibir `@/data` desde `presentation`.

---

## Archivos de Mayor Prioridad

- `src/presentation/pages/client/HotelDetailPage.tsx` (895 l.) y `RoomDetailPage.tsx` (704 l.)
- `src/presentation/pages/manager/ManagerDashboardPage.tsx`, `ReservationDetailPage.tsx` (767), `CalendarPage.tsx` (721), `HotelManagementPage.tsx` (610), `RoomManagementPage.tsx` (529)
- `src/presentation/providers/useAuthStore.ts` y stores asociadas
- `src/data/repositories/Supabase*Repository.ts`
- `src/core/router/AppRouter.tsx`
- `supabase/migrations/` (reconciliar con BD real antes de tocar RLS)
