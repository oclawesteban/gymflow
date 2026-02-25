"use client"

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
} from "lucide-react"

// Tipos de datos
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

interface RevenueData {
  mes: string
  ingresos: number
}

interface MemberData {
  mes: string
  nuevos: number
  total: number
}

interface ReportsClientProps {
  kpis: KPIs
  ingresos: RevenueData[]
  miembros: MemberData[]
}

// Colores de la paleta GymFlow
const BLUE_GYMFLOW = "#2563eb"
const COLORS_PIE = ["#22c55e", "#ef4444", "#f59e0b"]

// Formateador de pesos colombianos compacto
function formatCOP(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`
  return `$${value}`
}

export function ReportsClient({ kpis, ingresos, miembros }: ReportsClientProps) {
  const estadosMembresías = [
    { name: "Activas", value: kpis.membresiasActivas, color: COLORS_PIE[0] },
    { name: "Vencidas", value: kpis.membresiasVencidas, color: COLORS_PIE[1] },
    { name: "Por vencer", value: kpis.porVencer, color: COLORS_PIE[2] },
  ]

  return (
    <div className="space-y-6">
      {/* ── KPIs DEL MES ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50">
                Este mes
              </Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.ingresosMes)}</p>
            <p className="text-xs text-gray-500 mt-1">Ingresos del mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                Nuevos
              </Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpis.miembrosNuevos}</p>
            <p className="text-xs text-gray-500 mt-1">Miembros este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-indigo-600" />
              </div>
              <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-200 bg-indigo-50">
                Estado
              </Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpis.membresiasActivas}</p>
            <p className="text-xs text-gray-500 mt-1">
              Activas · <span className="text-red-500">{kpis.membresiasVencidas} vencidas</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
                <PercentCircle className="h-5 w-5 text-purple-600" />
              </div>
              <Badge variant="outline" className="text-xs text-purple-600 border-purple-200 bg-purple-50">
                Retención
              </Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpis.tasaRetencion}%</p>
            <p className="text-xs text-gray-500 mt-1">Tasa de retención</p>
          </CardContent>
        </Card>
      </div>

      {/* ── GRÁFICAS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BarChart: Ingresos por mes */}
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
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCOP}
                />
                <Tooltip
                  formatter={(value: number | undefined) => [formatCurrency(value ?? 0), "Ingresos"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                />
                <Bar dataKey="ingresos" radius={[6, 6, 0, 0]}>
                  {ingresos.map((_, i) => (
                    <Cell key={i} fill={BLUE_GYMFLOW} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* LineChart: Crecimiento de miembros */}
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
                <XAxis
                  dataKey="mes"
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
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={BLUE_GYMFLOW}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: BLUE_GYMFLOW }}
                  name="Total miembros"
                />
                <Line
                  type="monotone"
                  dataKey="nuevos"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#22c55e" }}
                  strokeDasharray="5 5"
                  name="Nuevos"
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── ESTADOS DE MEMBRESÍAS + TABLA PAGOS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PieChart: Membresías por estado */}
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
                    <Pie
                      data={estadosMembresías}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {estadosMembresías.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {estadosMembresías.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-gray-600">{item.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{item.value}</span>
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

            {/* Alerta por vencer */}
            {kpis.porVencer > 0 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                <p className="text-xs text-yellow-800">
                  <span className="font-bold">{kpis.porVencer}</span> membresía(s) vencen esta semana
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabla: Pagos recientes */}
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
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Miembro
                      </th>
                      <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                        Plan
                      </th>
                      <th className="text-right pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Monto
                      </th>
                      <th className="text-right pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                        Fecha
                      </th>
                      <th className="text-right pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                        Método
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {kpis.pagosRecientes.map((pago) => (
                      <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 pr-3">
                          <span className="font-medium text-gray-900">{pago.miembro}</span>
                        </td>
                        <td className="py-3 pr-3 text-gray-600 hidden sm:table-cell">{pago.plan}</td>
                        <td className="py-3 text-right font-semibold text-gray-900">
                          {formatCurrency(pago.monto)}
                        </td>
                        <td className="py-3 pl-3 text-right text-gray-500 hidden md:table-cell">
                          {formatDateShort(pago.fecha)}
                        </td>
                        <td className="py-3 pl-3 text-right hidden lg:table-cell">
                          <Badge variant="outline" className="text-xs">
                            {getPaymentMethodLabel(pago.metodo)}
                          </Badge>
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
  )
}
