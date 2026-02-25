import { getClasses } from "@/lib/actions/classes"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Users2, Clock, User } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ClassActions } from "@/components/classes/class-actions"

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const DIAS_LARGO = [
  "Domingo", "Lunes", "Martes", "Miércoles",
  "Jueves", "Viernes", "Sábado",
]

async function ClasesList() {
  const clases = await getClasses()

  if (clases.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users2 className="h-10 w-10 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Aún no hay clases grupales
        </h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Crea el horario de clases de tu gimnasio.
        </p>
        <Link href="/classes/new">
          <Button className="bg-blue-600 hover:bg-blue-700 min-h-[48px] px-6 gap-2">
            <Plus className="h-4 w-4" />
            Nueva Clase
          </Button>
        </Link>
      </div>
    )
  }

  // Agrupar por día de la semana
  const clasesPorDia = DIAS_LARGO.map((dia, idx) => ({
    dia,
    idx,
    clases: clases.filter((c) => c.dayOfWeek === idx),
  })).filter((d) => d.clases.length > 0)

  return (
    <div className="space-y-8">
      {clasesPorDia.map(({ dia, clases: clasesDelDia }) => (
        <div key={dia}>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {dia}
          </h2>
          <div className="space-y-3">
            {clasesDelDia.map((clase) => {
              const inscritos = clase.bookings.length
              const cuposDisponibles = clase.capacity - inscritos
              const cuposPercent = Math.round((inscritos / clase.capacity) * 100)

              return (
                <Card key={clase.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Color badge */}
                      <div
                        className="w-1 rounded-full self-stretch flex-shrink-0 min-h-[60px]"
                        style={{ backgroundColor: clase.color }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900">{clase.name}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {clase.startTime} – {clase.endTime}
                              </span>
                              {clase.instructor && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {clase.instructor}
                                </span>
                              )}
                            </div>
                            {clase.description && (
                              <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                                {clase.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge
                              variant="outline"
                              style={{
                                borderColor: clase.color,
                                color: clase.color,
                                backgroundColor: `${clase.color}15`,
                              }}
                              className="text-xs"
                            >
                              <Users2 className="h-3 w-3 mr-1" />
                              {cuposDisponibles > 0
                                ? `${cuposDisponibles} cupos`
                                : "Lleno"}
                            </Badge>
                          </div>
                        </div>

                        {/* Barra de ocupación */}
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${cuposPercent}%`,
                                backgroundColor: cuposPercent >= 90 ? "#ef4444" : clase.color,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">
                            {inscritos}/{clase.capacity}
                          </span>
                          <ClassActions claseId={clase.id} claseNombre={clase.name} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ClasesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clases Grupales</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Horario semanal de clases del gimnasio
          </p>
        </div>
        <Link href="/classes/new">
          <Button className="bg-blue-600 hover:bg-blue-700 min-h-[48px] gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva Clase</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        }
      >
        <ClasesList />
      </Suspense>
    </div>
  )
}
