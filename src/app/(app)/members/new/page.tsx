"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createMember } from "@/lib/actions/members"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, UserPlus, CreditCard, HeartPulse, Phone } from "lucide-react"
import Link from "next/link"

const ID_TYPES = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "TI", label: "Tarjeta de Identidad" },
  { value: "PA", label: "Pasaporte" },
  { value: "DNI", label: "DNI" },
]

const EPS_LIST = [
  "Sura", "Sanitas", "Nueva EPS", "Compensar", "Famisanar",
  "Coomeva", "SOS", "Coosalud", "Mutual Ser", "Medimás",
  "Salud Total", "Aliansalud", "Cruz Blanca", "Otra",
]

export default function NewMemberPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasEps, setHasEps] = useState(false)
  const [epsCustom, setEpsCustom] = useState(false)
  const [epsName, setEpsName] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const birthDateStr = data.get("birthDate") as string
      const result = await createMember({
        name: data.get("name") as string,
        email: data.get("email") as string || undefined,
        phone: data.get("phone") as string || undefined,
        photoUrl: data.get("photoUrl") as string || undefined,
        idType: data.get("idType") as string || undefined,
        idNumber: data.get("idNumber") as string || undefined,
        birthDate: birthDateStr ? new Date(birthDateStr) : undefined,
        hasEps,
        epsName: hasEps ? epsName : undefined,
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nuevo Miembro</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Completa los datos del nuevo miembro</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Información Personal ── */}
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
                id="name" name="name"
                placeholder="Ej: Juan García"
                required
                className="min-h-[48px] text-base"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone" name="phone" type="tel"
                  placeholder="Ej: 3001234567"
                  className="min-h-[48px] text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email" name="email" type="email"
                  placeholder="Ej: juan@correo.com"
                  className="min-h-[48px] text-base"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="photoUrl">Foto (URL)</Label>
              <Input
                id="photoUrl" name="photoUrl" type="url"
                placeholder="https://ejemplo.com/foto.jpg"
                className="min-h-[48px] text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Identificación ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Identificación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                <Input
                  id="birthDate" name="birthDate" type="date"
                  className="min-h-[48px] text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idType">Tipo de documento</Label>
                <select
                  id="idType"
                  name="idType"
                  className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                >
                  <option value="">Seleccionar tipo</option>
                  {ID_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idNumber">Número de documento</Label>
                <Input
                  id="idNumber" name="idNumber"
                  placeholder="Ej: 1234567890"
                  className="min-h-[48px] text-base"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── EPS / Salud ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-rose-500" />
              Información de Salud
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Toggle EPS */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setHasEps(!hasEps); setEpsName(""); setEpsCustom(false) }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  hasEps ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  hasEps ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
              <Label className="cursor-pointer" onClick={() => { setHasEps(!hasEps); setEpsName(""); setEpsCustom(false) }}>
                ¿Tiene EPS?
              </Label>
            </div>

            {hasEps && (
              <div className="space-y-3 pl-1">
                <Label>Nombre de la EPS</Label>
                {!epsCustom ? (
                  <div className="space-y-2">
                    <select
                      className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                      value={epsName}
                      onChange={(e) => {
                        if (e.target.value === "__otra__") {
                          setEpsCustom(true)
                          setEpsName("")
                        } else {
                          setEpsName(e.target.value)
                        }
                      }}
                    >
                      <option value="">Seleccionar EPS</option>
                      {EPS_LIST.map((eps) => (
                        <option key={eps} value={eps === "Otra" ? "__otra__" : eps}>
                          {eps}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={epsName}
                      onChange={(e) => setEpsName(e.target.value)}
                      placeholder="Escribe el nombre de la EPS"
                      className="min-h-[48px] text-base flex-1"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setEpsCustom(false); setEpsName("") }}
                      className="min-h-[48px] px-3"
                    >
                      ↩
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Contacto de Emergencia ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-5 w-5 text-orange-500" />
              Contacto de Emergencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Nombre del contacto</Label>
                <Input
                  id="emergencyContact" name="emergencyContact"
                  placeholder="Ej: María García"
                  className="min-h-[48px] text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Teléfono</Label>
                <Input
                  id="emergencyPhone" name="emergencyPhone" type="tel"
                  placeholder="Ej: 3009876543"
                  className="min-h-[48px] text-base"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Notas ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes" name="notes"
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
            <Button variant="outline" className="w-full min-h-[52px]">Cancelar</Button>
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
