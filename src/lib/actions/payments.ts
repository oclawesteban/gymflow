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

export async function getPayments(filters?: { membershipId?: string }) {
  const gymId = await getGymId()
  return prisma.payment.findMany({
    where: {
      membership: {
        member: { gymId },
        ...(filters?.membershipId ? { id: filters.membershipId } : {}),
      },
    },
    include: { membership: { include: { member: true, plan: true } } },
    orderBy: { paidAt: "desc" },
  })
}

const PAGE_SIZE_PAYMENTS = 15

export async function getPaymentsPaginated(options?: { page?: number }) {
  const gymId = await getGymId()
  const page = Math.max(1, options?.page ?? 1)
  const skip = (page - 1) * PAGE_SIZE_PAYMENTS

  const where = { membership: { member: { gymId } } }
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: { membership: { include: { member: true, plan: true } } },
      orderBy: { paidAt: "desc" },
      skip,
      take: PAGE_SIZE_PAYMENTS,
    }),
    prisma.payment.count({ where }),
  ])

  return { payments, total, page, pageSize: PAGE_SIZE_PAYMENTS, totalPages: Math.ceil(total / PAGE_SIZE_PAYMENTS) }
}

export async function createPayment(data: {
  membershipId: string
  amount: number
  method?: "CASH" | "CARD" | "TRANSFER" | "NEQUI" | "DAVIPLATA" | "OTHER"
  reference?: string
  notes?: string
  promoCodeId?: string
  discountAmount?: number
}) {
  const gymId = await getGymId()

  const membership = await prisma.membership.findFirst({
    where: { id: data.membershipId, member: { gymId } },
  })
  if (!membership) throw new Error("Membresía no encontrada")

  const payment = await prisma.payment.create({
    data: {
      membershipId: data.membershipId,
      amount: data.amount,
      method: data.method ?? "CASH",
      reference: data.reference,
      notes: data.notes,
      promoCodeId: data.promoCodeId ?? null,
      discountAmount: data.discountAmount ?? null,
    },
    include: { membership: { include: { member: true, plan: true } } },
  })

  // Incrementar usedCount del código promo
  if (data.promoCodeId) {
    await prisma.promoCode.update({
      where: { id: data.promoCodeId },
      data: { usedCount: { increment: 1 } },
    })
  }

  revalidatePath("/payments")
  revalidatePath("/dashboard")
  return { success: true, payment }
}

export async function getRevenueThisMonth() {
  const gymId = await getGymId()
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const payments = await prisma.payment.aggregate({
    where: {
      membership: { member: { gymId } },
      paidAt: { gte: start, lte: end },
    },
    _sum: { amount: true },
  })

  return payments._sum.amount ?? 0
}
