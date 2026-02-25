import { getClass } from "@/lib/actions/classes"
import { notFound } from "next/navigation"
import { EditClassForm } from "@/components/classes/edit-class-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function EditarClasePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const clase = await getClass(id)
  if (!clase) notFound()

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/classes/${id}`}>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Clase</h1>
          <p className="text-gray-500 text-sm">{clase.name}</p>
        </div>
      </div>

      <EditClassForm clase={clase} />
    </div>
  )
}
