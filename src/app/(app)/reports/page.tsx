import { getReportKPIs, getRevenueByMonth, getMemberGrowth } from "@/lib/actions/reports"
import { ReportsClient } from "./reports-client"
import { BarChart2 } from "lucide-react"

export default async function ReportsPage() {
  // Cargar todos los datos en paralelo
  const [kpis, ingresos, miembros] = await Promise.all([
    getReportKPIs(),
    getRevenueByMonth(6),
    getMemberGrowth(6),
  ])

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <BarChart2 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Analytics</h1>
          <p className="text-gray-500 text-sm">Visualiza el rendimiento de tu gimnasio</p>
        </div>
      </div>

      <ReportsClient kpis={kpis} ingresos={ingresos} miembros={miembros} />
    </div>
  )
}
