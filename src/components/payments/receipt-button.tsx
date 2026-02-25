"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Loader2 } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export interface PaymentReceiptData {
  id: string
  amount: number
  method: string
  reference: string | null
  paidAt: Date | string
  memberName: string
  planName: string
}

const METHOD_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  NEQUI: "Nequi",
  DAVIPLATA: "Daviplata",
  OTHER: "Otro",
}

interface ReceiptButtonProps {
  payment: PaymentReceiptData
  gymName: string
}

export function ReceiptButton({ payment, gymName }: ReceiptButtonProps) {
  const [loading, setLoading] = useState(false)

  function generatePDF() {
    setLoading(true)

    try {
      const doc = new jsPDF()

      // ── Encabezado azul ──────────────────────────────────────────
      doc.setFillColor(37, 99, 235)
      doc.rect(0, 0, 210, 40, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("GymFlow", 20, 20)
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text("Comprobante de Pago", 20, 30)
      doc.text(gymName, 150, 20, { align: "right" })

      // ── Número de recibo ─────────────────────────────────────────
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)
      doc.text(
        `Recibo #${payment.id.slice(-8).toUpperCase()}`,
        150,
        50,
        { align: "right" }
      )
      const fecha = new Date(payment.paidAt).toLocaleDateString("es-CO")
      doc.text(`Fecha: ${fecha}`, 150, 57, { align: "right" })

      // ── Datos del pago ───────────────────────────────────────────
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Datos del Pago", 20, 55)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)

      const monto = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }).format(payment.amount)

      autoTable(doc, {
        startY: 65,
        head: [["Campo", "Detalle"]],
        body: [
          ["Socio", payment.memberName],
          ["Plan", payment.planName],
          ["Monto", monto],
          ["Método de pago", METHOD_LABELS[payment.method] ?? payment.method],
          ["Referencia", payment.reference || "N/A"],
          ["Estado", "PAGADO ✓"],
        ],
        headStyles: { fillColor: [37, 99, 235] },
        alternateRowStyles: { fillColor: [239, 246, 255] },
        styles: { fontSize: 10 },
      })

      // ── Pie de página ────────────────────────────────────────────
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const finalY = (doc as any).lastAutoTable.finalY + 20
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text(
        "Gracias por su pago. Este documento es su comprobante oficial.",
        105,
        finalY,
        { align: "center" }
      )
      doc.text("GymFlow — gymflow-zeta.vercel.app", 105, finalY + 7, {
        align: "center",
      })

      const nombreArchivo = payment.memberName.replace(/\s+/g, "-")
      doc.save(`recibo-${payment.id.slice(-8)}-${nombreArchivo}.pdf`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generatePDF}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      Recibo PDF
    </Button>
  )
}
