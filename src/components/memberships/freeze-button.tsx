"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { freezeMembership, unfreezeMembership } from "@/lib/actions/memberships"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface FreezeButtonProps {
  membershipId: string
  status: string
}

export function FreezeButton({ membershipId, status }: FreezeButtonProps) {
  const [open, setOpen] = useState(false)
  const [fechaHasta, setFechaHasta] = useState("")
  const [isPending, startTransition] = useTransition()

  const estaCongelada = status === "FROZEN"

  // Fecha mínima: mañana
  const manana = new Date()
  manana.setDate(manana.getDate() + 1)
  const fechaMinima = manana.toISOString().split("T")[0]

  function handleCongelar() {
    if (!fechaHasta) {
      toast.error("Selecciona una fecha de descongelamiento")
      return
    }
    startTransition(async () => {
      try {
        await freezeMembership(membershipId, new Date(fechaHasta))
        toast.success("Membresía congelada exitosamente ❄️")
        setOpen(false)
        setFechaHasta("")
      } catch (err) {
        toast.error("Error al congelar la membresía")
      }
    })
  }

  function handleDescongelar() {
    startTransition(async () => {
      try {
        await unfreezeMembership(membershipId)
        toast.success("Membresía descongelada. Los días se extendieron ✅")
        setOpen(false)
      } catch (err) {
        toast.error("Error al descongelar la membresía")
      }
    })
  }

  if (estaCongelada) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="min-h-[40px] gap-1 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            🔥 Descongelar
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Descongelar membresía</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Los días que estuvo congelada se agregarán automáticamente a la fecha de vencimiento.
          </p>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button
              onClick={handleDescongelar}
              disabled={isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="min-h-[40px] gap-1 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
          disabled={status !== "ACTIVE"}
        >
          ❄️ Congelar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Congelar membresía</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-600">
            La membresía quedará pausada hasta la fecha elegida. Al descongelarla, los días
            congelados se sumarán a la fecha de vencimiento.
          </p>
          <div className="space-y-2">
            <Label htmlFor="fecha-hasta">Congelar hasta</Label>
            <Input
              id="fecha-hasta"
              type="date"
              min={fechaMinima}
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleCongelar}
            disabled={isPending || !fechaHasta}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            ❄️ Congelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
