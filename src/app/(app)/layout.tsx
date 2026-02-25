import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { SessionProvider } from "next-auth/react"
import { InstallBanner } from "@/components/pwa/install-banner"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="md:ml-64 pt-16 md:pt-0">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            {children}
          </div>
        </main>
        {/* Banner de instalación PWA */}
        <InstallBanner />
      </div>
    </SessionProvider>
  )
}
