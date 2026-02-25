import { getDashboardStats } from "@/lib/actions/dashboard"
import { formatCurrency, formatDateTime, formatRelative } from "@/lib/utils/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  UserX,
  AlertTriangle,
  TrendingUp,
  CalendarCheck,
  Activity,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"

async function DashboardContent() {
  let data
  try {
    data = await getDashboardStats()
  } catch {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No se pudo cargar el panel. Asegúrate de tener un gimnasio configurado.</p>
      </div>
    )
  }

  const { gym, stats, recentPayments, recentAttendance } = data

  const statCards = [
    {
      label: "Miembros Activos",
      value: stats.activeMembers,
      icon: Users,
      color: "bg-green-50 text-green-700",
      iconBg: "bg-green-100",
      href: "/memberships?status=ACTIVE",
    },
    {
      label: "Membresías Vencidas",
      value: stats.expiredMembers,
      icon: UserX,
      color: "bg-red-50 text-red-700",
      iconBg: "bg-red-100",
      href: "/memberships?status=EXPIRED",
    },
    {
      label: "Vencen Esta Semana",
      value: stats.expiringSoon,
      icon: AlertTriangle,
      color: "bg-yellow-50 text-yellow-700",
      iconBg: "bg-yellow-100",
      href: "/memberships?status=ACTIVE",
    },
    {
      label: "Ingresos del Mes",
      value: formatCurrency(stats.revenueThisMonth),
      icon: TrendingUp,
      color: "bg-blue-50 text-blue-700",
      iconBg: "bg-blue-100",
      href: "/payments",
      isCurrency: true,
    },
    {
      label: "Asistencias Hoy",
      value: stats.todayAttendance,
      icon: CalendarCheck,
      color: "bg-purple-50 text-purple-700",
      iconBg: "bg-purple-100",
      href: "/attendance",
    },
    {
      label: "Total Miembros",
      value: stats.totalMembers,
      icon: Activity,
      color: "bg-gray-50 text-gray-700",
      iconBg: "bg-gray-100",
      href: "/members",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          ¡Bienvenido, {gym.owner.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-1">{gym.name} · Resumen de hoy</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/attendance">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white min-h-[48px] px-5 gap-2">
            <CalendarCheck className="h-4 w-4" />
            Registrar Asistencia
          </Button>
        </Link>
        <Link href="/members/new">
          <Button variant="outline" className="min-h-[48px] px-5 gap-2">
            <Users className="h-4 w-4" />
            Nuevo Miembro
          </Button>
        </Link>
        <Link href="/payments/new">
          <Button variant="outline" className="min-h-[48px] px-5 gap-2">
            <DollarSign className="h-4 w-4" />
            Registrar Pago
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.label} href={card.href}>
              <Card className={`${card.color} border-0 hover:shadow-md transition-shadow cursor-pointer`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium opacity-80 mb-1">{card.label}</p>
                      <p className={`font-bold ${card.isCurrency ? "text-lg" : "text-3xl"}`}>
                        {card.value}
                      </p>
                    </div>
                    <div className={`${card.iconBg} p-2 rounded-lg`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Bottom Panels */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Últimos Pagos</CardTitle>
              <Link href="/payments">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 text-xs">
                  Ver todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aún no hay pagos registrados</p>
                <Link href="/payments/new">
                  <Button size="sm" className="mt-3">Registrar primer pago</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{payment.membership.member.name}</p>
                      <p className="text-xs text-gray-500">{formatRelative(payment.paidAt)}</p>
                    </div>
                    <span className="font-semibold text-green-700 text-sm">
                      {formatCurrency(Number(payment.amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Asistencia Reciente</CardTitle>
              <Link href="/attendance">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 text-xs">
                  Ver todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentAttendance.length === 0 ? (
              <div className="text-center py-8">
                <CalendarCheck className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Nadie ha llegado hoy</p>
                <Link href="/attendance">
                  <Button size="sm" className="mt-3">Registrar asistencia</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAttendance.map((record) => (
                  <div key={record.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                      {record.member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{record.member.name}</p>
                      <p className="text-xs text-gray-500">{formatRelative(record.checkedIn)}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Entró</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
