import type { Metadata } from "next"
import Link from "next/link"
import { Dumbbell, LayoutDashboard, Users2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Portal del Socio — GymFlow",
  description: "Accede a tu información de membresía",
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg leading-tight">GymFlow</p>
            <p className="text-xs text-gray-500">Portal del Socio</p>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Barra de navegación inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-4xl mx-auto flex">
          <Link href="/portal/dashboard" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-500 hover:text-blue-600 transition-colors">
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs font-medium">Mi portal</span>
          </Link>
          <Link href="/portal/classes" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-500 hover:text-blue-600 transition-colors">
            <Users2 className="h-5 w-5" />
            <span className="text-xs font-medium">Clases</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
