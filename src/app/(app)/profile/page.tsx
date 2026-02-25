import { getProfile } from "@/lib/actions/profile"
import { ProfileForm } from "./profile-form"

export default async function ProfilePage() {
  const user = await getProfile()

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mi Perfil</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Gestiona tu información personal y seguridad
        </p>
      </div>
      <ProfileForm user={user} />
    </div>
  )
}
