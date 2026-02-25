import { getMemberships } from "@/lib/actions/memberships"
import { formatDate, formatCurrency, getMembershipStatusColor, getMembershipStatusLabel } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, CreditCard, DollarSign, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { MembershipActions } from "@/components/memberships/membership-actions"
import { WhatsAppReminderButton } from "@/components/memberships/whatsapp-reminder-button"
import { FreezeButton } from "@/components/memberships/freeze-button"

async function MembershipsList({ status }: { status?: string }) {
  const memberships = await getMemberships(status ? { status } : undefined)

  if (memberships.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="h-10 w-10 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No hay membresías</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          {status === "EXPIRED"
            ? "¡Excelente! No tienes membresías vencidas."
            : "Asigna un plan a tus miembros para empezar."}
        </p>
        {!status || status === "ACTIVE" ? (
          <Link href="/memberships/new">
            <Button className="bg-blue-600 hover:bg-blue-700 min-h-[48px] px-6 gap-2">
              <Plus className="h-4 w-4" />
              Nueva Membresía
            </Button>
          </Link>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {memberships.map((ms) => {
        const colors = getMembershipStatusColor(ms.status, ms.endDate)
        const totalPaid = ms.payments.reduce((sum, p) => sum + Number(p.amount), 0)
        const isExpiringSoon = ms.status === "ACTIVE" && colors.dot === "bg-yellow-500"
        const isExpired = ms.status === "EXPIRED"
        const isFrozen = ms.status === "FROZEN"
        const showReminder = (isExpiringSoon || isExpired) && !!ms.member.phone

        return (
          <Card key={ms.id} className={`border ${isExpiringSoon ? "border-yellow-200" : isFrozen ? "border-blue-200" : "border-gray-200"}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-base flex-shrink-0 overflow-hidden">
                  {ms.member.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ms.member.photoUrl} alt={ms.member.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    ms.member.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <Link href={`/members/${ms.memberId}`}>
                        <p className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          {ms.member.name}
                        </p>
                      </Link>
                      <p className="text-sm text-gray-600">{ms.plan.name}</p>
                    </div>
                    <Badge className={`${colors.badge} border text-xs flex-shrink-0`}>
                      {getMembershipStatusLabel(ms.status)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                    <span className="text-xs text-gray-500">
                      Vence: <span className="font-medium text-gray-700">{formatDate(ms.endDate)}</span>
                    </span>
                    {totalPaid > 0 && (
                      <span className="text-xs text-gray-500">
                        Pagado: <span className="font-medium text-green-700">{formatCurrency(totalPaid)}</span>
                      </span>
                    )}
                  </div>

                  {isExpiringSoon && (
                    <div className="flex items-center gap-1 mt-2">
                      <AlertCircle className="h-3.5 w-3.5 text-yellow-600" />
                      <span className="text-xs text-yellow-700 font-medium">Vence pronto</span>
                    </div>
                  )}
                  {isFrozen && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs text-blue-700 font-medium">❄️ Membresía congelada</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Row */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap">
                <Link href={`/payments/new?membershipId=${ms.id}`} className="flex-1 min-w-[80px]">
                  <Button size="sm" variant="outline" className="w-full min-h-[40px] gap-1 text-xs">
                    <DollarSign className="h-3.5 w-3.5" />
                    Pago
                  </Button>
                </Link>
                {showReminder && (
                  <WhatsAppReminderButton
                    phone={ms.member.phone!}
                    memberName={ms.member.name}
                    gymName={ms.member.gym.name}
                    planName={ms.plan.name}
                    expiresAt={new Date(ms.endDate)}
                  />
                )}
                <FreezeButton membershipId={ms.id} status={ms.status} />
                <MembershipActions membershipId={ms.id} status={ms.status} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default async function MembershipsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams

  const tabs = [
    { label: "Todas", value: undefined },
    { label: "Activas", value: "ACTIVE" },
    { label: "Vencidas", value: "EXPIRED" },
    { label: "Pendientes", value: "PENDING" },
    { label: "❄️ Congeladas", value: "FROZEN" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membresías</h1>
          <p className="text-gray-500 text-sm mt-0.5">Controla los planes de tus miembros</p>
        </div>
        <Link href="/memberships/new">
          <Button className="bg-blue-600 hover:bg-blue-700 min-h-[48px] gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva Membresía</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <Link key={tab.label} href={tab.value ? `/memberships?status=${tab.value}` : "/memberships"}>
            <Button
              variant={status === tab.value || (!status && !tab.value) ? "default" : "outline"}
              size="sm"
              className={`min-h-[40px] whitespace-nowrap ${
                status === tab.value || (!status && !tab.value)
                  ? "bg-blue-600 hover:bg-blue-700"
                  : ""
              }`}
            >
              {tab.label}
            </Button>
          </Link>
        ))}
      </div>

      <Suspense fallback={
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      }>
        <MembershipsList status={status} />
      </Suspense>
    </div>
  )
}
