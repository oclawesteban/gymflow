"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

// Evento estándar para la instalación de PWA
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [mostrar, setMostrar] = useState(false)

  useEffect(() => {
    // Si ya está instalada como PWA, no mostrar
    const yaInstalada =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true

    if (yaInstalada) return

    // Si el usuario ya cerró el banner antes, no molestar
    const cerrado = sessionStorage.getItem("gymflow-install-banner-closed")
    if (cerrado) return

    const manejador = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e as BeforeInstallPromptEvent)
      setMostrar(true)
    }

    window.addEventListener("beforeinstallprompt", manejador)
    return () => window.removeEventListener("beforeinstallprompt", manejador)
  }, [])

  const handleInstalar = async () => {
    if (!promptEvent) return
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === "accepted") {
      setMostrar(false)
    }
    setPromptEvent(null)
  }

  const handleCerrar = () => {
    sessionStorage.setItem("gymflow-install-banner-closed", "1")
    setMostrar(false)
  }

  if (!mostrar) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-sm mx-auto md:ml-auto md:mr-4 bg-white border border-blue-200 rounded-2xl shadow-lg p-4 flex items-center gap-3">
        {/* Ícono */}
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
          📱
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight">
            Instala GymFlow en tu celular
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Acceso rápido, sin navegador
          </p>
        </div>

        {/* Botón instalar */}
        <Button
          onClick={handleInstalar}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3 flex-shrink-0"
        >
          Instalar
        </Button>

        {/* Cerrar */}
        <button
          onClick={handleCerrar}
          className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex-shrink-0"
          aria-label="Cerrar banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
