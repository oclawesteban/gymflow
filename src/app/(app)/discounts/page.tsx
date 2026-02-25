import { getPromoCodes } from "@/lib/actions/discounts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tag, Plus, CheckCircle2, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils/format"
import { PromoCodeActions } from "./promo-code-actions"

function getPromoStatus(promo: {
  isActive: boolean
  validUntil: Date | null
  maxUses: number | null
  usedCount: number
}) {
  if (!promo.isActive) return { label: "Inactivo", color: "secondary" as const }
  if (promo.validUntil && promo.validUntil < new Date())
    return { label: "Vencido", color: "destructive" as const }
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses)
    return { label: "Agotado", color: "destructive" as const }
  return { label: "Activo", color: "default" as const }
}

export default async function DiscountsPage() {
  const promoCodes = await getPromoCodes()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Descuentos</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Gestiona códigos promocionales para tu gimnasio
          </p>
        </div>
        <Link href="/discounts/new">
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2 min-h-[44px]">
            <Plus className="h-4 w-4" />
            Nuevo código
          </Button>
        </Link>
      </div>

      {promoCodes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Sin códigos promocionales
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Crea tu primer código de descuento para ofrecer a tus socios
            </p>
            <Link href="/discounts/new">
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus className="h-4 w-4" />
                Crear primer código
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {promoCodes.map((promo) => {
            const status = getPromoStatus(promo)
            return (
              <Card key={promo.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Tag className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 dark:text-gray-100 font-mono text-lg">
                            {promo.code}
                          </span>
                          <Badge
                            variant={status.color}
                            className="text-xs"
                          >
                            {status.label === "Activo" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {(status.label === "Vencido" || status.label === "Agotado") && (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {status.label === "Inactivo" && <Clock className="h-3 w-3 mr-1" />}
                            {status.label}
                          </Badge>
                        </div>
                        {promo.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {promo.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-semibold text-blue-700 dark:text-blue-400 text-sm">
                            {promo.discountType === "PERCENTAGE"
                              ? `${Number(promo.discountValue)}% de descuento`
                              : `${formatCurrency(Number(promo.discountValue))} de descuento`}
                          </span>
                          <span>
                            Usos: {promo.usedCount}
                            {promo.maxUses !== null ? ` / ${promo.maxUses}` : " / ∞"}
                          </span>
                          {promo.validUntil && (
                            <span>
                              Vence: {new Date(promo.validUntil).toLocaleDateString("es-CO")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <PromoCodeActions id={promo.id} isActive={promo.isActive} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
