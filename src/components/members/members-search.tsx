"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useTransition, useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function MembersSearch({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState(defaultValue)
  const [isPending, startTransition] = useTransition()

  // Debounce the search to avoid too many navigation calls
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams()
      if (query.trim()) {
        params.set("q", query.trim())
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    }, 400)
    return () => clearTimeout(timeout)
  }, [query, pathname, router])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="search"
        placeholder="Buscar por nombre, teléfono o email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9 min-h-[44px]"
        aria-label="Buscar miembros"
      />
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-3 w-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  )
}
