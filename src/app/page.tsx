import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import { Dumbbell, Users, CreditCard, BarChart2, CheckSquare, MessageCircle, Shield, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function RootPage() {
  // Redirigir al dashboard si ya está autenticado
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        {/* Navbar mínima */}
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">GymFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10 border border-white/30">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold">
                Empieza gratis
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero content */}
        <div className="max-w-4xl mx-auto px-4 py-20 md:py-32 text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Dumbbell className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Gestiona tu gimnasio<br />
            <span className="text-blue-200">sin complicaciones</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Controla membresías, pagos y asistencia desde un solo lugar.
            Diseñado para gimnasios colombianos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-lg px-8 py-6 w-full sm:w-auto">
                Empieza gratis
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 font-semibold text-lg px-8 py-6 w-full sm:w-auto bg-transparent"
              >
                Iniciar sesión
              </Button>
            </Link>
          </div>
          <p className="text-blue-300 text-sm mt-4">Sin tarjeta de crédito requerida</p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesita tu gimnasio
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Herramientas poderosas y sencillas para gestionar tu negocio de manera eficiente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                emoji: "👥",
                icon: Users,
                titulo: "Miembros",
                descripcion: "Registra y gestiona todos tus socios en un solo lugar",
              },
              {
                emoji: "💳",
                icon: CreditCard,
                titulo: "Membresías",
                descripcion: "Controla vencimientos y recibe alertas automáticas",
              },
              {
                emoji: "📊",
                icon: BarChart2,
                titulo: "Reportes",
                descripcion: "Visualiza ingresos y tendencias de tu negocio",
              },
              {
                emoji: "✅",
                icon: CheckSquare,
                titulo: "Asistencia",
                descripcion: "Registra entradas con un solo toque",
              },
              {
                emoji: "📲",
                icon: MessageCircle,
                titulo: "WhatsApp",
                descripcion: "Envía recordatorios directamente a tus socios",
              },
              {
                emoji: "🔒",
                icon: Shield,
                titulo: "Seguro",
                descripcion: "Tus datos protegidos en la nube",
              },
            ].map((feature) => (
              <div
                key={feature.titulo}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-2xl">
                  {feature.emoji}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.titulo}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Planes simples y transparentes
            </h2>
            <p className="text-gray-600 text-lg">Empieza gratis, crece cuando necesites.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Plan Gratis */}
            <div className="rounded-2xl border-2 border-gray-200 p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Gratis</h3>
                <p className="text-gray-500 text-sm">Para gimnasios que empiezan</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-gray-500 ml-1">/ mes</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Hasta 30 miembros",
                  "Gestión de membresías",
                  "Registro de asistencia",
                  "Planes y pagos básicos",
                  "Soporte por email",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-700">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button
                  variant="outline"
                  className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-6"
                >
                  Comenzar gratis
                </Button>
              </Link>
            </div>

            {/* Plan Pro */}
            <div className="rounded-2xl border-2 border-blue-600 bg-blue-600 p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-1">Pro</h3>
                <p className="text-blue-200 text-sm">Para gimnasios en crecimiento</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">$99.000</span>
                <span className="text-blue-200 ml-1">COP / mes</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Miembros ilimitados",
                  "Reportes y analytics",
                  "Envío de recordatorios por WhatsApp",
                  "Exportar datos",
                  "Soporte prioritario",
                  "Todo lo del plan Gratis",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-white">
                    <Check className="h-4 w-4 text-blue-200 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold py-6">
                  Comenzar gratis
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Sin tarjeta de crédito requerida · Cancela cuando quieras
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg">GymFlow</span>
        </div>
        <p className="text-sm">
          © 2026 GymFlow · Hecho con ❤️ en Colombia
        </p>
      </footer>
    </div>
  )
}
