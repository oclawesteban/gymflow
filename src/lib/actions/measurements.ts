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

export async function addMeasurement(data: {
  memberId: string
  weight?: number
  height?: number
  bodyFat?: number
  waist?: number
  hip?: number
  chest?: number
  arms?: number
  notes?: string
  measuredAt?: Date
}) {
  const gymId = await getGymId()

  // Calcular IMC automáticamente si hay peso y talla
  let bmi: number | undefined
  if (data.weight && data.height && data.height > 0) {
    const heightM = data.height / 100
    bmi = Math.round((data.weight / (heightM * heightM)) * 10) / 10
  }

  const measurement = await prisma.bodyMeasurement.create({
    data: {
      memberId: data.memberId,
      gymId,
      weight: data.weight ?? null,
      height: data.height ?? null,
      bodyFat: data.bodyFat ?? null,
      bmi: bmi ?? null,
      waist: data.waist ?? null,
      hip: data.hip ?? null,
      chest: data.chest ?? null,
      arms: data.arms ?? null,
      notes: data.notes ?? null,
      measuredAt: data.measuredAt ?? new Date(),
    },
  })

  revalidatePath(`/members/${data.memberId}`)
  return { success: true, measurement }
}

export async function getMeasurements(memberId: string) {
  const gymId = await getGymId()
  return prisma.bodyMeasurement.findMany({
    where: { memberId, gymId },
    orderBy: { measuredAt: "asc" },
  })
}

export async function deleteMeasurement(id: string, memberId: string) {
  const gymId = await getGymId()
  await prisma.bodyMeasurement.deleteMany({ where: { id, gymId } })
  revalidatePath(`/members/${memberId}`)
  return { success: true }
}
