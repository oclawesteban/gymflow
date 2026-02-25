# GymFlow — Reporte de Features 3

**Fecha:** 2026-02-25  
**Commit:** `feat: PWA instalable, historial por miembro y calendario de vencimientos`  
**Build:** ✅ Sin errores TypeScript

---

## FEATURE 1 — PWA (Progressive Web App)

GymFlow ahora es una PWA instalable en el celular del administrador.

### Archivos creados/modificados:
- `src/app/manifest.ts` — Manifest de la PWA con nombre, colores, iconos y start_url
- `public/icon.svg` — Ícono SVG de GymFlow (mancuerna azul sobre fondo #2563eb)
- `public/icon-192.png` — Ícono PNG 192×192 generado con sharp (para maskable/Apple)
- `public/icon-512.png` — Ícono PNG 512×512 generado con sharp
- `scripts/generate-icons.js` — Script de generación de iconos PNG
- `src/app/layout.tsx` — Metadata actualizada con manifest, appleWebApp, themeColor y meta tags PWA en `<head>`
- `src/components/pwa/install-banner.tsx` — Banner discreto en la parte inferior que detecta `beforeinstallprompt` y permite instalar la PWA
- `src/app/(app)/layout.tsx` — Agrega `<InstallBanner />` al layout autenticado

### Comportamiento del banner:
- Solo aparece si la app aún no está instalada (`display-mode: standalone`)
- Detecta el evento `beforeinstallprompt` (compatible con Android/Chrome)
- Permite cerrar y no volver a molestar en la sesión (`sessionStorage`)
- Diseño mobile-first discreto en la esquina inferior

---

## FEATURE 2 — Historial completo por miembro

La página `/members/[id]` ahora muestra TODO el historial del socio en 4 tabs.

### Archivos creados/modificados:
- `src/lib/actions/members.ts` — Agrega `getMemberHistory()` que incluye membresías con plan y pagos, y hasta 200 registros de asistencia
- `src/components/ui/tabs.tsx` — Componente Tabs de shadcn/ui instalado
- `src/app/(app)/members/[id]/page.tsx` — Página reescrita con 4 tabs

### Tabs implementados:
| Tab | Contenido |
|-----|-----------|
| **Información** | Datos de contacto, emergencia y notas |
| **Membresías** | Historial completo con estado (badge de color), fechas, plan y total pagado por membresía |
| **Pagos** | Todos los pagos de todas las membresías: fecha, monto, método, referencia, plan. Total pagado al fondo |
| **Asistencia** | Estadísticas (visitas este mes, mes anterior, racha de días consecutivos) + lista completa con scroll |

---

## FEATURE 3 — Calendario de vencimientos

Nueva ruta `/calendar` con calendario mensual interactivo de membresías que vencen.

### Archivos creados:
- `src/lib/actions/calendar.ts` — Server action `getMembershipsByMonth()` que filtra membresías por rango de fechas y las agrupa por día `{ 'YYYY-MM-DD': [...] }`
- `src/app/(app)/calendar/page.tsx` — Página cliente completa con calendario

### Características del calendario:
- **Navegación** mes anterior / mes siguiente con flechas
- **Grid** de 7 columnas (Lu Ma Mi Ju Vi Sá Do), semana empieza el lunes
- **Colores por urgencia:**
  - 🔴 Rojo: ya venció
  - 🟠 Naranja: vence hoy o mañana
  - 🟡 Amarillo: vence esta semana (≤7 días)
  - 🔵 Azul: vence este mes
- **Badge** en cada día con el número de vencimientos
- **Panel de detalle** al hacer clic en un día: lista de miembros con nombre, plan, estado y botón de recordatorio WhatsApp
- **Botón WhatsApp** genera mensaje personalizado con urgencia del vencimiento
- **Resumen** al final: total de membresías que vencen en el mes mostrado
- **Sidebar actualizado** con ítem "Vencimientos" (icono `CalendarDays`, ruta `/calendar`)

---

## Verificación
```
✓ npm run build — sin errores
✓ git commit — 17 archivos, 1261 inserciones
✓ git push origin main — enviado a GitHub
```
