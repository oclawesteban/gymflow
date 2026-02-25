"use client"

import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { QrCode } from "lucide-react"

export function MemberQR({ memberId, memberName }: { memberId: string; memberName: string }) {
  const url = `https://gymflow-zeta.vercel.app/attendance?memberId=${memberId}`

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 min-h-[48px]">
          <QrCode className="h-4 w-4" />
          Ver QR
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>QR de {memberName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border">
            <QRCodeSVG value={url} size={220} level="H" includeMargin />
          </div>
          <p className="text-sm text-gray-500 text-center">
            El socio muestra este QR en su celular para registrar su entrada
          </p>
          <p className="text-xs text-gray-400 text-center font-mono break-all">{url}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
