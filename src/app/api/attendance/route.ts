import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const gym = await prisma.gym.findUnique({ where: { ownerId: session.user.id } })
  if (!gym) return NextResponse.json({ error: "Gimnasio no encontrado" }, { status: 404 })

  const { memberId, notes } = await req.json()

  const member = await prisma.member.findFirst({ where: { id: memberId, gymId: gym.id } })
  if (!member) return NextResponse.json({ error: "Miembro no encontrado" }, { status: 404 })

  const attendance = await prisma.attendance.create({
    data: { memberId, notes },
    include: { member: true },
  })

  return NextResponse.json(attendance)
}
