"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createMembership } from "@/lib/actions/memberships"
import { getMembers } from "@/lib/actions/members"
import { getPlans } from "@/lib/actions/plans"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Loader2, CreditCard } from "lucide-react"
import Link from "next/link"

type Member = { id: string; name: string }
type Plan = { id: string; name: string; price: any; durationDays: number }

export default function NewMembershipPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultMemberId = searchParams.get("memberId") ?? ""
  const defaultPlanId = searchParams.get("planId") ?? ""

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [members, setMembers] = useState<Member[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedMember, setSelectedMember] = useState(defaultMemberId)
  const [selectedPlan, setSelectedPlan] = useState(defaultPlanId)
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    async function load() {
      const [m, p] = await Promise.all([getMembers(), getPlans()])
      setMembers(m)
      setPlans(p.filter((pl: any) => pl.isActive))
    }
    load()
  }, [])

  const selectedPlanData = plans.find(p => p.id === selectedPlan)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedMember || !selectedPlan) {
      setError("Selecciona un miembro y un plan")
      return
    }
    setLoading(true)
    setError("")

    try {
      const result = await createMembership({
        memberId: selectedMember,
        planId: selectedPlan,
        startDate: new Date(startDate),
      })

      if (result.success) {
        router.push("/memberships")
      }
    } catch (err: any) {
      setError(err.message ?? "Error al crear la membresía")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/memberships">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Membresía</h1>
          <p className="text-gray-500 text-sm">Asigna un plan a un miembro</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Detalles de la Membresía
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Miembro *</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="min-h-[48px] text-base">
                  <SelectValue placeholder="Selecciona un miembro..." />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="py-3">
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Plan *</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="min-h-[48px] text-base">
                  <SelectValue placeholder="Selecciona un plan..." />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="py-3">
                      {p.name} — {p.durationDays} días
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPlanData && (
                <div className="bg-blue-50 rounded-xl p-4 mt-2">
                  <p className="text-sm font-semibold text-blue-800">{selectedPlanData.name}</p>
                  <p className="text-sm text-blue-600">
                    Duración: {selectedPlanData.durationDays} días ·
                    Precio: {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(selectedPlanData.price))}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de inicio *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="min-h-[48px] text-base"
                required
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
          <Link href="/memberships" className="flex-1">
            <Button variant="outline" className="w-full min-h-[52px]">Cancelar</Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 min-h-[52px] gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Asignar Plan
          </Button>
        </div>
      </form>
    </div>
  )
}
