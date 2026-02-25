"use client"

import { useState, useEffect, useCallback } from "react"
import { getMembershipsByMonth, VencimientoDelDia, VencimientosPorDia } from "@/lib/actions/calendar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, CalendarDays, X, MessageCircle } from "lucide-react"
import { buildWhatsAppReminderUrl } from "@/lib/utils/whatsapp"

// Nombres de meses en español
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

// Días de la semana en español (empezando en lunes)
const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

// Obtiene el color del día según urgencia
function obtenerColorDia(claveFecha: string): {
  bg: string
  text: string
  badge: string
} {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const [anio, mes, dia] = claveFecha.split("-").map(Number)
  const fechaDia = new Date(anio, mes - 1, dia)
  fechaDia.setHours(0, 0, 0, 0)

  const diferencia = Math.floor(
    (fechaDia.getTime() - hoy.getTime()) / 86400000
  )

  if (diferencia < 0) {
    // Ya venció
    return { bg: "bg-red-50", text: "text-red-700", badge: "bg-red-500" }
  } else if (diferencia <= 1) {
    // Hoy o mañana
    return { bg: "bg-orange-50", text: "text-orange-700", badge: "bg-orange-500" }
  } else if (diferencia <= 7) {
    // Esta semana
    return { bg: "bg-yellow-50", text: "text-yellow-700", badge: "bg-yellow-500" }
  } else {
    // Este mes
    return { bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-500" }
  }
}

// (helper eliminado — usamos buildWhatsAppReminderUrl directamente)

export default function CalendarioPage() {
  const ahora = new Date()
  const [anio, setAnio] = useState(ahora.getFullYear())
  const [mes, setMes] = useState(ahora.getMonth() + 1)
  const [vencimientos, setVencimientos] = useState<VencimientosPorDia>({})
  const [cargando, setCargando] = useState(true)
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null)

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    try {
      const datos = await getMembershipsByMonth(anio, mes)
      setVencimientos(datos)
    } catch (error) {
      console.error("Error al cargar vencimientos:", error)
    } finally {
      setCargando(false)
    }
  }, [anio, mes])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  // Navegar al mes anterior
  const mesAnterior = () => {
    if (mes === 1) {
      setMes(12)
      setAnio(anio - 1)
    } else {
      setMes(mes - 1)
    }
    setDiaSeleccionado(null)
  }

  // Navegar al mes siguiente
  const mesSiguiente = () => {
    if (mes === 12) {
      setMes(1)
      setAnio(anio + 1)
    } else {
      setMes(mes + 1)
    }
    setDiaSeleccionado(null)
  }

  // Construir grilla del calendario
  const primerDia = new Date(anio, mes - 1, 1)
  // En JS getDay() 0=Dom, 1=Lun... ajustamos para que empiece en lunes
  const diaDeSemanaInicio = (primerDia.getDay() + 6) % 7
  const diasEnMes = new Date(anio, mes, 0).getDate()

  // Celdas del calendario: días vacíos al inicio + días del mes
  const celdas: (number | null)[] = [
    ...Array(diaDeSemanaInicio).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ]

  // Rellenar hasta múltiplo de 7
  while (celdas.length % 7 !== 0) {
    celdas.push(null)
  }

  const miembrosDelDiaSeleccionado: VencimientoDelDia[] =
    diaSeleccionado ? vencimientos[diaSeleccionado] || [] : []

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <CalendarDays className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario de Vencimientos</h1>
          <p className="text-gray-500 text-sm">Membresías que vencen este mes</p>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-600">Ya venció</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-gray-600">Hoy / Mañana</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-gray-600">Esta semana</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-gray-600">Este mes</span>
        </div>
      </div>

      {/* Navegación del mes */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={mesAnterior}
              className="h-10 w-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-bold text-gray-900">
              {MESES[mes - 1]} {anio}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={mesSiguiente}
              className="h-10 w-10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {cargando ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Cabecera días */}
              {DIAS_SEMANA.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-semibold text-gray-400 py-2"
                >
                  {d}
                </div>
              ))}

              {/* Celdas del calendario */}
              {celdas.map((dia, idx) => {
                if (dia === null) {
                  return <div key={`vacio-${idx}`} className="h-12 md:h-16" />
                }

                const clave = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
                const vencimientosDia = vencimientos[clave] || []
                const tieneVencimientos = vencimientosDia.length > 0
                const colores = tieneVencimientos ? obtenerColorDia(clave) : null
                const esHoy =
                  ahora.getDate() === dia &&
                  ahora.getMonth() + 1 === mes &&
                  ahora.getFullYear() === anio
                const seleccionado = diaSeleccionado === clave

                return (
                  <button
                    key={clave}
                    onClick={() =>
                      setDiaSeleccionado(seleccionado ? null : clave)
                    }
                    className={`
                      relative h-12 md:h-16 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all
                      ${tieneVencimientos ? `${colores!.bg} cursor-pointer hover:opacity-80` : "hover:bg-gray-50"}
                      ${esHoy ? "ring-2 ring-blue-400" : ""}
                      ${seleccionado ? "ring-2 ring-offset-1 ring-gray-400" : ""}
                    `}
                  >
                    <span
                      className={`text-sm font-medium ${
                        esHoy
                          ? "text-blue-600"
                          : tieneVencimientos
                          ? colores!.text
                          : "text-gray-700"
                      }`}
                    >
                      {dia}
                    </span>
                    {tieneVencimientos && (
                      <span
                        className={`text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-full text-white ${colores!.badge}`}
                      >
                        {vencimientosDia.length}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panel de detalle del día seleccionado */}
      {diaSeleccionado && (
        <Card className="border-blue-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {(() => {
                  const [a, m, d] = diaSeleccionado.split("-").map(Number)
                  return new Date(a, m - 1, d).toLocaleDateString("es-CO", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                })()}
              </CardTitle>
              <button
                onClick={() => setDiaSeleccionado(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {miembrosDelDiaSeleccionado.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                Sin vencimientos este día
              </p>
            ) : (
              <div className="space-y-3">
                {miembrosDelDiaSeleccionado.map((v) => {
                  const colores = obtenerColorDia(diaSeleccionado)
                  const urlWA = v.memberPhone
                    ? buildWhatsAppReminderUrl({
                        phone: v.memberPhone,
                        memberName: v.memberName,
                        gymName: "GymFlow",
                        planName: v.planName,
                        expiresAt: new Date(v.endDate),
                      })
                    : null

                  return (
                    <div
                      key={v.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {v.memberName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">{v.planName}</span>
                          <Badge
                            className={`text-[10px] px-1.5 py-0 ${colores.badge} text-white border-0`}
                          >
                            {v.status === "ACTIVE"
                              ? "Activa"
                              : v.status === "EXPIRED"
                              ? "Vencida"
                              : v.status === "FROZEN"
                              ? "Congelada"
                              : v.status}
                          </Badge>
                        </div>
                      </div>
                      {urlWA ? (
                        <a
                          href={urlWA}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white text-xs h-8 gap-1.5 flex-shrink-0"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            Recordatorio
                          </Button>
                        </a>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="text-xs h-8 gap-1.5 flex-shrink-0 opacity-50"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          Sin teléfono
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resumen del mes */}
      {!cargando && (
        <Card className="bg-gray-50 border-gray-100">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-gray-600 text-center">
              <span className="font-semibold text-gray-900">
                {Object.values(vencimientos).reduce(
                  (total, lista) => total + lista.length,
                  0
                )}
              </span>{" "}
              membresías vencen en {MESES[mes - 1]} {anio}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
