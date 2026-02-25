"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { generateGymCode, generateRandomCode } from "@/lib/utils/gym-code"
import { randomBytes } from "crypto"

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

// Regenerar el código del gimnasio
export async function regenerateGymCode() {
  const gym = await getGym()

  let newCode = generateGymCode(gym.name)
  // Asegurarse de que sea único
  const conflict = await prisma.gym.findFirst({
    where: { gymCode: newCode, id: { not: gym.id } },
  })
  if (conflict) newCode = generateRandomCode()

  const updated = await prisma.gym.update({
    where: { id: gym.id },
    data: { gymCode: newCode },
  })

  revalidatePath("/settings")
  return { success: true, gymCode: updated.gymCode }
}

// Regenerar la API Key del ESP32
export async function regenerateAccessApiKey() {
  const gym = await getGym()
  const newKey = "gf_" + randomBytes(24).toString("hex")

  const updated = await prisma.gym.update({
    where: { id: gym.id },
    data: { accessApiKey: newKey },
  })

  revalidatePath("/settings")
  return { success: true, accessApiKey: updated.accessApiKey }
}
