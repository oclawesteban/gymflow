"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createPayment } from "@/lib/actions/payments"
import { getMemberships } from "@/lib/actions/memberships"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, DollarSign } from "lucide-react"
import Link from "next/link"

const PAYMENT_METHODS = [
  { value: "CASH", label: "💵 Efectivo" },
  { value: "NEQUI", label: "💜 Nequi" },
  { value: "DAVIPLATA", label: "🔴 Daviplata" },
  { value: "CARD", label: "💳 Tarjeta" },
  { value: "TRANSFER", label: "🏦 Transferencia" },
  { value: "OTHER", label: "💰 Otro" },
]

type Membership = {
  id: string
  member: { name: string }
  plan: { name: string; price: any }
  status: string
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

  useEffect(() => {
    getMemberships().then((ms) => setMemberships(ms as any))
  }, [])

  const selected = memberships.find(m => m.id === selectedMembership)

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
      })

      if (result.success) {
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
          <h1 className="text-2xl font-bold text-gray-900">Registrar Pago</h1>
          <p className="text-gray-500 text-sm">Registra el pago de una membresía</p>
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
              <Select value={selectedMembership} onValueChange={setSelectedMembership}>
                <SelectTrigger className="min-h-[48px] text-base">
                  <SelectValue placeholder="Selecciona la membresía..." />
                </SelectTrigger>
                <SelectContent>
                  {memberships.map((ms) => (
                    <SelectItem key={ms.id} value={ms.id} className="py-3">
                      {ms.member.name} — {ms.plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selected && (
                <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-800">
                  Valor del plan: <span className="font-semibold">
                    {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(selected.plan.price))}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Monto (COP) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="1000"
                defaultValue={selected ? Number(selected.plan.price) : ""}
                placeholder="Ej: 80000"
                required
                className="min-h-[48px] text-base"
              />
            </div>

            <div className="space-y-2">
              <Label>Forma de pago *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => setMethod(pm.value)}
                    className={`py-3 px-3 rounded-xl border text-sm font-medium transition-all ${
                      method === pm.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
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
            <Button variant="outline" className="w-full min-h-[52px]">Cancelar</Button>
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
