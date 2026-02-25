export type PlanTier = "FREE" | "BASIC" | "PRO" | "MULTI"

export interface PlanFeatures {
  name: string
  price: number | null          // null = contactar
  priceLabel: string
  members: number               // -1 = ilimitado
  instructors: number           // -1 = ilimitado
  classes: boolean
  advancedReports: boolean
  exportExcel: boolean
  portalSocios: boolean
  whatsappReminders: boolean
  multiSede: boolean
  supportLabel: string
  highlight?: boolean
}

export const PLANS: Record<PlanTier, PlanFeatures> = {
  FREE: {
    name: "Gratis",
    price: 0,
    priceLabel: "$0",
    members: 30,
    instructors: 2,
    classes: false,
    advancedReports: false,
    exportExcel: false,
    portalSocios: true,
    whatsappReminders: false,
    multiSede: false,
    supportLabel: "Comunidad",
  },
  BASIC: {
    name: "Básico",
    price: 49900,
    priceLabel: "$49.900",
    members: 150,
    instructors: 10,
    classes: true,
    advancedReports: false,
    exportExcel: true,
    portalSocios: true,
    whatsappReminders: false,
    multiSede: false,
    supportLabel: "Email",
  },
  PRO: {
    name: "Pro",
    price: 99900,
    priceLabel: "$99.900",
    members: -1,
    instructors: -1,
    classes: true,
    advancedReports: true,
    exportExcel: true,
    portalSocios: true,
    whatsappReminders: true,
    multiSede: false,
    supportLabel: "Prioritario",
    highlight: true,
  },
  MULTI: {
    name: "Multi-sede",
    price: null,
    priceLabel: "Consultar",
    members: -1,
    instructors: -1,
    classes: true,
    advancedReports: true,
    exportExcel: true,
    portalSocios: true,
    whatsappReminders: true,
    multiSede: true,
    supportLabel: "Dedicado",
  },
}

export function getLimitLabel(value: number): string {
  return value === -1 ? "Ilimitado" : value.toString()
}

export function isUnlimited(value: number): boolean {
  return value === -1
}
