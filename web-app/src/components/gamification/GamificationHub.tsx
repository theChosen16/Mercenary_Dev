'use client'

import { useState } from 'react'
import { StreakDisplay } from './StreakDisplay'
import { BadgeCollection } from './BadgeCollection'
import { DailyMissions } from './DailyMissions'
import { Leaderboard } from './Leaderboard'
import { SubscriptionPlans } from '../subscription/SubscriptionPlans'

interface GamificationHubProps {
  userId: string
}

export function GamificationHub({ userId }: GamificationHubProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'missions' | 'leaderboard' | 'subscription'>('overview')

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: '📊' },
    { id: 'badges', label: 'Logros', icon: '🏆' },
    { id: 'missions', label: 'Misiones', icon: '🎯' },
    { id: 'leaderboard', label: 'Ranking', icon: '👑' },
    { id: 'subscription', label: 'Premium', icon: '⭐' }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Centro de Gamificación
        </h1>
        <p className="text-gray-600">
          Completa trabajos, gana logros y sube en el ranking de mercenarios elite
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <StreakDisplay userId={userId} />
              <DailyMissions userId={userId} />
            </div>
            <div className="space-y-6">
              <Leaderboard className="h-fit" />
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BadgeCollection userId={userId} />
            </div>
            <div>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Próximos Logros</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl opacity-50">🔥</div>
                    <div>
                      <p className="font-medium text-gray-900">Constante</p>
                      <p className="text-sm text-gray-600">Completa 5 trabajos consecutivos</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl opacity-50">⭐</div>
                    <div>
                      <p className="font-medium text-gray-900">Dedicado</p>
                      <p className="text-sm text-gray-600">Completa 10 trabajos consecutivos</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'missions' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyMissions userId={userId} />
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recompensas XP</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Trabajo completado</span>
                  <span className="text-sm font-bold text-blue-600">+200 XP</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-900">Entrega temprana</span>
                  <span className="text-sm font-bold text-green-600">+75 XP</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-purple-900">Review 5 estrellas</span>
                  <span className="text-sm font-bold text-purple-600">+100 XP</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium text-yellow-900">Misión diaria</span>
                  <span className="text-sm font-bold text-yellow-600">+25-40 XP</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Leaderboard />
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Tu Posición</h3>
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-2xl font-bold text-gray-900 mb-1">#42</p>
                <p className="text-gray-600 mb-4">en el ranking general</p>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    ¡Completa más trabajos para subir en el ranking!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <SubscriptionPlans userId={userId} />
        )}
      </div>
    </div>
  )
}
