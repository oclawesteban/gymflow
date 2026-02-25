"use client"

import { useState, useEffect, useCallback } from "react"
import { updateGymSettings } from "@/lib/actions/settings"
import { createPlan } from "@/lib/actions/plans"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dumbbell, ChevronRight, Check, Loader2, X } from "lucide-react"
import confetti from "canvas-confetti"
import { useRouter } from "next/navigation"

const STORAGE_KEY = "gymflow_onboarding_complete"

interface OnboardingWizardProps {
  shouldShow: boolean
  gymName: string
}

const STEPS = [
  { title: "Bienvenida", description: "Configura tu gimnasio en 2 pasos simples" },
  { title: "Tu Gimnasio", description: "Información básica del gimnasio" },
  { title: "Primer Plan", description: "Crea tu plan de membresía" },
  { title: "¡Listo!", description: "Todo configurado" },
]

export function OnboardingWizard({ shouldShow, gymName }: OnboardingWizardProps) {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Gym info
  const [gName, setGName] = useState(gymName)
  const [gCity, setGCity] = useState("")
  const [gPhone, setGPhone] = useState("")

  // Plan info
  const [planName, setPlanName] = useState("Mensual")
  const [planPrice, setPlanPrice] = useState("80000")
  const [planDays, setPlanDays] = useState("30")

  // Summary
  const [summary, setSummary] = useState<{ gym: string; plan: string }>({
    gym: "",
    plan: "",
  })

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (shouldShow && !done) {
      setVisible(true)
    }
  }, [shouldShow])

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
    })
  }, [])

  async function handleStep2() {
    if (!gName.trim()) return
    setLoading(true)
    try {
      await updateGymSettings({ name: gName, city: gCity, phone: gPhone })
      setSummary((s) => ({ ...s, gym: gName }))
      setStep(2)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleStep3() {
    const price = parseFloat(planPrice)
    const days = parseInt(planDays)
    if (!planName.trim() || isNaN(price) || isNaN(days)) return
    setLoading(true)
    try {
      await createPlan({ name: planName, price, durationDays: days })
      setSummary((s) => ({ ...s, plan: `${planName} — $${price.toLocaleString("es-CO")} / ${days} días` }))
      setStep(3)
      fireConfetti()
      localStorage.setItem(STORAGE_KEY, "true")
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "true")
    setVisible(false)
  }

  function handleFinish() {
    setVisible(false)
    router.refresh()
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                {STEPS[step].title}
              </p>
              <p className="text-xs text-gray-400">{STEPS[step].description}</p>
            </div>
          </div>
          {step < 3 && (
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 px-6 py-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step
                  ? "w-8 bg-blue-600"
                  : i < step
                  ? "w-2 bg-blue-400"
                  : "w-2 bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">

          {/* Step 0 — Bienvenida */}
          {step === 0 && (
            <div className="text-center py-4 space-y-4">
              <div className="text-5xl">🏋️</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                ¡Bienvenido a GymFlow!
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Vamos a configurar tu gimnasio <strong>{gymName}</strong> en 2 pasos simples.
                Esto solo tomará un momento.
              </p>
              <div className="flex flex-col gap-2 text-sm text-left bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4">
                {[
                  "Configura la info de tu gimnasio",
                  "Crea tu primer plan de membresía",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    {item}
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setStep(1)}
                className="w-full bg-blue-600 hover:bg-blue-700 min-h-[52px] gap-2 text-base"
              >
                ¡Empezar! <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 1 — Configura el gym */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del gimnasio *</Label>
                <Input
                  value={gName}
                  onChange={(e) => setGName(e.target.value)}
                  placeholder="Ej: FitZone Manizales"
                  className="min-h-[48px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input
                  value={gCity}
                  onChange={(e) => setGCity(e.target.value)}
                  placeholder="Ej: Manizales"
                  className="min-h-[48px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono de contacto</Label>
                <Input
                  value={gPhone}
                  onChange={(e) => setGPhone(e.target.value)}
                  placeholder="Ej: +57 300 123 4567"
                  className="min-h-[48px]"
                />
              </div>
              <Button
                onClick={handleStep2}
                disabled={loading || !gName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 min-h-[52px] gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Siguiente <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 2 — Primer plan */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del plan *</Label>
                <Input
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="Ej: Mensual"
                  className="min-h-[48px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Precio (COP) *</Label>
                  <Input
                    type="number"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    placeholder="80000"
                    min="0"
                    className="min-h-[48px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duración (días) *</Label>
                  <Input
                    type="number"
                    value={planDays}
                    onChange={(e) => setPlanDays(e.target.value)}
                    placeholder="30"
                    min="1"
                    className="min-h-[48px]"
                  />
                </div>
              </div>
              <Button
                onClick={handleStep3}
                disabled={loading || !planName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 min-h-[52px] gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Crear plan <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 3 — ¡Listo! */}
          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="text-5xl">🎉</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                ¡Todo listo!
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tu gimnasio está configurado y listo para operar.
              </p>
              <div className="space-y-2 text-sm bg-green-50 dark:bg-green-950/30 rounded-2xl p-4 text-left">
                {[
                  { label: "Gimnasio", value: summary.gym },
                  { label: "Plan creado", value: summary.plan },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-green-800 dark:text-green-300">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>
                      <strong>{item.label}:</strong> {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleFinish}
                className="w-full bg-blue-600 hover:bg-blue-700 min-h-[52px] gap-2 text-base"
              >
                Ir al dashboard 🚀
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
