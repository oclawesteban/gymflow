"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { canAddInstructor } from "@/lib/actions/limits"

async function getGymId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")
  const gym = await prisma.gym.findUnique({ where: { ownerId: session.user.id } })
  if (!gym) throw new Error("Gimnasio no encontrado")
  return gym.id
}

export async function getInstructors() {
  const gymId = await getGymId()
  return prisma.instructor.findMany({
    where: { gymId },
    include: {
      _count: { select: { classes: true } },
    },
    orderBy: { name: "asc" },
  })
}

export async function getInstructor(id: string) {
  const gymId = await getGymId()
  return prisma.instructor.findFirst({
    where: { id, gymId },
    include: {
      classes: {
        where: { isActive: true },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
  })
}

export async function createInstructor(data: {
  name: string
  email?: string
  phone?: string
  photoUrl?: string
  idType?: string
  idNumber?: string
  hasEps?: boolean
  epsName?: string
  specialty?: string
  bio?: string
}) {
  const gymId = await getGymId()

  // Verificar límite del plan
  const limit = await canAddInstructor()
  if (!limit.allowed) throw new Error(limit.reason)

  const instructor = await prisma.instructor.create({
    data: {
      gymId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      photoUrl: data.photoUrl || null,
      idType: data.idType || null,
      idNumber: data.idNumber || null,
      hasEps: data.hasEps ?? false,
      epsName: data.epsName || null,
      specialty: data.specialty || null,
      bio: data.bio || null,
    },
  })

  revalidatePath("/instructors")
  return { success: true, instructor }
}

export async function updateInstructor(
  id: string,
  data: {
    name: string
    email?: string
    phone?: string
    photoUrl?: string
    idType?: string
    idNumber?: string
    hasEps?: boolean
    epsName?: string
    specialty?: string
    bio?: string
    isActive?: boolean
  }
) {
  const gymId = await getGymId()
  await prisma.instructor.updateMany({
    where: { id, gymId },
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      photoUrl: data.photoUrl || null,
      idType: data.idType || null,
      idNumber: data.idNumber || null,
      hasEps: data.hasEps ?? false,
      epsName: data.epsName || null,
      specialty: data.specialty || null,
      bio: data.bio || null,
      isActive: data.isActive ?? true,
    },
  })
  revalidatePath("/instructors")
  revalidatePath(`/instructors/${id}`)
  return { success: true }
}

export async function deleteInstructor(id: string) {
  const gymId = await getGymId()
  await prisma.instructor.deleteMany({ where: { id, gymId } })
  revalidatePath("/instructors")
  return { success: true }
}

export async function getInstructorsForSelect() {
  const gymId = await getGymId()
  const instructors = await prisma.instructor.findMany({
    where: { gymId, isActive: true },
    select: { id: true, name: true, specialty: true },
    orderBy: { name: "asc" },
  })
  return instructors
}
