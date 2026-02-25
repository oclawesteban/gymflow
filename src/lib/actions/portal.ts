"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET no está definido. Configura esta variable de entorno.")
}
const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET)

// ─── Helpers de JWT ────────────────────────────────────────────────

export async function signPortalToken(memberId: string, gymId: string) {
  return new SignJWT({ memberId, gymId, type: "portal" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(JWT_SECRET)
}

export async function verifyPortalToken(
  token: string
): Promise<{ memberId: string; gymId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    if (payload.type !== "portal") return null
    return {
      memberId: payload.memberId as string,
      gymId: payload.gymId as string,
    }
  } catch {
    return null
  }
}

export async function getPortalSession(): Promise<{
  memberId: string
  gymId: string
} | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("portal_token")?.value
  if (!token) return null
  return verifyPortalToken(token)
}

// ─── Registro del socio ────────────────────────────────────────────

export async function registerMemberPortal(
  email: string,
  password: string,
  gymCode: string
): Promise<{ success: boolean; error?: string }> {
  if (!email || !password || !gymCode) {
    return { success: false, error: "Todos los campos son requeridos" }
  }
  if (password.length < 6) {
    return { success: false, error: "La contraseña debe tener al menos 6 caracteres" }
  }

  // Verificar que el gym existe
  const gym = await prisma.gym.findUnique({ where: { id: gymCode } })
  if (!gym) {
    return { success: false, error: "Código de gimnasio inválido" }
  }

  // Buscar miembro por email en ese gym
  const member = await prisma.member.findFirst({
    where: { email, gymId: gymCode },
  })
  if (!member) {
    return {
      success: false,
      error:
        "No encontramos un socio con ese email en el gimnasio. Contacta al administrador.",
    }
  }

  // Verificar que el email del portal no esté tomado
  const existing = await prisma.member.findFirst({
    where: { portalEmail: email },
  })
  if (existing && existing.id !== member.id) {
    return { success: false, error: "Este email ya está registrado en el portal" }
  }

  const hashed = await bcrypt.hash(password, 10)

  await prisma.member.update({
    where: { id: member.id },
    data: { portalEmail: email, portalPassword: hashed },
  })

  return { success: true }
}

// ─── Login del socio ──────────────────────────────────────────────

export async function loginMemberPortal(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; token?: string }> {
  if (!email || !password) {
    return { success: false, error: "Email y contraseña requeridos" }
  }

  const member = await prisma.member.findFirst({
    where: { portalEmail: email },
    include: { gym: true },
  })

  if (!member || !member.portalPassword) {
    return { success: false, error: "Credenciales inválidas" }
  }

  const valid = await bcrypt.compare(password, member.portalPassword)
  if (!valid) {
    return { success: false, error: "Credenciales inválidas" }
  }

  const token = await signPortalToken(member.id, member.gymId)
  return { success: true, token }
}

// ─── Datos del socio en el portal ────────────────────────────────

export type MemberPortalData = {
  member: {
    id: string
    name: string
    email: string | null
    photoUrl: string | null
    portalEmail: string | null
  }
  gym: {
    id: string
    name: string
    logoUrl: string | null
  }
  activeMembership: {
    id: string
    startDate: Date
    endDate: Date
    status: string
    plan: {
      name: string
      durationDays: number
      price: number
    }
    daysRemaining: number
    progressPercent: number
  } | null
  recentPayments: Array<{
    id: string
    amount: number
    method: string
    paidAt: Date
    plan: string
  }>
  attendanceThisMonth: number
}

export async function getMemberPortalData(
  memberId: string
): Promise<MemberPortalData | null> {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      gym: true,
      memberships: {
        include: {
          plan: true,
          payments: { orderBy: { paidAt: "desc" }, take: 5 },
        },
        orderBy: { createdAt: "desc" },
      },
      attendance: {
        where: {
          checkedIn: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
    },
  })

  if (!member) return null

  const now = new Date()
  const activeMembership = member.memberships.find((m) => m.status === "ACTIVE")

  let activeMembershipData: MemberPortalData["activeMembership"] = null

  if (activeMembership) {
    const totalDays = activeMembership.plan.durationDays
    const elapsed = Math.floor(
      (now.getTime() - new Date(activeMembership.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
    const daysRemaining = Math.max(
      0,
      Math.floor(
        (new Date(activeMembership.endDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    )
    const progressPercent = Math.min(100, Math.round((elapsed / totalDays) * 100))

    activeMembershipData = {
      id: activeMembership.id,
      startDate: activeMembership.startDate,
      endDate: activeMembership.endDate,
      status: activeMembership.status,
      plan: {
        name: activeMembership.plan.name,
        durationDays: activeMembership.plan.durationDays,
        price: Number(activeMembership.plan.price),
      },
      daysRemaining,
      progressPercent,
    }
  }

  // Últimos 5 pagos de todas las membresías
  const allPayments = member.memberships
    .flatMap((ms) =>
      ms.payments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        method: p.method,
        paidAt: p.paidAt,
        plan: ms.plan.name,
      }))
    )
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
    .slice(0, 5)

  return {
    member: {
      id: member.id,
      name: member.name,
      email: member.email,
      photoUrl: member.photoUrl,
      portalEmail: member.portalEmail,
    },
    gym: {
      id: member.gym.id,
      name: member.gym.name,
      logoUrl: member.gym.logoUrl,
    },
    activeMembership: activeMembershipData,
    recentPayments: allPayments,
    attendanceThisMonth: member.attendance.length,
  }
}

// ─── Check-in propio del socio ─────────────────────────────────────

export async function selfCheckIn(
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      memberships: {
        where: { status: "ACTIVE" },
        take: 1,
      },
    },
  })
  if (!member) return { success: false, error: "Miembro no encontrado" }

  // No permitir check-in sin membresía activa
  if (member.memberships.length === 0) {
    return { success: false, error: "No tienes una membresía activa" }
  }

  // Evitar check-ins duplicados en la misma hora
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const recentCheckin = await prisma.attendance.findFirst({
    where: {
      memberId,
      checkedIn: { gte: oneHourAgo },
    },
  })
  if (recentCheckin) {
    return { success: false, error: "Ya registraste una entrada en la última hora" }
  }

  await prisma.attendance.create({
    data: {
      memberId,
      notes: "Auto check-in desde portal del socio",
    },
  })

  return { success: true }
}
