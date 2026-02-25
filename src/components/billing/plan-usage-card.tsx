import { getUsageSummary } from "@/lib/actions/limits"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Users, GraduationCap, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react"
import Link from "next/link"

function UsageBar({ current, limit }: { current: number; limit: number }) {
  if (limit === -1) {
    return (
      <div className="flex items-center gap-2 text-xs text-green-600">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Ilimitado
      </div>
    )
  }
  const pct = Math.min(100, Math.round((current / limit) * 100))
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-blue-500"
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{current} de {limit}</span>
        <span className={pct >= 90 ? "text-red-600 font-semibold" : ""}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function FeaturePill({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1 text-xs ${enabled ? "text-green-700" : "text-gray-400"}`}>
      {enabled
        ? <CheckCircle2 className="h-3 w-3 text-green-500" />
        : <XCircle className="h-3 w-3 text-gray-300" />
      }
      {label}
    </div>
  )
}

const TIER_COLORS: Record<string, string> = {
  FREE:  "bg-gray-100 text-gray-600 border-gray-200",
  BASIC: "bg-blue-100 text-blue-700 border-blue-200",
  PRO:   "bg-purple-100 text-purple-700 border-purple-200",
  MULTI: "bg-amber-100 text-amber-700 border-amber-200",
}

export async function PlanUsageCard() {
  let usage
  try {
    usage = await getUsageSummary()
  } catch {
    return null
  }

  const showUpgrade = usage.planTier === "FREE" || usage.planTier === "BASIC"

  return (
    <Card className="border border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            Tu Plan
          </CardTitle>
          <Badge className={`text-xs border ${TIER_COLORS[usage.planTier]}`}>
            {usage.planName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Uso de miembros */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
            <Users className="h-3.5 w-3.5" />
            Miembros
          </div>
          <UsageBar current={usage.members.current} limit={usage.members.limit} />
        </div>

        {/* Uso de instructores */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
            <GraduationCap className="h-3.5 w-3.5" />
            Instructores
          </div>
          <UsageBar current={usage.instructors.current} limit={usage.instructors.limit} />
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-1 pt-1 border-t border-gray-100 dark:border-gray-800">
          <FeaturePill enabled={usage.features.classes} label="Clases" />
          <FeaturePill enabled={usage.features.exportExcel} label="Exportar Excel" />
          <FeaturePill enabled={usage.features.advancedReports} label="Reportes avanzados" />
          <FeaturePill enabled={usage.features.whatsappReminders} label="WhatsApp auto" />
        </div>

        {/* CTA upgrade */}
        {showUpgrade && (
          <Link href="/pricing">
            <Button size="sm" className="w-full gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Mejorar plan
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
