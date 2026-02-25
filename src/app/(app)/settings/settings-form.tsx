"use client"

import { useState } from "react"
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
} from "lucide-react"

// Esquema de validación con Zod
const settingsSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  address: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  contactEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  description: z.string().optional(),
  logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
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

  const {
    register,
    handleSubmit,
    watch,
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
            <Label htmlFor="logoUrl">URL del Logo</Label>
            <Input
              id="logoUrl"
              type="url"
              placeholder="https://ejemplo.com/logo.png"
              className="min-h-[48px] text-base"
              {...register("logoUrl")}
              onChange={(e) => {
                register("logoUrl").onChange(e)
                setLogoPreview(e.target.value)
              }}
            />
            {errors.logoUrl && (
              <p className="text-sm text-red-600">{errors.logoUrl.message}</p>
            )}
          </div>

          {/* Preview del logo */}
          {(logoPreview || logoUrlValue) && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
              <div className="w-24 h-24 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoPreview || logoUrlValue}
                  alt="Logo preview"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = "none"
                  }}
                />
              </div>
            </div>
          )}
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
