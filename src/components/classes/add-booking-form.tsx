"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { bookClass } from "@/lib/actions/classes"
import { Button } from "@/components/ui/button"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Loader2, UserPlus } from "lucide-react"
import { toast } from "sonner"

interface Miembro {
  id: string
  name: string
  email: string | null
}

interface AddBookingFormProps {
  claseId: string
  claseNombre: string
  proximaFecha: Date
  miembros: Miembro[]
  inscriptosIds: string[]
  cuposDisponibles: number
}

export function AddBookingForm({
  claseId,
  proximaFecha,
  miembros,
  inscriptosIds,
  cuposDisponibles,
}: AddBookingFormProps) {
  const router = useRouter()
  const [selectedMember, setSelectedMember] = useState("")
  const [loading, setLoading] = useState(false)

  const opciones = miembros
    .filter((m) => !inscriptosIds.includes(m.id))
    .map((m) => ({
      value: m.id,
      label: m.name,
      sublabel: m.email ?? undefined,
    }))

  async function handleBook() {
    if (!selectedMember) {
      toast.error("Selecciona un socio")
      return
    }

    setLoading(true)
    try {
      const result = await bookClass(claseId, selectedMember, proximaFecha)
      if (result.success) {
        toast.success("Socio inscrito exitosamente")
        setSelectedMember("")
        router.refresh()
      } else {
        toast.error(result.error ?? "Error al inscribir")
      }
    } finally {
      setLoading(false)
    }
  }

  if (cuposDisponibles === 0) {
    return (
      <p className="text-orange-600 text-sm font-medium text-center py-2">
        ⚠️ No hay cupos disponibles para la próxima sesión
      </p>
    )
  }

  if (opciones.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-2">
        Todos los socios activos ya están inscritos
      </p>
    )
  }

  return (
    <div className="flex gap-3">
      <SearchableSelect
        options={opciones}
        value={selectedMember}
        onValueChange={setSelectedMember}
        placeholder="Buscar socio activo..."
        searchPlaceholder="Escribir nombre..."
        emptyText="No se encontraron socios"
        className="flex-1"
      />
      <Button
        onClick={handleBook}
        disabled={loading || !selectedMember}
        className="bg-blue-600 hover:bg-blue-700 min-h-[48px] gap-2 flex-shrink-0"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Inscribir</span>
      </Button>
    </div>
  )
}
