import { prisma } from '@/lib/prisma'

export interface NotificationData {
  userId: string
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'PROJECT' | 'PAYMENT' | 'CHAT'
  actionUrl?: string
  metadata?: Record<string, any>
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: Record<string, any>
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
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          actionUrl: data.actionUrl,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          isRead: false,
        }
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
  static async sendPushNotification(userId: string, payload: PushNotificationPayload) {
    try {
      // Get user's push subscriptions
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId }
      })

      const webpush = await import('web-push')
      
      // Configure VAPID keys (should be in environment variables)
      webpush.setVapidDetails(
        'mailto:admin@mercenary.com',
        process.env.VAPID_PUBLIC_KEY || '',
        process.env.VAPID_PRIVATE_KEY || ''
      )

      // Send to all user's devices
      const promises = subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            JSON.parse(subscription.subscription),
            JSON.stringify(payload)
          )
        } catch (error) {
          console.error('Failed to send push notification:', error)
          // Remove invalid subscription
          await prisma.pushSubscription.delete({
            where: { id: subscription.id }
          })
        }
      })

      await Promise.allSettled(promises)
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
        text: textContent || htmlContent.replace(/<[^>]*>/g, '')
      })
    } catch (error) {
      console.error('Error sending email notification:', error)
    }
  }

  // Send real-time notification via WebSocket
  private static sendRealTimeNotification(userId: string, notification: any) {
    // This would integrate with your WebSocket system
    // For now, we'll use a simple event emitter pattern
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('newNotification', {
        detail: { userId, notification }
      }))
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string) {
    return await prisma.notification.update({
      where: {
        id: notificationId,
        userId: userId
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
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

    const where = {
      userId,
      ...(unreadOnly ? { isRead: false } : {})
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ])

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  // Bulk mark notifications as read
  static async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })
  }

  // Delete old notifications (cleanup job)
  static async cleanupOldNotifications(daysOld: number = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    return await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        isRead: true
      }
    })
  }

  // Notification templates
  static getProjectNotificationTemplate(type: string, projectTitle: string, data: any) {
    const templates = {
      'project_created': {
        title: '🎯 Nuevo Proyecto Creado',
        message: `Tu proyecto "${projectTitle}" ha sido publicado exitosamente`,
        type: 'SUCCESS' as const
      },
      'application_received': {
        title: '📋 Nueva Aplicación',
        message: `Recibiste una nueva aplicación para "${projectTitle}"`,
        type: 'INFO' as const
      },
      'application_accepted': {
        title: '🎉 Aplicación Aceptada',
        message: `Tu aplicación para "${projectTitle}" fue aceptada`,
        type: 'SUCCESS' as const
      },
      'project_completed': {
        title: '✅ Proyecto Completado',
        message: `El proyecto "${projectTitle}" ha sido marcado como completado`,
        type: 'SUCCESS' as const
      },
      'payment_released': {
        title: '💰 Pago Liberado',
        message: `El pago de $${data.amount} para "${projectTitle}" ha sido liberado`,
        type: 'SUCCESS' as const
      }
    }

    return templates[type as keyof typeof templates] || {
      title: 'Notificación',
      message: 'Tienes una nueva notificación',
      type: 'INFO' as const
    }
  }
}
