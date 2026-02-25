"use client"

import { useState } from "react"
import { togglePromoCode, deletePromoCode } from "@/lib/actions/discounts"
import { Button } from "@/components/ui/button"
import { MoreVertical, ToggleLeft, ToggleRight, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function PromoCodeActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleToggle() {
    setLoading(true)
    setOpen(false)
    try {
      await togglePromoCode(id)
      router.refresh()
      toast.success(isActive ? "Código desactivado" : "Código activado")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este código? Esta acción no se puede deshacer.")) return
    setLoading(true)
    setOpen(false)
    try {
      await deletePromoCode(id)
      router.refresh()
      toast.success("Código eliminado")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => setOpen(!open)}
        disabled={loading}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 py-1 min-w-[160px]">
          <button
            onClick={handleToggle}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            {isActive ? (
              <ToggleLeft className="h-4 w-4 text-orange-500" />
            ) : (
              <ToggleRight className="h-4 w-4 text-green-500" />
            )}
            {isActive ? "Desactivar" : "Activar"}
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </div>
      )}
    </div>
  )
}
