'use client'

import { useState, useEffect } from 'react'
import { UserStreak } from '@/types'
import { AdvancedGamificationService } from '@/lib/gamification-advanced'

interface StreakDisplayProps {
  userId: string
  className?: string
}

export function StreakDisplay({ userId, className = '' }: StreakDisplayProps) {
  const [streak, setStreak] = useState<UserStreak | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStreak()
  }, [userId])

  const loadStreak = async () => {
    try {
      const streakData = await AdvancedGamificationService.updateJobCompletionStreak(userId)
      setStreak(streakData)
    } catch (error) {
      console.error('Error loading streak:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg p-4 ${className}`}>
        <div className="h-4 bg-gray-300 rounded mb-2"></div>
        <div className="h-6 bg-gray-300 rounded"></div>
      </div>
    )
  }

  if (!streak) return null

  const getStreakColor = (current: number) => {
    if (current >= 20) return 'text-purple-600 bg-purple-100'
    if (current >= 10) return 'text-blue-600 bg-blue-100'
    if (current >= 5) return 'text-green-600 bg-green-100'
    return 'text-orange-600 bg-orange-100'
  }

  const getStreakIcon = (current: number) => {
    if (current >= 20) return '👑'
    if (current >= 10) return '🚀'
    if (current >= 5) return '🔥'
    return '⭐'
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Racha de Trabajos</h3>
        <span className="text-2xl">{getStreakIcon(streak.current_streak)}</span>
      </div>
      
      <div className="space-y-3">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStreakColor(streak.current_streak)}`}>
          <span className="mr-1">🔥</span>
          {streak.current_streak} trabajos consecutivos
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Mejor racha</p>
            <p className="font-semibold text-gray-900">{streak.longest_streak} trabajos</p>
          </div>
          <div>
            <p className="text-gray-500">Total completados</p>
            <p className="font-semibold text-gray-900">{streak.total_completed_jobs}</p>
          </div>
        </div>

        {streak.current_streak > 0 && (
          <div className="mt-3 p-2 bg-green-50 rounded-md">
            <p className="text-xs text-green-700">
              ¡Sigue así! Cada trabajo completado mantiene tu racha activa.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
