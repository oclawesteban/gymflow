import { getClass, getActiveMembers, bookClass, cancelBooking } from "@/lib/actions/classes"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, User, Users2, UserPlus } from "lucide-react"
import Link from "next/link"
import { BookingActions } from "@/components/classes/booking-actions"
import { AddBookingForm } from "@/components/classes/add-booking-form"

const DIAS_LARGO = [
  "Domingo", "Lunes", "Martes", "Miércoles",
  "Jueves", "Viernes", "Sábado",
]

export default async function ClaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const clase = await getClass(id)
  if (!clase) notFound()

  const miembros = await getActiveMembers()

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  // Inscripciones activas de hoy/próxima fecha del día de la semana
  // Buscar la próxima ocurrencia del día de la semana
  const diaActualSemana = hoy.getDay()
  const diasHasta = (clase.dayOfWeek - diaActualSemana + 7) % 7
  const proximaFecha = new Date(hoy)
  proximaFecha.setDate(hoy.getDate() + diasHasta)

  const inscriptosProxima = clase.bookings.filter(
    (b) =>
      b.status === "CONFIRMED" &&
      new Date(b.date).toDateString() === proximaFecha.toDateString()
  )

  const cuposDisponibles = clase.capacity - inscriptosProxima.length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <Link href="/classes">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: clase.color }}
            />
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {clase.name}
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            {DIAS_LARGO[clase.dayOfWeek]} · {clase.startTime} – {clase.endTime}
          </p>
        </div>
        <Link href={`/classes/${id}/edit`}>
          <Button variant="outline" size="sm">
            Editar
          </Button>
        </Link>
      </div>

      {/* Info de la clase */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-sm font-semibold">{clase.startTime} – {clase.endTime}</p>
              <p className="text-xs text-gray-500">Horario</p>
            </div>
            <div className="text-center">
              <Users2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <p className="text-sm font-semibold">
                {inscriptosProxima.length}/{clase.capacity}
              </p>
              <p className="text-xs text-gray-500">Cupos</p>
            </div>
            <div className="text-center">
              <User className="h-5 w-5 text-purple-500 mx-auto mb-1" />
              <p className="text-sm font-semibold truncate">
                {clase.instructor ?? "—"}
              </p>
              <p className="text-xs text-gray-500">Instructor</p>
            </div>
            <div className="text-center">
              <Badge
                className="text-xs"
                style={{
                  backgroundColor: `${clase.color}20`,
                  color: clase.color,
                  borderColor: clase.color,
                }}
                variant="outline"
              >
                {cuposDisponibles > 0 ? `${cuposDisponibles} libres` : "Lleno"}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">Estado</p>
            </div>
          </div>
          {clase.description && (
            <p className="text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
              {clase.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Inscribir socio */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-blue-600" />
            Inscribir Socio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AddBookingForm
            claseId={clase.id}
            claseNombre={clase.name}
            proximaFecha={proximaFecha}
            miembros={miembros}
            inscriptosIds={inscriptosProxima.map((b) => b.memberId)}
            cuposDisponibles={cuposDisponibles}
          />
        </CardContent>
      </Card>

      {/* Lista de inscritos para próxima sesión */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users2 className="h-4 w-4" />
            Inscritos — {DIAS_LARGO[clase.dayOfWeek]}{" "}
            {proximaFecha.toLocaleDateString("es-CO", {
              day: "numeric",
              month: "long",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inscriptosProxima.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              Sin inscritos para la próxima sesión
            </p>
          ) : (
            <div className="space-y-2">
              {inscriptosProxima.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                    {booking.member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {booking.member.name}
                    </p>
                  </div>
                  <BookingActions
                    claseId={clase.id}
                    memberId={booking.memberId}
                    fecha={proximaFecha}
                    memberName={booking.member.name}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
