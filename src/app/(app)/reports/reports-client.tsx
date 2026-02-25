"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDateShort, getPaymentMethodLabel } from "@/lib/utils/format"
import {
  TrendingUp,
  Users,
  CreditCard,
  PercentCircle,
  AlertCircle,
  DollarSign,
  Activity,
  Calendar,
  Trophy,
} from "lucide-react"

// ── Tipos ────────────────────────────────────────────────────────────────────

interface KPIs {
  ingresosMes: number
  miembrosNuevos: number
  membresiasActivas: number
  membresiasVencidas: number
  totalMiembros: number
  porVencer: number
  tasaRetencion: number
  pagosRecientes: {
    id: string
    miembro: string
    plan: string
    monto: number
    fecha: Date
    metodo: string
  }[]
}

interface RevenueData { mes: string; ingresos: number }
interface MemberData { mes: string; nuevos: number; total: number }
interface TopMember { memberId: string; name: string; photoUrl: string | null; visits: number; percentage: number }
interface WeeklyTrend { semana: string; total: number; promedio: number }

interface ReportsClientProps {
  kpis: KPIs
  ingresos: RevenueData[]
  miembros: MemberData[]
  heatmapData: Record<string, number>
  topMembers: TopMember[]
  weeklyTrend: WeeklyTrend[]
}

// ── Constantes ───────────────────────────────────────────────────────────────

const BLUE_GYMFLOW = "#2563eb"
const COLORS_PIE = ["#22c55e", "#ef4444", "#f59e0b"]
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const BLOQUES_HORA = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]

