"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createPlan } from "@/lib/actions/plans"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, FileText } from "lucide-react"
import Link from "next/link"

const DURATION_PRESETS = [
  { label: "15 días", days: 15 },
  { label: "1 mes", days: 30 },
  { label: "2 meses", days: 60 },
  { label: "3 meses", days: 90 },
  { label: "6 meses", days: 180 },
  { label: "1 año", days: 365 },
]

export default function NewPlanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [duration, setDuration] = useState(30)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const result = await createPlan({
        name: data.get("name") as string,
        description: data.get("description") as string || undefined,
        price: parseFloat(data.get("price") as string),
        durationDays: duration,
      })

      if (result.success) {
        router.push("/plans")
      }
    } catch (err: any) {
      setError(err.message ?? "Error al crear el plan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/plans">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Plan</h1>
          <p className="text-gray-500 text-sm">Define los detalles del plan de membresía</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Detalles del Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del plan *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ej: Plan Mensual, Plan Estudiante..."
                required
                className="min-h-[48px] text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio (COP) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1000"
                placeholder="Ej: 80000"
                required
                className="min-h-[48px] text-base"
              />
            </div>

            <div className="space-y-3">
              <Label>Duración *</Label>
              <div className="grid grid-cols-3 gap-2">
                {DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setDuration(preset.days)}
                    className={`py-3 px-2 rounded-xl border text-sm font-medium transition-all ${
                      duration === preset.days
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                  className="min-h-[48px] text-base max-w-[120px]"
                />
                <span className="text-sm text-gray-500">días personalizados</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Beneficios incluidos, restricciones, etc."
                rows={3}
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
          <Link href="/plans" className="flex-1">
            <Button variant="outline" className="w-full min-h-[52px]">Cancelar</Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 min-h-[52px] gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Guardar Plan
          </Button>
        </div>
      </form>
    </div>
  )
}
