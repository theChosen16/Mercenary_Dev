import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthConfig, Session, User } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import type { UserRole } from '@prisma/client'

type ExtendedToken = JWT & {
  id?: string
  userId?: string
  name?: string
  role?: UserRole
}

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Simplified auth for testing - replace with real DB logic later
        if (
          credentials.email === 'test@test.com' &&
          credentials.password === 'password'
        ) {
          const u: Partial<User> & { role: UserRole } = {
            id: '1',
            email: credentials.email as string,
            name: 'Test User',
            role: 'CLIENT' as UserRole,
          }
          return u as User
        }

        return null
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User | null }) {
      const t = token as ExtendedToken
      if (user) {
        // Persist useful fields in the JWT
        const u = user as Partial<User> & { id?: string; role?: UserRole }
        t.id = u.id
        t.userId = u.id
        t.role = u.role
        if (u.email) token.email = u.email
        t.name = u.name ?? t.name
      }
      return t
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        const t = token as ExtendedToken
        session.user.id = t.userId ?? t.id ?? session.user.id
        if (token.email) session.user.email = token.email
        if (t.name) session.user.name = t.name
        if (t.role)
          (session.user as unknown as { role?: UserRole }).role = t.role
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/auth/error',
  },

  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  debug: process.env.NODE_ENV === 'development',
}

// NextAuth v5 helpers: route handlers and auth() helper for server components and route handlers
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
