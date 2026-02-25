"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function getProfile() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      photoUrl: true,
      bio: true,
      phone: true,
    },
  })

  if (!user) throw new Error("Usuario no encontrado")
  return user
}

export async function updateProfile(data: {
  name: string
  phone?: string
  bio?: string
  photoUrl?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      phone: data.phone || null,
      bio: data.bio || null,
      photoUrl: data.photoUrl || null,
    },
  })

  revalidatePath("/profile")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  if (!user?.password) throw new Error("Usuario sin contraseña configurada")

  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) throw new Error("Contraseña actual incorrecta")

  if (newPassword.length < 8) throw new Error("La nueva contraseña debe tener al menos 8 caracteres")

  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  })

  return { success: true }
}

export async function resetPasswordByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error("No se encontró ninguna cuenta con ese correo")

  const tempPassword = "GymFlow2026!"
  const hashed = await bcrypt.hash(tempPassword, 10)

  await prisma.user.update({
    where: { email },
    data: { password: hashed },
  })

  return { success: true, tempPassword }
}
