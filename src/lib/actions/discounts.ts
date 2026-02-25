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

export async function getPromoCodes() {
  const gymId = await getGymId()
  return prisma.promoCode.findMany({
    where: { gymId },
    orderBy: { createdAt: "desc" },
  })
}

export async function createPromoCode(data: {
  code: string
  description?: string
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
  maxUses?: number
  validUntil?: string
}) {
  const gymId = await getGymId()

  // Verificar que el código no exista en el mismo gym
  const existing = await prisma.promoCode.findFirst({
    where: { gymId, code: data.code.toUpperCase() },
  })
  if (existing) throw new Error("Ya existe un código con ese nombre en tu gimnasio")

  const promo = await prisma.promoCode.create({
    data: {
      gymId,
      code: data.code.toUpperCase(),
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxUses: data.maxUses ?? null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
    },
  })

  revalidatePath("/discounts")
  return { success: true, promo }
}

export async function togglePromoCode(id: string) {
  const gymId = await getGymId()
  const promo = await prisma.promoCode.findFirst({ where: { id, gymId } })
  if (!promo) throw new Error("Código no encontrado")

  await prisma.promoCode.update({
    where: { id },
    data: { isActive: !promo.isActive },
  })

  revalidatePath("/discounts")
  return { success: true }
}

export async function deletePromoCode(id: string) {
  const gymId = await getGymId()
  await prisma.promoCode.deleteMany({ where: { id, gymId } })
  revalidatePath("/discounts")
  return { success: true }
}

export async function validatePromoCode(code: string): Promise<{
  valid: boolean
  promoCode?: {
    id: string
    code: string
    discountType: string
    discountValue: number
    description?: string | null
  }
  error?: string
}> {
  const gymId = await getGymId()
  const now = new Date()

  const promo = await prisma.promoCode.findFirst({
    where: {
      gymId,
      code: code.toUpperCase(),
      isActive: true,
    },
  })

  if (!promo) return { valid: false, error: "Código no válido o inactivo" }

  if (promo.validUntil && promo.validUntil < now) {
    return { valid: false, error: "El código ha vencido" }
  }

  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    return { valid: false, error: "El código ya alcanzó el límite de usos" }
  }

  return {
    valid: true,
    promoCode: {
      id: promo.id,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: Number(promo.discountValue),
      description: promo.description,
    },
  }
}
