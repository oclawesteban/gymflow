"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { addDays } from "date-fns"

async function getGymId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")
  const gym = await prisma.gym.findUnique({
    where: { ownerId: session.user.id },
    include: { owner: true },
  })
  if (!gym) throw new Error("Gimnasio no encontrado")
  return gym
}

export async function getDashboardStats() {
  const gym = await getGymId()
  const now = new Date()
  const weekFromNow = addDays(now, 7)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)

  const [
    activeMembers,
    expiredMembers,
    expiringSoon,
    revenueAgg,
    todayAttendance,
    totalMembers,
    recentPayments,
    recentAttendance,
  ] = await Promise.all([
    prisma.membership.count({
      where: { member: { gymId: gym.id }, status: "ACTIVE" },
    }),
    prisma.membership.count({
      where: { member: { gymId: gym.id }, status: "EXPIRED" },
    }),
    prisma.membership.count({
      where: {
        member: { gymId: gym.id },
        status: "ACTIVE",
        endDate: { gte: now, lte: weekFromNow },
      },
    }),
    prisma.payment.aggregate({
      where: {
        membership: { member: { gymId: gym.id } },
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
    prisma.attendance.count({
      where: {
        member: { gymId: gym.id },
        checkedIn: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.member.count({ where: { gymId: gym.id } }),
    prisma.payment.findMany({
      where: { membership: { member: { gymId: gym.id } } },
      include: { membership: { include: { member: true, plan: true } } },
      orderBy: { paidAt: "desc" },
      take: 5,
    }),
    prisma.attendance.findMany({
      where: { member: { gymId: gym.id } },
      include: { member: true },
      orderBy: { checkedIn: "desc" },
      take: 5,
    }),
  ])

  return {
    gym,
    stats: {
      activeMembers,
      expiredMembers,
      expiringSoon,
      revenueThisMonth: Number(revenueAgg._sum.amount ?? 0),
      todayAttendance,
      totalMembers,
    },
    recentPayments,
    recentAttendance,
  }
}

export async function getOnboardingStatus() {
  try {
    const gym = await getGymId()
    const [memberCount, planCount] = await Promise.all([
      prisma.member.count({ where: { gymId: gym.id } }),
      prisma.plan.count({ where: { gymId: gym.id } }),
    ])
    return {
      shouldShow: memberCount === 0 && planCount === 0,
      gymName: gym.name,
    }
  } catch {
    return { shouldShow: false, gymName: "" }
  }
}
