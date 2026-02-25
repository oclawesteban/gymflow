"use client"

import { useState } from "react"
import { DoorOpen, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

type State = "idle" | "loading" | "open" | "no-membership" | "cooldown" | "error"

interface TurnstileButtonProps {
  hasActiveMembership: boolean
}

export function TurnstileButton({ hasActiveMembership }: TurnstileButtonProps) {
  const [state, setState] = useState<State>(hasActiveMembership ? "idle" : "no-membership")
  const [errorMsg, setErrorMsg] = useState("")
  const [cooldownMsg, setCooldownMsg] = useState("")

  async function handleOpen() {
    if (state !== "idle") return
    setState("loading")

    try {
      const res = await fetch("/api/access/open", { method: "POST" })
      const data = await res.json()

      if (data.success) {
        setState("open")
        // Volver a idle después de 8 segundos
        setTimeout(() => setState("idle"), 8000)
      } else if (data.cooldown) {
        setCooldownMsg(data.error)
        setState("cooldown")
        setTimeout(() => setState("idle"), 5000)
      } else if (res.status === 403) {
        setState("no-membership")
      } else {
        setErrorMsg(data.error || "Error al abrir el torniquete")
        setState("error")
        setTimeout(() => setState("idle"), 4000)
      }
    } catch {
      setErrorMsg("Error de conexión. Verifica tu internet.")
      setState("error")
      setTimeout(() => setState("idle"), 4000)
    }
  }

  // ── Sin membresía activa ──────────────────────────────────────────
  if (state === "no-membership") {
    return (
      <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-5 text-center space-y-2">
        <XCircle className="h-8 w-8 text-orange-400 mx-auto" />
        <p className="font-semibold text-orange-800">Sin membresía activa</p>
        <p className="text-sm text-orange-600">
          No puedes abrir el torniquete. Contacta al administrador del gimnasio.
        </p>
      </div>
    )
  }

  // ── Torniquete abierto ────────────────────────────────────────────
  if (state === "open") {
    return (
      <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-5 text-center space-y-2 animate-pulse-once">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-9 w-9 text-green-600" />
        </div>
        <p className="text-xl font-bold text-green-800">¡Torniquete abierto!</p>
        <p className="text-sm text-green-600">Puedes pasar. Se cerrará en unos segundos.</p>
      </div>
    )
  }

  // ── Cooldown ──────────────────────────────────────────────────────
  if (state === "cooldown") {
    return (
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 text-center space-y-2">
        <Clock className="h-8 w-8 text-amber-500 mx-auto" />
        <p className="font-semibold text-amber-800">Espera un momento</p>
        <p className="text-sm text-amber-600">{cooldownMsg}</p>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────
  if (state === "error") {
    return (
      <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 text-center space-y-2">
        <XCircle className="h-8 w-8 text-red-400 mx-auto" />
        <p className="font-semibold text-red-800">Error</p>
        <p className="text-sm text-red-600">{errorMsg}</p>
      </div>
    )
  }

  // ── Idle / Loading ────────────────────────────────────────────────
  return (
    <button
      onClick={handleOpen}
      disabled={state === "loading"}
      className={`w-full rounded-2xl border-2 p-6 text-center transition-all select-none
        ${state === "loading"
          ? "border-blue-300 bg-blue-50 cursor-wait"
          : "border-blue-400 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-95 cursor-pointer shadow-lg shadow-blue-200"
        }`}
    >
      <div className="flex flex-col items-center gap-3">
        {state === "loading" ? (
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        ) : (
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <DoorOpen className="h-10 w-10 text-white" />
          </div>
        )}
        <div>
          <p className={`text-xl font-bold ${state === "loading" ? "text-blue-600" : "text-white"}`}>
            {state === "loading" ? "Abriendo..." : "Abrir torniquete"}
          </p>
          {state === "idle" && (
            <p className="text-sm text-blue-100 mt-0.5">Toca para entrar al gimnasio</p>
          )}
        </div>
      </div>
    </button>
  )
}
