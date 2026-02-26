"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users2 } from "lucide-react"

const NAV_ITEMS = [
  { href: "/portal/dashboard", label: "Mi portal", Icon: LayoutDashboard },
  { href: "/portal/classes", label: "Clases", Icon: Users2 },
]

// Rutas donde NO mostramos la nav (usuario no autenticado)
const AUTH_ROUTES = ["/portal/login", "/portal/register"]

export function PortalNav() {
  const pathname = usePathname()

  // Ocultar nav en páginas de autenticación
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-4xl mx-auto flex">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                isActive ? "text-blue-600" : "text-gray-400 hover:text-blue-500"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className={`text-xs font-medium ${isActive ? "font-semibold" : ""}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-12 h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
