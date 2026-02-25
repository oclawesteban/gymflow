import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPortalToken } from "@/lib/actions/portal"
import { startOfDay, endOfDay } from "date-fns"

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

export async function GET(req: NextRequest) {
  const token = req.cookies.get("portal_token")?.value
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const session = await verifyPortalToken(token)
  if (!session) return NextResponse.json({ error: "Sesión inválida" }, { status: 401 })

  const today = new Date()
  const todayDay = today.getDay()

  const classes = await prisma.gymClass.findMany({
    where: { gymId: session.gymId, isActive: true },
    include: {
      instructorRel: { select: { name: true } },
      _count: {
        select: {
          bookings: {
            where: {
              date: { gte: startOfDay(today), lte: endOfDay(today) },
              status: "CONFIRMED",
            },
          },
        },
      },
      bookings: {
        where: {
          memberId: session.memberId,
          date: { gte: startOfDay(today), lte: endOfDay(today) },
          status: "CONFIRMED",
        },
      },
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  })

  return NextResponse.json({
    classes: classes.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      instructor: c.instructorRel?.name ?? c.instructor,
      dayOfWeek: c.dayOfWeek,
      dayName: DAY_NAMES[c.dayOfWeek],
      startTime: c.startTime,
      endTime: c.endTime,
      color: c.color,
      capacity: c.capacity,
      bookedCount: c._count.bookings,
      isFull: c._count.bookings >= c.capacity,
      isToday: c.dayOfWeek === todayDay,
      myBooking: c.bookings[0] ?? null,
    })),
  })
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("portal_token")?.value
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const session = await verifyPortalToken(token)
  if (!session) return NextResponse.json({ error: "Sesión inválida" }, { status: 401 })

  const { classId, action } = await req.json()

  // Verificar membresía activa
  const activeMembership = await prisma.membership.findFirst({
    where: { memberId: session.memberId, status: "ACTIVE" },
  })
  if (!activeMembership) {
    return NextResponse.json({ error: "Necesitas una membresía activa para reservar clases" }, { status: 403 })
  }

  const gymClass = await prisma.gymClass.findFirst({
    where: { id: classId, gymId: session.gymId },
  })
  if (!gymClass) return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 })

  const today = new Date()
  const classDate = new Date(today)
  // Calcular la próxima fecha en que cae el día de la clase
  const daysUntil = (gymClass.dayOfWeek - today.getDay() + 7) % 7
  classDate.setDate(today.getDate() + daysUntil)
  classDate.setHours(0, 0, 0, 0)

  if (action === "book") {
    // Verificar cupos
    const bookedCount = await prisma.classBooking.count({
      where: { classId, date: { gte: startOfDay(classDate), lte: endOfDay(classDate) }, status: "CONFIRMED" },
    })
    if (bookedCount >= gymClass.capacity) {
      return NextResponse.json({ error: "La clase está llena" }, { status: 400 })
    }

    // Crear reserva (upsert por si ya existe cancelada)
    await prisma.classBooking.upsert({
      where: { classId_memberId_date: { classId, memberId: session.memberId, date: classDate } },
      create: { classId, memberId: session.memberId, date: classDate, status: "CONFIRMED" },
      update: { status: "CONFIRMED" },
    })
    return NextResponse.json({ success: true, message: "¡Reserva confirmada!" })
  }

  if (action === "cancel") {
    await prisma.classBooking.updateMany({
      where: { classId, memberId: session.memberId, date: { gte: startOfDay(classDate), lte: endOfDay(classDate) } },
      data: { status: "CANCELLED" },
    })
    return NextResponse.json({ success: true, message: "Reserva cancelada" })
  }

  return NextResponse.json({ error: "Acción inválida" }, { status: 400 })
}
