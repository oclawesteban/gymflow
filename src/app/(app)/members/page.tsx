import { getMembers } from "@/lib/actions/members"
import { formatDate, getMembershipStatusColor, getMembershipStatusLabel } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Plus, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { MembersSearch } from "@/components/members/members-search"

async function MembersList({ query }: { query?: string }) {
  const members = await getMembers(query ? { query } : undefined)

  if (members.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-10 w-10 text-blue-400" />
        </div>
        {query ? (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Sin resultados</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              No se encontraron miembros que coincidan con &ldquo;{query}&rdquo;.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Aún no hay miembros</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Comienza agregando el primer miembro de tu gimnasio.
            </p>
            <Link href="/members/new">
              <Button className="bg-blue-600 hover:bg-blue-700 min-h-[48px] px-6 gap-2">
                <Plus className="h-4 w-4" />
                Agregar Primer Miembro
              </Button>
            </Link>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member) => {
        const latestMembership = member.memberships[0]
        const statusColors = latestMembership
          ? getMembershipStatusColor(latestMembership.status, latestMembership.endDate)
          : null

        return (
          <Link key={member.id} href={`/members/${member.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg flex-shrink-0 overflow-hidden">
                    {member.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      member.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
                      {latestMembership && statusColors && (
                        <Badge className={`${statusColors.badge} text-xs flex-shrink-0 border`}>
                          {getMembershipStatusLabel(latestMembership.status)}
                        </Badge>
                      )}
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{member.phone}</span>
                      </div>
                    )}
                    {member.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500 truncate">{member.email}</span>
                      </div>
                    )}
                    {latestMembership && (
                      <p className="text-xs text-gray-400 mt-1">
                        Plan: {latestMembership.plan.name} · Vence: {formatDate(latestMembership.endDate)}
                      </p>
                    )}
                    {!latestMembership && (
                      <p className="text-xs text-orange-500 mt-1">Sin membresía</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Miembros</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestiona los miembros de tu gimnasio</p>
        </div>
        <Link href="/members/new">
          <Button className="bg-blue-600 hover:bg-blue-700 min-h-[48px] gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Miembro</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </Link>
      </div>

      {/* Campo de búsqueda */}
      <Suspense fallback={<div className="h-[44px] rounded-md bg-gray-100 animate-pulse" />}>
        <MembersSearch defaultValue={q ?? ""} />
      </Suspense>

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      }>
        <MembersList query={q} />
      </Suspense>
    </div>
  )
}
