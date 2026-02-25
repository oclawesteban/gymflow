"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signIn } from "@/auth"
import { redirect } from "next/navigation"

export async function registerUser(data: {
  name: string
  email: string
  password: string
  gymName: string
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) {
    return { error: "Ya existe una cuenta con este correo" }
  }

  const hashed = await bcrypt.hash(data.password, 12)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      gym: {
        create: {
          name: data.gymName,
        },
      },
    },
  })

  await signIn("credentials", {
    email: data.email,
    password: data.password,
    redirectTo: "/dashboard",
  })

  return { success: true, userId: user.id }
}

export async function loginUser(data: { email: string; password: string }) {
  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo: "/dashboard",
    })
  } catch (error: any) {
    // En NextAuth v5, el error de credenciales tiene type="CredentialsSignin"
    // El message contiene la URL en minúsculas: "...#credentialssignin"
    // Por eso verificamos `type` (confiable) y también el message en minúsculas como fallback
    if (
      error?.type === "CredentialsSignin" ||
      error?.message?.toLowerCase().includes("credentialssignin")
    ) {
      return { error: "Correo o contraseña incorrectos" }
    }
    throw error
  }
}
