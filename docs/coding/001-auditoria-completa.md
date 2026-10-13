# Auditoría Completa — Tourist Corner

**Fecha**: 2026-05-21
**Agentes**: Software Architect, Code Reviewer, Security Engineer, Frontend Developer, Performance Benchmarker, Database Optimizer

---

## Scores por Área

| Área | Score | Estado |
|------|:-----:|:------:|
| **Arquitectura** | **6.5/10** | ⚠️ Base sólida, violaciones en admin pages |
| **Calidad de Código** | **6.5/10** | ⚠️ Bueno en general, barrel exports incompletos |
| **Seguridad** | **3.5/10** | ❌ Registration codes expuestos |
| **Frontend/UX** | **5.5/10** | ❌ Sin lazy loading, accesibilidad ausente |
| **Rendimiento** | **4/10** | ❌ Sin code splitting, CLS alto |
| **Base de Datos** | **3.5/10** | ❌ Políticas RLS con drift |
| **Global** | **5.0/10** | ⚠️ Requiere atención |

---

## DB Real vs Auditoría — Correcciones

| Hallazgo Auditoría | Realidad en DB |
|---|---|
| `custom_room_types` sin `created_by` | ✅ **Sí existe** |
| `custom_services` sin `created_by` | ✅ **Sí existe** |
| `reservations` con `USING(true)` | ✅ **No existe**, ya usa `auth.uid() = user_id` |
| `hotels` ref `owner_id` inexistente | ✅ Migración nunca ejecutada |
| `registration_codes` públicos | ❌ **Sí existe**, sigue vulnerable |
| Storage INSERT sin ownership | ❌ **Sigue sin verificación** |

---

## Hallazgos Críticos (Prioridad Inmediata)

1. **Registration codes expuestos** → Cualquiera sin auth puede enumerar códigos y escalar a owner
2. **ManagerDashboardPage query rota** → `.in("hotel_id")` en tabla sin esa columna
3. **HotelDetailPage "current-user" hardcodeado** → Comentarios con UUID inválido
4. **getReservationsByHotelIds query rota** → `.in('room.hotel_id')` no funciona en Supabase JS
5. **Sin code splitting** → Bundle inicial ~500-700KB gzip
6. **Imágenes sin lazy loading ni dimensiones** → CLS ~0.3-0.6

## Bugs Adicionales Descubiertos

- B1: `HotelDetailPage.tsx` usa `"current-user"` como userId para comentarios
- B2: `ManagerDashboardPage.tsx` query a `reservations` sin columna `hotel_id`

## DRIFT de Migraciones

- **3 migraciones en DB que no están localmente**: 20260507010701, 20260507035201, 20260514225950
- **4 migraciones locales no aplicadas**: 20260509_client_features, 20260509_avatars_bucket, 20260510_enhance_reservations (contiene bug), 20260511_images_table

---

## Hoja de Ruta

### Semana 1 (Bugs + Seguridad)
- Fix ManagerDashboard, HotelDetailPage, getReservationsByHotelIds
- Cerrar RLS registration_codes + crear función SECURITY DEFINER

### Semana 2 (Sincronizar drift + Quick wins)
- Sincronizar migraciones, barrel exports, ruta 404, ErrorBoundary

### Semana 3 (Rendimiento)
- React.lazy, loading="lazy", manualChunks

### Semana 4+ (Arquitectura)
- Migrar admin pages a stores/usecases
