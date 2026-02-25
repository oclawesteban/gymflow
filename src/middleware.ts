import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth(function middleware(req: NextRequest & { auth: any }) {
  const { pathname } = req.nextUrl

  // ── Portal: verificar cookie portal_token ─────────────────────────
  // La verificación criptográfica completa ocurre en el page/server action.
  // Aquí solo validamos que el token existe para protección edge.
  if (pathname.startsWith("/portal/dashboard")) {
    const portalToken = req.cookies.get("portal_token")?.value
    if (!portalToken) {
      return NextResponse.redirect(new URL("/portal/login", req.url))
    }
    return NextResponse.next()
  }

  // ── Portal login/register: si ya tiene sesión de portal, redirigir ─
  if (pathname === "/portal/login" || pathname === "/portal/register") {
    const portalToken = req.cookies.get("portal_token")?.value
    if (portalToken) {
      return NextResponse.redirect(new URL("/portal/dashboard", req.url))
    }
    return NextResponse.next()
  }

  // El resto (rutas admin) lo maneja el callback `authorized` en authConfig
  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Ejecutar middleware en todas las rutas excepto:
     * - _next/static, _next/image (assets)
     * - favicon, manifest, íconos
     * - api/auth (NextAuth handlers)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon.*\\.png|icon\\.svg|api/auth).*)",
  ],
}
