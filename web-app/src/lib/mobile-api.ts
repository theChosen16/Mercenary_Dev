import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import {
  ProjectStatus,
  TransactionStatus,
  TransactionType,
} from '@prisma/client'

export interface MobileAPIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
  version: string
}

export interface MobileSyncData {
  users: {
    lastSync: string
    data: unknown[]
  }
  projects: {
    lastSync: string
    data: unknown[]
  }
  messages: {
    lastSync: string
    data: unknown[]
  }
  notifications: {
    lastSync: string
    data: unknown[]
  }
}

type MobileAchievement = {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string
}

export interface DeviceInfo {
  deviceId: string
  platform: 'ios' | 'android' | 'web'
  version: string
  pushToken?: string
  lastSeen: Date
}

export class MobileAPIService {
  private static readonly API_VERSION = '1.0.0'

  // Crear respuesta estándar para móvil
  static createResponse<T>(
    success: boolean,
    data?: T,
    error?: string,
    message?: string
  ): MobileAPIResponse<T> {
    return {
      success,
      data,
      error,
      message,
      timestamp: new Date().toISOString(),
      version: this.API_VERSION,
    }
  }

  // Registrar dispositivo móvil
  static async registerDevice(userId: string, deviceInfo: DeviceInfo) {
    try {
      const device = await prisma.device.upsert({
        where: {
          deviceId: deviceInfo.deviceId,
        },
        update: {
          platform: deviceInfo.platform,
          isRegistered: true,
          lastSeen: new Date(),
        },
        create: {
          userId,
          deviceId: deviceInfo.deviceId,
          deviceName: `${deviceInfo.platform} device`,
          deviceType: 'mobile',
          platform: deviceInfo.platform,
          fingerprint: deviceInfo.deviceId,
          isRegistered: true,
          isTrusted: false,
          lastSeen: new Date(),
        },
      })

      return this.createResponse(
        true,
        device,
        undefined,
        'Device registered successfully'
      )
    } catch (error) {
      console.error('Error registering device:', error)
      return this.createResponse(false, undefined, 'Failed to register device')
    }
  }

