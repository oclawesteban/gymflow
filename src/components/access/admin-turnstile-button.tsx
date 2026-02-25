"use client"

import { useState } from "react"
import { adminOpenTurnstile } from "@/lib/actions/access"
import { DoorOpen, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

type State = "idle" | "loading" | "open" | "error"

export function AdminTurnstileButton() {
  const [state, setState] = useState<State>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleOpen() {
    if (state !== "idle") return
    setState("loading")
    try {
      await adminOpenTurnstile()
      setState("open")
      setTimeout(() => setState("idle"), 5000)
    } catch (err: any) {
      setErrorMsg(err.message ?? "Error al abrir el torniquete")
      setState("error")
      setTimeout(() => setState("idle"), 4000)
    }
  }

  if (state === "open") {
    return (
      <Button
        disabled
        className="min-h-[52px] px-6 gap-2 bg-green-600 hover:bg-green-600 text-white"
      >
        <CheckCircle2 className="h-5 w-5" />
        ¡Abierto!
      </Button>
    )
  }

  if (state === "error") {
    return (
      <Button
        disabled
        variant="outline"
        className="min-h-[52px] px-6 gap-2 border-red-300 text-red-600"
        title={errorMsg}
      >
        <XCircle className="h-5 w-5" />
        Error — reintentar
      </Button>
    )
  }

  return (
    <Button
      onClick={handleOpen}
      disabled={state === "loading"}
      className="min-h-[52px] px-6 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
    >
      {state === "loading"
        ? <Loader2 className="h-5 w-5 animate-spin" />
        : <DoorOpen className="h-5 w-5" />
      }
      {state === "loading" ? "Abriendo..." : "Abrir torniquete"}
    </Button>
  )
}
