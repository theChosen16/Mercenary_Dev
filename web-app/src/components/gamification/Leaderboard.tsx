'use client'

import { useState, useEffect } from 'react'
import { AdvancedGamificationService } from '@/lib/gamification-advanced'

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatar?: string
  experience: number
  level: number
  streak: number
  completedJobs: number
}

interface LeaderboardProps {
  className?: string
}

export function Leaderboard({ className = '' }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [activeTab, setActiveTab] = useState<'xp' | 'streak' | 'completed_jobs'>('xp')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [activeTab])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const data = await AdvancedGamificationService.getLeaderboard(activeTab, 10)
      setLeaderboard(data)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 bg-yellow-50'
    if (rank === 2) return 'text-gray-600 bg-gray-50'
    if (rank === 3) return 'text-orange-600 bg-orange-50'
    return 'text-gray-700 bg-white'
  }

  const getTabLabel = (tab: string) => {
    const labels = {
      xp: 'Experiencia',
      streak: 'Rachas',
      completed_jobs: 'Trabajos'
    }
    return labels[tab as keyof typeof labels]
  }

  const getValueDisplay = (entry: LeaderboardEntry) => {
    switch (activeTab) {
      case 'xp':
        return `${entry.experience.toLocaleString()} XP`
      case 'streak':
        return `${entry.streak} trabajos`
      case 'completed_jobs':
        return `${entry.completedJobs} completados`
      default:
        return ''
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900 mb-3">Tabla de Líderes</h3>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {(['xp', 'streak', 'completed_jobs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-gray-50 ${getRankColor(entry.rank)}`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
                  <span className="text-sm font-bold">
                    {getRankIcon(entry.rank)}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 truncate">
                      {entry.name}
                    </p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Nv. {entry.level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {getValueDisplay(entry)}
                  </p>
                </div>

                {entry.rank <= 3 && (
                  <div className="text-2xl">
                    {entry.rank === 1 ? '👑' : entry.rank === 2 ? '⭐' : '🔥'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && leaderboard.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-gray-500">No hay datos disponibles</p>
            <p className="text-sm text-gray-400">¡Sé el primero en aparecer aquí!</p>
          </div>
        )}
      </div>
    </div>
  )
}
