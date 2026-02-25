"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function PortalLogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/portal/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    })
    router.push("/portal/login")
    router.refresh()
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLogout}
      className="h-10 w-10 text-gray-500 hover:text-red-600 hover:bg-red-50"
      title="Cerrar sesión"
    >
      <LogOut className="h-4 w-4" />
    </Button>
  )
}
