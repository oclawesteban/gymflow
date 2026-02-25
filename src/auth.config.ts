import type { NextAuthConfig } from "next-auth"

/**
 * Configuración base de NextAuth — Edge-compatible (sin Prisma, sin Node.js APIs).
 * Usada por middleware.ts para verificar sesiones en el Edge Runtime de Vercel.
 * La configuración completa (con PrismaAdapter y providers) está en auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      // Rutas públicas admin — siempre permitir
      const adminPublic = ["/login", "/register", "/forgot-password"]
      if (adminPublic.some((p) => pathname.startsWith(p))) return true

      // Rutas del portal — manejarlas como públicas aquí (usan su propia cookie)
      if (pathname.startsWith("/portal")) return true

      // Landing page y rutas estáticas
      if (pathname === "/" || pathname.startsWith("/api")) return true

      // Rutas de la app admin — requieren sesión
      const adminRoutes = [
        "/dashboard", "/members", "/plans", "/memberships", "/payments",
        "/attendance", "/reports", "/settings", "/calendar", "/classes",
        "/instructors", "/discounts", "/profile",
      ]
      if (adminRoutes.some((r) => pathname.startsWith(r))) {
        return isLoggedIn
      }

      return true
    },
  },
  providers: [], // Los providers se agregan en auth.ts (requieren Node.js)
} satisfies NextAuthConfig
