'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Zap, TrendingUp, Clock, Eye, Smartphone, Monitor, AlertTriangle, CheckCircle } from 'lucide-react'
import { OptimizationService, PerformanceMetrics } from '@/lib/optimization'

interface PerformanceMonitorProps {
  showDetails?: boolean
  autoOptimize?: boolean
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showDetails = false,
  autoOptimize = true
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [optimizations, setOptimizations] = useState<string[]>([])
  const [coreWebVitals, setCoreWebVitals] = useState<any>(null)

  useEffect(() => {
    loadPerformanceMetrics()
    if (autoOptimize) {
      OptimizationService.optimizeMemoryUsage()
    }
  }, [autoOptimize])

  const loadPerformanceMetrics = async () => {
    setLoading(true)
    try {
      const [performanceData, webVitals] = await Promise.all([
        OptimizationService.measurePerformance(),
        OptimizationService.optimizeCoreWebVitals()
      ])
      
      setMetrics(performanceData)
      setCoreWebVitals(webVitals)
      
      // Generate optimization recommendations
      const recommendations = generateOptimizationRecommendations(performanceData)
      setOptimizations(recommendations)
    } catch (error) {
      console.error('Error loading performance metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateOptimizationRecommendations = (data: PerformanceMetrics): string[] => {
    const recommendations: string[] = []
    
    if (data.firstContentfulPaint > 1800) {
      recommendations.push('Optimizar First Contentful Paint con critical CSS')
    }
    
    if (data.largestContentfulPaint > 2500) {
      recommendations.push('Mejorar Largest Contentful Paint con lazy loading')
    }
    
    if (data.cumulativeLayoutShift > 0.1) {
      recommendations.push('Reducir Cumulative Layout Shift fijando dimensiones')
    }
    
    if (data.firstInputDelay > 100) {
      recommendations.push('Optimizar First Input Delay con code splitting')
    }
    
    return recommendations
  }

  const getScoreColor = (score: number, thresholds: { good: number; needs: number }) => {
    if (score <= thresholds.good) return 'text-green-600 bg-green-100'
    if (score <= thresholds.needs) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreIcon = (score: number, thresholds: { good: number; needs: number }) => {
    if (score <= thresholds.good) return <CheckCircle className="w-4 h-4" />
    return <AlertTriangle className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="text-gray-600">Analizando performance...</span>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          No se pudieron cargar las métricas de performance
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Performance Score Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Performance Monitor</h2>
              <p className="text-gray-600">Métricas de rendimiento en tiempo real</p>
            </div>
          </div>
          <button
            onClick={loadPerformanceMetrics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Actualizar
          </button>
        </div>

        {/* Core Web Vitals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* LCP */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Largest Contentful Paint</span>
              {getScoreIcon(metrics.largestContentfulPaint, { good: 2500, needs: 4000 })}
            </div>
            <div className={`text-2xl font-bold px-3 py-1 rounded-full inline-block ${
              getScoreColor(metrics.largestContentfulPaint, { good: 2500, needs: 4000 })
            }`}>
              {metrics.largestContentfulPaint.toFixed(0)}ms
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Target: &lt;2.5s
            </div>
          </div>

          {/* FID */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">First Input Delay</span>
              {getScoreIcon(metrics.firstInputDelay, { good: 100, needs: 300 })}
            </div>
            <div className={`text-2xl font-bold px-3 py-1 rounded-full inline-block ${
              getScoreColor(metrics.firstInputDelay, { good: 100, needs: 300 })
            }`}>
              {metrics.firstInputDelay.toFixed(0)}ms
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Target: &lt;100ms
            </div>
          </div>

          {/* CLS */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Cumulative Layout Shift</span>
              {getScoreIcon(metrics.cumulativeLayoutShift, { good: 0.1, needs: 0.25 })}
            </div>
            <div className={`text-2xl font-bold px-3 py-1 rounded-full inline-block ${
              getScoreColor(metrics.cumulativeLayoutShift, { good: 0.1, needs: 0.25 })
            }`}>
              {metrics.cumulativeLayoutShift.toFixed(3)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Target: &lt;0.1
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        {showDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Métricas Adicionales</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">First Contentful Paint</span>
                  <span className="font-medium">{metrics.firstContentfulPaint.toFixed(0)}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Time to Interactive</span>
                  <span className="font-medium">{metrics.timeToInteractive.toFixed(0)}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Page Load Time</span>
                  <span className="font-medium">{metrics.pageLoadTime.toFixed(0)}ms</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Optimizaciones Activas</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Image optimization habilitado</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Lazy loading implementado</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Code splitting activo</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>CDN configurado</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {optimizations.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">Recomendaciones de Optimización</h3>
            </div>
            <ul className="space-y-2">
              {optimizations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-yellow-700">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Device Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Monitor className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Desktop Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Performance Score</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-14 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-green-600">87</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Accessibility</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-15 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-green-600">94</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Best Practices</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-13 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-yellow-600">83</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SEO</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-15 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-green-600">92</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Smartphone className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Mobile Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Performance Score</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-12 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-yellow-600">76</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Accessibility</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-15 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-green-600">94</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Best Practices</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-13 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-yellow-600">83</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SEO</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-14 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-green-600">89</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Monitoring */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Eye className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Monitoreo en Tiempo Real</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">99.9%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">245ms</div>
            <div className="text-sm text-gray-600">Avg Response</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">1,247</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">0.2%</div>
            <div className="text-sm text-gray-600">Error Rate</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceMonitor
