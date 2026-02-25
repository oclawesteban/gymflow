"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createMember } from "@/lib/actions/members"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, UserPlus } from "lucide-react"
import Link from "next/link"

export default function NewMemberPage() {
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
      const result = await createMember({
        name: data.get("name") as string,
        email: data.get("email") as string || undefined,
        phone: data.get("phone") as string || undefined,
        photoUrl: data.get("photoUrl") as string || undefined,
        emergencyContact: data.get("emergencyContact") as string || undefined,
        emergencyPhone: data.get("emergencyPhone") as string || undefined,
        notes: data.get("notes") as string || undefined,
      })

      if (result.success) {
        router.push(`/members/${result.member.id}`)
      }
    } catch (err: any) {
      setError(err.message ?? "Error al crear el miembro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/members">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Miembro</h1>
          <p className="text-gray-500 text-sm">Completa los datos del nuevo miembro</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ej: Juan García"
                required
                className="min-h-[48px] text-base"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Ej: 3001234567"
                  className="min-h-[48px] text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Ej: juan@correo.com"
                  className="min-h-[48px] text-base"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="photoUrl">Foto (URL)</Label>
              <Input
                id="photoUrl"
                name="photoUrl"
                type="url"
                placeholder="https://ejemplo.com/foto.jpg"
                className="min-h-[48px] text-base"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contacto de Emergencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Nombre del contacto</Label>
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  placeholder="Ej: María García"
                  className="min-h-[48px] text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Teléfono de emergencia</Label>
                <Input
                  id="emergencyPhone"
                  name="emergencyPhone"
                  type="tel"
                  placeholder="Ej: 3009876543"
                  className="min-h-[48px] text-base"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Lesiones, condiciones médicas, objetivos..."
              rows={3}
              className="text-base resize-none"
            />
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pb-8">
          <Link href="/members" className="flex-1">
            <Button variant="outline" className="w-full min-h-[52px]">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 min-h-[52px] gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Guardar Miembro
          </Button>
        </div>
      </form>
    </div>
  )
}
