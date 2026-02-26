"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { updateGymSettings } from "@/lib/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Image as ImageIcon,
  Loader2,
  Save,
  CheckCircle2,
  Camera,
  Dumbbell,
} from "lucide-react"

function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const MAX = 400
        const scale = Math.min(MAX / img.width, MAX / img.height, 1)
        const canvas = document.createElement("canvas")
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/png", 0.9))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Esquema de validación con Zod
const settingsSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  address: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  contactEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  city: z.string().optional(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

interface GymData {
  id: string
  name: string
  address: string | null
  phone: string | null
  whatsapp: string | null
  contactEmail: string | null
  description: string | null
  logoUrl: string | null
  city: string | null
}

interface SettingsFormProps {
  gym: GymData
}

export function SettingsForm({ gym }: SettingsFormProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [logoPreview, setLogoPreview] = useState(gym.logoUrl || "")
  const logoFileRef = useRef<HTMLInputElement>(null)

  async function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return
    if (file.size > 5 * 1024 * 1024) { setError("La imagen no puede superar 5 MB"); return }
    try {
      const dataUrl = await resizeImageToDataUrl(file)
      setLogoPreview(dataUrl)
      setValue("logoUrl", dataUrl)
    } catch { setError("No se pudo procesar la imagen") }
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: gym.name,
      address: gym.address || "",
      phone: gym.phone || "",
      whatsapp: gym.whatsapp || "",
      contactEmail: gym.contactEmail || "",
      description: gym.description || "",
      logoUrl: gym.logoUrl || "",
      city: gym.city || "",
    },
  })

  const logoUrlValue = watch("logoUrl")

  async function onSubmit(data: SettingsFormData) {
    setSaving(true)
    setError("")
    setSaved(false)

    try {
      await updateGymSettings(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar"
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sección: Información del gimnasio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Información del Gimnasio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del gimnasio *</Label>
            <Input
              id="name"
              placeholder="Ej: GymFit Manizales"
              className="min-h-[48px] text-base"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Ciudad y Dirección */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">
                <MapPin className="inline h-3.5 w-3.5 mr-1 text-gray-400" />
                Ciudad
              </Label>
              <Input
                id="city"
                placeholder="Ej: Manizales"
                className="min-h-[48px] text-base"
                {...register("city")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                placeholder="Ej: Cra 23 #45-67"
                className="min-h-[48px] text-base"
                {...register("address")}
              />
            </div>
          </div>

          {/* Teléfono y WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="inline h-3.5 w-3.5 mr-1 text-gray-400" />
                Teléfono
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Ej: 6086123456"
                className="min-h-[48px] text-base"
                {...register("phone")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">
                <MessageCircle className="inline h-3.5 w-3.5 mr-1 text-green-500" />
                WhatsApp
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="Ej: 3001234567"
                className="min-h-[48px] text-base"
                {...register("whatsapp")}
              />
            </div>
          </div>

          {/* Email de contacto */}
          <div className="space-y-2">
            <Label htmlFor="contactEmail">
              <Mail className="inline h-3.5 w-3.5 mr-1 text-gray-400" />
              Email de contacto
            </Label>
            <Input
              id="contactEmail"
              type="email"
              placeholder="Ej: contacto@migym.com"
              className="min-h-[48px] text-base"
              {...register("contactEmail")}
            />
            {errors.contactEmail && (
              <p className="text-sm text-red-600">{errors.contactEmail.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Cuéntanos sobre tu gimnasio..."
              rows={3}
              className="text-base resize-none"
              {...register("description")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sección: Apariencia */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-blue-600" />
            Apariencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Logo del gimnasio</Label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => logoFileRef.current?.click()}
                className="relative group flex-shrink-0 focus:outline-none"
              >
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <Dumbbell className="h-8 w-8 text-gray-300" />
                  )}
                </div>
                <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </button>
              <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
              <input type="hidden" {...register("logoUrl")} />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">Logo del gimnasio</p>
                <p className="text-xs text-gray-400 mt-0.5">Haz clic para subir (PNG, JPG — máx 5 MB)</p>
                {logoPreview && (
                  <button type="button" onClick={() => { setLogoPreview(""); setValue("logoUrl", "") }}
                    className="text-xs text-red-500 hover:underline mt-1">
                    Quitar logo
                  </button>
                )}
              </div>
            </div>
          </div>


        </CardContent>
      </Card>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Toast de éxito */}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          ¡Configuración guardada exitosamente!
        </div>
      )}

      <Separator />

      {/* Botón de guardar */}
      <div className="flex justify-end pb-8">
        <Button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 min-h-[52px] px-8 gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  )
}
