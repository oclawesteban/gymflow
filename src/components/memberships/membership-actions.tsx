"use client"

import { useState } from "react"
import { renewMembership, updateMembershipStatus } from "@/lib/actions/memberships"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, RefreshCw, XCircle, Loader2 } from "lucide-react"

export function MembershipActions({
  membershipId,
  status,
}: {
  membershipId: string
  status: string
}) {
  const [loading, setLoading] = useState(false)

  async function handleRenew() {
    setLoading(true)
    try {
      await renewMembership(membershipId)
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel() {
    if (!confirm("¿Cancelar esta membresía?")) return
    setLoading(true)
    try {
      await updateMembershipStatus(membershipId, "CANCELLED")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="min-h-[40px] px-3" disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MoreVertical className="h-3.5 w-3.5" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleRenew} className="gap-2">
          <RefreshCw className="h-4 w-4 text-green-600" />
          Renovar membresía
        </DropdownMenuItem>
        {status !== "CANCELLED" && (
          <DropdownMenuItem onClick={handleCancel} className="gap-2 text-red-600">
            <XCircle className="h-4 w-4" />
            Cancelar membresía
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
