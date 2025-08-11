'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DeviceInfo as APIDeviceInfo } from '@/lib/mobile-api'
import {
  Smartphone,
  Monitor,
  Briefcase,
  DollarSign,
  MessageCircle,
  Trophy,
  Activity,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react'

type ProjectItem = {
  id: string
  title: string
  budget: number
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED' | (string & {})
}

type AchievementItem = {
  id: string
  title: string
  description: string
  icon: string
}

interface MobileDashboardData {
  user: {
    id: string
    name: string
    email: string
    role: string
    profile?: unknown
  }
  projects: ProjectItem[]
  financial: {
    totalEarnings: number
    completedPayments: number
  }
  activity: {
    messagesCount: number
    notificationsCount: number
  }
  gamification: {
    xp: number
    level: number
    rank: number
    achievements: AchievementItem[]
  }
  lastUpdated: string
}

type DeviceInfoClient = Omit<APIDeviceInfo, 'lastSeen'> & {
  lastSeen?: string | Date
}

export default function UnifiedDashboard() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] =
    useState<MobileDashboardData | null>(null)
  const [devices, setDevices] = useState<DeviceInfoClient[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  // Detectar estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Cargar datos del dashboard
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/mobile/v1/dashboard', {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setDashboardData(result.data)
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar dispositivos registrados
  const loadDevices = useCallback(async () => {
    try {
      const response = await fetch('/api/mobile/v1/devices')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setDevices(result.data)
        }
      }
    } catch (error) {
      console.error('Error loading devices:', error)
    }
  }, [])

  // Obtener información del dispositivo actual
  const getCurrentDeviceInfo = useCallback((): DeviceInfoClient => {
    return {
      deviceId: `web-${navigator.userAgent.slice(-10)}`,
      platform: 'web',
      version: '1.0.0',
    }
  }, [])

  // Sincronizar datos
  const syncData = useCallback(async () => {
    try {
      setSyncing(true)
      const response = await fetch('/api/mobile/v1/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastSync,
          deviceInfo: getCurrentDeviceInfo(),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setLastSync(new Date().toISOString())
          await loadDashboardData() // Recargar dashboard después de sync
        }
      }
    } catch (error) {
      console.error('Error syncing data:', error)
    } finally {
      setSyncing(false)
    }
  }, [lastSync, loadDashboardData, getCurrentDeviceInfo])

  // Registrar dispositivo actual
  const registerCurrentDevice = useCallback(async () => {
    try {
      const deviceInfo = getCurrentDeviceInfo()
      await fetch('/api/mobile/v1/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          deviceInfo,
        }),
      })
    } catch (error) {
      console.error('Error registering device:', error)
    }
  }, [getCurrentDeviceInfo])

  // Cargar datos iniciales
  useEffect(() => {
    if (session?.user) {
      loadDashboardData()
      loadDevices()
      registerCurrentDevice()
    }
  }, [session, loadDashboardData, loadDevices, registerCurrentDevice])

  // Auto-sync cada 5 minutos si está online
  useEffect(() => {
    if (!isOnline || !session?.user) return

    const interval = setInterval(
      () => {
        syncData()
      },
      5 * 60 * 1000
    ) // 5 minutos

    return () => clearInterval(interval)
  }, [isOnline, session, lastSync, syncData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              No se pudieron cargar los datos del dashboard
            </p>
            <Button onClick={loadDashboardData} className="w-full mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header con estado de conexión */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Unificado</h1>
          <p className="text-gray-600">
            Sincronización móvil/web en tiempo real
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <span
              className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}
            >
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <Button
            onClick={syncData}
            disabled={syncing || !isOnline}
            size="sm"
            variant="outline"
          >
            {syncing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sincronizar
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Proyectos Activos
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.projects.filter(p => p.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              +
              {
                dashboardData.projects.filter(p => p.status === 'PENDING')
                  .length
              }{' '}
              pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ganancias Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardData.financial.totalEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.financial.completedPayments} pagos completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.activity.messagesCount}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nivel XP</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Nivel {dashboardData.gamification.level}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.gamification.xp} XP • Rank #
              {dashboardData.gamification.rank}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de contenido */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
          <TabsTrigger value="sync">Sincronización</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Proyectos recientes */}
            <Card>
              <CardHeader>
                <CardTitle>Proyectos Recientes</CardTitle>
                <CardDescription>
                  Últimos proyectos actualizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.projects.slice(0, 5).map(project => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-gray-500">
                          ${project.budget}
                        </p>
                      </div>
                      <Badge
                        variant={
                          project.status === 'ACTIVE'
                            ? 'default'
                            : project.status === 'COMPLETED'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Logros */}
            <Card>
              <CardHeader>
                <CardTitle>Logros Recientes</CardTitle>
                <CardDescription>Tus últimos achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.gamification.achievements.map(achievement => (
                    <div
                      key={achievement.id}
                      className="flex items-center space-x-3"
                    >
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-sm text-gray-500">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dispositivos Registrados</CardTitle>
              <CardDescription>
                Gestiona tus dispositivos conectados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.map(device => (
                  <div
                    key={device.deviceId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {device.platform === 'web' ? (
                        <Monitor className="h-5 w-5" />
                      ) : (
                        <Smartphone className="h-5 w-5" />
                      )}
                      <div>
                        <p className="font-medium capitalize">
                          {device.platform}
                        </p>
                        <p className="text-sm text-gray-500">
                          Última actividad:{' '}
                          {device.lastSeen
                            ? new Date(device.lastSeen).toLocaleDateString()
                            : 'Nunca'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {device.platform === 'web' ? 'Web' : 'Móvil'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Sincronización</CardTitle>
              <CardDescription>
                Información sobre la sincronización de datos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Última sincronización:</span>
                <span className="text-sm text-gray-500">
                  {lastSync ? new Date(lastSync).toLocaleString() : 'Nunca'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Estado de conexión:</span>
                <Badge variant={isOnline ? 'default' : 'destructive'}>
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Sincronización automática:</span>
                <Badge variant="secondary">Cada 5 minutos</Badge>
              </div>
              <Button onClick={syncData} disabled={syncing} className="w-full">
                {syncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Centro de Notificaciones</CardTitle>
              <CardDescription>Notificaciones cross-platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span>Notificaciones no leídas:</span>
                <Badge variant="destructive">
                  {dashboardData.activity.notificationsCount}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notificaciones web:</span>
                  <Badge variant="outline">Habilitadas</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notificaciones móviles:</span>
                  <Badge variant="outline">Habilitadas</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notificaciones email:</span>
                  <Badge variant="outline">Habilitadas</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer con información de última actualización */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Última actualización:{' '}
              {new Date(dashboardData.lastUpdated).toLocaleString()}
            </span>
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Sistema activo</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
