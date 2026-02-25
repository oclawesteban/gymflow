"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { updateProfile, changePassword } from "@/lib/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Lock, Camera, Loader2, Check } from "lucide-react"
import { toast } from "sonner"

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
            {/* Avatar preview */}
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold select-none">
                    {initials}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-gray-100 border border-gray-200 rounded-full p-1">
                  <Camera className="h-3.5 w-3.5 text-gray-500" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="photoUrl">URL de foto de perfil</Label>
                <Input
                  id="photoUrl"
                  placeholder="https://ejemplo.com/foto.jpg"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="min-h-[44px] text-sm"
                />
                <p className="text-xs text-gray-400">
                  Pega la URL de tu imagen. Si está vacío, se mostrarán tus iniciales.
                </p>
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
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Tu contraseña actual"
                required
                className="min-h-[48px] text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
                className="min-h-[48px] text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                required
                className="min-h-[48px] text-base"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={savingPassword || (!!confirmPassword && newPassword !== confirmPassword)}
              variant="outline"
              className="w-full min-h-[48px] gap-2 border-orange-200 text-orange-700 hover:bg-orange-50"
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
