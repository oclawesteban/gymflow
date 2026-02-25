import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// El ESP32 llama a este endpoint cada 1-2 segundos
// GET /api/access/poll?key=gf_xxx

export async function GET(req: NextRequest) {
  try {
    const key = req.nextUrl.searchParams.get("key")
    if (!key) {
      return NextResponse.json({ error: "API key requerida" }, { status: 400 })
    }

    // Buscar el gym por accessApiKey
    const gym = await prisma.gym.findUnique({ where: { accessApiKey: key } })
    if (!gym) {
      return NextResponse.json({ error: "API key inválida" }, { status: 401 })
    }

    const now = new Date()

    // Buscar grant pendiente (no usado y no expirado)
    const grant = await prisma.accessGrant.findFirst({
      where: {
        gymId: gym.id,
        usedAt: null,
        expiresAt: { gt: now },
      },
      include: { member: true },
      orderBy: { createdAt: "asc" }, // el más antiguo primero
    })

    if (!grant) {
      return NextResponse.json({ open: false })
    }

    // Marcar como usado
    await prisma.accessGrant.update({
      where: { id: grant.id },
      data: { usedAt: now },
    })

    // Registrar asistencia
    await prisma.attendance.create({
      data: {
        memberId: grant.memberId,
        notes: "Entrada vía torniquete — portal del socio",
      },
    })

    return NextResponse.json({
      open: true,
      member: grant.member.name,
      grantId: grant.id,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
