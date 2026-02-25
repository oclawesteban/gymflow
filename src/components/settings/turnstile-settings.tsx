"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DoorOpen, Copy, Check, RefreshCw, ChevronDown, ChevronUp, Cpu } from "lucide-react"
import { toast } from "sonner"
import { regenerateAccessApiKey } from "@/lib/actions/settings"

interface TurnstileSettingsProps {
  accessApiKey: string
}

const BASE_URL = "https://gymflow-zeta.vercel.app"

export function TurnstileSettings({ accessApiKey: initialKey }: TurnstileSettingsProps) {
  const [key, setKey] = useState(initialKey)
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [showCode, setShowCode] = useState(false)

  const pollUrl = `${BASE_URL}/api/access/poll?key=${key}`

  function copyKey() {
    navigator.clipboard.writeText(key).then(() => {
      setCopied(true)
      toast.success("API Key copiada")
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleRegenerate() {
    if (!confirm("¿Regenerar la API Key? El ESP32 dejará de funcionar hasta que actualices el código con la nueva clave.")) return
    setRegenerating(true)
    try {
      const result = await regenerateAccessApiKey()
      if (result.accessApiKey) {
        setKey(result.accessApiKey)
        toast.success("Nueva API Key generada. Actualiza el ESP32.")
      }
    } catch (err: any) {
      toast.error(err.message ?? "Error al regenerar")
    } finally {
      setRegenerating(false)
    }
  }

  const esp32Code = `#include <WiFi.h>
#include <HTTPClient.h>

// ── Configuración ──────────────────────────────
const char* WIFI_SSID     = "TU_WIFI";
const char* WIFI_PASSWORD = "TU_PASSWORD";
const char* POLL_URL      = "${pollUrl}";
const int   RELAY_PIN     = 26;   // Pin del relay
const int   RELAY_TIME_MS = 5000; // Abierto 5 segundos
// ──────────────────────────────────────────────

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("\\nConectado: " + WiFi.localIP().toString());
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.reconnect(); delay(2000); return;
  }

  HTTPClient http;
  http.begin(POLL_URL);
  int code = http.GET();

  if (code == 200) {
    String body = http.getString();
    if (body.indexOf("\\"open\\":true") != -1) {
      Serial.println("✅ Acceso autorizado — abriendo torniquete");
      digitalWrite(RELAY_PIN, HIGH);
      delay(RELAY_TIME_MS);
      digitalWrite(RELAY_PIN, LOW);
      Serial.println("🔒 Torniquete cerrado");
    }
  }

  http.end();
  delay(1000); // Polling cada 1 segundo
}`

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <DoorOpen className="h-5 w-5 text-blue-600" />
            Control de Torniquete
          </CardTitle>
          <Badge className="bg-green-100 text-green-700 border-green-200">Activo</Badge>
        </div>
        <p className="text-sm text-gray-500">
          Los socios abren el torniquete desde su portal móvil. Solo funciona con membresía activa.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* API Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">API Key del ESP32</p>
            <Button
              variant="ghost" size="sm"
              className="h-7 text-xs text-gray-500 gap-1"
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              <RefreshCw className={`h-3 w-3 ${regenerating ? "animate-spin" : ""}`} />
              Regenerar
            </Button>
          </div>
          <div className="flex items-center gap-2 p-3 bg-gray-900 rounded-lg">
            <code className="flex-1 text-green-400 font-mono text-xs break-all">{key}</code>
            <Button variant="ghost" size="sm" className="flex-shrink-0 text-gray-400 hover:text-white" onClick={copyKey}>
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Hardware */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
            <Cpu className="h-4 w-4" />
            Hardware necesario
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-400">
            {[
              ["ESP32", "~$8 USD"],
              ["Módulo relay 5V", "~$2 USD"],
              ["Cable USB", "~$1 USD"],
              ["Total aprox.", "~$11 USD"],
            ].map(([item, price]) => (
              <div key={item} className="flex justify-between bg-white/60 dark:bg-blue-900/30 rounded-lg px-2.5 py-1.5">
                <span>{item}</span>
                <span className="font-semibold">{price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Código Arduino */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Cpu className="h-4 w-4" />
              Ver código para ESP32 (Arduino/PlatformIO)
            </span>
            {showCode ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showCode && (
            <div className="relative">
              <pre className="bg-gray-900 text-green-300 text-xs font-mono rounded-xl p-4 overflow-x-auto whitespace-pre leading-relaxed max-h-80 overflow-y-auto">
                {esp32Code}
              </pre>
              <Button
                variant="ghost" size="sm"
                className="absolute top-2 right-2 text-gray-400 hover:text-white h-7"
                onClick={() => {
                  navigator.clipboard.writeText(esp32Code)
                  toast.success("Código copiado")
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Instrucciones */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
          <p className="font-semibold">⚡ Pasos de instalación</p>
          <ol className="list-decimal list-inside space-y-0.5 text-amber-700">
            <li>Instala Arduino IDE y la librería ESP32</li>
            <li>Copia el código y pega tu WIFI_SSID y WIFI_PASSWORD</li>
            <li>La API Key y la URL ya vienen pre-configuradas arriba</li>
            <li>Conecta el relay al pin 26 del ESP32</li>
            <li>Conecta el relay en serie con el torniquete</li>
            <li>Sube el código y ¡listo!</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
