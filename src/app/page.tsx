import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import {
  Dumbbell, Users, CreditCard, BarChart2, CalendarCheck,
  MessageCircle, Shield, Check, X, Smartphone, Zap,
} from "lucide-react"
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
              { Icon: Users,        titulo: "Miembros",      descripcion: "Registra y gestiona todos tus socios en un solo lugar", color: "bg-blue-50 text-blue-600" },
              { Icon: CreditCard,   titulo: "Membresías",    descripcion: "Controla vencimientos y recibe alertas automáticas",    color: "bg-purple-50 text-purple-600" },
              { Icon: BarChart2,    titulo: "Reportes",      descripcion: "Visualiza ingresos y tendencias de tu negocio",          color: "bg-green-50 text-green-600" },
              { Icon: CalendarCheck,titulo: "Asistencia",    descripcion: "Registra entradas con un solo toque desde el celular",   color: "bg-orange-50 text-orange-600" },
              { Icon: MessageCircle,titulo: "WhatsApp",      descripcion: "Envía recordatorios directamente a tus socios",          color: "bg-emerald-50 text-emerald-600" },
              { Icon: Smartphone,   titulo: "Portal Socio",  descripcion: "Tus socios ven su membresía y abren el torniquete",      color: "bg-indigo-50 text-indigo-600" },
            ].map(({ Icon, titulo, descripcion, color }) => (
              <div key={titulo} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{titulo}</h3>
                <p className="text-gray-600 leading-relaxed">{descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Planes simples y transparentes
            </h2>
            <p className="text-gray-600 text-lg">Empieza gratis, crece cuando necesites.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Gratis */}
            <div className="rounded-2xl border-2 border-gray-200 p-6 flex flex-col">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Gratis</p>
              <div className="mb-4"><span className="text-3xl font-extrabold text-gray-900">$0</span><span className="text-gray-400 text-sm ml-1">/mes</span></div>
              <ul className="space-y-2 mb-6 flex-1 text-sm">
                {["30 miembros","2 instructores","Portal del socio","Asistencia y pagos","Soporte email"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-gray-600"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <Link href="/register"><Button variant="outline" className="w-full border-2 border-gray-300 font-semibold min-h-[44px]">Empezar gratis</Button></Link>
            </div>

            {/* Básico */}
            <div className="rounded-2xl border-2 border-blue-200 p-6 flex flex-col">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">Básico</p>
              <div className="mb-4"><span className="text-3xl font-extrabold text-gray-900">$49.900</span><span className="text-gray-400 text-sm ml-1">COP/mes</span></div>
              <ul className="space-y-2 mb-6 flex-1 text-sm">
                {["100 miembros","5 instructores","Clases grupales","Exportar Excel","Todo lo del plan Gratis"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-gray-600"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <Link href="/register"><Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold min-h-[44px]">Elegir plan</Button></Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border-2 border-purple-500 bg-gradient-to-b from-purple-600 to-blue-700 p-6 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">Más popular</span>
              </div>
              <p className="text-sm font-semibold text-purple-200 uppercase tracking-wide mb-1">Pro</p>
              <div className="mb-4"><span className="text-3xl font-extrabold text-white">$99.900</span><span className="text-purple-200 text-sm ml-1">COP/mes</span></div>
              <ul className="space-y-2 mb-6 flex-1 text-sm">
                {["Miembros ilimitados","Instructores ilimitados","Reportes avanzados","WhatsApp automático","Todo lo del plan Básico"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-white"><Check className="h-3.5 w-3.5 text-purple-200 flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <Link href="/register"><Button className="w-full bg-white text-purple-700 hover:bg-purple-50 font-bold min-h-[44px]">Elegir plan</Button></Link>
            </div>

            {/* Multi-sede */}
            <div className="rounded-2xl border-2 border-amber-200 p-6 flex flex-col">
              <p className="text-sm font-semibold text-amber-600 uppercase tracking-wide mb-1">Multi-sede</p>
              <div className="mb-4"><span className="text-3xl font-extrabold text-gray-900">Consultar</span></div>
              <ul className="space-y-2 mb-6 flex-1 text-sm">
                {["Varias sucursales","Panel unificado","Gestión de redes","Soporte dedicado","Todo lo del plan Pro"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-gray-600"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <a href="https://wa.me/573000000000?text=Hola,%20quiero%20info%20sobre%20GymFlow%20Multi-sede" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full border-2 border-amber-400 text-amber-700 hover:bg-amber-50 font-semibold min-h-[44px] gap-2">
                  <MessageCircle className="h-4 w-4" />Contactar
                </Button>
              </a>
            </div>
          </div>

          <div className="text-center mt-8 space-y-2">
            <p className="text-gray-500 text-sm">Sin tarjeta de crédito · Cancela cuando quieras · Precios en COP con IVA incluido</p>
            <Link href="/pricing" className="text-blue-600 text-sm font-medium hover:underline">Ver comparación completa de planes →</Link>
          </div>
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
