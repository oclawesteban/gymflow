"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

// Obtener el gimnasio del usuario autenticado
async function getGym() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const gym = await prisma.gym.findUnique({
    where: { ownerId: session.user.id },
  })

  if (!gym) throw new Error("Gimnasio no encontrado")
  return gym
}

// Obtener configuración del gimnasio
export async function getGymSettings() {
  const gym = await getGym()
  return gym
}

// Actualizar configuración del gimnasio
export async function updateGymSettings(data: {
  name: string
  address?: string
  phone?: string
  whatsapp?: string
  contactEmail?: string
  description?: string
  logoUrl?: string
  city?: string
}) {
  const gym = await getGym()

  const updated = await prisma.gym.update({
    where: { id: gym.id },
    data: {
      name: data.name,
      address: data.address || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      contactEmail: data.contactEmail || null,
      description: data.description || null,
      logoUrl: data.logoUrl || null,
      city: data.city || null,
    },
  })

  revalidatePath("/settings")
  revalidatePath("/dashboard")

  return { success: true, gym: updated }
}
