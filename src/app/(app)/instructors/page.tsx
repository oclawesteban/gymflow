import { getInstructors } from "@/lib/actions/instructors"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GraduationCap, Plus, Users2, Phone, Mail } from "lucide-react"
import Link from "next/link"

export default async function InstructorsPage() {
  const instructors = await getInstructors()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Instructores</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Gestiona el equipo de instructores de tu gimnasio
          </p>
        </div>
        <Link href="/instructors/new">
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2 min-h-[44px]">
            <Plus className="h-4 w-4" />
            Nuevo instructor
          </Button>
        </Link>
      </div>

      {instructors.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Sin instructores registrados
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Agrega instructores para asignarlos a tus clases
            </p>
            <Link href="/instructors/new">
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus className="h-4 w-4" />
                Agregar instructor
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {instructors.map((inst) => {
            const initials = inst.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)

            return (
              <Link key={inst.id} href={`/instructors/${inst.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {inst.photoUrl ? (
                        <img
                          src={inst.photoUrl}
                          alt={inst.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {inst.name}
                          </h3>
                          {!inst.isActive && (
                            <Badge variant="secondary" className="text-xs">Inactivo</Badge>
                          )}
                        </div>
                        {inst.specialty && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                            {inst.specialty}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users2 className="h-3.5 w-3.5" />
                            {inst._count.classes} clase{inst._count.classes !== 1 ? "s" : ""}
                          </span>
                          {inst.phone && (
                            <span className="flex items-center gap-1 truncate">
                              <Phone className="h-3.5 w-3.5" />
                              {inst.phone}
                            </span>
                          )}
                        </div>
                        {inst.email && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1 truncate">
                            <Mail className="h-3.5 w-3.5" />
                            {inst.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
