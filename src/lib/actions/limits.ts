"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { PLANS, type PlanTier } from "@/lib/config/plans"

async function getGymWithTier() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")
  const gym = await prisma.gym.findUnique({ where: { ownerId: session.user.id } })
  if (!gym) throw new Error("Gimnasio no encontrado")
  return gym
}

// ── Verificar si puede agregar un miembro ────────────────────────────────
export async function canAddMember(): Promise<{ allowed: boolean; reason?: string; current: number; limit: number }> {
  const gym = await getGymWithTier()
  const plan = PLANS[gym.planTier as PlanTier]
  if (plan.members === -1) return { allowed: true, current: 0, limit: -1 }

  const count = await prisma.member.count({ where: { gymId: gym.id } })
  if (count >= plan.members) {
    return {
      allowed: false,
      reason: `Tu plan ${plan.name} permite máximo ${plan.members} miembros. Actualmente tienes ${count}.`,
      current: count,
      limit: plan.members,
    }
  }
  return { allowed: true, current: count, limit: plan.members }
}

// ── Verificar si puede agregar un instructor ─────────────────────────────
export async function canAddInstructor(): Promise<{ allowed: boolean; reason?: string; current: number; limit: number }> {
  const gym = await getGymWithTier()
  const plan = PLANS[gym.planTier as PlanTier]
  if (plan.instructors === -1) return { allowed: true, current: 0, limit: -1 }

  const count = await prisma.instructor.count({ where: { gymId: gym.id } })
  if (count >= plan.instructors) {
    return {
      allowed: false,
      reason: `Tu plan ${plan.name} permite máximo ${plan.instructors} instructores. Actualmente tienes ${count}.`,
      current: count,
      limit: plan.instructors,
    }
  }
  return { allowed: true, current: count, limit: plan.instructors }
}

// ── Resumen de uso para el dashboard ────────────────────────────────────
export async function getUsageSummary() {
  const gym = await getGymWithTier()
  const plan = PLANS[gym.planTier as PlanTier]

  const [memberCount, instructorCount] = await Promise.all([
    prisma.member.count({ where: { gymId: gym.id } }),
    prisma.instructor.count({ where: { gymId: gym.id } }),
  ])

  return {
    planTier: gym.planTier as PlanTier,
    planName: plan.name,
    planExpiresAt: gym.planExpiresAt,
    members: { current: memberCount, limit: plan.members },
    instructors: { current: instructorCount, limit: plan.instructors },
    features: {
      classes: plan.classes,
      advancedReports: plan.advancedReports,
      exportExcel: plan.exportExcel,
      whatsappReminders: plan.whatsappReminders,
    },
  }
}
