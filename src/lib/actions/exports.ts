"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { format } from "date-fns"
import { es } from "date-fns/locale"

async function getGymId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")
  const gym = await prisma.gym.findUnique({ where: { ownerId: session.user.id } })
  if (!gym) throw new Error("Gimnasio no encontrado")
  return gym.id
}

/** Etiquetas para el status de membresía en español */
function etiquetaStatus(status: string): string {
  const etiquetas: Record<string, string> = {
    ACTIVE: "Activa",
    EXPIRED: "Vencida",
    PENDING: "Pendiente",
    CANCELLED: "Cancelada",
    FROZEN: "Congelada",
  }
  return etiquetas[status] ?? status
}

/** Etiquetas para el método de pago en español */
function etiquetaMetodo(method: string): string {
  const etiquetas: Record<string, string> = {
    CASH: "Efectivo",
    CARD: "Tarjeta",
    TRANSFER: "Transferencia",
    NEQUI: "Nequi",
    DAVIPLATA: "Daviplata",
    OTHER: "Otro",
  }
  return etiquetas[method] ?? method
}

/**
 * Exportar lista de miembros con sus membresías activas
 */
export async function exportMembers() {
  const gymId = await getGymId()

  const members = await prisma.member.findMany({
    where: { gymId },
    include: {
      memberships: {
        include: { plan: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  })

  return members.map((m) => {
    const ultima = m.memberships[0]
    return {
      "Nombre": m.name,
      "Email": m.email ?? "—",
      "Teléfono": m.phone ?? "—",
      "Plan activo": ultima?.plan?.name ?? "Sin plan",
      "Estado membresía": ultima ? etiquetaStatus(ultima.status) : "—",
      "Fecha vencimiento": ultima
        ? format(new Date(ultima.endDate), "dd/MM/yyyy", { locale: es })
        : "—",
      "Fecha registro": format(new Date(m.createdAt), "dd/MM/yyyy", { locale: es }),
    }
  })
}

/**
 * Exportar pagos, con filtro opcional por mes y año
 */
export async function exportPayments(mes?: number, anio?: number) {
  const gymId = await getGymId()

  const ahora = new Date()
  const mesActual = mes ?? ahora.getMonth() + 1
  const anioActual = anio ?? ahora.getFullYear()

  let fechaFiltro: { gte?: Date; lte?: Date } | undefined

  if (mes !== undefined || anio !== undefined) {
    const inicio = new Date(anioActual, mesActual - 1, 1)
    const fin = new Date(anioActual, mesActual, 0, 23, 59, 59)
    fechaFiltro = { gte: inicio, lte: fin }
  }

  const pagos = await prisma.payment.findMany({
    where: {
      membership: { member: { gymId } },
      ...(fechaFiltro ? { paidAt: fechaFiltro } : {}),
    },
    include: {
      membership: {
        include: { member: true, plan: true },
      },
    },
    orderBy: { paidAt: "desc" },
  })

  return pagos.map((p) => ({
    "Miembro": p.membership.member.name,
    "Plan": p.membership.plan.name,
    "Monto": Number(p.amount),
    "Método de pago": etiquetaMetodo(p.method),
    "Fecha": format(new Date(p.paidAt), "dd/MM/yyyy HH:mm", { locale: es }),
    "Referencia": p.reference ?? "—",
  }))
}
