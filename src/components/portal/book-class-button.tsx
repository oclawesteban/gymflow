"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { bookPortalClass, cancelPortalBooking } from "@/lib/actions/portal"
import { Loader2, Check } from "lucide-react"

interface Props {
  classId: string
  memberId: string
  gymId: string
  dateStr: string
  isBooked: boolean
  isFull: boolean
  isPast: boolean
}

export function BookClassButton({
  classId,
  memberId,
  gymId,
  dateStr,
  isBooked,
  isFull,
  isPast,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [justBooked, setJustBooked] = useState(false)

  async function handleClick() {
    setError(null)
    startTransition(async () => {
      const result = isBooked
        ? await cancelPortalBooking(memberId, classId, dateStr)
        : await bookPortalClass(memberId, gymId, classId, dateStr)

      if (!result.success) {
        setError(result.error ?? "Error inesperado")
      } else {
        if (!isBooked) setJustBooked(true)
        router.refresh()
      }
    })
  }

  if (isPast) {
    return <span className="text-xs text-gray-400">Pasada</span>
  }

  if (isFull && !isBooked) {
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100">
        Sin cupos
      </span>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
          transition-all duration-150 min-w-[80px] justify-center
          ${isBooked
            ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
            : "bg-blue-600 text-white hover:bg-blue-700"
          }
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : isBooked ? (
          <>
            <Check className="h-3 w-3" />
            Cancelar
          </>
        ) : justBooked ? (
          <>
            <Check className="h-3 w-3" />
            ¡Listo!
          </>
        ) : (
          "Reservar"
        )}
      </button>
      {error && (
        <p className="text-xs text-red-500 text-right max-w-[140px]">{error}</p>
      )}
    </div>
  )
}
