"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface SelfCheckInButtonProps {
  memberId: string
}

export function SelfCheckInButton({ memberId: _memberId }: SelfCheckInButtonProps) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleCheckIn() {
    setLoading(true)
    try {
      const res = await fetch("/api/portal/checkin", { method: "POST" })
      const data = await res.json()

      if (data.success) {
        setDone(true)
        toast.success("¡Check-in registrado! Bienvenido al gym 💪")
        setTimeout(() => setDone(false), 5000)
      } else {
        toast.error(data.error || "No se pudo registrar el check-in")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckIn}
      disabled={loading || done}
      className={`w-full min-h-[56px] gap-2 text-base font-semibold transition-all ${
        done
          ? "bg-green-600 hover:bg-green-600"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <CheckCircle className="h-5 w-5" />
      )}
      {done ? "¡Entrada registrada! 💪" : loading ? "Registrando..." : "Registrar mi entrada"}
    </Button>
  )
}
