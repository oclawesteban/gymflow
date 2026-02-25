import { getGymSettings } from "@/lib/actions/settings"
import { SettingsForm } from "./settings-form"
import { Settings } from "lucide-react"

export default async function SettingsPage() {
  const gym = await getGymSettings()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Settings className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500 text-sm">Administra la información de tu gimnasio</p>
        </div>
      </div>

      <SettingsForm gym={gym} />
    </div>
  )
}
