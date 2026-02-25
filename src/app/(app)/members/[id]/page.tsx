import { getMember } from "@/lib/actions/members"
import { notFound } from "next/navigation"
import { formatDate, formatDateTime, formatRelative, formatCurrency, getMembershipStatusColor, getMembershipStatusLabel, getPaymentMethodLabel } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Phone, Mail, AlertCircle, Calendar, CreditCard, DollarSign, RefreshCw, CheckCircle } from "lucide-react"
import Link from "next/link"
import { MemberActions } from "@/components/members/member-actions"
import { MemberQR } from "@/components/members/member-qr"

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const member = await getMember(id)
  if (!member) notFound()

  const activeMembership = member.memberships.find(m => m.status === "ACTIVE")

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
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
              <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover rounded-full" />
            ) : (
              member.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{member.name}</h1>
            <p className="text-gray-500 text-sm">Miembro desde {formatDate(member.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
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

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {member.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <a href={`tel:${member.phone}`} className="text-blue-600 font-medium">{member.phone}</a>
            </div>
          )}
          {member.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <a href={`mailto:${member.email}`} className="text-blue-600">{member.email}</a>
            </div>
          )}
          {(member.emergencyContact || member.emergencyPhone) && (
            <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
              <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Contacto de emergencia</p>
                <p className="text-sm font-medium">{member.emergencyContact}</p>
                {member.emergencyPhone && (
                  <a href={`tel:${member.emergencyPhone}`} className="text-sm text-blue-600">{member.emergencyPhone}</a>
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
        </CardContent>
      </Card>

      {/* Memberships */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Membresías
            </CardTitle>
            <Link href={`/memberships/new?memberId=${member.id}`}>
              <Button size="sm" variant="outline" className="text-xs h-8">+ Nueva</Button>
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
                return (
                  <div key={ms.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{ms.plan.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(ms.startDate)} → {formatDate(ms.endDate)}
                        </p>
                      </div>
                      <Badge className={`${colors.badge} border text-xs`}>
                        {getMembershipStatusLabel(ms.status)}
                      </Badge>
                    </div>
                    {ms.payments.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-50">
                        <p className="text-xs text-gray-500 mb-1">Pagos:</p>
                        {ms.payments.map(p => (
                          <div key={p.id} className="flex justify-between text-xs">
                            <span className="text-gray-600">{getPaymentMethodLabel(p.method)} · {formatRelative(p.paidAt)}</span>
                            <span className="font-medium text-green-700">{formatCurrency(Number(p.amount))}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Asistencia Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {member.attendance.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Sin registros de asistencia</p>
          ) : (
            <div className="space-y-2">
              {member.attendance.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-700">{formatDateTime(a.checkedIn)}</span>
                  </div>
                  {a.notes && <span className="text-xs text-gray-400">{a.notes}</span>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
