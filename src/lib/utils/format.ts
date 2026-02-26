import { format, formatDistanceToNow, isAfter, isBefore, addDays } from "date-fns"
import { es } from "date-fns/locale"

export function formatCurrency(amount: number | string | null | undefined): string {
  const num = Number(amount ?? 0)
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—"
  return format(new Date(date), "d 'de' MMMM, yyyy", { locale: es })
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "—"
  return format(new Date(date), "dd/MM/yyyy")
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = new Date(date)
  // Mostrar en zona horaria de Colombia (UTC-5) usando Intl nativo
  const formatted = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
    hour12: false,
  }).format(d)
  // "25/02/2026, 13:03" → "25/02/2026 a las 13:03"
  return formatted.replace(", ", " a las ")
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return "—"
  return formatDistanceToNow(new Date(date), { locale: es, addSuffix: true })
}

export function getMembershipStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: "Activa",
    EXPIRED: "Vencida",
    PENDING: "Pendiente",
    CANCELLED: "Cancelada",
    FROZEN: "Congelada",
  }
  return labels[status] ?? status
}

export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    CASH: "Efectivo",
    CARD: "Tarjeta",
    TRANSFER: "Transferencia",
    NEQUI: "Nequi",
    DAVIPLATA: "Daviplata",
    OTHER: "Otro",
  }
  return labels[method] ?? method
}

export function getMembershipStatusColor(status: string, endDate?: Date | string | null): {
  badge: string
  dot: string
} {
  if (status === "ACTIVE") {
    const soon = endDate && isBefore(new Date(endDate), addDays(new Date(), 7))
    if (soon) return { badge: "bg-yellow-100 text-yellow-800 border-yellow-200", dot: "bg-yellow-500" }
    return { badge: "bg-green-100 text-green-800 border-green-200", dot: "bg-green-500" }
  }
  if (status === "EXPIRED") return { badge: "bg-red-100 text-red-800 border-red-200", dot: "bg-red-500" }
  if (status === "PENDING") return { badge: "bg-blue-100 text-blue-800 border-blue-200", dot: "bg-blue-500" }
  if (status === "FROZEN") return { badge: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-400" }
  return { badge: "bg-gray-100 text-gray-800 border-gray-200", dot: "bg-gray-400" }
}
