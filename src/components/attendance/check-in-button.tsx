"use client"

import { useState } from "react"
import { checkIn } from "@/lib/actions/attendance"
import { CheckCircle, Loader2 } from "lucide-react"

export function CheckInButton({
  memberId,
  memberName,
  photoUrl,
}: {
  memberId: string
  memberName: string
  photoUrl?: string
}) {
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  async function handleCheckIn() {
    if (loading || checked) return
    setLoading(true)
    try {
      await checkIn(memberId)
      setChecked(true)
      // Reset after 3 seconds
      setTimeout(() => setChecked(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckIn}
      disabled={loading}
      className={`
        relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all
        min-h-[90px] w-full touch-manipulation active:scale-95
        ${checked
          ? "border-green-400 bg-green-50 text-green-700"
          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-gray-700"
        }
      `}
    >
      <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-base flex-shrink-0">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={memberName} className="w-full h-full object-cover" />
        ) : (
          memberName.charAt(0).toUpperCase()
        )}
      </div>
      <span className="text-xs font-medium text-center leading-tight line-clamp-2">
        {memberName}
      </span>
      {loading && (
        <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        </div>
      )}
      {checked && (
        <div className="absolute top-1 right-1">
          <CheckCircle className="h-4 w-4 text-green-600" />
        </div>
      )}
    </button>
  )
}
