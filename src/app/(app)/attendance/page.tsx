import { getAttendance } from "@/lib/actions/attendance"
import { getMembers } from "@/lib/actions/members"
import { formatDateTime } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarCheck, UserCheck, History, CalendarDays } from "lucide-react"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckInButton } from "@/components/attendance/check-in-button"
import { QuickCheckIn } from "@/components/attendance/quick-check-in"
import { AdminTurnstileButton } from "@/components/access/admin-turnstile-button"
import Link from "next/link"

async function AttendanceContent({ memberId, showAll }: { memberId?: string; showAll?: boolean }) {
  const todayFilter = !memberId && !showAll ? new Date() : undefined
  const [attendance, members] = await Promise.all([
    getAttendance({ memberId, date: todayFilter }),
    getMembers(),
  ])

  return (
    <div className="space-y-6">
      {/* Quick Check-In */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-blue-900 flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Registro Rápido de Entrada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QuickCheckIn members={members.map(m => ({ id: m.id, name: m.name }))} defaultMemberId={memberId} />
        </CardContent>
      </Card>

      {/* Member Grid for Quick Check-In */}
      {!memberId && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Toca para registrar entrada:</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {members.length === 0 ? (
              <div className="col-span-full text-center py-6 text-gray-500 text-sm">
                No hay miembros registrados
              </div>
            ) : (
              members.map((member) => (
                <CheckInButton
                  key={member.id}
                  memberId={member.id}
                  memberName={member.name}
                  photoUrl={member.photoUrl ?? undefined}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Attendance Log */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" />
              {memberId ? "Historial del Miembro" : showAll ? "Historial Completo" : `Asistencias de Hoy (${attendance.length})`}
            </CardTitle>
            {!memberId && (
              showAll ? (
                <Link href="/attendance">
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Solo hoy
                  </Button>
                </Link>
              ) : (
                <Link href="/attendance?all=true">
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    <History className="h-3.5 w-3.5" />
                    Ver historial
                  </Button>
                </Link>
              )
            )}
          </div>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <div className="text-center py-8">
              <CalendarCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                {memberId ? "Sin registros de asistencia" : "Nadie ha llegado hoy todavía"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {attendance.map((record) => (
                <div key={record.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold flex-shrink-0 overflow-hidden">
                    {record.member.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={record.member.photoUrl} alt={record.member.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      record.member.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{record.member.name}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(record.checkedIn)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 flex-shrink-0">
                    <UserCheck className="h-4 w-4" />
                    <span className="text-xs font-medium">Entró</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ memberId?: string; all?: string }>
}) {
  const { memberId, all } = await searchParams
  const showAll = all === "true"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Asistencia</h1>
          <p className="text-gray-500 text-sm mt-0.5">Registra la entrada de los miembros</p>
        </div>
        <AdminTurnstileButton />
      </div>

      <Suspense fallback={
        <div className="space-y-4">
          <Skeleton className="h-36 rounded-xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        </div>
      }>
        <AttendanceContent memberId={memberId} showAll={showAll} />
      </Suspense>
    </div>
  )
}
