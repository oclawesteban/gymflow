"use client"

import { useState } from "react"
import { loginUser } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dumbbell, Loader2, Lock, Mail } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const result = await loginUser({
        email: data.get("email") as string,
        password: data.get("password") as string,
      })
      if (result?.error) setError(result.error)
    } catch (err: any) {
      // signIn hace redirect en éxito (NEXT_REDIRECT) — eso no es un error real.
      // Cualquier otro error no capturado en loginUser se muestra aquí.
      if (!err?.message?.includes("NEXT_REDIRECT")) {
        setError("Ocurrió un error al iniciar sesión. Intenta de nuevo.")
      }
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
          <p className="text-blue-200 mt-1">Gestión de Gimnasio</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="pb-2">
            <h2 className="text-xl font-bold text-gray-900 text-center">Iniciar Sesión</h2>
            <p className="text-gray-500 text-sm text-center">Ingresa a tu cuenta</p>
          </CardHeader>
          <CardContent>
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
                    name="email"
                    type="email"
                    placeholder="tu@correo.com"
                    required
                    className="pl-10 min-h-[52px] text-base"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="pl-10 min-h-[52px] text-base"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 min-h-[52px] text-base gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Entrar
              </Button>
              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </form>
          </CardContent>
          <CardFooter className="justify-center pt-0">
            <p className="text-sm text-gray-500">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-blue-600 font-medium hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
