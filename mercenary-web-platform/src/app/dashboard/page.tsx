'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  Trophy, 
  Star, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Clock,
  MessageSquare,
  Bell,
  Award,
  Target
} from 'lucide-react'

// Mock user data
const mockUser = {
  id: '1',
  username: 'juan_dev',
  level: 15,
  experience_points: 2450,
  profile_picture: undefined,
  stats: {
    projectsCompleted: 23,
    totalEarnings: 125000,
    rating: 4.8,
    responseTime: '2h',
    successRate: 96
  },
  badges: [
    { id: '1', name: 'Desarrollador Full Stack', rarity: 'epic', icon: '💻' },
    { id: '2', name: 'Entrega Rápida', rarity: 'rare', icon: '⚡' },
    { id: '3', name: 'Cliente Satisfecho', rarity: 'legendary', icon: '⭐' }
  ],
  recentProjects: [
    { id: '1', title: 'E-commerce React', status: 'completed', earnings: 15000, client: 'TechCorp' },
    { id: '2', title: 'API REST Node.js', status: 'in_progress', earnings: 8000, client: 'StartupXYZ' },
    { id: '3', title: 'Landing Page', status: 'pending', earnings: 5000, client: 'Marketing Pro' }
  ]
}

export default function DashboardPage() {
  return (
    <MainLayout user={mockUser} isAuthenticated={true}>
      <div className="container mx-auto py-8 px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">¡Bienvenido de vuelta, {mockUser.username}!</h1>
          <p className="text-muted-foreground">Aquí tienes un resumen de tu actividad reciente</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proyectos Completados</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockUser.stats.projectsCompleted}</div>
              <p className="text-xs text-muted-foreground">+2 este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ganancias Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockUser.stats.totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+15% vs mes anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating Promedio</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockUser.stats.rating}</div>
              <p className="text-xs text-muted-foreground">Excelente desempeño</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nivel Actual</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Nivel {mockUser.level}</div>
              <p className="text-xs text-muted-foreground">{mockUser.experience_points} XP</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Proyectos Recientes
                </CardTitle>
                <CardDescription>
                  Tus últimos proyectos y su estado actual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUser.recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{project.title}</h4>
                        <p className="text-sm text-muted-foreground">Cliente: {project.client}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge 
                          variant={
                            project.status === 'completed' ? 'success' : 
                            project.status === 'in_progress' ? 'warning' : 'outline'
                          }
                        >
                          {project.status === 'completed' ? 'Completado' : 
                           project.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                        </Badge>
                        <span className="font-medium">${project.earnings.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    Ver Todos los Proyectos
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Rendimiento Mensual
                </CardTitle>
                <CardDescription>
                  Tu progreso en los últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Gráfico de rendimiento</p>
                    <p className="text-sm text-muted-foreground">Próximamente disponible</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Level Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Progreso de Nivel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Nivel {mockUser.level}</span>
                    <span className="text-sm text-muted-foreground">
                      {mockUser.experience_points}/3000 XP
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(mockUser.experience_points / 3000) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {3000 - mockUser.experience_points} XP para el siguiente nivel
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Badges Recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockUser.badges.map((badge) => (
                    <div key={badge.id} className="flex items-center gap-3">
                      <div className="text-2xl">{badge.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{badge.name}</p>
                        <Badge 
                          variant={
                            badge.rarity === 'legendary' ? 'gold' :
                            badge.rarity === 'epic' ? 'epic' :
                            badge.rarity === 'rare' ? 'rare' : 'common'
                          }
                          className="text-xs"
                        >
                          {badge.rarity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Ver Todos los Badges
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Mensajes (3)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Notificaciones (5)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Buscar Proyectos
                </Button>
                <Button variant="gold" className="w-full justify-start">
                  <Trophy className="mr-2 h-4 w-4" />
                  Ver Ranking
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
