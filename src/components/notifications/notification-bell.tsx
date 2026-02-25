"use client"

import { useState, useEffect, useRef } from "react"
import { getNotifications, type Notification } from "@/lib/actions/notifications"
import { Bell, AlertCircle, AlertTriangle, Info, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

const severityStyles = {
  error: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-600",
    dot: "bg-red-500",
    IconComponent: AlertCircle,
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    border: "border-yellow-200 dark:border-yellow-800",
    icon: "text-yellow-600",
    dot: "bg-yellow-500",
    IconComponent: AlertTriangle,
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600",
    dot: "bg-blue-500",
    IconComponent: Info,
  },
}

interface NotificationBellProps {
  dropUp?: boolean   // abre hacia arriba (cuando está en la parte inferior)
  alignEnd?: boolean // alinea el dropdown al borde derecho
}

export function NotificationBell({ dropUp = false, alignEnd = false }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const totalCount = notifications.reduce((sum, n) => sum + n.count, 0)

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 relative text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setOpen(!open)}
        title="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {!loading && totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        )}
      </Button>

      {/* Dropdown — posición según contexto */}
      {open && (
        <div className={cn(
          "absolute w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-[100] overflow-hidden",
          dropUp ? "bottom-full mb-2" : "top-full mt-2",
          alignEnd ? "right-0" : "left-0",
        )}>
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              Notificaciones
            </h3>
            {totalCount > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {totalCount}
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                Cargando...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">¡Todo en orden! Sin alertas pendientes.</p>
              </div>
            ) : (
              <div className="py-2">
                {notifications.map((notif, i) => {
                  const styles = severityStyles[notif.severity]
                  const Icon = styles.IconComponent
                  return (
                    <Link
                      key={i}
                      href={notif.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-start gap-3 mx-2 my-1 px-3 py-2.5 rounded-xl transition-all cursor-pointer",
                        styles.bg,
                        "hover:brightness-95 dark:hover:brightness-110"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", styles.icon)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight">
                          {notif.message}
                        </p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
              <Link href="/calendar" onClick={() => setOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full text-xs h-9 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/30"
                >
                  Ver todos los vencimientos →
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
