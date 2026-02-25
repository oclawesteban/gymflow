"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, Copy, Check, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface PortalSettingsProps {
  gymId: string
  gymName: string
}

const PORTAL_URL = "https://gymflow-zeta.vercel.app/portal/login"

export function PortalSettings({ gymId, gymName }: PortalSettingsProps) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

  function copyToClipboard(text: string, tipo: "code" | "url") {
    navigator.clipboard.writeText(text).then(() => {
      if (tipo === "code") {
        setCopiedCode(true)
        toast.success("Código copiado al portapapeles")
        setTimeout(() => setCopiedCode(false), 2000)
      } else {
        setCopiedUrl(true)
        toast.success("URL copiada al portapapeles")
        setTimeout(() => setCopiedUrl(false), 2000)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Portal del Socio
          </CardTitle>
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Activo
          </Badge>
        </div>
        <p className="text-sm text-gray-500">
          Tus socios pueden acceder a su información personal desde el portal web.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Código del gimnasio */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Código del gimnasio
          </p>
          <p className="text-xs text-gray-500">
            Comparte este código con tus socios para que puedan registrarse en el portal.
          </p>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <code className="flex-1 font-mono text-sm text-gray-900 break-all">
              {gymId}
            </code>
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0 gap-1.5"
              onClick={() => copyToClipboard(gymId, "code")}
            >
              {copiedCode ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copiedCode ? "¡Copiado!" : "Copiar"}
            </Button>
          </div>
        </div>

        {/* URL del portal */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            URL del portal para compartir
          </p>
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="flex-1 text-sm text-blue-700 break-all font-mono">
              {PORTAL_URL}
            </span>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => copyToClipboard(PORTAL_URL, "url")}
              >
                {copiedUrl ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
              <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Link de registro con gymCode pre-llenado */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Link de registro directo para {gymName}
          </p>
          <p className="text-xs text-gray-500">
            Este link pre-llena el código del gym para facilitar el registro.
          </p>
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <span className="flex-1 text-sm text-green-700 break-all font-mono text-xs">
              {`${PORTAL_URL.replace("/login", "/register")}?gym=${gymId}`}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0 gap-1.5 border-green-300 text-green-700 hover:bg-green-100"
              onClick={() =>
                copyToClipboard(
                  `${PORTAL_URL.replace("/login", "/register")}?gym=${gymId}`,
                  "url"
                )
              }
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
