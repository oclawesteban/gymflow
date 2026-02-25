import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import {
  verifyPortalToken,
  getPortalClasses,
  getMemberUpcomingBookings,
} from "@/lib/actions/portal"
import { Card, CardContent } from "@/components/ui/card"
import { BookClassButton } from "@/components/portal/book-class-button"
import { Users2, Clock, User, CalendarCheck, Dumbbell } from "lucide-react"

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const DIAS_LARGO = [
  "Domingo", "Lunes", "Martes", "Miércoles",
  "Jueves", "Viernes", "Sábado",
]
const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
]

function getMondayOfCurrentWeek(): Date {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function getClassDateThisWeek(monday: Date, dayOfWeek: number): Date {
  // dayOfWeek: 0=Dom, 1=Lun, ..., 6=Sáb
  // Días desde el lunes: Dom=6, Lun=0, Mar=1, ..., Sáb=5
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const date = new Date(monday)
  date.setDate(monday.getDate() + daysFromMonday)
  return date
}

function formatClassDate(date: Date): string {
  const day = DIAS_SEMANA[date.getDay()]
  return `${day} ${date.getDate()} ${MESES[date.getMonth()]}`
}

function isDatePast(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

export default async function PortalClassesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("portal_token")?.value
  if (!token) redirect("/portal/login")

  const session = await verifyPortalToken(token)
  if (!session) redirect("/portal/login")

  const [classes, upcomingBookings] = await Promise.all([
    getPortalClasses(session.gymId),
    getMemberUpcomingBookings(session.memberId),
  ])

  const monday = getMondayOfCurrentWeek()

  // Construir lista de días con clases
  const diasConClases = DIAS_LARGO.map((nombreDia, idx) => {
    const classesHoy = classes.filter((c) => c.dayOfWeek === idx)
    const date = getClassDateThisWeek(monday, idx)
    return { nombreDia, idx, classesHoy, date }
  }).filter((d) => d.classesHoy.length > 0)

  // Semana actual: lunes → domingo
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const semanaLabel = `${monday.getDate()} ${MESES[monday.getMonth()]} – ${sunday.getDate()} ${MESES[sunday.getMonth()]}`

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clases Grupales</h1>
        <p className="text-sm text-gray-500 mt-0.5">Semana del {semanaLabel}</p>
      </div>

      {/* Mis reservas próximas */}
      {upcomingBookings.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            Mis Reservas
          </p>
          <div className="space-y-2">
            {upcomingBookings.map((b) => {
              const d = new Date(b.date)
              return (
                <div
                  key={b.id}
                  className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 shadow-sm"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: b.gymClass.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {b.gymClass.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatClassDate(d)} · {b.gymClass.startTime}–{b.gymClass.endTime}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Horario semanal */}
      {diasConClases.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="h-8 w-8 text-blue-300" />
          </div>
          <p className="text-gray-500 font-medium">
            No hay clases programadas esta semana
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Consulta con tu gimnasio para más información
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {diasConClases.map(({ nombreDia, classesHoy, date }) => {
            const isPast = isDatePast(date)
            return (
              <div key={nombreDia}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    {nombreDia}
                  </h2>
                  <span className="text-xs text-gray-400">
                    {date.getDate()} {MESES[date.getMonth()]}
                  </span>
                  {isPast && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Pasada
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {classesHoy.map((cls) => {
                    const dateStr = date.toISOString()
                    const totalInscritos = cls.bookings.length
                    const cuposLibres = cls.capacity - totalInscritos
                    const isFull = cuposLibres <= 0
                    const isBooked = cls.bookings.some(
                      (b) => b.memberId === session.memberId
                    )
                    const ocupPct = Math.round((totalInscritos / cls.capacity) * 100)

                    return (
                      <Card
                        key={cls.id}
                        className={`border transition-shadow ${
                          isBooked
                            ? "border-blue-300 bg-blue-50/60"
                            : "border-gray-200 hover:shadow-md"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Barra de color */}
                            <div
                              className="w-1 rounded-full self-stretch flex-shrink-0 min-h-[60px]"
                              style={{ backgroundColor: cls.color }}
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 truncate">
                                    {cls.name}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                      <Clock className="h-3 w-3" />
                                      {cls.startTime}–{cls.endTime}
                                    </span>
                                    {cls.instructor && (
                                      <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <User className="h-3 w-3" />
                                        {cls.instructor}
                                      </span>
                                    )}
                                  </div>
                                  {cls.description && (
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                                      {cls.description}
                                    </p>
                                  )}
                                </div>

                                {/* Botón reservar/cancelar */}
                                <BookClassButton
                                  classId={cls.id}
                                  memberId={session.memberId}
                                  gymId={session.gymId}
                                  dateStr={dateStr}
                                  isBooked={isBooked}
                                  isFull={isFull}
                                  isPast={isPast}
                                />
                              </div>

                              {/* Barra de ocupación */}
                              <div className="mt-3 flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${ocupPct}%`,
                                      backgroundColor:
                                        ocupPct >= 90 ? "#ef4444" : cls.color,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Users2 className="h-3 w-3" />
                                  {isFull
                                    ? "Llena"
                                    : `${cuposLibres} cupo${cuposLibres !== 1 ? "s" : ""}`}
                                </span>
                              </div>

                              {isBooked && (
                                <p className="mt-2 text-xs font-medium text-blue-600">
                                  ✓ Ya tienes lugar reservado
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
