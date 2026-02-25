import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPortalToken } from "@/lib/actions/portal"

// Cooldown entre aperturas: 5 minutos
const COOLDOWN_MS = 5 * 60 * 1000
// TTL del grant: 30 segundos para que el ESP32 lo detecte
const GRANT_TTL_MS = 30 * 1000

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar sesión del portal
    const token = req.cookies.get("portal_token")?.value
    if (!token) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    const session = await verifyPortalToken(token)
    if (!session) {
      return NextResponse.json({ success: false, error: "Sesión inválida o expirada" }, { status: 401 })
    }

    const { memberId, gymId } = session

    // 2. Verificar membresía activa — regla crítica
    const activeMembership = await prisma.membership.findFirst({
      where: { memberId, status: "ACTIVE" },
    })
    if (!activeMembership) {
      return NextResponse.json(
        { success: false, error: "No tienes una membresía activa. Contacta al administrador." },
        { status: 403 }
      )
    }

    // 3. Cooldown — no abrir dos veces en 5 minutos
    const cooldownStart = new Date(Date.now() - COOLDOWN_MS)
    const recentGrant = await prisma.accessGrant.findFirst({
      where: {
        memberId,
        createdAt: { gte: cooldownStart },
      },
      orderBy: { createdAt: "desc" },
    })
    if (recentGrant) {
      const nextAvailableMs = recentGrant.createdAt.getTime() + COOLDOWN_MS - Date.now()
      const nextAvailableMin = Math.ceil(nextAvailableMs / 60000)
      return NextResponse.json(
        {
          success: false,
          error: `Ya abriste el torniquete recientemente. Espera ${nextAvailableMin} minuto${nextAvailableMin !== 1 ? "s" : ""}.`,
          cooldown: true,
        },
        { status: 429 }
      )
    }

    // 4. Crear el AccessGrant (expira en 30 seg)
    const grant = await prisma.accessGrant.create({
      data: {
        gymId,
        memberId,
        expiresAt: new Date(Date.now() + GRANT_TTL_MS),
      },
    })

    return NextResponse.json({ success: true, grantId: grant.id, expiresIn: 30 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno"
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
