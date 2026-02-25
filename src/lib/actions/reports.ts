"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { subMonths, startOfMonth, endOfMonth, format, startOfWeek, endOfWeek, addDays } from "date-fns"
import { es } from "date-fns/locale"

// Obtener ID del gimnasio del usuario autenticado
async function getGymId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const gym = await prisma.gym.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true },
  })

  if (!gym) throw new Error("Gimnasio no encontrado")
  return gym.id
}

// Ingresos agrupados por mes (últimos N meses)
export async function getRevenueByMonth(months = 6) {
  const gymId = await getGymId()
  const now = new Date()
  const result: { mes: string; ingresos: number }[] = []

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i)
    const start = startOfMonth(date)
    const end = endOfMonth(date)

    const agg = await prisma.payment.aggregate({
      where: {
        membership: { member: { gymId } },
        paidAt: { gte: start, lte: end },
      },
      _sum: { amount: true },
    })

    result.push({
      mes: format(date, "MMM yyyy", { locale: es }),
      ingresos: Number(agg._sum.amount ?? 0),
    })
  }

  return result
}

// Crecimiento de miembros por mes (últimos N meses)
export async function getMemberGrowth(months = 6) {
  const gymId = await getGymId()
  const now = new Date()
  const result: { mes: string; nuevos: number; total: number }[] = []

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i)
    const start = startOfMonth(date)
    const end = endOfMonth(date)

    const [nuevos, total] = await Promise.all([
      prisma.member.count({
        where: {
          gymId,
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.member.count({
        where: {
          gymId,
          createdAt: { lte: end },
        },
      }),
    ])

    result.push({
      mes: format(date, "MMM yyyy", { locale: es }),
      nuevos,
      total,
    })
  }

  return result
}

// KPIs del mes actual
export async function getReportKPIs() {
  const gymId = await getGymId()
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const weekFromNow = addDays(now, 7)

  const [
    ingresosAgg,
    miembrosNuevos,
    membresiasActivas,
    membresiasVencidas,
    totalMiembros,
    porVencer,
    pagosRecientes,
  ] = await Promise.all([
    // Ingresos del mes actual
    prisma.payment.aggregate({
      where: {
        membership: { member: { gymId } },
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
    // Miembros nuevos este mes
    prisma.member.count({
      where: {
        gymId,
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    }),
    // Membresías activas
    prisma.membership.count({
      where: {
        member: { gymId },
        status: "ACTIVE",
      },
    }),
    // Membresías vencidas
    prisma.membership.count({
      where: {
        member: { gymId },
        status: "EXPIRED",
      },
    }),
    // Total de miembros
    prisma.member.count({ where: { gymId } }),
    // Por vencer esta semana
    prisma.membership.count({
      where: {
        member: { gymId },
        status: "ACTIVE",
        endDate: { gte: now, lte: weekFromNow },
      },
    }),
    // Últimos 10 pagos
    prisma.payment.findMany({
      where: { membership: { member: { gymId } } },
      include: {
        membership: {
          include: {
            member: { select: { name: true } },
            plan: { select: { name: true } },
          },
        },
      },
      orderBy: { paidAt: "desc" },
      take: 10,
    }),
  ])

  const ingresosMes = Number(ingresosAgg._sum.amount ?? 0)
  const tasaRetencion =
    totalMiembros > 0 ? Math.round((membresiasActivas / totalMiembros) * 100) : 0

  return {
    ingresosMes,
    miembrosNuevos,
    membresiasActivas,
    membresiasVencidas,
    totalMiembros,
    porVencer,
    tasaRetencion,
    pagosRecientes: pagosRecientes.map((p) => ({
      id: p.id,
      miembro: p.membership.member.name,
      plan: p.membership.plan.name,
      monto: Number(p.amount),
      fecha: p.paidAt,
      metodo: p.method,
    })),
  }
}

// ─── ANALYTICS DE ASISTENCIA ────────────────────────────────────────────────

// Heatmap: asistencias agrupadas por dayOfWeek (0-6) y hour (0-23)
export async function getAttendanceHeatmap() {
  const gymId = await getGymId()

  const records = await prisma.attendance.findMany({
    where: { member: { gymId } },
    select: { checkedIn: true },
  })

  // Crear mapa dayOfWeek × hour → count
  const map: Record<string, number> = {}
  for (const r of records) {
    const d = r.checkedIn.getDay()    // 0=Dom … 6=Sáb
    const h = r.checkedIn.getHours()  // 0-23
    const key = `${d}-${h}`
    map[key] = (map[key] ?? 0) + 1
  }

  return map
}

// Top 10 socios con más asistencias en los últimos 30 días
export async function getTopMembers(limit = 10) {
  const gymId = await getGymId()
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const counts = await prisma.attendance.groupBy({
    by: ["memberId"],
    where: {
      member: { gymId },
      checkedIn: { gte: since },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  })

  if (counts.length === 0) return []

  const memberIds = counts.map((c) => c.memberId)
  const members = await prisma.member.findMany({
    where: { id: { in: memberIds } },
    select: {
      id: true,
      name: true,
      photoUrl: true,
      memberships: {
        where: { status: "ACTIVE" },
        select: { startDate: true, endDate: true },
        take: 1,
      },
    },
  })

  return counts.map((c) => {
    const member = members.find((m) => m.id === c.memberId)
    const visits = c._count.id
    const membership = member?.memberships[0]
    let percentage = 0
    if (membership) {
      const start = new Date(membership.startDate)
      const end = new Date(membership.endDate)
      const totalDays = Math.max(
        1,
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      )
      percentage = Math.min(100, Math.round((visits / totalDays) * 100))
    }
    return {
      memberId: c.memberId,
      name: member?.name ?? "Desconocido",
      photoUrl: member?.photoUrl ?? null,
      visits,
      percentage,
    }
  })
}

// Tendencia de asistencia: promedio por día en las últimas 4 semanas
export async function getWeeklyAttendanceTrend() {
  const gymId = await getGymId()
  const now = new Date()
  const result: { semana: string; promedio: number; total: number }[] = []

  for (let i = 3; i >= 0; i--) {
    const weekStart = startOfWeek(addDays(now, -i * 7), { weekStartsOn: 1 })
    const weekEnd = endOfWeek(addDays(now, -i * 7), { weekStartsOn: 1 })

    const count = await prisma.attendance.count({
      where: {
        member: { gymId },
        checkedIn: { gte: weekStart, lte: weekEnd },
      },
    })

    result.push({
      semana: format(weekStart, "dd MMM", { locale: es }),
      total: count,
      promedio: Math.round(count / 7),
    })
  }

  return result
}
