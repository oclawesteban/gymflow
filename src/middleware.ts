import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rutas del portal socio — protegidas con cookie portal_token
const PORTAL_PROTECTED = ["/portal/dashboard"]

// Rutas admin — protegidas con sesión NextAuth
const ADMIN_PUBLIC = ["/login", "/register", "/forgot-password"]
const PORTAL_PUBLIC = ["/portal/login", "/portal/register"]

export default auth(async function middleware(req: NextRequest & { auth: any }) {
  const { pathname } = req.nextUrl

  // ── Portal: verificar cookie portal_token ─────────────────────────
  if (PORTAL_PROTECTED.some((p) => pathname.startsWith(p))) {
    const portalToken = req.cookies.get("portal_token")?.value
    if (!portalToken) {
      return NextResponse.redirect(new URL("/portal/login", req.url))
    }
    // La verificación criptográfica completa ocurre en el page/server action
    // Aquí solo validamos que el token existe (protección edge)
    return NextResponse.next()
  }

  // ── Portal público: si ya tiene sesión, redirigir al dashboard ────
  if (PORTAL_PUBLIC.some((p) => pathname.startsWith(p))) {
    const portalToken = req.cookies.get("portal_token")?.value
    if (portalToken) {
      return NextResponse.redirect(new URL("/portal/dashboard", req.url))
    }
    return NextResponse.next()
  }

  // ── Admin público: permitir sin sesión ────────────────────────────
  if (ADMIN_PUBLIC.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // ── Admin app (/dashboard, /members, etc.) ────────────────────────
  // Las rutas bajo /(app) ya verifican sesión en layout, pero el
  // middleware agrega protección edge antes del render.
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/members") ||
    pathname.startsWith("/plans") ||
    pathname.startsWith("/memberships") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/attendance") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/classes") ||
    pathname.startsWith("/instructors") ||
    pathname.startsWith("/discounts") ||
    pathname.startsWith("/profile")
  ) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Ejecutar middleware en todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, manifest, íconos
     * - API routes de auth (manejadas por NextAuth)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon.*\\.png|icon\\.svg|api/auth).*)",
  ],
}
