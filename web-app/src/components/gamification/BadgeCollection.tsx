'use client'

import { useState, useEffect } from 'react'
import { Badge, Achievement } from '@/types'

interface BadgeCollectionProps {
  userId: string
  className?: string
}

export function BadgeCollection({ userId, className = '' }: BadgeCollectionProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAchievements()
  }, [userId])

  const loadAchievements = async () => {
    try {
      const response = await fetch(`/api/v1/gamification/achievements?userId=${userId}`)
      const data = await response.json()
      setAchievements(data)
    } catch (error) {
      console.error('Error loading achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRarityColor = (rarity: Badge['rarity']) => {
    const colors = {
      common: 'bg-gray-100 text-gray-800 border-gray-300',
      rare: 'bg-blue-100 text-blue-800 border-blue-300',
      epic: 'bg-purple-100 text-purple-800 border-purple-300',
      legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    }
    return colors[rarity]
  }

  const getCategoryIcon = (category: Badge['category']) => {
    const icons = {
      STREAK: '🔥',
      COMPLETION: '✅',
      SPEED: '⚡',
      SOCIAL: '👥',
      SPECIAL: '⭐'
    }
    return icons[category]
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Logros Obtenidos</h3>
        <span className="text-sm text-gray-500">{achievements.length} logros</span>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-gray-500">Aún no tienes logros</p>
          <p className="text-sm text-gray-400">¡Completa trabajos para desbloquear badges!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`relative p-3 rounded-lg border-2 transition-transform hover:scale-105 ${getRarityColor(achievement.badge.rarity)}`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">
                  {achievement.badge.icon}
                </div>
                <h4 className="font-medium text-sm mb-1">
                  {achievement.badge.name}
                </h4>
                <p className="text-xs opacity-75">
                  {achievement.badge.description}
                </p>
              </div>
              
              {/* Category indicator */}
              <div className="absolute top-1 right-1 text-xs">
                {getCategoryIcon(achievement.badge.category)}
              </div>
              
              {/* Rarity indicator */}
              <div className="absolute bottom-1 right-1">
                <div className={`w-2 h-2 rounded-full ${
                  achievement.badge.rarity === 'legendary' ? 'bg-yellow-500' :
                  achievement.badge.rarity === 'epic' ? 'bg-purple-500' :
                  achievement.badge.rarity === 'rare' ? 'bg-blue-500' : 'bg-gray-400'
                }`}></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
