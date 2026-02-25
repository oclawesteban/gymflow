"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteMember } from "@/lib/actions/members"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2, Loader2 } from "lucide-react"

export function MemberActions({ memberId, memberName }: { memberId: string; memberName: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      await deleteMember(memberId)
      router.push("/members")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="min-h-[48px] gap-2 text-red-600 border-red-200 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar miembro?</DialogTitle>
          <DialogDescription>
            Esto eliminará permanentemente a <strong>{memberName}</strong> junto con todas sus membresías y
            registros de asistencia. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 sm:gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="min-h-[48px]">
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="min-h-[48px] gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Sí, eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
