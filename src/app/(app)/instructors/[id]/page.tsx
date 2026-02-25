import { getInstructor } from "@/lib/actions/instructors"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  GraduationCap,
  Phone,
  Mail,
  Users2,
  Clock,
} from "lucide-react"
import Link from "next/link"

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

export default async function InstructorProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const instructor = await getInstructor(params.id)
  if (!instructor) notFound()

  const initials = instructor.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/instructors">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Perfil del Instructor
          </h1>
        </div>
      </div>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            {instructor.photoUrl ? (
              <img
                src={instructor.photoUrl}
                alt={instructor.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700 flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {instructor.name}
                </h2>
                <Badge variant={instructor.isActive ? "default" : "secondary"}>
                  {instructor.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              {instructor.specialty && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  {instructor.specialty}
                </p>
              )}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                {instructor.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {instructor.email}
                  </span>
                )}
                {instructor.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    {instructor.phone}
                  </span>
                )}
              </div>
              {instructor.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
                  {instructor.bio}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clases asignadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users2 className="h-5 w-5 text-blue-600" />
            Clases asignadas ({instructor.classes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {instructor.classes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <GraduationCap className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Este instructor no tiene clases asignadas</p>
              <Link href="/classes/new" className="mt-3 inline-block">
                <Button variant="outline" size="sm">Asignar clase</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {instructor.classes.map((cls) => (
                <Link key={cls.id} href={`/classes/${cls.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div
                      className="w-3 h-10 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cls.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{cls.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {DIAS[cls.dayOfWeek]} {cls.startTime} – {cls.endTime}
                        {" · "}
                        {cls.capacity} cupos
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