function formatCOP(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`
  return `$${value}`
}

// ── Componente Heatmap ───────────────────────────────────────────────────────

function AttendanceHeatmap({ data }: { data: Record<string, number> }) {
  if (Object.keys(data).length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Activity className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">Sin datos de asistencia</p>
      </div>
    )
  }

  // Calcular max para escala de colores
  let maxVal = 1
  for (const v of Object.values(data)) {
    if (v > maxVal) maxVal = v
  }

  // Agrupar cada dos horas
  function getCount(day: number, blockStart: number): number {
    let total = 0
    for (let h = blockStart; h < blockStart + 2; h++) {
      total += data[`${day}-${h}`] ?? 0
    }
    return total
  }

  function getColor(count: number): string {
    if (count === 0) return "#f1f5f9"
    const intensity = count / maxVal
    if (intensity < 0.25) return "#bfdbfe"
    if (intensity < 0.5) return "#60a5fa"
    if (intensity < 0.75) return "#2563eb"
    return "#1e3a8a"
  }

  // Encontrar día y hora pico
  let peakDay = 0, peakHour = 0, peakCount = 0
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const c = data[`${d}-${h}`] ?? 0
      if (c > peakCount) { peakCount = c; peakDay = d; peakHour = h }
    }
  }

  return (
    <div className="space-y-4">
      {/* Badges día y hora pico */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
            📅 Día más activo: <strong>{DIAS_SEMANA[peakDay]}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-2">
          <Activity className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
            ⏰ Hora pico: <strong>{peakHour}:00 - {peakHour + 2}:00</strong>
          </span>
        </div>
      </div>

      {/* Grid heatmap */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Header horas */}
          <div className="flex gap-1 mb-1 ml-8">
            {BLOQUES_HORA.map((h) => (
              <div key={h} className="w-8 text-center text-[10px] text-gray-400">
                {h}h
              </div>
            ))}
          </div>
          {/* Filas por día */}
          {DIAS_SEMANA.map((dia, dayIndex) => (
            <div key={dayIndex} className="flex items-center gap-1 mb-1">
              <div className="w-7 text-[11px] text-gray-500 text-right pr-1">{dia}</div>
              {BLOQUES_HORA.map((blockStart) => {
                const count = getCount(dayIndex, blockStart)
                return (
                  <div
                    key={blockStart}
                    title={`${dia} ${blockStart}:00-${blockStart + 2}:00 — ${count} visitas`}
                    className="w-8 h-8 rounded-md cursor-default transition-transform hover:scale-110"
                    style={{ backgroundColor: getColor(count) }}
                  />
                )
              })}
            </div>
          ))}
          {/* Leyenda */}
          <div className="flex items-center gap-2 mt-2 ml-8 text-[11px] text-gray-400">
            <span>Menos</span>
            {["#f1f5f9", "#bfdbfe", "#60a5fa", "#2563eb", "#1e3a8a"].map((c) => (
              <div key={c} className="w-4 h-4 rounded-sm" style={{ backgroundColor: c }} />
            ))}
            <span>Más</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tab Asistencia ───────────────────────────────────────────────────────────

function AttendanceTab({
  heatmapData,
  topMembers,
  weeklyTrend,
}: {
  heatmapData: Record<string, number>
  topMembers: TopMember[]
  weeklyTrend: WeeklyTrend[]
}) {
  return (
    <div className="space-y-6">
      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Heatmap de Asistencia Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceHeatmap data={heatmapData} />
        </CardContent>
      </Card>

      {/* Tendencia semanal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Tendencia — Últimas 4 semanas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyTrend.every((w) => w.total === 0) ? (
            <div className="text-center py-8 text-gray-400">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Sin datos de asistencia</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyTrend} margin={{ top: 0, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="semana"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                  formatter={(v: number | undefined) => [v ?? 0, "Asistencias"]}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={BLUE_GYMFLOW}
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: BLUE_GYMFLOW }}
                  name="Total asistencias"
                />
                <Line
                  type="monotone"
                  dataKey="promedio"
                  stroke="#22c55e"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: "#22c55e" }}
                  name="Promedio/día"
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top 10 socios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top 10 Socios Más Activos (últimos 30 días)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Sin asistencias en los últimos 30 días</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topMembers.map((m, i) => {
                const initials = m.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
                return (
                  <div
                    key={m.memberId}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                  >
                    <span className="text-sm font-bold text-gray-400 w-5 text-right flex-shrink-0">
                      {i + 1}
                    </span>
                    {m.photoUrl ? (
                      <img
                        src={m.photoUrl}
                        alt={m.name}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {m.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, m.percentage)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {m.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-lg font-bold text-blue-600">{m.visits}</span>
                      <p className="text-[10px] text-gray-400">visitas</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

export function ReportsClient({
  kpis,
  ingresos,
  miembros,
  heatmapData,
  topMembers,
  weeklyTrend,
}: ReportsClientProps) {
  const [activeTab, setActiveTab] = useState<"general" | "asistencia">("general")

  const estadosMembresías = [
    { name: "Activas", value: kpis.membresiasActivas, color: COLORS_PIE[0] },
    { name: "Vencidas", value: kpis.membresiasVencidas, color: COLORS_PIE[1] },
    { name: "Por vencer", value: kpis.porVencer, color: COLORS_PIE[2] },
  ]

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "general"
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab("asistencia")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "asistencia"
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          Asistencia
        </button>
      </div>

      {activeTab === "asistencia" ? (
        <AttendanceTab
          heatmapData={heatmapData}
          topMembers={topMembers}
          weeklyTrend={weeklyTrend}
        />
      ) : (
        <div className="space-y-6">
          {/* ── KPIs DEL MES ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                    Este mes
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(kpis.ingresosMes)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ingresos del mes</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-green-50 dark:bg-green-950/30 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30">
                    Nuevos
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpis.miembrosNuevos}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Miembros este mes</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                  </div>
                  <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-200 bg-indigo-50 dark:bg-indigo-950/30">
                    Estado
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpis.membresiasActivas}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Activas · <span className="text-red-500">{kpis.membresiasVencidas} vencidas</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-purple-50 dark:bg-purple-950/30 rounded-lg flex items-center justify-center">
                    <PercentCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <Badge variant="outline" className="text-xs text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-950/30">
                    Retención
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpis.tasaRetencion}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tasa de retención</p>
              </CardContent>
            </Card>
          </div>

          {/* ── GRÁFICAS ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Ingresos — últimos 6 meses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={ingresos} margin={{ top: 0, right: 4, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} tickFormatter={formatCOP} />
                    <Tooltip formatter={(v: number | undefined) => [formatCurrency(v ?? 0), "Ingresos"]} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                    <Bar dataKey="ingresos" radius={[6, 6, 0, 0]}>
                      {ingresos.map((_, i) => <Cell key={i} fill={BLUE_GYMFLOW} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Crecimiento de miembros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={miembros} margin={{ top: 0, right: 4, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                    <Line type="monotone" dataKey="total" stroke={BLUE_GYMFLOW} strokeWidth={2.5} dot={{ r: 4, fill: BLUE_GYMFLOW }} name="Total miembros" />
                    <Line type="monotone" dataKey="nuevos" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: "#22c55e" }} strokeDasharray="5 5" name="Nuevos" />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* ── ESTADOS DE MEMBRESÍAS + TABLA PAGOS ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Membresías por estado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {kpis.membresiasActivas + kpis.membresiasVencidas > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={estadosMembresías} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {estadosMembresías.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                      {estadosMembresías.map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                            <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p className="text-sm">Sin membresías aún</p>
                  </div>
                )}
                {kpis.porVencer > 0 && (
                  <div className="mt-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <p className="text-xs text-yellow-800 dark:text-yellow-300">
                      <span className="font-bold">{kpis.porVencer}</span> membresía(s) vencen esta semana
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Pagos recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {kpis.pagosRecientes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p className="text-sm">Sin pagos registrados</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <th className="text-left pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Miembro</th>
                          <th className="text-left pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell">Plan</th>
                          <th className="text-right pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Monto</th>
                          <th className="text-right pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Fecha</th>
                          <th className="text-right pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">Método</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {kpis.pagosRecientes.map((pago) => (
                          <tr key={pago.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="py-3 pr-3"><span className="font-medium text-gray-900 dark:text-gray-100">{pago.miembro}</span></td>
                            <td className="py-3 pr-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">{pago.plan}</td>
                            <td className="py-3 text-right font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(pago.monto)}</td>
                            <td className="py-3 pl-3 text-right text-gray-500 dark:text-gray-400 hidden md:table-cell">{formatDateShort(pago.fecha)}</td>
                            <td className="py-3 pl-3 text-right hidden lg:table-cell">
                              <Badge variant="outline" className="text-xs">{getPaymentMethodLabel(pago.metodo)}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
