"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { startOfDay, endOfDay, addDays } from "date-fns"

export type Notification = {
  type: string
  message: string
  count: number
  href: string
  severity: "error" | "warning" | "info"
}

async function getGymId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")
  const gym = await prisma.gym.findUnique({ where: { ownerId: session.user.id } })
  if (!gym) throw new Error("Gimnasio no encontrado")
  return gym.id
}

export async function getNotifications(): Promise<Notification[]> {
  const gymId = await getGymId()
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const tomorrow = addDays(now, 1)
  const tomorrowStart = startOfDay(tomorrow)
  const tomorrowEnd = endOfDay(tomorrow)

  const [
    vencidasHoy,
    vencenManana,
    sinMembresia,
    clasesMembresiasTotales,
  ] = await Promise.all([
    // Membresías vencidas hoy
    prisma.membership.count({
      where: {
        member: { gymId },
        endDate: { gte: todayStart, lte: todayEnd },
        status: "ACTIVE",
      },
    }),
    // Membresías que vencen mañana
    prisma.membership.count({
      where: {
        member: { gymId },
        endDate: { gte: tomorrowStart, lte: tomorrowEnd },
        status: "ACTIVE",
      },
    }),
    // Socios sin membresía activa
    prisma.member.count({
      where: {
        gymId,
        memberships: {
          none: {
            status: "ACTIVE",
          },
        },
      },
    }),
    // Clases con cupos llenos hoy
    prisma.gymClass.findMany({
      where: { gymId, isActive: true },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                date: { gte: todayStart, lte: todayEnd },
                status: "CONFIRMED",
              },
            },
          },
        },
      },
    }),
  ])

  const clasesLlenas = clasesMembresiasTotales.filter(
    (c) => c._count.bookings >= c.capacity
  ).length

  const notifications: Notification[] = []

  if (vencidasHoy > 0) {
    notifications.push({
      type: "expired_today",
      message: `${vencidasHoy} membresía${vencidasHoy > 1 ? "s" : ""} vence${vencidasHoy > 1 ? "n" : ""} hoy`,
      count: vencidasHoy,
      href: "/memberships?status=ACTIVE",
      severity: "error",
    })
  }

  if (vencenManana > 0) {
    notifications.push({
      type: "expiring_tomorrow",
      message: `${vencenManana} membresía${vencenManana > 1 ? "s" : ""} vence${vencenManana > 1 ? "n" : ""} mañana`,
      count: vencenManana,
      href: "/calendar",
      severity: "warning",
    })
  }

  if (sinMembresia > 0) {
    notifications.push({
      type: "no_membership",
      message: `${sinMembresia} socio${sinMembresia > 1 ? "s" : ""} sin membresía activa`,
      count: sinMembresia,
      href: "/members",
      severity: "warning",
    })
  }

  if (clasesLlenas > 0) {
    notifications.push({
      type: "class_full",
      message: `${clasesLlenas} clase${clasesLlenas > 1 ? "s" : ""} con cupos llenos hoy`,
      count: clasesLlenas,
      href: "/classes",
      severity: "info",
    })
  }

  return notifications
}
