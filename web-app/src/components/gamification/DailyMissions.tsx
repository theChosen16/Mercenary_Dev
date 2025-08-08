'use client'

import { useState, useEffect } from 'react'
import { Mission } from '@/types'
import { AdvancedGamificationService } from '@/lib/gamification-advanced'

interface DailyMissionsProps {
  userId: string
  className?: string
}

export function DailyMissions({ userId, className = '' }: DailyMissionsProps) {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMissions()
  }, [userId])

  const loadMissions = async () => {
    try {
      const missionsData = await AdvancedGamificationService.generateDailyMissions(userId)
      setMissions(missionsData)
    } catch (error) {
      console.error('Error loading missions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMissionIcon = (type: Mission['type']) => {
    const icons = {
      DAILY: '📅',
      WEEKLY: '📊',
      MONTHLY: '🏆'
    }
    return icons[type]
  }

  const getTypeColor = (type: Mission['type']) => {
    const colors = {
      DAILY: 'bg-blue-100 text-blue-800',
      WEEKLY: 'bg-green-100 text-green-800',
      MONTHLY: 'bg-purple-100 text-purple-800'
    }
    return colors[type]
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expirada'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m restantes`
    }
    return `${minutes}m restantes`
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Misiones Diarias</h3>
        <span className="text-sm text-gray-500">
          {missions.filter(m => m.completed).length} / {missions.length} completadas
        </span>
      </div>

      <div className="space-y-3">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className={`p-3 rounded-lg border transition-all ${
              mission.completed 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="text-xl">
                  {mission.completed ? '✅' : getMissionIcon(mission.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className={`font-medium ${
                      mission.completed ? 'text-green-800' : 'text-gray-900'
                    }`}>
                      {mission.title}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(mission.type)}`}>
                      {mission.type}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    mission.completed ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {mission.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {getTimeRemaining(mission.expires_at)}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-yellow-600">⚡</span>
                      <span className="text-xs font-medium text-yellow-600">
                        +{mission.xp_reward} XP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {missions.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-gray-500">No hay misiones disponibles</p>
          <p className="text-sm text-gray-400">¡Vuelve mañana para nuevas misiones!</p>
        </div>
      )}
    </div>
  )
}
