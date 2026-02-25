"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Share, Plus } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function isIOS() {
  if (typeof navigator === "undefined") return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [mostrar, setMostrar] = useState(false)
  const [esIOS, setEsIOS] = useState(false)

  useEffect(() => {
    // No mostrar si ya está instalada
    if (isInStandaloneMode()) return

    // No mostrar si ya se cerró en esta sesión
    if (sessionStorage.getItem("gymflow-install-banner-closed")) return

    const ios = isIOS()
    setEsIOS(ios)

    if (ios) {
      // iOS no dispara beforeinstallprompt — mostramos instrucciones manuales
      // Solo si es Safari (para no molestar en otros browsers de iOS)
      const esSafari = /safari/i.test(navigator.userAgent) && !/chrome|crios/i.test(navigator.userAgent)
      if (esSafari) {
        // Delay de 3s para no aparecer de inmediato
        const timer = setTimeout(() => setMostrar(true), 3000)
        return () => clearTimeout(timer)
      }
    } else {
      // Android/Chrome: esperar el evento beforeinstallprompt
      const manejador = (e: Event) => {
        e.preventDefault()
        setPromptEvent(e as BeforeInstallPromptEvent)
        setMostrar(true)
      }
      window.addEventListener("beforeinstallprompt", manejador)
      return () => window.removeEventListener("beforeinstallprompt", manejador)
    }
  }, [])

  const handleInstalar = async () => {
    if (!promptEvent) return
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === "accepted") setMostrar(false)
    setPromptEvent(null)
  }

  const handleCerrar = () => {
    sessionStorage.setItem("gymflow-install-banner-closed", "1")
    setMostrar(false)
  }

  if (!mostrar) return null

  return (
    // Posicionado debajo del topbar mobile (top-16) y NUNCA en bottom
    // En desktop: esquina superior derecha
    <div className="fixed top-16 md:top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40 pointer-events-none">
      <div className="pointer-events-auto bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-2xl shadow-xl p-4 flex items-start gap-3">
        {/* Ícono */}
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 text-lg mt-0.5">
          📱
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
            Instala GymFlow en tu celular
          </p>

          {esIOS ? (
            // Instrucciones para iOS Safari
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Toca{" "}
              <span className="inline-flex items-center gap-0.5 text-blue-600 font-medium">
                <Share className="h-3 w-3" /> Compartir
              </span>{" "}
              y luego{" "}
              <span className="inline-flex items-center gap-0.5 text-blue-600 font-medium">
                <Plus className="h-3 w-3" /> Agregar a inicio
              </span>
            </p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Acceso rápido, sin abrir el navegador
            </p>
          )}

          {!esIOS && (
            <Button
              onClick={handleInstalar}
              size="sm"
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-3"
            >
              Instalar ahora
            </Button>
          )}
        </div>

        {/* Cerrar */}
        <button
          onClick={handleCerrar}
          className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
          aria-label="Cerrar banner de instalación"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
