"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const GRANT_TTL_MS = 30 * 1000

export async function adminOpenTurnstile() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const gym = await prisma.gym.findUnique({ where: { ownerId: session.user.id } })
  if (!gym) throw new Error("Gimnasio no encontrado")

  if (!gym.accessApiKey) throw new Error("El torniquete no está configurado")

  // Crear grant de admin (sin memberId, sin cooldown)
  const grant = await prisma.accessGrant.create({
    data: {
      gymId: gym.id,
      memberId: null,
      isAdminGrant: true,
      expiresAt: new Date(Date.now() + GRANT_TTL_MS),
    },
  })

  return { success: true, grantId: grant.id }
}
