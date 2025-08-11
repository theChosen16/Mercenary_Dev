import { prisma } from '@/lib/prisma'
import type {
  Prisma,
  Notification as DbNotification,
  NotificationType,
} from '@prisma/client'

export interface NotificationData {
  userId: string
  title: string
  message: string
  type: NotificationType
  actionUrl?: string
  metadata?: Record<string, unknown>
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: Record<string, unknown>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

export class NotificationService {
  // Create in-app notification
  static async createNotification(data: NotificationData) {
    try {
      const payload =
        data.metadata || data.actionUrl
          ? JSON.stringify({
              ...(data.metadata ?? {}),
              ...(data.actionUrl ? { actionUrl: data.actionUrl } : {}),
            })
          : null

      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          isRead: false,
          data: payload,
        },
      })

      // Send real-time notification via WebSocket
      this.sendRealTimeNotification(data.userId, notification)

      return notification
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  // Send push notification
  static async sendPushNotification(
    userId: string,
    payload: PushNotificationPayload
  ) {
    try {
      // Fallback: Push subscriptions model not present in current Prisma schema.
      // Integrate with your push service here.
      console.log(`Push notification to ${userId}:`, payload.title)
    } catch (error) {
      console.error('Error sending push notification:', error)
    }
  }

  // Send email notification
  static async sendEmailNotification(
    email: string,
    subject: string,
    htmlContent: string,
    textContent?: string
  ) {
    try {
      // Using Resend for email service
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      await resend.emails.send({
        from: 'Mercenary <noreply@mercenary.com>',
        to: email,
        subject,
        html: htmlContent,
        text: textContent || htmlContent.replace(/<[^>]*>/g, ''),
      })
    } catch (error) {
      console.error('Error sending email notification:', error)
    }
  }

  // Send real-time notification via WebSocket
  private static sendRealTimeNotification(
    userId: string,
    notification: DbNotification
  ) {
    // This would integrate with your WebSocket system
    // For now, we'll use a simple event emitter pattern
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent('newNotification', {
          detail: { userId, notification },
        })
      )
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string) {
    const existing = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { id: true, userId: true },
    })
    if (!existing || existing.userId !== userId) {
      throw new Error('Notification not found')
    }
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })
  }

  // Get user notifications with pagination
  static async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ) {
    const skip = (page - 1) * limit

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ])

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // Bulk mark notifications as read
  static async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })
  }

  // Delete old notifications (cleanup job)
  static async cleanupOldNotifications(daysOld: number = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    return await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        isRead: true,
      },
    })
  }

  // Notification templates
  static getProjectNotificationTemplate(
    type: string,
    projectTitle: string,
    data?: { amount?: number }
  ) {
    const templates = {
      project_created: {
        title: '🎯 Nuevo Proyecto Creado',
        message: `Tu proyecto "${projectTitle}" ha sido publicado exitosamente`,
        type: 'PROJECT_UPDATE' as NotificationType,
      },
      application_received: {
        title: '📋 Nueva Aplicación',
        message: `Recibiste una nueva aplicación para "${projectTitle}"`,
        type: 'PROJECT_UPDATE' as NotificationType,
      },
      application_accepted: {
        title: '🎉 Aplicación Aceptada',
        message: `Tu aplicación para "${projectTitle}" fue aceptada`,
        type: 'PROJECT_UPDATE' as NotificationType,
      },
      project_completed: {
        title: '✅ Proyecto Completado',
        message: `El proyecto "${projectTitle}" ha sido marcado como completado`,
        type: 'PROJECT_UPDATE' as NotificationType,
      },
      payment_released: {
        title: '💰 Pago Liberado',
        message: `El pago de $${data.amount} para "${projectTitle}" ha sido liberado`,
        type: 'PAYMENT' as NotificationType,
      },
    }

    return (
      templates[type as keyof typeof templates] || {
        title: 'Notificación',
        message: 'Tienes una nueva notificación',
        type: 'SYSTEM' as NotificationType,
      }
    )
  }
}
