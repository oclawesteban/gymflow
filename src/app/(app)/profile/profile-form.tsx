"use client"

import { useState, useRef } from "react"
import { signOut } from "next-auth/react"
import { updateProfile, changePassword } from "@/lib/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Lock, Camera, Loader2, Check, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const MAX = 300
        const scale = Math.min(MAX / img.width, MAX / img.height, 1)
        const canvas = document.createElement("canvas")
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", 0.85))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

interface ProfileUser {
  id: string
  name: string | null
  email: string
  photoUrl: string | null
  bio: string | null
  phone: string | null
}

export function ProfileForm({ user }: { user: ProfileUser }) {
  const [name, setName] = useState(user.name ?? "")
  const [phone, setPhone] = useState(user.phone ?? "")
  const [bio, setBio] = useState(user.bio ?? "")
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl ?? "")
  const [savingProfile, setSavingProfile] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handlePhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { toast.error("Solo se permiten imágenes"); return }
    if (file.size > 5 * 1024 * 1024) { toast.error("La imagen no puede superar 5 MB"); return }
    try {
      const dataUrl = await resizeImageToDataUrl(file)
      setPhotoUrl(dataUrl)
      toast.success("Foto lista — guarda los cambios para aplicarla")
    } catch {
      toast.error("No se pudo procesar la imagen")
    }
  }

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)

  // Iniciales para avatar
  const initials = (name || user.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("El nombre es requerido")
      return
    }
    setSavingProfile(true)
    try {
      await updateProfile({ name: name.trim(), phone, bio, photoUrl })
      toast.success("Perfil actualizado correctamente")
    } catch (err: any) {
      toast.error(err.message ?? "Error al actualizar el perfil")
    } finally {
      setSavingProfile(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }
    setSavingPassword(true)
    try {
      const result = await changePassword(currentPassword, newPassword)
      toast.success("Contraseña cambiada. Redirigiendo al login...")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      // Cerrar sesión para forzar re-autenticación con la nueva contraseña
      if (result.requiresRelogin) {
        setTimeout(() => signOut({ callbackUrl: "/login" }), 1500)
      }
    } catch (err: any) {
      toast.error(err.message ?? "Error al cambiar la contraseña")
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── PERFIL ── */}
      <form onSubmit={handleProfileSave}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar — click para subir foto */}
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative flex-shrink-0 group focus:outline-none"
                title="Cambiar foto"
              >
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl}
                    alt={name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold select-none">
                    {initials}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoFile}
              />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Foto de perfil</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Haz clic en el avatar para subir una imagen (JPG, PNG — max 5 MB)
                </p>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl("")}
                    className="text-xs text-red-500 hover:underline mt-1"
                  >
                    Eliminar foto
                  </button>
                )}
              </div>
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre completo"
                required
                className="min-h-[48px] text-base"
              />
            </div>

            {/* Email (solo lectura) */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="min-h-[48px] text-base bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400">El correo no puede modificarse</p>
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: +57 310 123 4567"
                className="min-h-[48px] text-base"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (opcional)</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Cuéntanos algo sobre ti..."
                rows={3}
                className="text-base resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={savingProfile}
              className="w-full bg-blue-600 hover:bg-blue-700 min-h-[48px] gap-2"
            >
              {savingProfile ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {savingProfile ? "Guardando..." : "Guardar cambios"}
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* ── CAMBIAR CONTRASEÑA ── */}
      <form onSubmit={handlePasswordChange}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-5 w-5 text-orange-600" />
              Cambiar Contraseña
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Tu contraseña actual"
                  required
                  className="min-h-[48px] text-base pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  className="min-h-[48px] text-base pr-12"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  required
                  className="min-h-[48px] text-base pr-12"
                />
                {confirmPassword && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold ${newPassword === confirmPassword ? "text-green-600" : "text-red-500"}`}>
                    {newPassword === confirmPassword ? "✓" : "✗"}
                  </span>
                )}
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={savingPassword || (!!confirmPassword && newPassword !== confirmPassword)}
              variant="outline"
              className="w-full min-h-[48px] gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              {savingPassword ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {savingPassword ? "Cambiando..." : "Cambiar contraseña"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
