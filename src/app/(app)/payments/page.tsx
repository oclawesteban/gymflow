import { getPayments } from "@/lib/actions/payments"
import { getGymSettings } from "@/lib/actions/settings"
import { formatCurrency, formatDateTime, getPaymentMethodLabel } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, DollarSign } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ExportButton } from "@/components/exports/export-button"
import { exportPayments } from "@/lib/actions/exports"
import { ReceiptButton } from "@/components/payments/receipt-button"

const METHOD_ICONS: Record<string, string> = {
  CASH: "💵",
  CARD: "💳",
  TRANSFER: "🏦",
  NEQUI: "💜",
  DAVIPLATA: "🔴",
  OTHER: "💰",
}

async function PaymentsList() {
  const [payments, gym] = await Promise.all([getPayments(), getGymSettings()])

  if (payments.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="h-10 w-10 text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Aún no hay pagos</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Registra el primer pago de una membresía.
        </p>
        <Link href="/payments/new">
          <Button className="bg-blue-600 hover:bg-blue-700 min-h-[48px] px-6 gap-2">
            <Plus className="h-4 w-4" />
            Registrar Pago
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <Card key={payment.id} className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                {METHOD_ICONS[payment.method] ?? "💰"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link href={`/members/${payment.membership.memberId}`}>
                      <p className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {payment.membership.member.name}
                      </p>
                    </Link>
                    <p className="text-xs text-gray-500">
                      {payment.membership.plan.name} · {getPaymentMethodLabel(payment.method)}
                    </p>
                    <p className="text-xs text-gray-400">{formatDateTime(payment.paidAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-lg font-bold text-green-700">
                      {formatCurrency(Number(payment.amount))}
                    </span>
                    <ReceiptButton
                      gymName={gym.name}
                      payment={{
                        id: payment.id,
                        amount: Number(payment.amount),
                        method: payment.method,
                        reference: payment.reference ?? null,
                        paidAt: payment.paidAt,
                        memberName: payment.membership.member.name,
                        planName: payment.membership.plan.name,
                      }}
                    />
                  </div>
                </div>
                {payment.reference && (
                  <p className="text-xs text-gray-400 mt-1">Ref: {payment.reference}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
          <p className="text-gray-500 text-sm mt-0.5">Historial de pagos de membresías</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            label="Exportar"
            filename="pagos"
            fetchData={exportPayments}
          />
          <Link href="/payments/new">
            <Button className="bg-blue-600 hover:bg-blue-700 min-h-[48px] gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Registrar Pago</span>
              <span className="sm:hidden">Pago</span>
            </Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      }>
        <PaymentsList />
      </Suspense>
    </div>
  )
}
