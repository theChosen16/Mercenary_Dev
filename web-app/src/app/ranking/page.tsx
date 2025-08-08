'use client'

import React, { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  Trophy, 
  Star, 
  Medal,
  Crown,
  TrendingUp,
  Users,
  Award,
  Target
} from 'lucide-react'

// Mock ranking data
const mockRanking = [
  {
    id: '1',
    rank: 1,
    username: 'carlos_dev',
    level: 25,
    experience_points: 8500,
    rating: 4.9,
    projectsCompleted: 45,
    specialties: ['React', 'Node.js', 'AWS'],
    badges: ['legendary', 'epic', 'rare'],
    avatar: '👨‍💻',
    trend: 'up'
  },
  {
    id: '2',
    rank: 2,
    username: 'maria_design',
    level: 23,
    experience_points: 7800,
    rating: 4.8,
    projectsCompleted: 38,
    specialties: ['UI/UX', 'Figma', 'Branding'],
    badges: ['legendary', 'epic'],
    avatar: '👩‍🎨',
    trend: 'up'
  },
  {
    id: '3',
    rank: 3,
    username: 'juan_mobile',
    level: 22,
    experience_points: 7200,
    rating: 4.7,
    projectsCompleted: 32,
    specialties: ['Flutter', 'React Native', 'iOS'],
    badges: ['epic', 'rare'],
    avatar: '📱',
    trend: 'down'
  },
  {
    id: '4',
    rank: 4,
    username: 'ana_data',
    level: 21,
    experience_points: 6900,
    rating: 4.8,
    projectsCompleted: 29,
    specialties: ['Python', 'Machine Learning', 'SQL'],
    badges: ['epic', 'rare'],
    avatar: '📊',
    trend: 'up'
  },
  {
    id: '5',
    rank: 5,
    username: 'pedro_backend',
    level: 20,
    experience_points: 6500,
    rating: 4.6,
    projectsCompleted: 35,
    specialties: ['Java', 'Spring', 'Docker'],
    badges: ['rare', 'common'],
    avatar: '⚙️',
    trend: 'stable'
  }
]

const categories = [
  { id: 'general', name: 'General', icon: Trophy },
  { id: 'frontend', name: 'Frontend', icon: Star },
  { id: 'backend', name: 'Backend', icon: Target },
  { id: 'design', name: 'Diseño', icon: Award },
  { id: 'mobile', name: 'Móvil', icon: Users }
]

export default function RankingPage() {
  const [selectedCategory, setSelectedCategory] = useState('general')

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-gold-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'gold'
    if (rank <= 3) return 'secondary'
    if (rank <= 10) return 'outline'
    return 'outline'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">🏆 Ranking de Mercenarios</h1>
          <p className="text-muted-foreground">Los mejores freelancers de la plataforma</p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'gold' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {category.name}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Second Place */}
            <div className="md:order-1 flex flex-col items-center">
              <Card className="w-full text-center border-2 border-gray-300">
                <CardHeader className="pb-4">
                  <div className="text-4xl mb-2">{mockRanking[1].avatar}</div>
                  <Medal className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <CardTitle className="text-lg">{mockRanking[1].username}</CardTitle>
                  <Badge variant="secondary">Nivel {mockRanking[1].level}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Rating:</span>
                      <span className="font-medium">{mockRanking[1].rating} ⭐</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Proyectos:</span>
                      <span className="font-medium">{mockRanking[1].projectsCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>XP:</span>
                      <span className="font-medium">{mockRanking[1].experience_points}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* First Place */}
            <div className="md:order-2 flex flex-col items-center">
              <Card className="w-full text-center border-2 border-gold-500 bg-gradient-to-b from-gold-50 to-background">
                <CardHeader className="pb-4">
                  <div className="text-5xl mb-2">{mockRanking[0].avatar}</div>
                  <Crown className="h-10 w-10 text-gold-500 mx-auto mb-2" />
                  <CardTitle className="text-xl text-gold-700">{mockRanking[0].username}</CardTitle>
                  <Badge variant="gold">Nivel {mockRanking[0].level}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Rating:</span>
                      <span className="font-medium">{mockRanking[0].rating} ⭐</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Proyectos:</span>
                      <span className="font-medium">{mockRanking[0].projectsCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>XP:</span>
                      <span className="font-medium">{mockRanking[0].experience_points}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Third Place */}
            <div className="md:order-3 flex flex-col items-center">
              <Card className="w-full text-center border-2 border-amber-600">
                <CardHeader className="pb-4">
                  <div className="text-4xl mb-2">{mockRanking[2].avatar}</div>
                  <Medal className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">{mockRanking[2].username}</CardTitle>
                  <Badge variant="secondary">Nivel {mockRanking[2].level}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Rating:</span>
                      <span className="font-medium">{mockRanking[2].rating} ⭐</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Proyectos:</span>
                      <span className="font-medium">{mockRanking[2].projectsCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>XP:</span>
                      <span className="font-medium">{mockRanking[2].experience_points}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Full Ranking Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Ranking Completo
            </CardTitle>
            <CardDescription>
              Clasificación actualizada en tiempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRanking.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 ${
                    user.rank <= 3 ? 'bg-muted/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(user.rank)}
                    </div>
                    
                    <div className="text-3xl">{user.avatar}</div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{user.username}</h3>
                        <Badge variant={getRankBadge(user.rank)}>
                          Nivel {user.level}
                        </Badge>
                        {getTrendIcon(user.trend)}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        {user.specialties.slice(0, 3).map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current text-yellow-500" />
                          {user.rating}
                        </span>
                        <span>{user.projectsCompleted} proyectos</span>
                        <span>{user.experience_points} XP</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {user.badges.map((badge, index) => (
                      <Badge
                        key={index}
                        variant={
                          badge === 'legendary' ? 'gold' :
                          badge === 'epic' ? 'epic' :
                          badge === 'rare' ? 'rare' : 'common'
                        }
                        className="text-xs"
                      >
                        {badge === 'legendary' ? '👑' :
                         badge === 'epic' ? '💜' :
                         badge === 'rare' ? '💙' : '⚪'}
                      </Badge>
                    ))}
                    <Button variant="outline" size="sm">
                      Ver Perfil
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Button variant="outline">
                Cargar Más Resultados
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <Trophy className="h-8 w-8 text-gold-500 mx-auto mb-2" />
              <CardTitle>Top Performer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{mockRanking[0].username}</p>
              <p className="text-muted-foreground">Líder este mes</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <CardTitle>Mayor Crecimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">ana_data</p>
              <p className="text-muted-foreground">+3 posiciones</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle>Mercenarios Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-muted-foreground">En el ranking</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
