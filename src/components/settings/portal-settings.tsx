"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, Copy, Check, ExternalLink, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { regenerateGymCode } from "@/lib/actions/settings"

interface PortalSettingsProps {
  gymId: string
  gymName: string
  gymCode: string
}

const BASE_URL = "https://gymflow-zeta.vercel.app"
const PORTAL_LOGIN = `${BASE_URL}/portal/login`
const PORTAL_REGISTER = `${BASE_URL}/portal/register`

export function PortalSettings({ gymId, gymName, gymCode: initialCode }: PortalSettingsProps) {
  const [code, setCode] = useState(initialCode)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  function copy(text: string, tipo: "code" | "url" | "link") {
    navigator.clipboard.writeText(text).then(() => {
      if (tipo === "code") { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000) }
      if (tipo === "url")  { setCopiedUrl(true);  setTimeout(() => setCopiedUrl(false), 2000) }
      if (tipo === "link") { setCopiedLink(true);  setTimeout(() => setCopiedLink(false), 2000) }
      toast.success("¡Copiado!")
    })
  }

  async function handleRegenerate() {
    if (!confirm("¿Regenerar el código? Los socios que ya lo tengan guardado deberán usar el nuevo.")) return
    setRegenerating(true)
    try {
      const result = await regenerateGymCode()
      if (result.gymCode) {
        setCode(result.gymCode)
        toast.success(`Nuevo código: ${result.gymCode}`)
      }
    } catch (err: any) {
      toast.error(err.message ?? "Error al regenerar")
    } finally {
      setRegenerating(false)
    }
  }

  const registerLink = `${PORTAL_REGISTER}?gym=${code}`

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Portal del Socio
          </CardTitle>
          <Badge className="bg-green-100 text-green-700 border-green-200">Activo</Badge>
        </div>
        <p className="text-sm text-gray-500">
          Tus socios pueden ver su membresía, pagos y asistencia desde el portal web.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* ── Código del gimnasio ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Código del gimnasio</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-gray-500 gap-1 hover:text-gray-700"
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              <RefreshCw className={`h-3 w-3 ${regenerating ? "animate-spin" : ""}`} />
              Regenerar
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Comparte este código con tus socios para que puedan registrarse. Es corto y fácil de recordar.
          </p>
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="flex-1 font-mono text-2xl font-bold tracking-widest text-blue-700">
              {code}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0 gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={() => copy(code, "code")}
            >
              {copiedCode ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedCode ? "¡Copiado!" : "Copiar"}
            </Button>
          </div>
        </div>

        {/* ── Link de registro directo ── */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Link de registro para {gymName}
          </p>
          <p className="text-xs text-gray-500">
            Este link ya tiene el código pre-llenado — solo compártelo por WhatsApp o redes.
          </p>
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <span className="flex-1 text-xs text-green-700 break-all font-mono">
              {registerLink}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0 gap-1.5 border-green-300 text-green-700 hover:bg-green-100"
              onClick={() => copy(registerLink, "link")}
            >
              {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        {/* ── URL del portal ── */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">URL del portal</p>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="flex-1 text-sm text-gray-600 break-all font-mono text-xs">
              {PORTAL_LOGIN}
            </span>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => copy(PORTAL_LOGIN, "url")}
              >
                {copiedUrl ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
              <a href={PORTAL_LOGIN} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* ── Instrucciones ── */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1">
          <p className="font-semibold">📋 Cómo funciona</p>
          <ol className="list-decimal list-inside space-y-0.5 text-amber-700">
            <li>El socio va al link de registro (o al portal y hace clic en "Regístrate")</li>
            <li>Ingresa su correo (el mismo que tiene registrado en el sistema)</li>
            <li>Crea una contraseña y escribe el código <strong>{code}</strong></li>
            <li>¡Listo! Ya puede ver su membresía y asistencia</li>
          </ol>
        </div>

      </CardContent>
    </Card>
  )
}
