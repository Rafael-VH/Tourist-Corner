# Plan Detallado Corregido — Tourist Corner

**Basado en**: Auditoría completa + verificación de DB real
**Fecha**: 2026-05-21

---

## Acceso Service Role (Integrado)

Se integró la `service_role` key al plan. Esto permite:

| Capacidad | Sin service_role | Con service_role |
|-----------|:----------------:|:----------------:|
| Migraciones SQL | ⚠️ Limitado por RLS | ✅ **Sin restricciones** |
| Fix datos corruptos | ❌ Solo desde frontend | ✅ **UPDATE directo** |
| Storage policies | ❌ Sin acceso | ✅ **Control total** |
| Rotación de claves | ❌ Manual | ✅ **Automatizable** |
| Branch management | ❌ No disponible | ✅ `supabase_create_branch` |

**Advertencia**: La `service_role` key **bypassea todas las RLS policies**. Después de aplicar los cambios, la key debe rotarse en el panel de Supabase.

## Correcciones vs Auditoría Original

| Item | Cambio en el plan |
|------|-------------------|
| A2 (USING true en reservations) | ❌ **Eliminado** — ya corregido en DB |
| A3 (created_by vs owner_id) | ❌ **Eliminado** — columna ya existe |
| A5 (owner_id en hotel policy) | ❌ **Eliminado** — migración nunca ejecutada |
| Sincronizar drift | ✅ **Agregado** — 7 migraciones desincronizadas |

---

## FASE 0 — P0: Bugs Activos (frontend + DB)

### B0a — Limpiar datos corruptos en comments (service_role)
**Ejecución**: SQL directo con service_role
**Problema**: Comentarios existentes con `user_id = 'current-user'` (string inválida)
**Fix**:
```sql
UPDATE public.comments 
SET user_id = NULL, user_name = 'Usuario Anónimo'
WHERE user_id = 'current-user'::text OR user_id::text = 'current-user';
```
**Riesgo**: BAJO — solo afecta registros corruptos

### B2 — ManagerDashboardPage: fix query reservations
**Archivo**: `src/presentation/pages/manager/ManagerDashboardPage.tsx` (línea 76)
**Problema**: `.in("hotel_id", hotelIds)` en tabla `reservations` que no tiene columna `hotel_id`
**Fix**: Usar `room:room_id!inner(name, hotel_id)` con `.in("room.hotel_id", hotelIds)`
**Riesgo**: ALTO — dashboard manager actualmente no muestra datos
**Mitigación**: Solo cambiar la query, no refactorizar a Clean Architecture
**Nota**: Con service_role podemos verificar que la query corregida funciona antes del deploy

### B1 — HotelDetailPage: fix "current-user"
**Archivo**: `src/presentation/pages/client/HotelDetailPage.tsx` (línea 104)
**Problema**: `userId: user?.id || "current-user"` — "current-user" no es UUID
**Fix**: `userId: user?.id || null`
**Riesgo**: ALTO — comentarios se insertan con ID inválido
**Mitigación**: No lanzar error si no hay auth, mantener `userName` con fallback

### A4 — SupabaseReservationRepository: fix getReservationsByHotelIds
**Archivo**: `src/data/repositories/SupabaseReservationRepository.ts` (líneas 85-96, 104)
**Problema**: `.in('room.hotel_id', hotelIds)` no funciona en Supabase JS
**Fix**: Primero obtener roomIds de rooms, luego filtrar reservations por room_id
**Riesgo**: ALTO — mismo error en 2 métodos
**Mitigación**: Aplicar fix a ambos métodos

---

## FASE 1 — P1: Seguridad (DB + Frontend)

### A1a — Cerrar RLS pública de registration_codes (service_role)
**Problema**: `"Public can select unused registration codes"` con `USING (used = false)`
**Acceso**: Service_role permite DROP y CREATE sin restricciones
**Fix**: 
1. `DROP POLICY "Public can select unused registration codes" ON public.registration_codes;`
2. Crear función `validate_registration_code(p_code text)` SECURITY DEFINER
3. Mantener políticas admin/owner para SELECT/INSERT existentes
**Riesgo**: ALTO — ventana entre deploy SQL y frontend
**Mitigación**: 2 fases (agregar función sin eliminar policy vieja, luego migrar frontend)

### A1b — Función validate_registration_code() (service_role)
```sql
CREATE OR REPLACE FUNCTION public.validate_registration_code(p_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  SELECT id INTO v_id FROM public.registration_codes
    WHERE code = p_code AND used = false;
  RETURN v_id;
END;
$$;
```

