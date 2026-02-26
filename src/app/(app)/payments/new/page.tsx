"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createPayment } from "@/lib/actions/payments"
import { getMemberships } from "@/lib/actions/memberships"
import { validatePromoCode } from "@/lib/actions/discounts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { ArrowLeft, Loader2, DollarSign, Tag, CheckCircle2, XCircle, Banknote, Smartphone, Wallet, CreditCard, Building2, CircleDollarSign } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const PAYMENT_METHODS = [
  { value: "CASH",     label: "Efectivo",       Icon: Banknote },
  { value: "NEQUI",    label: "Nequi",          Icon: Smartphone },
  { value: "DAVIPLATA",label: "Daviplata",      Icon: Wallet },
  { value: "CARD",     label: "Tarjeta",        Icon: CreditCard },
  { value: "TRANSFER", label: "Transferencia",  Icon: Building2 },
  { value: "OTHER",    label: "Otro",           Icon: CircleDollarSign },
]

type Membership = {
  id: string
  member: { name: string }
  plan: { name: string; price: any }
  status: string
}

type PromoCodeResult = {
  id: string
  code: string
  discountType: string
  discountValue: number
  description?: string | null
}

export default function NewPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultMembershipId = searchParams.get("membershipId") ?? ""

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [selectedMembership, setSelectedMembership] = useState(defaultMembershipId)
  const [method, setMethod] = useState("CASH")
  const [amount, setAmount] = useState("")

  // Promo code
  const [promoInput, setPromoInput] = useState("")
  const [validatingPromo, setValidatingPromo] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<PromoCodeResult | null>(null)
  const [promoError, setPromoError] = useState("")

  useEffect(() => {
    getMemberships().then((ms) => setMemberships(ms as any))
  }, [])

  const selected = memberships.find((m) => m.id === selectedMembership)

  useEffect(() => {
    if (selected) setAmount(String(Number(selected.plan.price)))
  }, [selected])

  const planPrice = selected ? Number(selected.plan.price) : 0

  function calcDiscount(): number {
    if (!appliedPromo || !planPrice) return 0
    if (appliedPromo.discountType === "PERCENTAGE") {
      return Math.round(planPrice * (appliedPromo.discountValue / 100))
    }
    return appliedPromo.discountValue
  }

  const discountAmount = calcDiscount()
  const finalAmount = Math.max(0, planPrice - discountAmount)

  async function handleValidatePromo(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" && e.key !== "Tab") return
    e.preventDefault()
    if (!promoInput.trim()) return
    await validatePromo()
  }

  async function validatePromo() {
    if (!promoInput.trim()) return
    setValidatingPromo(true)
    setPromoError("")
    setAppliedPromo(null)
    try {
      const result = await validatePromoCode(promoInput.trim())
      if (result.valid && result.promoCode) {
        setAppliedPromo(result.promoCode)
        setAmount(String(Math.max(0, planPrice - calcDiscountFor(result.promoCode))))
      } else {
        setPromoError(result.error ?? "Código no válido")
      }
    } catch {
      setPromoError("Error al validar el código")
    } finally {
      setValidatingPromo(false)
    }
  }

  function calcDiscountFor(promo: PromoCodeResult): number {
    if (promo.discountType === "PERCENTAGE") {
      return Math.round(planPrice * (promo.discountValue / 100))
    }
    return promo.discountValue
  }

  function removePromo() {
    setAppliedPromo(null)
    setPromoInput("")
    setPromoError("")
    if (selected) setAmount(String(Number(selected.plan.price)))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedMembership) {
      setError("Selecciona una membresía")
      return
    }
    setLoading(true)
    setError("")

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const result = await createPayment({
        membershipId: selectedMembership,
        amount: parseFloat(data.get("amount") as string),
        method: method as any,
        reference: data.get("reference") as string || undefined,
        notes: data.get("notes") as string || undefined,
        promoCodeId: appliedPromo?.id,
        discountAmount: appliedPromo ? discountAmount : undefined,
      })

      if (result.success) {
        toast.success("Pago registrado exitosamente")
        router.push("/payments")
      }
    } catch (err: any) {
      setError(err.message ?? "Error al registrar el pago")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/payments">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Registrar Pago</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Registra el pago de una membresía</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Detalles del Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Membresía *</Label>
              <SearchableSelect
                options={memberships.map((ms) => ({
                  value: ms.id,
                  label: ms.member.name,
                  sublabel: ms.plan.name,
                }))}
                value={selectedMembership}
                onValueChange={setSelectedMembership}
                placeholder="Selecciona la membresía..."
                searchPlaceholder="Buscar por nombre o plan..."
                emptyText="No se encontró ninguna membresía."
              />
              {selected && (
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 text-sm text-blue-800 dark:text-blue-300">
                  Valor del plan:{" "}
                  <span className="font-semibold">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      maximumFractionDigits: 0,
                    }).format(planPrice)}
                  </span>
                </div>
              )}
            </div>

            {/* Código de descuento */}
            <div className="space-y-2">
              <Label htmlFor="promoCode" className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-gray-400" />
                Código de descuento (opcional)
              </Label>
              {appliedPromo ? (
                <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                      ✅ Descuento aplicado: -{" "}
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        maximumFractionDigits: 0,
                      }).format(discountAmount)}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {appliedPromo.code}
                      {appliedPromo.description ? ` — ${appliedPromo.description}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removePromo}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="promoCode"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value.toUpperCase())
                      setPromoError("")
                    }}
                    onKeyDown={handleValidatePromo}
                    placeholder="Ej: ENERO20 (Enter para aplicar)"
                    className="min-h-[48px] text-base font-mono uppercase flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={validatePromo}
                    disabled={validatingPromo || !promoInput.trim()}
                    className="min-h-[48px] px-4"
                  >
                    {validatingPromo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Aplicar"
                    )}
                  </Button>
                </div>
              )}
              {promoError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" />
                  {promoError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Monto a cobrar (COP) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ej: 80000"
                required
                className="min-h-[48px] text-base"
              />
              {appliedPromo && discountAmount > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  Precio original: {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(planPrice)} → Descuento: -{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(discountAmount)} → Total: {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(finalAmount)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Forma de pago *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((pm) => {
                  const Icon = pm.Icon
                  return (
                    <button
                      key={pm.value}
                      type="button"
                      onClick={() => setMethod(pm.value)}
                      className={`py-3 px-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        method === pm.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300"
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {pm.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Referencia (opcional)</Label>
              <Input
                id="reference"
                name="reference"
                placeholder="Número de transacción, comprobante..."
                className="min-h-[48px] text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Observaciones adicionales..."
                rows={2}
                className="text-base resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pb-8">
          <Link href="/payments" className="flex-1">
            <Button variant="outline" className="w-full min-h-[52px]">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 min-h-[52px] gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
            Registrar Pago
          </Button>
        </div>
      </form>
    </div>
  )
}
