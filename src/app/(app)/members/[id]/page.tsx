import { getMemberHistory } from "@/lib/actions/members"
import { getMeasurements } from "@/lib/actions/measurements"
import { getGymSettings } from "@/lib/actions/settings"
import { BodyMeasurements } from "@/components/members/body-measurements"
import { notFound } from "next/navigation"
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  getMembershipStatusColor,
  getMembershipStatusLabel,
  getPaymentMethodLabel,
} from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Phone,
  Mail,
  AlertCircle,
  Calendar,
  CreditCard,
  DollarSign,
  CheckCircle,
  TrendingUp,
  Flame,
  Globe,
  UserCheck,
  UserX,
} from "lucide-react"
import Link from "next/link"
import { MemberActions } from "@/components/members/member-actions"
import { MemberQR } from "@/components/members/member-qr"
import { ReceiptButton } from "@/components/payments/receipt-button"

// Calcula la racha actual de días consecutivos de asistencia
function calcularRacha(fechas: Date[]): number {
  if (fechas.length === 0) return 0

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  // Crear conjunto de días únicos (sin hora)
  const diasUnicos = new Set(
    fechas.map((f) => {
      const d = new Date(f)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
  )

  const diasOrdenados = Array.from(diasUnicos).sort((a, b) => b - a)

  let racha = 0
  let diaActual = hoy.getTime()

  for (const dia of diasOrdenados) {
    if (dia === diaActual || dia === diaActual - 86400000) {
      racha++
      diaActual = dia - 86400000
    } else {
      break
    }
  }

  return racha
}

// Cuenta visitas en el mes actual y el anterior
function contarVisitasPorMes(fechas: Date[]) {
  const ahora = new Date()
  const mesActual = ahora.getMonth()
  const anioActual = ahora.getFullYear()
  const mesAnterior = mesActual === 0 ? 11 : mesActual - 1
  const anioAnterior = mesActual === 0 ? anioActual - 1 : anioActual

  let esteMes = 0
  let mesAnt = 0

  for (const f of fechas) {
    const d = new Date(f)
    if (d.getMonth() === mesActual && d.getFullYear() === anioActual) esteMes++
    if (d.getMonth() === mesAnterior && d.getFullYear() === anioAnterior) mesAnt++
  }

  return { esteMes, mesAnterior: mesAnt }
}

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [member, gymSettings, measurements] = await Promise.all([
    getMemberHistory(id),
    getGymSettings(),
    getMeasurements(id),
  ])
  if (!member) notFound()

  const activeMembership = member.memberships.find((m) => m.status === "ACTIVE")

  // Calcular total pagado
  const totalPagado = member.memberships.reduce(
    (total, ms) =>
      total + ms.payments.reduce((sum, p) => sum + Number(p.amount), 0),
    0
  )

  // Datos de asistencia
  const fechasAsistencia = member.attendance.map((a) => a.checkedIn)
  const racha = calcularRacha(fechasAsistencia)
  const { esteMes, mesAnterior } = contarVisitasPorMes(fechasAsistencia)

  // Todos los pagos de todas las membresías
  const todosLosPagos = member.memberships.flatMap((ms) =>
    ms.payments.map((p) => ({ ...p, plan: ms.plan, membershipId: ms.id }))
  ).sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <Link href="/members">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-2xl flex-shrink-0 overflow-hidden">
            {member.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.photoUrl}
                alt={member.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              member.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {member.name}
            </h1>
            <p className="text-gray-500 text-sm">
              Miembro desde {formatDate(member.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/attendance?memberId=${member.id}`}>
          <Button className="bg-blue-600 hover:bg-blue-700 min-h-[48px] gap-2">
            <CheckCircle className="h-4 w-4" />
            Registrar Entrada
          </Button>
        </Link>
        {activeMembership && (
          <Link href={`/payments/new?membershipId=${activeMembership.id}`}>
            <Button variant="outline" className="min-h-[48px] gap-2">
              <DollarSign className="h-4 w-4" />
              Registrar Pago
            </Button>
          </Link>
        )}
        <Link href={`/memberships/new?memberId=${member.id}`}>
          <Button variant="outline" className="min-h-[48px] gap-2">
            <CreditCard className="h-4 w-4" />
            Nueva Membresía
          </Button>
        </Link>
        <MemberQR memberId={member.id} memberName={member.name} />
        <MemberActions memberId={member.id} memberName={member.name} />
      </div>

      {/* Tabs de historial */}
      <Tabs defaultValue="informacion" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="informacion" className="text-xs py-2">
            Información
          </TabsTrigger>
          <TabsTrigger value="membresias" className="text-xs py-2">
            Membresías
          </TabsTrigger>
          <TabsTrigger value="pagos" className="text-xs py-2">
            Pagos
          </TabsTrigger>
          <TabsTrigger value="asistencia" className="text-xs py-2">
            Asistencia
          </TabsTrigger>
          <TabsTrigger value="medidas" className="text-xs py-2">
            📏 Medidas
          </TabsTrigger>
        </TabsList>

        {/* Tab: Información */}
        <TabsContent value="informacion" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {member.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${member.phone}`} className="text-blue-600 font-medium">
                    {member.phone}
                  </a>
                </div>
              )}
              {member.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${member.email}`} className="text-blue-600">
                    {member.email}
                  </a>
                </div>
              )}
              {(member.emergencyContact || member.emergencyPhone) && (
                <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
                  <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">
                      Contacto de emergencia
                    </p>
                    <p className="text-sm font-medium">{member.emergencyContact}</p>
                    {member.emergencyPhone && (
                      <a
                        href={`tel:${member.emergencyPhone}`}
                        className="text-sm text-blue-600"
                      >
                        {member.emergencyPhone}
                      </a>
                    )}
                  </div>
                </div>
              )}
              {member.notes && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Notas</p>
                  <p className="text-sm text-gray-700">{member.notes}</p>
                </div>
              )}
              {!member.phone && !member.email && !member.emergencyContact && !member.notes && (
                <p className="text-gray-400 text-sm text-center py-4">
                  Sin información de contacto registrada
                </p>
              )}

              {/* Estado del Portal */}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
                  Portal del Socio
                </p>
                {member.portalEmail ? (
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-700">Portal activado</p>
                      <p className="text-xs text-gray-500">{member.portalEmail}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <UserX className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-500">Sin acceso al portal</p>
                    </div>
                    <Link
                      href={`/portal/register?gym=${member.gymId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors">
                        <Globe className="h-3.5 w-3.5" />
                        Invitar al portal
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Membresías */}
        <TabsContent value="membresias" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Historial de Membresías
                </CardTitle>
                <Link href={`/memberships/new?memberId=${member.id}`}>
                  <Button size="sm" variant="outline" className="text-xs h-8">
                    + Nueva
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {member.memberships.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm mb-3">Sin membresías aún</p>
                  <Link href={`/memberships/new?memberId=${member.id}`}>
                    <Button size="sm">Asignar Plan</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {member.memberships.map((ms) => {
                    const colors = getMembershipStatusColor(ms.status, ms.endDate)
                    const totalMs = ms.payments.reduce(
                      (sum, p) => sum + Number(p.amount),
                      0
                    )
                    return (
                      <div
                        key={ms.id}
                        className="border border-gray-100 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {ms.plan.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(ms.startDate)} → {formatDate(ms.endDate)}
                            </p>
                          </div>
                          <Badge className={`${colors.badge} border text-xs`}>
                            {getMembershipStatusLabel(ms.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                          <span className="text-xs text-gray-500">
                            {ms.payments.length} pago{ms.payments.length !== 1 ? "s" : ""}
                          </span>
                          <span className="text-sm font-semibold text-green-700">
                            {formatCurrency(totalMs)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Pagos */}
        <TabsContent value="pagos" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Historial de Pagos
                </CardTitle>
                {activeMembership && (
                  <Link href={`/payments/new?membershipId=${activeMembership.id}`}>
                    <Button size="sm" variant="outline" className="text-xs h-8">
                      + Registrar
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {todosLosPagos.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  Sin pagos registrados
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    {todosLosPagos.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0 gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {p.plan.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(p.paidAt)} · {getPaymentMethodLabel(p.method)}
                          </p>
                          {p.reference && (
                            <p className="text-xs text-gray-400">Ref: {p.reference}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-sm font-semibold text-green-700">
                            {formatCurrency(Number(p.amount))}
                          </span>
                          <ReceiptButton
                            gymName={gymSettings.name}
                            payment={{
                              id: p.id,
                              amount: Number(p.amount),
                              method: p.method,
                              reference: p.reference ?? null,
                              paidAt: p.paidAt,
                              memberName: member.name,
                              planName: p.plan.name,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      Total pagado
                    </span>
                    <span className="text-lg font-bold text-green-700">
                      {formatCurrency(totalPagado)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Asistencia */}
        <TabsContent value="asistencia" className="mt-4">
          <div className="space-y-4">
            {/* Resumen estadísticas */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <TrendingUp className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{esteMes}</p>
                  <p className="text-xs text-gray-500">Este mes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <Calendar className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{mesAnterior}</p>
                  <p className="text-xs text-gray-500">Mes anterior</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{racha}</p>
                  <p className="text-xs text-gray-500">
                    {racha === 1 ? "día seguido" : "días seguidos"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de asistencia */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Registro de Visitas
                  <span className="text-gray-400 font-normal text-sm">
                    ({member.attendance.length} total)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {member.attendance.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Sin registros de asistencia
                  </p>
                ) : (
                  <div className="space-y-1 max-h-80 overflow-y-auto">
                    {member.attendance.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            {formatDateTime(a.checkedIn)}
                          </span>
                        </div>
                        {a.notes && (
                          <span className="text-xs text-gray-400">{a.notes}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Medidas corporales */}
        <TabsContent value="medidas" className="mt-4">
          <BodyMeasurements
            memberId={member.id}
            initialMeasurements={measurements.map((m) => ({
              ...m,
              measuredAt: new Date(m.measuredAt),
            }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
