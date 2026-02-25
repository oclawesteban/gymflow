"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  DollarSign,
  Calendar,
  CalendarDays,
  Dumbbell,
  Menu,
  X,
  LogOut,
  BarChart2,
  Settings,
} from "lucide-react"
import { useState } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/members", label: "Miembros", icon: Users },
  { href: "/plans", label: "Planes", icon: FileText },
  { href: "/memberships", label: "Membresías", icon: CreditCard },
  { href: "/payments", label: "Pagos", icon: DollarSign },
  { href: "/attendance", label: "Asistencia", icon: Calendar },
  { href: "/calendar", label: "Vencimientos", icon: CalendarDays },
  { href: "/reports", label: "Reportes", icon: BarChart2 },
  { href: "/settings", label: "Configuración", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavLinks = () => (
    <nav className="flex flex-col gap-1 flex-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const active = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              "min-h-[52px] touch-target",
              active
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen px-4 py-6 fixed left-0 top-0 bottom-0 z-30">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-base leading-tight">GymFlow</p>
            <p className="text-xs text-gray-500">Gestión de Gimnasio</p>
          </div>
        </div>
        <NavLinks />
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-500 hover:text-red-600 hover:bg-red-50 py-3 min-h-[48px]"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">GymFlow</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-in Menu */}
      <div
        className={cn(
          "md:hidden fixed top-0 left-0 bottom-0 w-72 bg-white z-50 flex flex-col px-4 py-6 transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900">GymFlow</p>
              <p className="text-xs text-gray-500">Gestión de Gimnasio</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <NavLinks />
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-500 hover:text-red-600 hover:bg-red-50 py-3 min-h-[48px]"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </>
  )
}
