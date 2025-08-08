'use client'

import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

interface MainLayoutProps {
  children: React.ReactNode
  user?: {
    id: string
    username: string
    level: number
    experience_points: number
    profile_picture?: string
  }
  isAuthenticated?: boolean
}

export function MainLayout({ children, user, isAuthenticated = false }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} isAuthenticated={isAuthenticated} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
