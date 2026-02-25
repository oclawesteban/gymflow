"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import * as XLSX from "xlsx"

export function ExportButton({
  label,
  filename,
  fetchData,
}: {
  label: string
  filename: string
  fetchData: () => Promise<Record<string, unknown>[]>
}) {
  const [cargando, setCargando] = useState(false)

  async function handleExportar() {
    setCargando(true)
    try {
      const datos = await fetchData()
      const hoja = XLSX.utils.json_to_sheet(datos)
      const libro = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(libro, hoja, "Datos")
      XLSX.writeFile(libro, `${filename}-${new Date().toISOString().split("T")[0]}.xlsx`)
    } catch (err) {
      console.error("Error al exportar:", err)
    } finally {
      setCargando(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleExportar}
      disabled={cargando}
      className="gap-2"
    >
      {cargando ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {label}
    </Button>
  )
}