### A1c — Actualizar SupabaseAuthRepository
**Archivo**: `src/data/repositories/SupabaseAuthRepository.ts` (líneas 35-64)
**Cambio**: Reemplazar query directa por `supabase.rpc('validate_registration_code', { p_code })`
**Validación**: Con service_role, probar que `rpc()` funciona correctamente antes de eliminar la policy pública

### A1d — Storage RLS: ownership check en INSERT (service_role)
**Problema**: Políticas de storage solo verifican `auth.role() = 'authenticated'` sin ownership
**Fix**: Usar `storage.foldername(name)` para verificar que el folder corresponde al manager
```sql
DROP POLICY IF EXISTS "Authenticated users can upload hotel images" ON storage.objects;
CREATE POLICY "Hotel managers can upload hotel images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'hotel-images' AND
    EXISTS (
      SELECT 1 FROM public.hotels h
      WHERE h.id = (storage.foldername(name))[1]::uuid
      AND h.manager_id = auth.uid()
    )
  );
```

---

## FASE 1b — Rotación de Claves (post-seguridad)

### Después de aplicar todos los fixes de seguridad
1. Ir a Supabase Dashboard → Settings → API
2. **Rotar `service_role` key** (la actual queda expuesta en info.txt)
3. **Rotar `anon` public key** (opcional pero recomendado)
4. Actualizar `.env` del proyecto con las nuevas keys
5. Eliminar `supabase/.temp/info.txt` (o mantener .gitignore, pero rotar la key)

---

## FASE 2 — Sincronizar DRIFT (con service_role)

### Sincronizar migraciones
1. Extraer SQL de migraciones DB-only (20260507010701, 20260507035201, 20260514225950) a archivos locales
2. Revisar migraciones locales no aplicadas (4 archivos)
3. **CRÍTICO**: `20260510_enhance_reservations.sql` referencia `h.owner_id` — corregir a `h.manager_id` ANTES de ejecutar
4. Aplicar migraciones faltantes en orden cronológico mediante `supabase_apply_migration`
5. Verificar estado con `supabase_list_tables` y `pg_policies`

---

## FASE 3 — P2: Quick Wins

### Barrel exports
- `src/domain/usecases/index.ts`: agregar `export * from './SupportTicketUseCases'`
- `src/data/repositories/index.ts`: agregar repos faltantes

### Ruta 404
- Agregar `<Route path="*" element={<NotFoundPage />} />` en AppRouter

### ErrorBoundary
- Envolver rutas con componente ErrorBoundary

### React.lazy + Suspense
- Convertir imports estáticos a `React.lazy()`
- Agregar `<Suspense fallback={...}>` por grupo de rutas

### loading="lazy" en imágenes
- Búsqueda global de `<img>`, agregar `loading="lazy"`, `width`/`height`, `aspect-ratio`
- **No aplicar** a hero images above-the-fold

---

## Orden de Implementación (con service_role)

```
FASE 0 (bugs) ──────→ FASE 1 (seguridad) ──→ FASE 1b (rotar keys) ──→ FASE 2 (drift) ──→ FASE 3 (quick wins)
     │                        │                          │                      │
     ├── B0a: Clean data      ├── A1a: Cerrar RLS         ├── Rotar              ├── Sync migrations
     ├── B2: ManagerDashboard ├── A1b: Función SQL         │   service_role       ├── Barrel exports
     ├── B1: HotelDetailPage  ├── A1c: Frontend rpc        ├── Rotar anon key     ├── 404 + ErrorBoundary
     └── A4: Repository fix   ├── A1d: Storage RLS        └── Update .env         ├── React.lazy
                              └── (service_role)                                 └── loading="lazy"
```

**Regla clave**: Rotar `service_role` DESPUÉS de aplicar todos los cambios de BD, ANTES de hacer deploy del frontend. Esto asegura que las queries anon/client en producción usen las nuevas policies sin que la key expuesta sea un riesgo.

## Resumen de Acceso Service Role

| Operación | Herramienta | Cuándo |
|-----------|-------------|--------|
| Fix datos corruptos (comments) | `supabase_execute_sql` | FASE 0 |
| DROP policy registration_codes | `supabase_execute_sql` | FASE 1 |
| CREATE FUNCTION validate_registration_code | `supabase_execute_sql` | FASE 1 |
| Fix storage policies | `supabase_execute_sql` | FASE 1 |
| Sync migrations faltantes | `supabase_apply_migration` | FASE 2 |
| Verificar policies | `supabase_list_tables` + queries | Post-cada cambio |
