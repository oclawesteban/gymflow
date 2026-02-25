"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

async function getGymId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")
  const gym = await prisma.gym.findUnique({ where: { ownerId: session.user.id } })
  if (!gym) throw new Error("Gimnasio no encontrado")
  return gym.id
}

export interface VencimientoDelDia {
  id: string
  memberName: string
  memberPhone: string | null
  planName: string
  endDate: Date
  status: string
}

export interface VencimientosPorDia {
  [dia: string]: VencimientoDelDia[]
}

export async function getMembershipsByMonth(
  year: number,
  month: number
): Promise<VencimientosPorDia> {
  const gymId = await getGymId()

  // Primer y último día del mes
  const primerDia = new Date(year, month - 1, 1)
  const ultimoDia = new Date(year, month, 0, 23, 59, 59)

  const membresias = await prisma.membership.findMany({
    where: {
      member: { gymId },
      endDate: {
        gte: primerDia,
        lte: ultimoDia,
      },
    },
    include: {
      member: {
        select: { name: true, phone: true },
      },
      plan: {
        select: { name: true },
      },
    },
    orderBy: { endDate: "asc" },
  })

  // Agrupar por día en formato 'YYYY-MM-DD'
  const resultado: VencimientosPorDia = {}

  for (const ms of membresias) {
    const fecha = ms.endDate
    // Usar la fecha UTC para evitar problemas de zona horaria
    const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`

    if (!resultado[clave]) {
      resultado[clave] = []
    }

    resultado[clave].push({
      id: ms.id,
      memberName: ms.member.name,
      memberPhone: ms.member.phone,
      planName: ms.plan.name,
      endDate: ms.endDate,
      status: ms.status,
    })
  }

  return resultado
}
