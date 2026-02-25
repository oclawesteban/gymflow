"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateMemberPhoto } from "@/lib/actions/portal"
import { Camera, Loader2, User } from "lucide-react"

interface Props {
  memberId: string
  currentPhotoUrl: string | null
  memberName: string
}

const MAX_SIZE = 200 // px — tamaño máximo para thumbnail en DB

function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const scale = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height, 1)
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext("2d")!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", 0.85))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function PhotoUpload({ memberId, currentPhotoUrl, memberName }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar 5 MB")
      return
    }

    setError(null)
    setSuccess(false)

    try {
      const dataUrl = await resizeImageToDataUrl(file)
      setPreview(dataUrl)

      startTransition(async () => {
        const result = await updateMemberPhoto(memberId, dataUrl)
        if (!result.success) {
          setError(result.error ?? "Error al guardar la foto")
          setPreview(currentPhotoUrl)
        } else {
          setSuccess(true)
          router.refresh()
          setTimeout(() => setSuccess(false), 3000)
        }
      })
    } catch {
      setError("No se pudo procesar la imagen")
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="relative group w-16 h-16 rounded-full overflow-hidden focus:outline-none"
        title="Cambiar foto"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={memberName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
            <User className="h-7 w-7 text-blue-600" />
          </div>
        )}

        {/* Overlay al hacer hover */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isPending ? (
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          ) : (
            <Camera className="h-5 w-5 text-white" />
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      <p className="text-xs text-gray-400">
        {isPending ? "Guardando..." : success ? "✓ Foto actualizada" : "Toca para cambiar foto"}
      </p>

      {error && (
        <p className="text-xs text-red-500 text-center max-w-[160px]">{error}</p>
      )}
    </div>
  )
}
