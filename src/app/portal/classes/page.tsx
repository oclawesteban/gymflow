"use client"

import { useState, useEffect } from "react"
import { Users2, Clock, User, Loader2, CheckCircle2, XCircle, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface GymClassItem {
  id: string
  name: string
  description: string | null
  instructor: string | null
  dayName: string
  dayOfWeek: number
  startTime: string
  endTime: string
  color: string
  capacity: number
  bookedCount: number
  isFull: boolean
  isToday: boolean
  myBooking: { id: string } | null
}

export default function PortalClassesPage() {
  const [classes, setClasses] = useState<GymClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingId, setBookingId] = useState<string | null>(null)

  async function loadClasses() {
    try {
      const res = await fetch("/api/portal/classes")
      const data = await res.json()
      if (data.classes) setClasses(data.classes)
    } catch {
      toast.error("Error al cargar las clases")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadClasses() }, [])

  async function handleBook(classId: string, action: "book" | "cancel") {
    setBookingId(classId)
    try {
      const res = await fetch("/api/portal/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, action }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        await loadClasses()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setBookingId(null)
    }
  }

  const todayClasses = classes.filter((c) => c.isToday)
  const otherClasses = classes.filter((c) => !c.isToday)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (classes.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <Users2 className="h-12 w-12 text-gray-300 mx-auto" />
        <p className="font-semibold text-gray-700">No hay clases disponibles</p>
        <p className="text-sm text-gray-500">Tu gimnasio aún no tiene clases configuradas.</p>
      </div>
    )
  }

  const ClassCard = ({ c }: { c: GymClassItem }) => {
    const isBooking = bookingId === c.id
    const spotsLeft = c.capacity - c.bookedCount

    return (
      <Card className={`border-l-4 ${c.isToday ? "ring-2 ring-blue-200" : ""}`} style={{ borderLeftColor: c.color }}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-gray-900 dark:text-gray-100">{c.name}</p>
                {c.isToday && <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">Hoy</Badge>}
                {c.isFull && <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Llena</Badge>}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {c.startTime} – {c.endTime}
                </span>
                {c.instructor && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {c.instructor}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users2 className="h-3 w-3" />
                  {spotsLeft > 0 ? `${spotsLeft} cupos libres` : "Sin cupos"}
                </span>
              </div>
              {c.description && (
                <p className="text-xs text-gray-400 mt-1">{c.description}</p>
              )}
            </div>

            <div className="flex-shrink-0">
              {c.myBooking ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-green-300 text-green-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                  onClick={() => handleBook(c.id, "cancel")}
                  disabled={isBooking}
                >
                  {isBooking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  Reservado
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleBook(c.id, "book")}
                  disabled={isBooking || c.isFull}
                >
                  {isBooking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5 rotate-45" />}
                  {c.isFull ? "Llena" : "Reservar"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Clases</h1>
        <p className="text-sm text-gray-500 mt-0.5">Reserva tu lugar con un toque</p>
      </div>

      {todayClasses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
            <Calendar className="h-4 w-4" />
            Clases de hoy
          </div>
          {todayClasses.map((c) => <ClassCard key={c.id} c={c} />)}
        </div>
      )}

      {otherClasses.length > 0 && (
        <div className="space-y-3">
          {todayClasses.length > 0 && (
            <p className="text-sm font-semibold text-gray-500">Resto de la semana</p>
          )}
          {otherClasses.map((c) => <ClassCard key={c.id} c={c} />)}
        </div>
      )}
    </div>
  )
}
