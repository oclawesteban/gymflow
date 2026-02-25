import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const { auth } = NextAuth(authConfig)

export const proxy = auth(function middleware(req: NextRequest & { auth: any }) {
  const { pathname } = req.nextUrl

  // ── Portal: proteger /portal/dashboard con cookie portal_token ────
  if (pathname.startsWith("/portal/dashboard")) {
    const portalToken = req.cookies.get("portal_token")?.value
    if (!portalToken) {
      return NextResponse.redirect(new URL("/portal/login", req.url))
    }
    return NextResponse.next()
  }

  // ── Portal login/register: si ya tiene token, redirigir ───────────
  if (pathname === "/portal/login" || pathname === "/portal/register") {
    const portalToken = req.cookies.get("portal_token")?.value
    if (portalToken) {
      return NextResponse.redirect(new URL("/portal/dashboard", req.url))
    }
    return NextResponse.next()
  }

  // El resto lo maneja el callback `authorized` en authConfig
  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon.*\\.png|icon\\.svg).*)",
  ],
}
