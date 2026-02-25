import { NextRequest, NextResponse } from "next/server"
import { loginMemberPortal, registerMemberPortal } from "@/lib/actions/portal"

// Duración de la cookie: 7 días
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    if (action === "login") {
      const { email, password } = body
      const result = await loginMemberPortal(email, password)

      if (!result.success || !result.token) {
        return NextResponse.json({ success: false, error: result.error }, { status: 401 })
      }

      const response = NextResponse.json({ success: true })
      response.cookies.set("portal_token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      })

      return response
    }

    if (action === "register") {
      const { email, password, gymCode } = body
      const result = await registerMemberPortal(email, password, gymCode)

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 })
      }

      return NextResponse.json({ success: true })
    }

    if (action === "logout") {
      const response = NextResponse.json({ success: true })
      response.cookies.delete("portal_token")
      return response
    }

    return NextResponse.json({ success: false, error: "Acción no válida" }, { status: 400 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno"
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
