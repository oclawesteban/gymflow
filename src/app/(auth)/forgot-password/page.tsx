"use client"

import { useState } from "react"
import { resetPasswordByEmail } from "@/lib/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dumbbell, Loader2, Mail, ArrowLeft, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [tempPassword, setTempPassword] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const result = await resetPasswordByEmail(email)
      if (result.success) {
        setTempPassword(result.tempPassword)
      }
    } catch (err: any) {
      setError(err.message ?? "Error al restablecer la contraseña")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">GymFlow</h1>
          <p className="text-blue-200 mt-1">Restablecer contraseña</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="pb-2">
            <h2 className="text-xl font-bold text-gray-900 text-center">¿Olvidaste tu contraseña?</h2>
            <p className="text-gray-500 text-sm text-center">
              Ingresa tu correo y restableceremos tu contraseña a un valor temporal
            </p>
          </CardHeader>
          <CardContent>
            {tempPassword ? (
              /* ── Contraseña restablecida ── */
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <ShieldCheck className="h-10 w-10 text-green-600 mx-auto mb-3" />
                  <p className="text-green-800 font-medium text-sm">
                    Tu contraseña fue restablecida a:
                  </p>
                  <p className="text-green-900 font-bold text-xl mt-2 font-mono bg-green-100 rounded-lg px-4 py-2 tracking-wider">
                    {tempPassword}
                  </p>
                  <p className="text-green-700 text-xs mt-3">
                    Cámbiala después de iniciar sesión desde tu perfil
                  </p>
                </div>
                <Link href="/login">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 min-h-[52px] gap-2">
                    Ir al inicio de sesión
                  </Button>
                </Link>
              </div>
            ) : (
              /* ── Formulario ── */
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      required
                      className="pl-10 min-h-[52px] text-base"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 min-h-[52px] text-base gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Restablecer contraseña
                </Button>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mt-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver al inicio de sesión
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
