"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

async function getGymId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")
  const gym = await prisma.gym.findUnique({ where: { ownerId: session.user.id } })
  if (!gym) throw new Error("Gimnasio no encontrado")
  return gym.id
}

export async function getAttendance(filters?: { memberId?: string; date?: Date }) {
  const gymId = await getGymId()

  let dateFilter = {}
  if (filters?.date) {
    const start = new Date(filters.date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(filters.date)
    end.setHours(23, 59, 59, 999)
    dateFilter = { checkedIn: { gte: start, lte: end } }
  }

  return prisma.attendance.findMany({
    where: {
      member: { gymId },
      ...(filters?.memberId ? { memberId: filters.memberId } : {}),
      ...dateFilter,
    },
    include: { member: true },
    orderBy: { checkedIn: "desc" },
  })
}

export async function checkIn(memberId: string, notes?: string) {
  const gymId = await getGymId()

  const member = await prisma.member.findFirst({ where: { id: memberId, gymId } })
  if (!member) throw new Error("Miembro no encontrado")

  const attendance = await prisma.attendance.create({
    data: { memberId, notes },
    include: { member: true },
  })

  revalidatePath("/attendance")
  revalidatePath("/dashboard")
  return { success: true, attendance }
}

export async function getTodayAttendanceCount() {
  const gymId = await getGymId()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  return prisma.attendance.count({
    where: {
      member: { gymId },
      checkedIn: { gte: today, lt: tomorrow },
    },
  })
}
