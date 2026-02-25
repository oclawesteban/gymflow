# FEATURES_REPORT_5.md — GymFlow v5

Implementación completada el 2026-02-25.
Build: ✅ Sin errores TypeScript | Commit: `0d19b3f` | Push: ✅ `main`

---

## FEATURE 1 — Gestión de Perfil del Admin ✅

### Cambios en Schema
- `User` ahora incluye: `photoUrl String?`, `bio String?`, `phone String?`
- Auth callback actualizado para incluir `photoUrl` en el JWT/session

### Archivos creados/modificados
- `src/lib/actions/profile.ts` — acciones: `getProfile`, `updateProfile`, `changePassword`, `resetPasswordByEmail`
- `src/app/(app)/profile/page.tsx` — página del perfil (server)
- `src/app/(app)/profile/profile-form.tsx` — formulario completo con:
  - Avatar circular con preview en vivo y fallback a iniciales (fondo azul)
  - Campos: nombre, email (read-only), teléfono, bio
  - Sección "Cambiar contraseña" con validación (actual + coincidencia + mínimo 8)
- `src/app/(auth)/forgot-password/page.tsx` — restablece contraseña a "GymFlow2026!" con mensaje claro
- `src/app/(auth)/login/page.tsx` — agregado link "¿Olvidaste tu contraseña?"
- `src/auth.ts` — JWT/session incluye `photoUrl`

---

## FEATURE 2 — Modo Oscuro ✅

### Archivos creados/modificados
- `src/components/ui/theme-toggle.tsx` — botón Sol/Luna usando `next-themes`
- `src/app/layout.tsx` — envuelto en `ThemeProvider` con `attribute="class"`
- `globals.css` — variables dark mode ya estaban; verificado que funcionan con shadcn/ui
- `src/components/layout/sidebar.tsx` — dark mode en todos los elementos del sidebar

---

## FEATURE 3 — Notificaciones In-App ✅

### Archivos creados
- `src/lib/actions/notifications.ts` — `getNotifications()` retorna alertas calculadas en tiempo real:
  - 🔴 Membresías vencidas hoy
  - 🟡 Membresías que vencen mañana
  - 🟠 Socios sin membresía activa
  - ℹ️ Clases con cupos llenos hoy
- `src/components/notifications/notification-bell.tsx` — campana con badge rojo, dropdown con:
  - Lista agrupada por severidad (`error` / `warning` / `info`)
  - Cada alerta clickeable redirige a la sección correspondiente
  - Botón "Ver todos los vencimientos" → `/calendar`

### Integración
- NotificationBell y ThemeToggle agregados al sidebar (desktop) y topbar (mobile)

---

## FEATURE 4 — Sistema de Descuentos ✅

### Cambios en Schema
- Modelo `PromoCode` con: code, discountType (PERCENTAGE/FIXED), discountValue, maxUses, usedCount, validUntil, isActive
- `Gym` → relación `promoCodes PromoCode[]`
- `Payment` → campos opcionales `promoCodeId` y `discountAmount`

### Archivos creados
- `src/lib/actions/discounts.ts` — `getPromoCodes`, `createPromoCode`, `togglePromoCode`, `deletePromoCode`, `validatePromoCode`
- `src/app/(app)/discounts/page.tsx` — lista de códigos con estado (activo/vencido/agotado), usos, vigencia
- `src/app/(app)/discounts/new/page.tsx` — formulario crear código
- `src/app/(app)/discounts/promo-code-actions.tsx` — menú activar/desactivar/eliminar
- `src/lib/actions/payments.ts` — `createPayment` soporta `promoCodeId` e incrementa `usedCount`
- `src/app/(app)/payments/new/page.tsx` — campo de código promo con validación en tiempo real:
  - Al presionar Enter/Tab o botón "Aplicar": valida el código
  - Muestra "✅ Descuento aplicado: -$X" o error
  - Actualiza el monto final automáticamente

### Sidebar
- "Descuentos" con ícono `Tag` agregado después de Pagos

---

## FEATURE 5 — Gestión de Instructores ✅

