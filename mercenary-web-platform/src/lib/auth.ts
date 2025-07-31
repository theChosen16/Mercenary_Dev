import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { Role } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // GitHub OAuth Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    
    // Email/Password Provider
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { profile: true }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.role = user.role
        token.userId = user.id
      }
      
      // OAuth sign in
      if (account && user) {
        // Create or update user profile for OAuth users
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { profile: true }
        })
        
        if (existingUser && !existingUser.profile) {
          await prisma.profile.create({
            data: {
              userId: existingUser.id,
              bio: `${existingUser.role === 'CLIENT' ? 'Cliente' : 'Freelancer'} en Mercenary`,
            }
          })
        }
      }
      
      return token
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string
        session.user.role = token.role as Role
      }
      return session
    },
    
    async signIn({ account }) {
      // Allow OAuth sign ins
      if (account?.provider !== "credentials") {
        return true
      }
      
      // Allow credentials sign in
      return true
    }
  },
  
  pages: {
    signIn: "/login",
    signUp: "/register",
    error: "/auth/error",
  },
  
  events: {
    async createUser({ user }) {
      // Create default profile for new users
      await prisma.profile.create({
        data: {
          userId: user.id,
          bio: `${user.role === 'CLIENT' ? 'Cliente' : 'Freelancer'} en Mercenary`,
        }
      })
    }
  },
  
  debug: process.env.NODE_ENV === "development",
}
