import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const gym = await prisma.gym.findUnique({ where: { ownerId: session.user.id } })
  if (!gym) return NextResponse.json({ error: "Gimnasio no encontrado" }, { status: 404 })

  const members = await prisma.member.findMany({
    where: { gymId: gym.id },
    include: {
      memberships: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { plan: true },
      },
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(members)
}
