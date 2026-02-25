"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createPromoCode } from "@/lib/actions/discounts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Tag, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NuevoCodigoPromoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE")
  const [discountValue, setDiscountValue] = useState("")
  const [maxUses, setMaxUses] = useState("")
  const [validUntil, setValidUntil] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) {
      toast.error("El código es requerido")
      return
    }
    const value = parseFloat(discountValue)
    if (isNaN(value) || value <= 0) {
      toast.error("El valor del descuento debe ser mayor a 0")
      return
    }
    if (discountType === "PERCENTAGE" && value > 100) {
      toast.error("El porcentaje no puede ser mayor a 100")
      return
    }

    setLoading(true)
    try {
      await createPromoCode({
        code: code.trim(),
        description: description.trim() || undefined,
        discountType,
        discountValue: value,
        maxUses: maxUses ? parseInt(maxUses) : undefined,
        validUntil: validUntil || undefined,
      })
      toast.success("Código creado exitosamente")
      router.push("/discounts")
    } catch (err: any) {
      toast.error(err.message ?? "Error al crear el código")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/discounts">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nuevo Código Promo</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Crea un descuento para tus socios
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-600" />
              Información del Código
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ej: ENERO20"
                required
                className="min-h-[48px] text-base font-mono uppercase"
              />
              <p className="text-xs text-gray-400">Se guardará en mayúsculas automáticamente</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descuento de enero para nuevos socios..."
                rows={2}
                className="text-base resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tipo de Descuento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDiscountType("PERCENTAGE")}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  discountType === "PERCENTAGE"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300"
                }`}
              >
                % Porcentaje
              </button>
              <button
                type="button"
                onClick={() => setDiscountType("FIXED")}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  discountType === "FIXED"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300"
                }`}
              >
                $ Valor fijo
              </button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountValue">
                {discountType === "PERCENTAGE" ? "Porcentaje (%)" : "Valor en COP"} *
              </Label>
              <Input
                id="discountValue"
                type="number"
                min="0"
                max={discountType === "PERCENTAGE" ? "100" : undefined}
                step={discountType === "PERCENTAGE" ? "1" : "1000"}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "PERCENTAGE" ? "Ej: 20" : "Ej: 15000"}
                required
                className="min-h-[48px] text-base"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Límites (opcionales)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxUses">Máximo de usos</Label>
              <Input
                id="maxUses"
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Dejar vacío = ilimitado"
                className="min-h-[48px] text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil">Válido hasta</Label>
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="min-h-[48px] text-base"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 pb-8">
          <Link href="/discounts" className="flex-1">
            <Button variant="outline" type="button" className="w-full min-h-[52px]">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 min-h-[52px] gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? "Guardando..." : "Crear código"}
          </Button>
        </div>
      </form>
    </div>
  )
}
