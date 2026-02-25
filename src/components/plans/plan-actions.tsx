"use client"

import { useState } from "react"
import { deletePlan, updatePlan } from "@/lib/actions/plans"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Trash2, ToggleLeft, ToggleRight } from "lucide-react"

export function PlanActions({ plan }: { plan: { id: string; name: string; isActive: boolean } }) {
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      await updatePlan(plan.id, { isActive: !plan.isActive })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar el plan "${plan.name}"? Esta acción no se puede deshacer.`)) return
    setLoading(true)
    try {
      await deletePlan(plan.id)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" disabled={loading}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleToggle} className="gap-2">
          {plan.isActive ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
          {plan.isActive ? "Desactivar" : "Activar"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="gap-2 text-red-600">
          <Trash2 className="h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
