'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Award, 
  Zap,
  Crown,
  Target,
  Users,
  Calendar,
  Gift
} from 'lucide-react'

interface UserStats {
  totalProjects: number
  completedProjects: number
  totalEarnings: number
  averageRating: number
  totalReviews: number
  streakDays: number
  level: number
  experience: number
  nextLevelXP: number
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  points: number
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  unlockedAt?: string
}

interface LeaderboardEntry {
  userId: string
  user: {
    name: string
    avatar?: string
    isVerified: boolean
  }
  points: number
  level: number
  rank: number
}

export function GamificationDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboard'>('overview')

  useEffect(() => {
    if (session?.user?.id) {
      loadGamificationData()
    }
  }, [session?.user?.id])

  const loadGamificationData = async () => {
    setLoading(true)
    try {
      const [statsRes, achievementsRes, leaderboardRes] = await Promise.all([
        fetch('/api/v1/gamification/stats'),
        fetch('/api/v1/gamification/achievements'),
        fetch('/api/v1/gamification/leaderboard')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json()
        setAchievements(achievementsData)
      }

      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json()
        setLeaderboard(leaderboardData)
      }
    } catch (error) {
      console.error('Error loading gamification data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    const colors = {
      COMMON: 'bg-gray-100 text-gray-800 border-gray-300',
      RARE: 'bg-blue-100 text-blue-800 border-blue-300',
      EPIC: 'bg-purple-100 text-purple-800 border-purple-300',
      LEGENDARY: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    }
    return colors[rarity as keyof typeof colors] || colors.COMMON
  }

  const getProgressPercentage = () => {
    if (!stats) return 0
    return (stats.experience / stats.nextLevelXP) * 100
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const unlockedAchievements = achievements.filter(a => a.unlockedAt)
  const lockedAchievements = achievements.filter(a => !a.unlockedAt)
  const userRank = leaderboard.findIndex(entry => entry.userId === session?.user?.id) + 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Gamificación
          </h1>
          <p className="text-gray-600 mt-1">
            Tu progreso y logros en la plataforma
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('overview')}
          >
            Resumen
          </Button>
          <Button
            variant={activeTab === 'achievements' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('achievements')}
          >
            Logros
          </Button>
          <Button
            variant={activeTab === 'leaderboard' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('leaderboard')}
          >
            Ranking
          </Button>
        </div>
      </div>

      {activeTab === 'overview' && stats && (
        <>
          {/* Level and XP Card */}
          <Card className="bg-gradient-to-r from-primary/10 to-gold/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-6 w-6 text-yellow-500" />
                    Nivel {stats.level}
                  </CardTitle>
                  <CardDescription>
                    {stats.experience} / {stats.nextLevelXP} XP
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {stats.experience.toLocaleString()} XP
                  </div>
                  <div className="text-sm text-gray-600">
                    Faltan {(stats.nextLevelXP - stats.experience).toLocaleString()} XP
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={getProgressPercentage()} className="h-3" />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Nivel {stats.level}</span>
                <span>Nivel {stats.level + 1}</span>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proyectos Completados</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedProjects}</div>
                <p className="text-xs text-muted-foreground">
                  de {stats.totalProjects} totales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ganancias Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.totalEarnings.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ingresos acumulados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-1">
                  {stats.averageRating.toFixed(1)}
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalReviews} reseñas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Racha de Días</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.streakDays}</div>
                <p className="text-xs text-muted-foreground">
                  Días consecutivos activo
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Logros Recientes
              </CardTitle>
              <CardDescription>
                Tus últimos logros desbloqueados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unlockedAchievements.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aún no has desbloqueado logros</p>
                  <p className="text-sm">¡Completa proyectos para ganar tus primeros logros!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unlockedAchievements.slice(0, 6).map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <p className="text-sm opacity-80">{achievement.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {achievement.rarity}
                            </Badge>
                            <span className="text-xs">+{achievement.points} XP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-6">
          {/* Achievement Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Unlocked Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Logros Desbloqueados ({unlockedAchievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {unlockedAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-3 rounded-lg border ${getRarityColor(achievement.rarity)}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium">{achievement.name}</h4>
                          <p className="text-sm opacity-80">{achievement.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {achievement.rarity}
                            </Badge>
                            <span className="text-xs">+{achievement.points} XP</span>
                            {achievement.unlockedAt && (
                              <span className="text-xs text-gray-500">
                                {new Date(achievement.unlockedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Locked Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-gray-400" />
                  Próximos Logros ({lockedAchievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {lockedAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="p-3 rounded-lg border border-gray-200 bg-gray-50 opacity-75"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl grayscale">{achievement.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-700">{achievement.name}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {achievement.rarity}
                            </Badge>
                            <span className="text-xs text-gray-500">+{achievement.points} XP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          {/* User Rank Card */}
          {userRank > 0 && (
            <Card className="bg-gradient-to-r from-primary/10 to-gold/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Tu Posición en el Ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-primary">#{userRank}</div>
                    <p className="text-sm text-gray-600">de {leaderboard.length} usuarios</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {stats?.experience.toLocaleString()} XP
                    </div>
                    <div className="text-sm text-gray-600">
                      Nivel {stats?.level}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Ranking Global</CardTitle>
              <CardDescription>
                Los usuarios con más experiencia en la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.slice(0, 20).map((entry) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      entry.userId === session?.user?.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border">
                      <span className={`text-sm font-bold ${
                        entry.rank <= 3 ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {entry.rank <= 3 ? 
                          ['🥇', '🥈', '🥉'][entry.rank - 1] : 
                          `#${entry.rank}`
                        }
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.user.name}</span>
                        {entry.user.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            ✓ Verificado
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Nivel {entry.level}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">
                        {entry.points.toLocaleString()} XP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
