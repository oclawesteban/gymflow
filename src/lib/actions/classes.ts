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

// ─── Obtener todas las clases activas ──────────────────────────────

export async function getClasses() {
  const gymId = await getGymId()
  return prisma.gymClass.findMany({
    where: { gymId, isActive: true },
    include: {
      bookings: {
        where: { status: "CONFIRMED" },
      },
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  })
}

// ─── Obtener clase con detalle ─────────────────────────────────────

export async function getClass(id: string) {
  const gymId = await getGymId()
  return prisma.gymClass.findFirst({
    where: { id, gymId },
    include: {
      bookings: {
        include: { member: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })
}

// ─── Crear clase ───────────────────────────────────────────────────

export async function createClass(data: {
  name: string
  description?: string
  instructor?: string
  capacity: number
  dayOfWeek: number
  startTime: string
  endTime: string
  color?: string
}) {
  const gymId = await getGymId()

  const gymClass = await prisma.gymClass.create({
    data: {
      gymId,
      name: data.name,
      description: data.description,
      instructor: data.instructor,
      capacity: data.capacity,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      color: data.color ?? "#3B82F6",
    },
  })

  revalidatePath("/classes")
  return { success: true, gymClass }
}

// ─── Actualizar clase ──────────────────────────────────────────────

export async function updateClass(
  id: string,
  data: {
    name?: string
    description?: string
    instructor?: string
    capacity?: number
    dayOfWeek?: number
    startTime?: string
    endTime?: string
    color?: string
    isActive?: boolean
  }
) {
  const gymId = await getGymId()

  await prisma.gymClass.updateMany({
    where: { id, gymId },
    data,
  })

  revalidatePath("/classes")
  revalidatePath(`/classes/${id}`)
  return { success: true }
}

// ─── Eliminar clase ────────────────────────────────────────────────

export async function deleteClass(id: string) {
  const gymId = await getGymId()
  await prisma.gymClass.deleteMany({ where: { id, gymId } })
  revalidatePath("/classes")
  return { success: true }
}

// ─── Inscribir socio a clase ───────────────────────────────────────

export async function bookClass(
  classId: string,
  memberId: string,
  date: Date
): Promise<{ success: boolean; error?: string }> {
  const gymId = await getGymId()

  // Verificar que la clase pertenece al gym
  const gymClass = await prisma.gymClass.findFirst({
    where: { id: classId, gymId },
    include: {
      bookings: {
        where: {
          date,
          status: "CONFIRMED",
        },
      },
    },
  })

  if (!gymClass) return { success: false, error: "Clase no encontrada" }

  // Verificar cupos disponibles
  if (gymClass.bookings.length >= gymClass.capacity) {
    return { success: false, error: "No hay cupos disponibles para esta clase" }
  }

  // Verificar que el miembro pertenece al gym
  const member = await prisma.member.findFirst({
    where: { id: memberId, gymId },
  })
  if (!member) return { success: false, error: "Miembro no encontrado" }

  try {
    await prisma.classBooking.create({
      data: { classId, memberId, date, status: "CONFIRMED" },
    })
    revalidatePath(`/classes/${classId}`)
    return { success: true }
  } catch {
    return { success: false, error: "El socio ya está inscrito en esta clase para esa fecha" }
  }
}

// ─── Cancelar inscripción ──────────────────────────────────────────

export async function cancelBooking(
  classId: string,
  memberId: string,
  date: Date
): Promise<{ success: boolean; error?: string }> {
  const gymId = await getGymId()

  // Verificar que la clase pertenece al gym
  const gymClass = await prisma.gymClass.findFirst({
    where: { id: classId, gymId },
  })
  if (!gymClass) return { success: false, error: "Clase no encontrada" }

  await prisma.classBooking.updateMany({
    where: { classId, memberId, date },
    data: { status: "CANCELLED" },
  })

  revalidatePath(`/classes/${classId}`)
  return { success: true }
}

// ─── Obtener miembros activos (para SearchableSelect) ──────────────

export async function getActiveMembers() {
  const gymId = await getGymId()
  return prisma.member.findMany({
    where: {
      gymId,
      memberships: {
        some: { status: "ACTIVE" },
      },
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  })
}
