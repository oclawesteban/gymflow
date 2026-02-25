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

export async function getPlans() {
  const gymId = await getGymId()
  return prisma.plan.findMany({
    where: { gymId },
    include: { _count: { select: { memberships: true } } },
    orderBy: { price: "asc" },
  })
}

export async function createPlan(data: {
  name: string
  description?: string
  price: number
  durationDays: number
}) {
  const gymId = await getGymId()
  const plan = await prisma.plan.create({
    data: { ...data, gymId },
  })
  revalidatePath("/plans")
  return { success: true, plan }
}

export async function updatePlan(id: string, data: {
  name?: string
  description?: string
  price?: number
  durationDays?: number
  isActive?: boolean
}) {
  const gymId = await getGymId()
  await prisma.plan.updateMany({ where: { id, gymId }, data })
  revalidatePath("/plans")
  return { success: true }
}

export async function deletePlan(id: string) {
  const gymId = await getGymId()
  await prisma.plan.deleteMany({ where: { id, gymId } })
  revalidatePath("/plans")
  return { success: true }
}
