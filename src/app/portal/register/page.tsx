"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, UserPlus, LogIn, CheckCircle2 } from "lucide-react"
import { Suspense } from "react"

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [gymCode, setGymCode] = useState(searchParams.get("gym") ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirm) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/portal/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", email, password, gymCode }),
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => router.push("/portal/login"), 2500)
      } else {
        setError(data.error || "Error al registrarse")
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">¡Cuenta creada!</h2>
        <p className="text-gray-500">
          Tu acceso al portal ha sido activado. Redirigiendo al login...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="min-h-[48px] text-base"
        />
        <p className="text-xs text-gray-500">
          Debe coincidir con el email registrado en tu gimnasio
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="min-h-[48px] text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm">Confirmar contraseña</Label>
        <Input
          id="confirm"
          type="password"
          placeholder="Repite tu contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          className="min-h-[48px] text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gymCode">Código del gimnasio</Label>
        <Input
          id="gymCode"
          placeholder="Ej: GYM274"
          value={gymCode}
          onChange={(e) => setGymCode(e.target.value.toUpperCase())}
          required
          className="min-h-[48px] text-base font-mono tracking-widest uppercase"
          maxLength={8}
        />
        <p className="text-xs text-gray-500">
          Es un código corto (ej: <span className="font-mono font-semibold">GYM274</span>). Pídeselo al administrador de tu gimnasio o usa el link que te compartió.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 min-h-[52px] gap-2 text-base"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <UserPlus className="h-5 w-5" />
        )}
        {loading ? "Registrando..." : "Crear cuenta"}
      </Button>
    </form>
  )
}

export default function PortalRegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Crear cuenta en el portal
          </CardTitle>
          <CardDescription>
            Activa tu acceso para ver tu membresía y asistencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="text-center py-4">Cargando...</div>}>
            <RegisterForm />
          </Suspense>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/portal/login"
                className="text-blue-600 font-medium hover:underline"
              >
                <LogIn className="inline h-3.5 w-3.5 mr-0.5" />
                Iniciar sesión
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
