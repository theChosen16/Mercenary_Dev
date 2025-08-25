'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Bell, User, LogOut, Settings, Trophy } from 'lucide-react'

interface HeaderProps {
  user?: {
    id: string
    username: string
    level: number
    experience_points: number
    profile_picture?: string
    updated_at?: string
  }
  isAuthenticated?: boolean
}

export function Header({ user, isAuthenticated = false }: HeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    // Implement logout logic
    router.push('/login')
  }

  const buildCacheBustedSrc = (src: string, version?: string) => {
    if (!version) return src
    const sep = src.includes('?') ? '&' : '?'
    return `${src}${sep}v=${encodeURIComponent(version)}`
  }

  // Support both snake_case and camelCase timestamp fields
  const imageVersion = (user as any)?.updated_at || (user as any)?.updatedAt

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">M</span>
          </div>
          <span className="font-bold text-xl">Mercenarius</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/projects" className="text-sm font-medium hover:text-primary transition-colors">
            Proyectos
          </Link>
          <Link href="/freelancers" className="text-sm font-medium hover:text-primary transition-colors">
            Mercenarios
          </Link>
          <Link href="/ranking" className="text-sm font-medium hover:text-primary transition-colors">
            Ranking
          </Link>
          <Link href="/how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
            Cómo Funciona
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {isAuthenticated && user ? (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>

              {/* User Level */}
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-gold-500" />
                <Badge variant="gold">Nivel {user.level}</Badge>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  {user.profile_picture ? (
                    <img 
                      key={imageVersion || user.profile_picture}
                      src={buildCacheBustedSrc(user.profile_picture, imageVersion)} 
                      alt={user.username}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>
                <span className="text-sm font-medium">{user.username}</span>
              </div>

              {/* Settings */}
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>

              {/* Logout */}
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button variant="gold" onClick={() => window.location.href='/register'}>
                Registrarse
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
