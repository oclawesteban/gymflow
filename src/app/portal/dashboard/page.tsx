import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyPortalToken, getMemberPortalData } from "@/lib/actions/portal"
import { formatDate, formatCurrency, getPaymentMethodLabel } from "@/lib/utils/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MemberQR } from "@/components/members/member-qr"
import { SelfCheckInButton } from "@/components/portal/self-checkin-button"
import { PortalLogoutButton } from "@/components/portal/portal-logout-button"
import {
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  User,
} from "lucide-react"

export default async function PortalDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("portal_token")?.value

  if (!token) redirect("/portal/login")

  const session = await verifyPortalToken(token)
  if (!session) redirect("/portal/login")

  const data = await getMemberPortalData(session.memberId)
  if (!data) redirect("/portal/login")

  const { member, gym, activeMembership, recentPayments, attendanceThisMonth } = data

  const METHOD_ICONS: Record<string, string> = {
    CASH: "💵",
    CARD: "💳",
    TRANSFER: "🏦",
    NEQUI: "💜",
    DAVIPLATA: "🔴",
    OTHER: "💰",
  }

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Hola, {member.name.split(" ")[0]}!
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{gym.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl overflow-hidden">
            {member.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.photoUrl}
                alt={member.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <User className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <PortalLogoutButton />
        </div>
      </div>

      {/* Membresía activa */}
      {activeMembership ? (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                Membresía Activa
              </CardTitle>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                Activa
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-bold text-xl text-gray-900">{activeMembership.plan.name}</p>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>
                  Vence el {formatDate(activeMembership.endDate)}
                </span>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Progreso del plan</span>
                <span className="font-semibold text-blue-700">
                  {activeMembership.daysRemaining} días restantes
                </span>
              </div>
              <Progress
                value={activeMembership.progressPercent}
                className="h-3"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatDate(activeMembership.startDate)}</span>
                <span>{activeMembership.progressPercent}% transcurrido</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-orange-200 bg-orange-50/50">
          <CardContent className="py-6 text-center">
            <Clock className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <p className="font-semibold text-gray-900">Sin membresía activa</p>
            <p className="text-sm text-gray-500 mt-1">
              Contacta al administrador de tu gimnasio
            </p>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-5 pb-5 text-center">
            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">{attendanceThisMonth}</p>
            <p className="text-xs text-gray-500 mt-0.5">Visitas este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5 text-center">
            <CreditCard className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">
              {activeMembership?.daysRemaining ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Días restantes</p>
          </CardContent>
        </Card>
      </div>

      {/* Botón de check-in propio */}
      <SelfCheckInButton memberId={member.id} />

      {/* QR personal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mi QR de entrada</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <MemberQR memberId={member.id} memberName={member.name} />
        </CardContent>
      </Card>

      {/* Últimos pagos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            Últimos Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              Sin pagos registrados
            </p>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((pago) => (
                <div
                  key={pago.id}
                  className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                >
                  <span className="text-xl">
                    {METHOD_ICONS[pago.method] ?? "💰"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {pago.plan}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(pago.paidAt)} · {getPaymentMethodLabel(pago.method)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-green-700 flex-shrink-0">
                    {formatCurrency(pago.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
