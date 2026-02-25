"use client"

import { useState } from "react"
import { addMeasurement, deleteMeasurement } from "@/lib/actions/measurements"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Plus, Trash2, Loader2, Activity, Scale, Ruler } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Measurement {
  id: string
  weight: number | null
  height: number | null
  bodyFat: number | null
  bmi: number | null
  waist: number | null
  hip: number | null
  chest: number | null
  arms: number | null
  notes: string | null
  measuredAt: Date
}

interface BodyMeasurementsProps {
  memberId: string
  initialMeasurements: Measurement[]
}

function getBmiLabel(bmi: number) {
  if (bmi < 18.5) return { label: "Bajo peso", color: "text-blue-600" }
  if (bmi < 25) return { label: "Normal", color: "text-green-600" }
  if (bmi < 30) return { label: "Sobrepeso", color: "text-amber-600" }
  return { label: "Obesidad", color: "text-red-600" }
}

export function BodyMeasurements({ memberId, initialMeasurements }: BodyMeasurementsProps) {
  const [measurements, setMeasurements] = useState<Measurement[]>(initialMeasurements)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [bodyFat, setBodyFat] = useState("")
  const [waist, setWaist] = useState("")
  const [hip, setHip] = useState("")
  const [chest, setChest] = useState("")
  const [arms, setArms] = useState("")
  const [notes, setNotes] = useState("")

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await addMeasurement({
        memberId,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
        waist: waist ? parseFloat(waist) : undefined,
        hip: hip ? parseFloat(hip) : undefined,
        chest: chest ? parseFloat(chest) : undefined,
        arms: arms ? parseFloat(arms) : undefined,
        notes: notes || undefined,
      })
      setMeasurements((prev) => [...prev, result.measurement as Measurement])
      toast.success("Medida registrada")
      setShowForm(false)
      setWeight(""); setHeight(""); setBodyFat("")
      setWaist(""); setHip(""); setChest(""); setArms(""); setNotes("")
    } catch (err: any) {
      toast.error(err.message ?? "Error al guardar")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta medida?")) return
    try {
      await deleteMeasurement(id, memberId)
      setMeasurements((prev) => prev.filter((m) => m.id !== id))
      toast.success("Medida eliminada")
    } catch {
      toast.error("Error al eliminar")
    }
  }

  const chartData = measurements.map((m) => ({
    fecha: format(new Date(m.measuredAt), "dd/MM", { locale: es }),
    Peso: m.weight,
    "% Grasa": m.bodyFat,
    IMC: m.bmi,
    Cintura: m.waist,
  }))

  const latest = measurements[measurements.length - 1]

  return (
    <div className="space-y-5">

      {/* Resumen última medida */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Peso", value: latest.weight ? `${latest.weight} kg` : "—", icon: Scale },
            { label: "IMC", value: latest.bmi ? `${latest.bmi}` : "—", icon: Activity, extra: latest.bmi ? getBmiLabel(latest.bmi) : null },
            { label: "% Grasa", value: latest.bodyFat ? `${latest.bodyFat}%` : "—", icon: Activity },
            { label: "Cintura", value: latest.waist ? `${latest.waist} cm` : "—", icon: Ruler },
          ].map(({ label, value, icon: Icon, extra }) => (
            <Card key={label} className="text-center">
              <CardContent className="pt-4 pb-4">
                <Icon className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
                {extra && <p className={`text-xs font-medium mt-0.5 ${extra.color}`}>{extra.label}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Gráfica de progreso */}
      {measurements.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Progreso en el tiempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Peso" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="% Grasa" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="IMC" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Historial */}
      {measurements.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Historial</p>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {[...measurements].reverse().map((m) => (
              <div key={m.id} className="flex items-start justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm">
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {format(new Date(m.measuredAt), "d 'de' MMMM yyyy", { locale: es })}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500">
                    {m.weight && <span>Peso: <strong>{m.weight} kg</strong></span>}
                    {m.bmi && <span>IMC: <strong>{m.bmi}</strong></span>}
                    {m.bodyFat && <span>Grasa: <strong>{m.bodyFat}%</strong></span>}
                    {m.waist && <span>Cintura: <strong>{m.waist} cm</strong></span>}
                    {m.chest && <span>Pecho: <strong>{m.chest} cm</strong></span>}
                    {m.arms && <span>Brazos: <strong>{m.arms} cm</strong></span>}
                  </div>
                  {m.notes && <p className="text-xs text-gray-400 mt-1 italic">{m.notes}</p>}
                </div>
                <button onClick={() => handleDelete(m.id)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulario */}
      {showForm ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Nueva medida</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Peso (kg)", val: weight, set: setWeight, placeholder: "70.5" },
                  { label: "Talla (cm)", val: height, set: setHeight, placeholder: "175" },
                  { label: "% Grasa corporal", val: bodyFat, set: setBodyFat, placeholder: "18.5" },
                  { label: "Cintura (cm)", val: waist, set: setWaist, placeholder: "82" },
                  { label: "Cadera (cm)", val: hip, set: setHip, placeholder: "95" },
                  { label: "Pecho (cm)", val: chest, set: setChest, placeholder: "100" },
                  { label: "Brazos (cm)", val: arms, set: setArms, placeholder: "35" },
                ].map(({ label, val, set, placeholder }) => (
                  <div key={label} className="space-y-1">
                    <Label className="text-xs">{label}</Label>
                    <Input type="number" step="0.1" min="0" value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder} className="min-h-[44px]" />
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Notas</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones..." className="min-h-[44px]" />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Guardar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setShowForm(true)} variant="outline" className="w-full gap-2 min-h-[48px]">
          <Plus className="h-4 w-4" />
          {measurements.length === 0 ? "Registrar primera medida" : "Agregar medida"}
        </Button>
      )}
    </div>
  )
}
