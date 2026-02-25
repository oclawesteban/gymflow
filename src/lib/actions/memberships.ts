"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { addDays } from "date-fns"

async function getGymId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")
  const gym = await prisma.gym.findUnique({ where: { ownerId: session.user.id } })
  if (!gym) throw new Error("Gimnasio no encontrado")
  return gym.id
}

export async function getMemberships(filters?: {
  status?: string
  memberId?: string
}) {
  const gymId = await getGymId()
  return prisma.membership.findMany({
    where: {
      member: { gymId },
      ...(filters?.status ? { status: filters.status as any } : {}),
      ...(filters?.memberId ? { memberId: filters.memberId } : {}),
    },
    include: {
      member: { include: { gym: true } },
      plan: true,
      payments: { orderBy: { paidAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getExpiringMemberships() {
  const gymId = await getGymId()
  const now = new Date()
  const weekFromNow = addDays(now, 7)

  return prisma.membership.findMany({
    where: {
      member: { gymId },
      OR: [
        // Expiring within the next 7 days (still active)
        {
          status: "ACTIVE",
          endDate: { gte: now, lte: weekFromNow },
        },
        // Already expired
        {
          status: "EXPIRED",
        },
      ],
    },
    include: {
      member: { include: { gym: true } },
      plan: true,
    },
    orderBy: { endDate: "asc" },
  })
}

export async function createMembership(data: {
  memberId: string
  planId: string
  startDate: Date
  notes?: string
}) {
  const gymId = await getGymId()

  // Verify member belongs to this gym
  const member = await prisma.member.findFirst({ where: { id: data.memberId, gymId } })
  if (!member) throw new Error("Miembro no encontrado")

  const plan = await prisma.plan.findFirst({ where: { id: data.planId, gymId } })
  if (!plan) throw new Error("Plan no encontrado")

  const endDate = addDays(data.startDate, plan.durationDays)

  const membership = await prisma.membership.create({
    data: {
      memberId: data.memberId,
      planId: data.planId,
      startDate: data.startDate,
      endDate,
      notes: data.notes,
      status: "ACTIVE",
    },
    include: { member: true, plan: true },
  })

  revalidatePath("/memberships")
  revalidatePath("/dashboard")
  return { success: true, membership }
}

export async function renewMembership(membershipId: string) {
  const gymId = await getGymId()

  const membership = await prisma.membership.findFirst({
    where: { id: membershipId, member: { gymId } },
    include: { plan: true },
  })
  if (!membership) throw new Error("Membresía no encontrada")

  const startDate = new Date()
  const endDate = addDays(startDate, membership.plan.durationDays)

  const renewed = await prisma.membership.update({
    where: { id: membershipId },
    data: { startDate, endDate, status: "ACTIVE" },
  })

  revalidatePath("/memberships")
  revalidatePath("/dashboard")
  return { success: true, membership: renewed }
}

export async function updateMembershipStatus(id: string, status: "ACTIVE" | "EXPIRED" | "CANCELLED") {
  const gymId = await getGymId()
  await prisma.membership.updateMany({
    where: { id, member: { gymId } },
    data: { status },
  })
  revalidatePath("/memberships")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function syncExpiredMemberships() {
  const gymId = await getGymId()
  const now = new Date()
  await prisma.membership.updateMany({
    where: {
      member: { gymId },
      status: "ACTIVE",
      endDate: { lt: now },
    },
    data: { status: "EXPIRED" },
  })
  revalidatePath("/memberships")
  revalidatePath("/dashboard")
  return { success: true }
}
