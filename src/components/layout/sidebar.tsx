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
  Users2,
  Tag,
  GraduationCap,
} from "lucide-react"
import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { NotificationBell } from "@/components/notifications/notification-bell"

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/members", label: "Miembros", icon: Users },
  { href: "/plans", label: "Planes", icon: FileText },
  { href: "/memberships", label: "Membresías", icon: CreditCard },
  { href: "/classes", label: "Clases", icon: Users2 },
  { href: "/instructors", label: "Instructores", icon: GraduationCap },
  { href: "/payments", label: "Pagos", icon: DollarSign },
  { href: "/discounts", label: "Descuentos", icon: Tag },
  { href: "/attendance", label: "Asistencia", icon: Calendar },
  { href: "/calendar", label: "Vencimientos", icon: CalendarDays },
  { href: "/reports", label: "Reportes", icon: BarChart2 },
  { href: "/settings", label: "Configuración", icon: Settings },
]

function AdminAvatar({ name, photoUrl }: { name?: string | null; photoUrl?: string | null }) {
  const initials = (name ?? "A")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name ?? "Admin"}
        className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0"
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.display = "none"
        }}
      />
    )
  }

  return (
    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 select-none">
      {initials}
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session } = useSession()
  const user = session?.user as any

  const NavLinks = () => (
    <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
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
              "min-h-[48px] touch-target",
              active
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  const BottomBar = () => (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
      {/* Notificaciones + Tema */}
      <div className="flex items-center justify-between px-2">
        <NotificationBell />
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Cerrar sesión"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
      {/* Avatar del admin */}
      <Link
        href="/profile"
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
      >
        <AdminAvatar name={user?.name} photoUrl={user?.photoUrl} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {user?.name ?? "Admin"}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
            {user?.email ?? ""}
          </p>
        </div>
      </Link>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 min-h-screen px-4 py-6 fixed left-0 top-0 bottom-0 z-30">
        <div className="flex items-center gap-2 px-2 mb-6">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-base leading-tight">GymFlow</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Gestión de Gimnasio</p>
          </div>
        </div>
        <NavLinks />
        <BottomBar />
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">GymFlow</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 dark:text-gray-300"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
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
          "md:hidden fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-gray-950 z-50 flex flex-col px-4 py-6 transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">GymFlow</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Gestión de Gimnasio</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="dark:text-gray-300">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <NavLinks />
        <BottomBar />
      </div>
    </>
  )
}
