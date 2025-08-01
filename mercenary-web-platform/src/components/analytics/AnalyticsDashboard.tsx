'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, Users, Briefcase, DollarSign, 
  Clock, Star, Activity, Download, RefreshCw, Calendar,
  BarChart3, PieChart, LineChart, Target, Zap, Globe
} from 'lucide-react'
import { AnalyticsMetrics, AnalyticsService } from '@/lib/analytics'

interface AnalyticsDashboardProps {
  userId?: string
  isAdmin?: boolean
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  userId,
  isAdmin = false
}) => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d' | '1y'>('30d')
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'projects' | 'financial' | 'performance'>('overview')

  useEffect(() => {
    loadAnalytics()
    const interval = setInterval(loadRealTimeMetrics, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const data = await AnalyticsService.getDashboardMetrics(timeRange, userId)
      setMetrics(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRealTimeMetrics = async () => {
    try {
      const data = await AnalyticsService.getRealTimeMetrics()
      setRealTimeMetrics(data)
    } catch (error) {
      console.error('Error loading real-time metrics:', error)
    }
  }

  const downloadReport = async (type: 'users' | 'projects' | 'financial' | 'performance') => {
    try {
      const report = await AnalyticsService.generateReport(type, timeRange, 'csv')
      const blob = new Blob([report as string], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-report-${timeRange}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading report:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se pudieron cargar las métricas</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'Analytics Dashboard' : 'Mis Métricas'}
          </h1>
          <p className="text-gray-600 mt-1">
            Insights y métricas de rendimiento en tiempo real
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Seleccionar rango de tiempo"
          >
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>
          
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Real-time Metrics Bar */}
      {realTimeMetrics && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Métricas en Tiempo Real
            </h2>
            <div className="flex items-center space-x-2 text-sm opacity-90">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Actualizado hace {Math.floor((Date.now() - new Date(realTimeMetrics.timestamp).getTime()) / 1000)}s</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{realTimeMetrics.onlineUsers}</div>
              <div className="text-sm opacity-90">Usuarios Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{realTimeMetrics.activeUsers}</div>
              <div className="text-sm opacity-90">Usuarios Activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{realTimeMetrics.newProjectsLastHour}</div>
              <div className="text-sm opacity-90">Proyectos/Hora</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{realTimeMetrics.newApplicationsLastHour}</div>
              <div className="text-sm opacity-90">Aplicaciones/Hora</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatCurrency(realTimeMetrics.revenueToday)}</div>
              <div className="text-sm opacity-90">Ingresos Hoy</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Resumen', icon: BarChart3 },
            { id: 'users', label: 'Usuarios', icon: Users },
            { id: 'projects', label: 'Proyectos', icon: Briefcase },
            { id: 'financial', label: 'Financiero', icon: DollarSign },
            { id: 'performance', label: 'Rendimiento', icon: Zap }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.overview.totalUsers.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {metrics.overview.userGrowthRate >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  metrics.overview.userGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(metrics.overview.userGrowthRate)}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Proyectos</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.overview.totalProjects.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{metrics.overview.activeProjects} activos</span>
                  <span>•</span>
                  <span>{formatPercentage(metrics.overview.completionRate)} completados</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.overview.totalRevenue)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {metrics.overview.revenueGrowthRate >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  metrics.overview.revenueGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(metrics.overview.revenueGrowthRate)}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Promedio</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.overview.averageProjectValue)}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-600">Por proyecto</div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Projects by Category */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Proyectos por Categoría</h3>
                <PieChart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {metrics.projectMetrics.projectsByCategory.slice(0, 5).map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-blue-${(index + 1) * 100}`}></div>
                      <span className="text-sm font-medium text-gray-700">{category.category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{category.count}</span>
                      <span className="text-xs text-gray-500">({category.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue by Category */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Ingresos por Categoría</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {metrics.financialMetrics.revenueByCategory.slice(0, 5).map((category, index) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{category.category}</span>
                      <span className="text-sm text-gray-600">{formatCurrency(category.revenue)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-green-${(index + 1) * 100} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Métricas de Usuarios</h2>
            <button
              onClick={() => downloadReport('users')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Reporte</span>
            </button>
          </div>

          {/* User Growth Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nuevos Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.userMetrics.newUsersToday}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.userMetrics.newUsersThisWeek}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Este Mes</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.userMetrics.newUsersThisMonth}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Top Users Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Freelancers */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Top Freelancers</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {metrics.userMetrics.topFreelancers.slice(0, 5).map((freelancer, index) => (
                    <div key={freelancer.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{freelancer.name}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Star className="w-3 h-3 fill-current text-yellow-400" />
                            <span>{freelancer.rating.toFixed(1)}</span>
                            <span>•</span>
                            <span>{freelancer.completedProjects} proyectos</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(freelancer.totalEarnings)}</p>
                        <p className="text-sm text-gray-500">ganados</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Clients */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Top Clientes</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {metrics.userMetrics.topClients.slice(0, 5).map((client, index) => (
                    <div key={client.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-green-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{client.name}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Star className="w-3 h-3 fill-current text-yellow-400" />
                            <span>{client.rating.toFixed(1)}</span>
                            <span>•</span>
                            <span>{client.postedProjects} proyectos</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(client.totalSpent)}</p>
                        <p className="text-sm text-gray-500">invertidos</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Métricas de Rendimiento</h2>
            <button
              onClick={() => downloadReport('performance')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Reporte</span>
            </button>
          </div>

          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tiempo de Respuesta</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.performanceMetrics.averageResponseTime}ms</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
              <div className="mt-2">
                <div className="text-xs text-gray-500">Promedio del sistema</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.performanceMetrics.systemUptime}%</p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
              <div className="mt-2">
                <div className="text-xs text-gray-500">Disponibilidad del sistema</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa de Error</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.performanceMetrics.errorRate}%</p>
                </div>
                <Zap className="w-8 h-8 text-red-500" />
              </div>
              <div className="mt-2">
                <div className="text-xs text-gray-500">Errores del sistema</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Satisfacción</p>
                  <p className="text-2xl font-bold text-yellow-600">{metrics.performanceMetrics.userSatisfactionScore}/5</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="mt-2">
                <div className="text-xs text-gray-500">Puntuación promedio</div>
              </div>
            </div>
          </div>

          {/* Conversion Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasas de Conversión</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Búsqueda → Aplicación</span>
                  <span className="font-medium text-gray-900">{metrics.performanceMetrics.searchConversionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Aplicación → Aceptación</span>
                  <span className="font-medium text-gray-900">{metrics.performanceMetrics.applicationSuccessRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tasa de Rebote</span>
                  <span className="font-medium text-gray-900">{metrics.performanceMetrics.bounceRate}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tráfico Web</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Páginas Vistas</span>
                  <span className="font-medium text-gray-900">{metrics.performanceMetrics.pageViews.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Usuarios Únicos</span>
                  <span className="font-medium text-gray-900">{metrics.userMetrics.activeUsers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sesiones Promedio</span>
                  <span className="font-medium text-gray-900">2.4</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalyticsDashboard
