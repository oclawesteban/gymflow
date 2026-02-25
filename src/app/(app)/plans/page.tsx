import { getPlans } from "@/lib/actions/plans"
import { formatCurrency } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, FileText, Clock, Users, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { PlanActions } from "@/components/plans/plan-actions"

async function PlansList() {
  const plans = await getPlans()

  if (plans.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="h-10 w-10 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Aún no hay planes</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Crea los planes de membresía que ofrecerás en tu gimnasio.
        </p>
        <Link href="/plans/new">
          <Button className="bg-blue-600 hover:bg-blue-700 min-h-[48px] px-6 gap-2">
            <Plus className="h-4 w-4" />
            Crear Primer Plan
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {plans.map((plan) => (
        <Card key={plan.id} className="border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                  {!plan.isActive && (
                    <Badge className="bg-gray-100 text-gray-600 border-gray-200 border text-xs">Inactivo</Badge>
                  )}
                </div>
                {plan.description && (
                  <p className="text-sm text-gray-500 mb-3">{plan.description}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-2xl font-bold text-blue-700">
                {formatCurrency(Number(plan.price))}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {plan.durationDays === 30 ? "1 mes" :
                    plan.durationDays === 60 ? "2 meses" :
                    plan.durationDays === 90 ? "3 meses" :
                    plan.durationDays === 180 ? "6 meses" :
                    plan.durationDays === 365 ? "1 año" :
                    `${plan.durationDays} días`}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {plan._count.memberships} miembro{plan._count.memberships !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <Link href={`/memberships/new?planId=${plan.id}`} className="flex-1">
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 min-h-[40px] gap-1 text-xs">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Asignar
                </Button>
              </Link>
              <PlanActions plan={{ id: plan.id, name: plan.name, isActive: plan.isActive }} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planes</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestiona los planes de membresía</p>
        </div>
        <Link href="/plans/new">
          <Button className="bg-blue-600 hover:bg-blue-700 min-h-[48px] gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Plan</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </Link>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      }>
        <PlansList />
      </Suspense>
    </div>
  )
}
