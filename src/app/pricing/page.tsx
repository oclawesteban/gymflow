import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Dumbbell, ArrowLeft, Zap, MessageCircle } from "lucide-react"
import { PLANS, getLimitLabel, type PlanTier } from "@/lib/config/plans"

const PLAN_ORDER: PlanTier[] = ["FREE", "BASIC", "PRO", "MULTI"]

const FEATURES_TABLE = [
  { label: "Miembros", key: "members" as const, type: "limit" },
  { label: "Instructores", key: "instructors" as const, type: "limit" },
  { label: "Portal del socio", key: "portalSocios" as const, type: "bool" },
  { label: "Clases grupales", key: "classes" as const, type: "bool" },
  { label: "Exportar Excel", key: "exportExcel" as const, type: "bool" },
  { label: "Reportes avanzados", key: "advancedReports" as const, type: "bool" },
  { label: "Recordatorios WhatsApp", key: "whatsappReminders" as const, type: "bool" },
  { label: "Multi-sede", key: "multiSede" as const, type: "bool" },
  { label: "Soporte", key: "supportLabel" as const, type: "text" },
]

const TIER_STYLES: Record<PlanTier, { card: string; button: string; badge?: string }> = {
  FREE:  { card: "border-gray-200", button: "variant-outline" },
  BASIC: { card: "border-blue-200", button: "bg-blue-600 hover:bg-blue-700 text-white" },
  PRO:   { card: "border-purple-400 shadow-xl shadow-purple-100 ring-2 ring-purple-400", button: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white", badge: "Más popular" },
  MULTI: { card: "border-amber-200", button: "bg-amber-500 hover:bg-amber-600 text-white" },
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Nav */}
      <div className="max-w-6xl mx-auto px-4 pt-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold text-lg">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          GymFlow
        </Link>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Iniciar sesión</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              Empezar gratis
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">

        {/* Hero */}
        <div className="text-center space-y-4">
          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
            <Zap className="h-3 w-3 mr-1" />
            Planes y precios
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
            Empieza gratis,<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              crece sin límites
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Sin contratos. Sin sorpresas. Cancela cuando quieras.
            Todos los precios en pesos colombianos, IVA incluido.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLAN_ORDER.map((tier) => {
            const plan = PLANS[tier]
            const style = TIER_STYLES[tier]
            return (
              <div
                key={tier}
                className={`relative rounded-2xl border-2 bg-white dark:bg-gray-900 p-6 flex flex-col gap-5 ${style.card}`}
              >
                {style.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white border-0 px-3 py-0.5 text-xs">
                      {style.badge}
                    </Badge>
                  </div>
                )}

                {/* Header */}
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {plan.price === null ? "Consultar" : plan.price === 0 ? "Gratis" : plan.priceLabel}
                    </span>
                    {plan.price !== null && plan.price > 0 && (
                      <span className="text-gray-400 text-sm mb-1">/mes</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>{getLimitLabel(plan.members)}</strong> miembros
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>{getLimitLabel(plan.instructors)}</strong> instructores
                    </span>
                  </li>
                  {[
                    { enabled: plan.portalSocios, label: "Portal del socio" },
                    { enabled: plan.classes, label: "Clases grupales" },
                    { enabled: plan.exportExcel, label: "Exportar Excel" },
                    { enabled: plan.advancedReports, label: "Reportes avanzados" },
                    { enabled: plan.whatsappReminders, label: "WhatsApp automático" },
                    { enabled: plan.multiSede, label: "Multi-sede" },
                  ].map(({ enabled, label }) => (
                    <li key={label} className={`flex items-start gap-2 text-sm ${!enabled ? "text-gray-400" : ""}`}>
                      {enabled
                        ? <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        : <X className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />
                      }
                      {label}
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Soporte {plan.supportLabel.toLowerCase()}</span>
                  </li>
                </ul>

                {/* CTA */}
                {tier === "FREE" || tier === "BASIC" || tier === "PRO" ? (
                  <Link href="/register">
                    <Button className={`w-full min-h-[44px] ${style.button}`}>
                      {tier === "FREE" ? "Empezar gratis" : "Elegir plan"}
                    </Button>
                  </Link>
                ) : (
                  <a href="https://wa.me/573000000000?text=Hola,%20quiero%20información%20sobre%20GymFlow%20Multi-sede" target="_blank" rel="noopener noreferrer">
                    <Button className={`w-full min-h-[44px] gap-2 ${style.button}`}>
                      <MessageCircle className="h-4 w-4" />
                      Contactar
                    </Button>
                  </a>
                )}
              </div>
            )
          })}
        </div>

        {/* Tabla comparativa */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
            Comparación detallada
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                  <th className="text-left px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 w-48">
                    Característica
                  </th>
                  {PLAN_ORDER.map((tier) => (
                    <th key={tier} className="px-4 py-4 text-center font-bold text-gray-900 dark:text-gray-100">
                      {PLANS[tier].name}
                      {tier === "PRO" && (
                        <span className="ml-1.5 inline-block bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 rounded-full">★</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES_TABLE.map((feat, i) => (
                  <tr key={feat.key} className={`border-b border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-gray-50/50 dark:bg-gray-900/50"}`}>
                    <td className="px-6 py-3.5 font-medium text-gray-700 dark:text-gray-300">
                      {feat.label}
                    </td>
                    {PLAN_ORDER.map((tier) => {
                      const plan = PLANS[tier]
                      const val = plan[feat.key as keyof typeof plan]
                      return (
                        <td key={tier} className="px-4 py-3.5 text-center">
                          {feat.type === "limit" ? (
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {getLimitLabel(val as number)}
                            </span>
                          ) : feat.type === "bool" ? (
                            val
                              ? <Check className="h-4 w-4 text-green-500 mx-auto" />
                              : <X className="h-4 w-4 text-gray-300 mx-auto" />
                          ) : (
                            <span className="text-gray-600 dark:text-gray-400">{val as string}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
                {/* Precio */}
                <tr className="bg-blue-50/50 dark:bg-blue-950/20 font-bold">
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100">Precio / mes</td>
                  {PLAN_ORDER.map((tier) => (
                    <td key={tier} className="px-4 py-4 text-center text-gray-900 dark:text-gray-100">
                      {PLANS[tier].priceLabel}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ rápido */}
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">Preguntas frecuentes</h2>
          {[
            { q: "¿Puedo cambiar de plan en cualquier momento?", a: "Sí. Puedes mejorar o reducir tu plan cuando quieras. Los cambios aplican al siguiente ciclo de facturación." },
            { q: "¿Qué pasa si supero el límite de miembros en el plan Gratis?", a: "El sistema te avisará antes de llegar al límite. No podrás agregar más miembros hasta que actualices tu plan." },
            { q: "¿Cómo se realiza el pago?", a: "Aceptamos transferencia bancaria, Nequi y Daviplata. Próximamente tarjeta de crédito/débito vía Wompi." },
            { q: "¿Hay contrato de permanencia?", a: "No. Mes a mes, cancelas cuando quieras sin penalización." },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-2">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{q}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{a}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ¿Listo para ordenar tu gimnasio?
          </h2>
          <p className="text-gray-500">Empieza hoy, gratis. Sin tarjeta de crédito.</p>
          <Link href="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white min-h-[52px] px-10 text-base gap-2">
              <Dumbbell className="h-5 w-5" />
              Crear cuenta gratis
            </Button>
          </Link>
        </div>

      </div>
    </div>
  )
}
