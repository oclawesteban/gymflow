"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerUser } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dumbbell, Loader2, Lock, Mail, User, Building2 } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const result = await registerUser({
        name: data.get("name") as string,
        email: data.get("email") as string,
        password: data.get("password") as string,
        gymName: data.get("gymName") as string,
      })

      if (result?.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Si la server action retornó un redirectTo explícito (fallback)
      if (result?.redirectTo) {
        router.push(result.redirectTo)
        return
      }

      // Éxito normal — el redirect lo maneja Next.js vía NEXT_REDIRECT
    } catch (err: any) {
      // NEXT_REDIRECT no llega aquí en Next.js 14 (lo intercepta el framework)
      // Si llega cualquier otro error, mostrarlo
      const isRedirect =
        err?.message?.includes("NEXT_REDIRECT") ||
        err?.digest?.includes("NEXT_REDIRECT")

      if (!isRedirect) {
        setError("Ocurrió un error al crear la cuenta. Intenta de nuevo.")
        setLoading(false)
      }
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
          <p className="text-blue-200 mt-1">Crea tu cuenta gratis</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="pb-2">
            <h2 className="text-xl font-bold text-gray-900 text-center">Registrar Gimnasio</h2>
            <p className="text-gray-500 text-sm text-center">Completa los datos para empezar</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="gymName">Nombre del gimnasio *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="gymName"
                    name="gymName"
                    placeholder="Ej: GymFit Manizales"
                    required
                    className="pl-10 min-h-[52px] text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Tu nombre *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="Tu nombre completo"
                    required
                    className="pl-10 min-h-[52px] text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico *</Label>
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
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    className="pl-10 min-h-[52px] text-base"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 min-h-[52px] text-base gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Crear Cuenta
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center pt-0">
            <p className="text-sm text-gray-500">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-blue-600 font-medium hover:underline">
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
