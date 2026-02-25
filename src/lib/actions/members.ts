"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { canAddMember } from "@/lib/actions/limits"

async function getGymId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")
  const gym = await prisma.gym.findUnique({ where: { ownerId: session.user.id } })
  if (!gym) throw new Error("Gimnasio no encontrado")
  return gym.id
}

export async function getMembers(options?: { query?: string }) {
  const gymId = await getGymId()
  const query = options?.query?.trim()
  return prisma.member.findMany({
    where: {
      gymId,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { phone: { contains: query } },
            ],
          }
        : {}),
    },
    include: {
      memberships: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { plan: true },
      },
    },
    orderBy: { name: "asc" },
  })
}

export async function getMember(id: string) {
  const gymId = await getGymId()
  return prisma.member.findFirst({
    where: { id, gymId },
    include: {
      memberships: {
        include: { plan: true, payments: { orderBy: { paidAt: "desc" } } },
        orderBy: { createdAt: "desc" },
      },
      attendance: { orderBy: { checkedIn: "desc" }, take: 20 },
    },
  })
}

export async function createMember(data: {
  name: string
  email?: string
  phone?: string
  photoUrl?: string
  idType?: string
  idNumber?: string
  hasEps?: boolean
  epsName?: string
  emergencyContact?: string
  emergencyPhone?: string
  notes?: string
}) {
  const gymId = await getGymId()

  // Verificar límite del plan
  const limit = await canAddMember()
  if (!limit.allowed) throw new Error(limit.reason)

  const member = await prisma.member.create({
    data: { ...data, gymId },
  })
  revalidatePath("/members")
  return { success: true, member }
}

export async function updateMember(id: string, data: {
  name?: string
  email?: string
  phone?: string
  photoUrl?: string
  idType?: string
  idNumber?: string
  hasEps?: boolean
  epsName?: string
  emergencyContact?: string
  emergencyPhone?: string
  notes?: string
}) {
  const gymId = await getGymId()
  const member = await prisma.member.updateMany({
    where: { id, gymId },
    data,
  })
  revalidatePath("/members")
  revalidatePath(`/members/${id}`)
  return { success: true }
}

export async function deleteMember(id: string) {
  const gymId = await getGymId()
  await prisma.member.deleteMany({ where: { id, gymId } })
  revalidatePath("/members")
  return { success: true }
}

export async function getMemberHistory(memberId: string) {
  const gymId = await getGymId()
  const miembro = await prisma.member.findFirst({
    where: { id: memberId, gymId },
    include: {
      memberships: {
        include: {
          plan: true,
          payments: { orderBy: { paidAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
      },
      attendance: {
        orderBy: { checkedIn: "desc" },
        take: 200,
      },
    },
  })
  return miembro
}
