'use client'

import { useState, useEffect } from 'react'
import { SubscriptionPlan, UserLimits } from '@/types'
import { AdvancedGamificationService } from '@/lib/gamification-advanced'

interface SubscriptionPlansProps {
  userId: string
  className?: string
}

export function SubscriptionPlans({ userId, className = '' }: SubscriptionPlansProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [userLimits, setUserLimits] = useState<UserLimits | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [userId])

  const loadData = async () => {
    try {
      const [plansData, limitsData] = await Promise.all([
        AdvancedGamificationService.getSubscriptionPlans(),
        AdvancedGamificationService.getUserLimits(userId)
      ])
      setPlans(plansData)
      setUserLimits(limitsData)
    } catch (error) {
      console.error('Error loading subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Gratis'
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const getPlanColor = (planId: string) => {
    const colors = {
      free: 'border-gray-200 bg-white',
      pro: 'border-blue-200 bg-blue-50',
      elite: 'border-purple-200 bg-purple-50'
    }
    return colors[planId as keyof typeof colors] || colors.free
  }

  const getFeatureIcon = (available: boolean) => {
    return available ? '✅' : '❌'
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Planes de Suscripción
        </h2>
        <p className="text-gray-600">
          Amplía tus límites y accede a funciones premium
        </p>
      </div>

      {/* Current Usage */}
      {userLimits && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Tu Uso Actual</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Trabajos Activos</p>
              <p className="font-semibold">
                {userLimits.current_active_jobs} / {userLimits.max_active_jobs === -1 ? '∞' : userLimits.max_active_jobs}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Publicaciones Activas</p>
              <p className="font-semibold">
                {userLimits.current_job_posts} / {userLimits.max_job_posts === -1 ? '∞' : userLimits.max_job_posts}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-lg border-2 p-6 ${getPlanColor(plan.id)}`}
          >
            {plan.id === 'pro' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Más Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {formatPrice(plan.price, plan.currency)}
              </div>
              <p className="text-gray-600 text-sm">
                {plan.price > 0 ? `por ${plan.interval === 'monthly' ? 'mes' : 'año'}` : 'para siempre'}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span>Trabajos simultáneos</span>
                <span className="font-semibold">
                  {plan.features.max_active_jobs === -1 ? 'Ilimitados' : plan.features.max_active_jobs}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Publicaciones activas</span>
                <span className="font-semibold">
                  {plan.features.max_job_posts === -1 ? 'Ilimitadas' : plan.features.max_job_posts}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span>Perfiles detallados</span>
                <span>{getFeatureIcon(plan.features.detailed_profiles)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span>Acceso a redes sociales</span>
                <span>{getFeatureIcon(plan.features.social_links_access)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span>Soporte prioritario</span>
                <span>{getFeatureIcon(plan.features.priority_support)}</span>
              </div>

              {plan.features.reduced_fees > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span>Descuento en comisiones</span>
                  <span className="font-semibold text-green-600">
                    -{plan.features.reduced_fees}%
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span>Analytics avanzados</span>
                <span>{getFeatureIcon(plan.features.advanced_analytics)}</span>
              </div>
            </div>

            <button
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                plan.id === 'free'
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : plan.id === 'pro'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
              onClick={() => {
                if (plan.id !== 'free') {
                  // Handle subscription upgrade
                  console.log('Upgrade to:', plan.id)
                }
              }}
            >
              {plan.id === 'free' ? 'Plan Actual' : 'Actualizar Plan'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Todos los planes incluyen acceso completo a la plataforma base.
          <br />
          Puedes cancelar tu suscripción en cualquier momento.
        </p>
      </div>
    </div>
  )
}
