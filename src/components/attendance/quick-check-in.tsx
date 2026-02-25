"use client"

import { useState } from "react"
import { checkIn } from "@/lib/actions/attendance"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Loader2, UserCheck } from "lucide-react"

type Member = { id: string; name: string }

export function QuickCheckIn({
  members,
  defaultMemberId,
}: {
  members: Member[]
  defaultMemberId?: string
}) {
  const [selectedMember, setSelectedMember] = useState(defaultMemberId ?? "")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedMember) {
      setError("Selecciona un miembro")
      return
    }
    setLoading(true)
    setError("")

    try {
      await checkIn(selectedMember, notes || undefined)
      const memberName = members.find(m => m.id === selectedMember)?.name ?? "Miembro"
      setSuccess(`✅ ${memberName} registrado exitosamente`)
      setNotes("")
      setTimeout(() => setSuccess(null), 4000)
    } catch (err: any) {
      setError(err.message ?? "Error al registrar entrada")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {success && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex-1">
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="min-h-[52px] text-base bg-white">
              <SelectValue placeholder="¿Quién llega?" />
            </SelectTrigger>
            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id} className="py-3 text-base">
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="submit"
          disabled={loading || !selectedMember}
          className="min-h-[52px] px-6 bg-green-600 hover:bg-green-700 gap-2 text-white"
        >
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <UserCheck className="h-5 w-5" />
          }
          <span className="hidden sm:inline">Registrar</span>
        </Button>
      </div>
      <Input
        placeholder="Nota opcional (ej: llegó tarde)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="bg-white min-h-[44px]"
      />
    </form>
  )
}
