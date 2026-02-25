"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateClass } from "@/lib/actions/classes"
import { getInstructorsForSelect } from "@/lib/actions/instructors"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Loader2, Save, Users2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { toast } from "sonner"

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

interface ClaseData {
  id: string
  name: string
  description: string | null
  instructor: string | null
  instructorId?: string | null
  capacity: number
  dayOfWeek: number
  startTime: string
  endTime: string
  color: string
}

type InstructorOption = { id: string; name: string; specialty: string | null }

export function EditClassForm({ clase }: { clase: ClaseData }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [nombre, setNombre] = useState(clase.name)
  const [descripcion, setDescripcion] = useState(clase.description ?? "")
  const [instructorId, setInstructorId] = useState(clase.instructorId ?? "")
  const [capacidad, setCapacidad] = useState(String(clase.capacity))
  const [dia, setDia] = useState(String(clase.dayOfWeek))
  const [horaInicio, setHoraInicio] = useState(clase.startTime)
  const [horaFin, setHoraFin] = useState(clase.endTime)
  const [color, setColor] = useState(clase.color)
  const [instructors, setInstructors] = useState<InstructorOption[]>([])

  useEffect(() => {
    getInstructorsForSelect().then(setInstructors).catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const capNum = parseInt(capacidad)
    if (isNaN(capNum) || capNum < 1) {
      toast.error("La capacidad debe ser un número mayor a 0")
      return
    }

    setLoading(true)
    try {
      const selectedInstructor = instructors.find((i) => i.id === instructorId)
      await updateClass(clase.id, {
        name: nombre.trim(),
        description: descripcion.trim() || undefined,
        instructorId: instructorId || null,
        instructor: selectedInstructor?.name || undefined,
        capacity: capNum,
        dayOfWeek: parseInt(dia),
        startTime: horaInicio,
        endTime: horaFin,
        color,
      })
      toast.success("Clase actualizada")
      router.push(`/classes/${clase.id}`)
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users2 className="h-5 w-5 text-blue-600" />
            Información de la Clase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre *</Label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="min-h-[48px] text-base"
            />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              className="text-base resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Instructor</Label>
            {instructors.length > 0 ? (
              <SearchableSelect
                options={[
                  { value: "", label: "Sin instructor asignado" },
                  ...instructors.map((i) => ({
                    value: i.id,
                    label: i.name,
                    sublabel: i.specialty ?? undefined,
                  })),
                ]}
                value={instructorId}
                onValueChange={setInstructorId}
                placeholder="Selecciona un instructor..."
                searchPlaceholder="Buscar instructor..."
                emptyText="No se encontró ningún instructor."
              />
            ) : (
              <div className="text-sm text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                No hay instructores.{" "}
                <Link href="/instructors/new" className="text-blue-600 hover:underline">
                  Agregar
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Horario y Capacidad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hora de inicio</Label>
              <Input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="min-h-[48px] text-base"
              />
            </div>
            <div className="space-y-2">
              <Label>Hora de fin</Label>
              <Input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="min-h-[48px] text-base"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Capacidad máxima</Label>
            <Input
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
        </CardContent>
      </Card>

      <div className="flex gap-3 pb-8">
        <Link href={`/classes/${clase.id}`} className="flex-1">
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
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  )
}
