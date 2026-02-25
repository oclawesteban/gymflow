"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createInstructor } from "@/lib/actions/instructors"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, GraduationCap, Save, CreditCard, HeartPulse } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

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

export default function NuevoInstructorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [idType, setIdType] = useState("")
  const [idNumber, setIdNumber] = useState("")
  const [hasEps, setHasEps] = useState(false)
  const [epsName, setEpsName] = useState("")
  const [epsCustom, setEpsCustom] = useState(false)
  const [specialty, setSpecialty] = useState("")
  const [bio, setBio] = useState("")

  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("El nombre es requerido")
      return
    }
    setLoading(true)
    try {
      await createInstructor({ name, email, phone, photoUrl, idType, idNumber, hasEps, epsName: hasEps ? epsName : undefined, specialty, bio })
      toast.success("Instructor creado exitosamente")
      router.push("/instructors")
    } catch (err: any) {
      toast.error(err.message ?? "Error al crear el instructor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/instructors">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nuevo Instructor</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Agrega un instructor a tu equipo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Información del Instructor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar preview */}
            <div className="flex items-center gap-4">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {initials}
                </div>
              )}
              <div className="flex-1 space-y-1">
                <Label htmlFor="photoUrl">URL de foto</Label>
                <Input
                  id="photoUrl"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://ejemplo.com/foto.jpg"
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del instructor"
                required
                className="min-h-[48px] text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="instructor@gym.com"
                  className="min-h-[48px] text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+57 310 123 4567"
                  className="min-h-[48px] text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad</Label>
              <Input
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Ej: Spinning, Yoga, Funcional"
                className="min-h-[48px] text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (opcional)</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Experiencia, certificaciones..."
                rows={3}
                className="text-base resize-none"
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
              <div className="space-y-2">
                <Label htmlFor="idType">Tipo de documento</Label>
                <select
                  id="idType"
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
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
                  id="idNumber"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
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
              <div className="space-y-2 pl-1">
                <Label>Nombre de la EPS</Label>
                {!epsCustom ? (
                  <select
                    className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    value={epsName}
                    onChange={(e) => {
                      if (e.target.value === "__otra__") { setEpsCustom(true); setEpsName("") }
                      else setEpsName(e.target.value)
                    }}
                  >
                    <option value="">Seleccionar EPS</option>
                    {EPS_LIST.map((eps) => (
                      <option key={eps} value={eps === "Otra" ? "__otra__" : eps}>{eps}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={epsName}
                      onChange={(e) => setEpsName(e.target.value)}
                      placeholder="Escribe el nombre de la EPS"
                      className="min-h-[48px] text-base flex-1"
                      autoFocus
                    />
                    <Button type="button" variant="outline" onClick={() => { setEpsCustom(false); setEpsName("") }} className="min-h-[48px] px-3">↩</Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3 pb-8">
          <Link href="/instructors" className="flex-1">
            <Button variant="outline" type="button" className="w-full min-h-[52px]">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 min-h-[52px] gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? "Guardando..." : "Crear instructor"}
          </Button>
        </div>
      </form>
    </div>
  )
}
