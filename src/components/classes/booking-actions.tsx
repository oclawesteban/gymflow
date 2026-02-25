"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cancelBooking } from "@/lib/actions/classes"
import { Button } from "@/components/ui/button"
import { Loader2, UserMinus } from "lucide-react"
import { toast } from "sonner"

interface BookingActionsProps {
  claseId: string
  memberId: string
  fecha: Date
  memberName: string
}

export function BookingActions({
  claseId,
  memberId,
  fecha,
  memberName,
}: BookingActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    setLoading(true)
    try {
      const result = await cancelBooking(claseId, memberId, fecha)
      if (result.success) {
        toast.success(`Inscripción de ${memberName} cancelada`)
        router.refresh()
      } else {
        toast.error(result.error ?? "Error al cancelar")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCancel}
      disabled={loading}
      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
      title="Cancelar inscripción"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <UserMinus className="h-4 w-4" />
      )}
    </Button>
  )
}
