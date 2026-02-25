# FEATURES_REPORT_4.md — Resumen de Implementación

**Fecha:** 2026-02-25  
**Commit:** `feat: portal del socio, recibos PDF y clases grupales`  
**Build:** ✅ Sin errores TypeScript  
**Push:** ✅ Desplegado en `main` → Vercel

---

## FEATURE 1 — Portal del Socio ✅

### Schema Prisma
- Agregado `portalEmail String? @unique` y `portalPassword String?` al modelo `Member`
- Los modelos `GymClass` y `ClassBooking` incluidos en este push también

### Rutas del portal (`/portal/*`)
| Ruta | Descripción |
|------|-------------|
| `/portal/layout.tsx` | Layout sin sidebar admin, con logo GymFlow |
| `/portal/login` | Formulario login (email + contraseña) |
| `/portal/register` | Registro con email, contraseña y código de gym |
| `/portal/dashboard` | Dashboard completo del socio |

### Dashboard del socio incluye:
- 🎫 **Membresía activa**: plan, fecha de vencimiento, días restantes, barra de progreso porcentual
- 📱 **QR personal** (componente MemberQR reutilizado)
- 💰 **Últimos 5 pagos** con ícono de método y monto
- 📊 **Contador de asistencias** del mes actual
- ✅ **Botón de check-in propio** — registra entrada desde el portal

### Autenticación del portal
- JWT firmado con `jose` (HS256, expira en 7 días)
- Cookie httpOnly `portal_token` manejada via API Route `/api/portal/auth`
- Acciones del server: `registerMemberPortal`, `loginMemberPortal`, `getMemberPortalData`, `selfCheckIn`

### Configuración en Settings (`/settings`)
- Nueva sección "Portal del Socio" al final de la página
- Muestra: **Código del gimnasio** (gymId) con botón de copiar
- URL del portal: `https://gymflow-zeta.vercel.app/portal/login` con copiar/abrir
- Link de registro directo con gymCode pre-llenado

### Perfil de miembro (`/members/[id]`)
- Tab "Información": sección "Portal del Socio" que muestra si el portal está activado (email)
- Si NO está activado: botón "Invitar al portal" que lleva a `/portal/register?gym={gymId}`

---

## FEATURE 2 — Recibos de Pago en PDF ✅

### Instalación
```bash
npm install jspdf jspdf-autotable
```

### Componente `ReceiptButton`
- Ubicación: `src/components/payments/receipt-button.tsx`
- Genera PDF con jsPDF directamente en el navegador (client-side)
- Diseño: header azul (#2563EB), tabla de datos del pago, pie de página
- Nombre del archivo: `recibo-{id_slice}-{nombre-socio}.pdf`

### Interface `PaymentReceiptData`
```ts
interface PaymentReceiptData {
  id: string
  amount: number
  method: string
  reference: string | null
  paidAt: Date | string
  memberName: string
  planName: string
}
```

### Integrado en:
1. **`/payments/page.tsx`** — botón "Recibo PDF" en cada tarjeta de pago
2. **`/members/[id]/page.tsx`** — botón "Recibo PDF" en cada pago del historial del socio

---

## FEATURE 3 — Clases Grupales ✅

### Schema Prisma — nuevos modelos
- `GymClass`: id, gymId, name, description, instructor, capacity, dayOfWeek, startTime, endTime, color, isActive
- `ClassBooking`: id, classId, memberId, date, status (CONFIRMED/CANCELLED) con unique constraint `[classId, memberId, date]`
- Relaciones agregadas: `Gym.classes`, `Member.bookings`

### Server actions (`src/lib/actions/classes.ts`)
| Función | Descripción |
|---------|-------------|
| `getClasses()` | Todas las clases activas del gym con bookings |
| `getClass(id)` | Clase con miembros inscritos |
| `createClass(data)` | Crear nueva clase |
| `updateClass(id, data)` | Actualizar clase |
| `deleteClass(id)` | Eliminar clase |
| `bookClass(classId, memberId, date)` | Inscribir socio (verifica cupos) |
| `cancelBooking(classId, memberId, date)` | Cancelar inscripción |
| `getActiveMembers()` | Socios activos para SearchableSelect |

### Páginas
| Ruta | Descripción |
|------|-------------|
| `/classes` | Horario semanal agrupado por día, tarjetas con barra de ocupación |
| `/classes/new` | Formulario crear clase (nombre, instructor, horario, capacidad, color) |
| `/classes/[id]` | Detalle: info, inscribir socios (SearchableSelect), lista de inscritos |
| `/classes/[id]/edit` | Formulario editar clase |

### Componentes de clases
- `ClassActions` — dropdown: ver, editar, eliminar (con confirmación)
- `BookingActions` — botón cancelar inscripción de un socio
- `AddBookingForm` — SearchableSelect + botón inscribir, filtra ya inscritos
- `EditClassForm` — formulario reutilizable para editar

### Sidebar
- Agregado "Clases" con icono `Users2` entre Membresías y Pagos

---

## Archivos creados/modificados

### Nuevos archivos (22)
- `src/lib/actions/portal.ts`
- `src/lib/actions/classes.ts`
- `src/app/portal/layout.tsx`
- `src/app/portal/login/page.tsx`
- `src/app/portal/register/page.tsx`
- `src/app/portal/dashboard/page.tsx`
- `src/app/api/portal/auth/route.ts`
- `src/app/api/portal/checkin/route.ts`
- `src/app/(app)/classes/page.tsx`
- `src/app/(app)/classes/new/page.tsx`
- `src/app/(app)/classes/[id]/page.tsx`
- `src/app/(app)/classes/[id]/edit/page.tsx`
- `src/components/portal/self-checkin-button.tsx`
- `src/components/portal/portal-logout-button.tsx`
- `src/components/payments/receipt-button.tsx`
- `src/components/classes/class-actions.tsx`
- `src/components/classes/booking-actions.tsx`
- `src/components/classes/add-booking-form.tsx`
- `src/components/classes/edit-class-form.tsx`
- `src/components/settings/portal-settings.tsx`

### Archivos modificados (5)
- `prisma/schema.prisma` — nuevos modelos y campos
- `src/components/layout/sidebar.tsx` — agregado link a Clases
- `src/app/(app)/settings/page.tsx` — agregado PortalSettings
- `src/app/(app)/payments/page.tsx` — ReceiptButton + getGymSettings
- `src/app/(app)/members/[id]/page.tsx` — portal status + invite + ReceiptButton

---

## Notas técnicas

- **JWT**: usa librería `jose` (ya incluida como dependencia transitiva de next-auth)
- **PDF**: generado client-side con jsPDF, sin llamadas al servidor
- **Auth del portal**: separado del auth del admin (NextAuth), usa cookies propias httpOnly
- **TypeScript**: cero uso de `any` excepto en el cast necesario de jsPDF autotable `lastAutoTable`
- **Build**: `✓ Compiled successfully` — 29 rutas generadas correctamente
