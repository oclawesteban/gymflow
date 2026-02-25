import { NextRequest, NextResponse } from "next/server"
import { getPortalSession, selfCheckIn } from "@/lib/actions/portal"

export async function POST(req: NextRequest) {
  // Leer cookie
  const token = req.cookies.get("portal_token")?.value
  if (!token) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
  }

  try {
    const { verifyPortalToken } = await import("@/lib/actions/portal")
    const session = await verifyPortalToken(token)
    if (!session) {
      return NextResponse.json({ success: false, error: "Sesión inválida" }, { status: 401 })
    }

    const result = await selfCheckIn(session.memberId)
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno"
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