  // Sincronización incremental de datos
  static async syncData(
    userId: string,
    lastSyncTimestamp?: string
  ): Promise<MobileAPIResponse<MobileSyncData>> {
    try {
      const lastSync = lastSyncTimestamp
        ? new Date(lastSyncTimestamp)
        : new Date(0)

      // Sincronizar usuarios (perfil y contactos)
      const userData = await prisma.user.findMany({
        where: {
          OR: [
            { id: userId },
            {
              updatedAt: { gt: lastSync },
              // Usuarios con los que ha interactuado
              OR: [
                {
                  sentMessages: {
                    some: { receiverId: userId },
                  },
                },
                {
                  receivedMessages: {
                    some: { senderId: userId },
                  },
                },
              ],
            },
          ],
        },
        include: {
          profile: true,
          _count: {
            select: {
              projects: true,
              sentMessages: true,
              receivedMessages: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      })

      // Sincronizar proyectos
      const projectsData = await prisma.project.findMany({
        where: {
          OR: [
            { clientId: userId },
            { freelancerId: userId },
            {
              updatedAt: { gt: lastSync },
              status: ProjectStatus.ACTIVE,
            },
          ],
        },
        include: {
          client: {
            select: { id: true, name: true, email: true, profile: true },
          },
          freelancer: {
            select: { id: true, name: true, email: true, profile: true },
          },
          _count: {
            select: {
              messages: true,
              transactions: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      })

      // Sincronizar mensajes
      const messagesData = await prisma.message.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
          updatedAt: { gt: lastSync },
        },
        include: {
          sender: {
            select: { id: true, name: true, image: true },
          },
          receiver: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100, // Limitar mensajes recientes
      })

      // Sincronizar notificaciones
      const notificationsData = await prisma.notification.findMany({
        where: {
          userId,
          updatedAt: { gt: lastSync },
        },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limitar notificaciones recientes
      })

      const syncData: MobileSyncData = {
        users: {
          lastSync: new Date().toISOString(),
          data: userData,
        },
        projects: {
          lastSync: new Date().toISOString(),
          data: projectsData,
        },
        messages: {
          lastSync: new Date().toISOString(),
          data: messagesData,
        },
        notifications: {
          lastSync: new Date().toISOString(),
          data: notificationsData,
        },
      }

      return this.createResponse<MobileSyncData>(
        true,
        syncData,
        undefined,
        'Data synchronized successfully'
      )
    } catch (error) {
      console.error('Error syncing data:', error)
      return this.createResponse<MobileSyncData>(
        false,
        undefined,
        'Failed to sync data'
      )
    }
  }

  // Obtener métricas unificadas para dashboard móvil
  static async getDashboardMetrics(
    userId: string
  ): Promise<MobileAPIResponse<unknown>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      })

      if (!user) {
        return this.createResponse(false, undefined, 'User not found')
      }

      // Métricas de proyectos
      const projectMetrics = await prisma.project.groupBy({
        by: ['status'],
        where: {
          OR: [{ clientId: userId }, { freelancerId: userId }],
        },
        _count: true,
      })

      // Métricas financieras
      const financialMetrics = await prisma.transaction.aggregate({
        where: {
          userId,
          status: TransactionStatus.COMPLETED,
          type: TransactionType.PAYMENT,
        },
        _sum: { amount: true },
        _count: true,
      })

      // Métricas de actividad
      const activityMetrics = {
        messagesCount: await prisma.message.count({
          where: {
            OR: [{ senderId: userId }, { receiverId: userId }],
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
            },
          },
        }),
        notificationsCount: await prisma.notification.count({
          where: {
            userId,
            isRead: false,
          },
        }),
      }

      // Métricas de gamificación
      const gamificationMetrics = {
        xp: user.profile?.xp || 0,
        level: user.profile?.level || 1,
        rank: await this.getUserRank(userId),
        achievements: await this.getUserAchievements(userId),
      }

      const metrics = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: user.profile,
        },
        projects: projectMetrics,
        financial: {
          totalEarnings: financialMetrics._sum.amount || 0,
          completedPayments: financialMetrics._count || 0,
        },
        activity: activityMetrics,
        gamification: gamificationMetrics,
        lastUpdated: new Date().toISOString(),
      }

      return this.createResponse(
        true,
        metrics,
        undefined,
        'Dashboard metrics retrieved successfully'
      )
    } catch (error) {
      console.error('Error getting dashboard metrics:', error)
      return this.createResponse(
        false,
        undefined,
        'Failed to get dashboard metrics'
      )
    }
  }

  // Obtener ranking del usuario
  private static async getUserRank(userId: string): Promise<number> {
    try {
      const userProfile = await prisma.profile.findUnique({
        where: { userId },
        select: { xp: true },
      })

      if (!userProfile) return 0

      const rank = await prisma.profile.count({
        where: {
          xp: { gt: userProfile.xp },
        },
      })

      return rank + 1
    } catch (error) {
      console.error('Error getting user rank:', error)
      return 0
    }
  }

  // Obtener logros del usuario
  private static async getUserAchievements(
    userId: string
  ): Promise<MobileAchievement[]> {
    try {
      // En una implementación real, esto vendría de una tabla de achievements
      // Por ahora, devolvemos logros mock basados en datos del usuario
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          projects: { where: { status: ProjectStatus.COMPLETED } },
        },
      })

      if (!user) return []

      const achievements = []
      const completedProjects = user.projects.length
      const xp = user.profile?.xp || 0

      if (completedProjects >= 1) {
        achievements.push({
          id: 'first_project',
          title: 'Primer Proyecto',
          description: 'Completa tu primer proyecto',
          icon: '🚀',
          unlockedAt: new Date().toISOString(),
        })
      }

      if (xp >= 100) {
        achievements.push({
          id: 'xp_100',
          title: 'Primeros Pasos',
          description: 'Alcanza 100 XP',
          icon: '⭐',
          unlockedAt: new Date().toISOString(),
        })
      }

      if (completedProjects >= 5) {
        achievements.push({
          id: 'experienced',
          title: 'Experimentado',
          description: 'Completa 5 proyectos',
          icon: '💎',
          unlockedAt: new Date().toISOString(),
        })
      }

      return achievements
    } catch (error) {
      console.error('Error getting user achievements:', error)
      return []
    }
  }

  // Validar token de autenticación móvil
  static async validateMobileToken(
    request: NextRequest
  ): Promise<{ valid: boolean; userId?: string; error?: string }> {
    try {
      const authHeader = request.headers.get('authorization')
      const mobileToken = request.headers.get('x-mobile-token')

      if (!authHeader && !mobileToken) {
        return { valid: false, error: 'No authentication token provided' }
      }

      // Aquí implementarías la validación del token
      // Por ahora, usamos una validación simplificada
      const token = authHeader?.replace('Bearer ', '') || mobileToken

      if (!token) {
        return { valid: false, error: 'Invalid token format' }
      }

      // En una implementación real, validarías el JWT o token de sesión
      // Por ahora, asumimos que el token es válido si existe
      return { valid: true, userId: 'mock-user-id' }
    } catch (error) {
      console.error('Error validating mobile token:', error)
      return { valid: false, error: 'Token validation failed' }
    }
  }

  // Actualizar estado de actividad del dispositivo
  static async updateDeviceActivity(userId: string, deviceId: string) {
    try {
      await prisma.device.updateMany({
        where: {
          userId,
          deviceId,
        },
        data: {
          lastSeen: new Date(),
        },
      })
    } catch (error) {
      console.error('Error updating device activity:', error)
    }
  }
}
