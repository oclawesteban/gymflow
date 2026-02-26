import React from "react"
import { getPaymentsPaginated } from "@/lib/actions/payments"
import { getGymSettings } from "@/lib/actions/settings"
import { formatCurrency, formatDateTime, getPaymentMethodLabel } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, DollarSign, Banknote, CreditCard, Building2, Smartphone, Wallet, CircleDollarSign, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ExportButton } from "@/components/exports/export-button"
import { exportPayments } from "@/lib/actions/exports"
import { ReceiptButton } from "@/components/payments/receipt-button"

const METHOD_ICONS: Record<string, React.ElementType> = {
  CASH:      Banknote,
  CARD:      CreditCard,
  TRANSFER:  Building2,
  NEQUI:     Smartphone,
  DAVIPLATA: Wallet,
  OTHER:     CircleDollarSign,
}

const METHOD_COLORS: Record<string, string> = {
  CASH:      "bg-green-100 text-green-700",
  CARD:      "bg-blue-100 text-blue-700",
  TRANSFER:  "bg-indigo-100 text-indigo-700",
  NEQUI:     "bg-purple-100 text-purple-700",
  DAVIPLATA: "bg-red-100 text-red-700",
  OTHER:     "bg-gray-100 text-gray-700",
}

async function PaymentsList({ page }: { page?: number }) {
  const [{ payments, total, totalPages, page: currentPage }, gym] = await Promise.all([getPaymentsPaginated({ page }), getGymSettings()])

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
    <div className="space-y-4">
    <div className="space-y-3">
      {payments.map((payment) => (
        <Card key={payment.id} className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {(() => { const Icon = METHOD_ICONS[payment.method] ?? CircleDollarSign; const color = METHOD_COLORS[payment.method] ?? "bg-gray-100 text-gray-700"; return (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              )})()}
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

    {/* Paginación */}
    {totalPages > 1 && (
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          {total} pago{total !== 1 ? "s" : ""} · Página {currentPage} de {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Link href={`/payments?page=${Math.max(1, currentPage - 1)}`}>
            <Button variant="outline" size="sm" disabled={currentPage <= 1} className="h-9 w-9 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i
            return (
              <Link key={p} href={`/payments?page=${p}`}>
                <Button variant={p === currentPage ? "default" : "outline"} size="sm" className={`h-9 w-9 p-0 ${p === currentPage ? "bg-blue-600" : ""}`}>{p}</Button>
              </Link>
            )
          })}
          <Link href={`/payments?page=${Math.min(totalPages, currentPage + 1)}`}>
            <Button variant="outline" size="sm" disabled={currentPage >= totalPages} className="h-9 w-9 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    )}
    </div>
  )
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const pageNum = parseInt(page ?? "1") || 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
          <p className="text-gray-500 text-sm mt-0.5">Historial de pagos de membresías</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton label="Exportar" filename="pagos" fetchData={exportPayments} />
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
        <PaymentsList page={pageNum} />
      </Suspense>
    </div>
  )
}
