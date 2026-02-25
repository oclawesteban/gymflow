"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteClass } from "@/lib/actions/classes"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Eye, Pencil, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"

interface ClassActionsProps {
  claseId: string
  claseNombre: string
}

export function ClassActions({ claseId, claseNombre }: ClassActionsProps) {
  const router = useRouter()
  const [openConfirm, setOpenConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      await deleteClass(claseId)
      router.refresh()
    } finally {
      setLoading(false)
      setOpenConfirm(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/classes/${claseId}`} className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Ver detalles
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/classes/${claseId}/edit`} className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => setOpenConfirm(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar clase?</DialogTitle>
            <DialogDescription>
              Esto eliminará permanentemente la clase{" "}
              <strong>{claseNombre}</strong> junto con todas las inscripciones.
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setOpenConfirm(false)}
              className="min-h-[48px]"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="min-h-[48px] gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Sí, eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
