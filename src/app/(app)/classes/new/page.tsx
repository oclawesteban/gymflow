"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClass } from "@/lib/actions/classes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Save, Users2 } from "lucide-react"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const DIAS = [
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
  { value: "6", label: "Sábado" },
  { value: "0", label: "Domingo" },
]

const COLORES = [
  { value: "#3B82F6", label: "Azul" },
  { value: "#10B981", label: "Verde" },
  { value: "#F59E0B", label: "Amarillo" },
  { value: "#EF4444", label: "Rojo" },
  { value: "#8B5CF6", label: "Morado" },
  { value: "#F97316", label: "Naranja" },
  { value: "#EC4899", label: "Rosa" },
  { value: "#06B6D4", label: "Cian" },
  { value: "#64748B", label: "Gris" },
]

export default function NuevaClasePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [instructor, setInstructor] = useState("")
  const [capacidad, setCapacidad] = useState("20")
  const [dia, setDia] = useState("1")
  const [horaInicio, setHoraInicio] = useState("07:00")
  const [horaFin, setHoraFin] = useState("08:00")
  const [color, setColor] = useState("#3B82F6")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!nombre.trim()) {
      setError("El nombre es requerido")
      return
    }

    const capNum = parseInt(capacidad)
    if (isNaN(capNum) || capNum < 1) {
      setError("La capacidad debe ser un número mayor a 0")
      return
    }

    setLoading(true)
    try {
      await createClass({
        name: nombre.trim(),
        description: descripcion.trim() || undefined,
        instructor: instructor.trim() || undefined,
        capacity: capNum,
        dayOfWeek: parseInt(dia),
        startTime: horaInicio,
        endTime: horaFin,
        color,
      })
      router.push("/classes")
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al crear la clase"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <Link href="/classes">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Clase</h1>
          <p className="text-gray-500 text-sm">Agrega una clase al horario del gym</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users2 className="h-5 w-5 text-blue-600" />
              Información de la Clase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                placeholder="Ej: CrossFit Matutino"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="min-h-[48px] text-base"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe la clase brevemente..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                className="text-base resize-none"
              />
            </div>

            {/* Instructor */}
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                placeholder="Nombre del instructor"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="min-h-[48px] text-base"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Horario y Capacidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Día de la semana */}
            <div className="space-y-2">
              <Label>Día de la semana</Label>
              <Select value={dia} onValueChange={setDia}>
                <SelectTrigger className="min-h-[48px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIAS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Horas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inicio">Hora de inicio</Label>
                <Input
                  id="inicio"
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="min-h-[48px] text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fin">Hora de fin</Label>
                <Input
                  id="fin"
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  className="min-h-[48px] text-base"
                />
              </div>
            </div>

            {/* Capacidad */}
            <div className="space-y-2">
              <Label htmlFor="capacidad">Capacidad máxima</Label>
              <Input
                id="capacidad"
                type="number"
                min="1"
                max="200"
                value={capacidad}
                onChange={(e) => setCapacidad(e.target.value)}
                className="min-h-[48px] text-base"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Color de la clase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {COLORES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  className={`w-10 h-10 rounded-full transition-all ${
                    color === c.value
                      ? "ring-4 ring-offset-2 ring-gray-400 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Color seleccionado:{" "}
              <span className="font-mono font-semibold">{color}</span>
            </p>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pb-8">
          <Link href="/classes" className="flex-1">
            <Button variant="outline" type="button" className="w-full min-h-[52px]">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 min-h-[52px] gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? "Guardando..." : "Guardar clase"}
          </Button>
        </div>
      </form>
    </div>
  )
}
