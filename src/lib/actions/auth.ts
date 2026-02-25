"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signIn } from "@/auth"
import { redirect } from "next/navigation"
import { generateGymCode, generateRandomCode } from "@/lib/utils/gym-code"

export async function registerUser(data: {
  name: string
  email: string
  password: string
  gymName: string
}) {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } })
  if (existingUser) {
    return { error: "Ya existe una cuenta con este correo" }
  }

  const hashed = await bcrypt.hash(data.password, 12)

  // Generar código único para el gym
  let gymCode = generateGymCode(data.gymName)
  const existingCode = await prisma.gym.findUnique({ where: { gymCode } })
  if (existingCode) gymCode = generateRandomCode()

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      gym: {
        create: {
          name: data.gymName,
          gymCode,
        },
      },
    },
  })

  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo: "/dashboard",
    })
  } catch (error: any) {
    // NextAuth v5: login exitoso lanza NEXT_REDIRECT — hay que re-lanzarlo
    const isRedirect =
      error?.message?.includes("NEXT_REDIRECT") ||
      error?.digest?.includes("NEXT_REDIRECT")
    if (isRedirect) throw error
    // Si signIn falla por otro motivo, igual la cuenta ya fue creada — ir al login
    return { success: true, redirectTo: "/login" }
  }

  return { success: true }
}

export async function loginUser(data: { email: string; password: string }) {
  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo: "/dashboard",
    })
  } catch (error: any) {
    // En NextAuth v5, un login exitoso lanza NEXT_REDIRECT — eso NO es un error real
    const isRedirect =
      error?.message?.includes("NEXT_REDIRECT") ||
      error?.digest?.includes("NEXT_REDIRECT")

    if (isRedirect) throw error

    // Cualquier otro error = credenciales inválidas
    return { error: "Correo o contraseña incorrectos" }
  }
}