### Cambios en Schema
- Modelo `Instructor` con: name, email, phone, photoUrl, specialty, bio, isActive
- `GymClass` → campo `instructorId String?` con relación a `Instructor`
- `Gym` → relación `instructors Instructor[]`

### Archivos creados
- `src/lib/actions/instructors.ts` — `getInstructors`, `getInstructor`, `createInstructor`, `updateInstructor`, `deleteInstructor`, `getInstructorsForSelect`
- `src/app/(app)/instructors/page.tsx` — grid de tarjetas con foto/iniciales, especialidad, clases asignadas
- `src/app/(app)/instructors/new/page.tsx` — formulario crear instructor con avatar preview
- `src/app/(app)/instructors/[id]/page.tsx` — perfil completo con clases asignadas

### Modificados
- `src/lib/actions/classes.ts` — `createClass` y `updateClass` soportan `instructorId`
- `src/app/(app)/classes/new/page.tsx` — campo instructor usa `SearchableSelect` (o mensaje si no hay instructores)
- `src/components/classes/edit-class-form.tsx` — ídem para edición

### Sidebar
- "Instructores" con ícono `GraduationCap` agregado después de Clases

---

## FEATURE 6 — Analytics de Asistencia ✅

### Server Actions (agregadas a `reports.ts`)
- `getAttendanceHeatmap()` — agrupa asistencias por `dayOfWeek × hour`
- `getTopMembers(limit=10)` — top socios por check-ins en 30 días con % de asistencia
- `getWeeklyAttendanceTrend()` — totales y promedios por día en 4 semanas

### Página `/reports`
- Sistema de tabs: **General** | **Asistencia**

### Tab Asistencia
1. **Heatmap semanal**: Grid 7 días × 12 bloques de 2h, escala azul claro→oscuro, tooltip con datos
2. **Badges de día/hora pico** calculados dinámicamente
3. **Top 10 socios**: tabla con avatar, barra de progreso (%), contador de visitas
4. **LineChart tendencia**: 4 semanas, total + promedio/día

---

## FEATURE 7 — Onboarding para Nuevos Gimnasios ✅

### Paquetes instalados
- `canvas-confetti` + `@types/canvas-confetti`

### Archivos creados
- `src/components/onboarding/onboarding-wizard.tsx` — wizard modal de 5 pasos:
  - **Paso 0**: Bienvenida con descripción de los 3 pasos
  - **Paso 1**: Formulario gym (nombre, ciudad, teléfono)
  - **Paso 2**: Formulario primer plan (nombre, precio, duración)
  - **Paso 3**: Formulario primer miembro (nombre, teléfono)
  - **Paso 4**: ¡Listo! con confetti 🎉 + resumen de lo configurado + botón "Ir al dashboard"
  - Barra de progreso animada, indicadores de paso, botón X para omitir
  - Guarda `gymflow_onboarding_complete` en localStorage para no mostrar de nuevo

### Lógica de activación
- `getOnboardingStatus()` en `dashboard.ts` verifica `members.count === 0 && plans.count === 0`
- `DashboardPage` lo llama y pasa props al wizard

---

## Resumen de Archivos

| Categoría | Archivos creados | Archivos modificados |
|-----------|-----------------|---------------------|
| Schema    | —               | `prisma/schema.prisma` |
| Actions   | 5 nuevos        | 3 modificados |
| Pages     | 10 nuevas       | 5 modificadas |
| Components | 4 nuevos       | 3 modificados |

**Total**: 33 archivos cambiados, 3,395 inserciones, 419 eliminaciones.

---

## Notas Técnicas

- El build pasó sin errores TypeScript en la primera corrección (formatter type en recharts)
- Dark mode funciona con todos los componentes shadcn/ui gracias a las variables CSS existentes
- El sidebar está completamente actualizado con dark mode, avatar del admin, notificaciones y toggle de tema
- Las relaciones de instructores son opcionales (retrocompatible con clases existentes)
- Los códigos promo son case-insensitive al validar (se guardan en UPPER_CASE)
