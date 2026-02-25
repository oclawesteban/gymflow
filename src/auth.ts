import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { authConfig } from "./auth.config"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 horas
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.photoUrl = (user as any).photoUrl ?? null
        token.name = user.name
        // Guardar timestamp de última cambio de contraseña al emitir el token
        token.passwordChangedAt = (user as any).passwordChangedAt?.getTime() ?? null
      }
      // Actualizar token cuando se llama update()
      if (trigger === "update" && session) {
        token.name = session.name ?? token.name
        token.photoUrl = session.photoUrl ?? token.photoUrl
      }
      // Validar que el token no fue emitido antes de un cambio de contraseña
      if (token.passwordChangedAt && token.iat) {
        const tokenIssuedAt = (token.iat as number) * 1000
        if (tokenIssuedAt < (token.passwordChangedAt as number)) {
          // Token viejo — forzar re-login devolviendo token vacío
          return null as any
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
        ;(session.user as any).photoUrl = token.photoUrl ?? null
      }
      return session
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (!user || !user.password) return null

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return user
      },
    }),
  ],
})
