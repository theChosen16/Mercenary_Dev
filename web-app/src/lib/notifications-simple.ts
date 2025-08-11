import { prisma } from '@/lib/prisma'
import type { Prisma, NotificationType } from '@prisma/client'

export interface NotificationData {
  userId: string
  title: string
  message: string
  type: NotificationType
  actionUrl?: string
  metadata?: Record<string, unknown>
}

export class NotificationService {
  // Create notification
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

      // Send push notification (simplified)
      await this.sendPushNotification(data.userId, data.title, data.message)

      return notification
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  // Get user notifications
  static async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ) {
    try {
      const where: Prisma.NotificationWhereInput = { userId }
      if (unreadOnly) {
        where.isRead = false
      }

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      })

      const totalCount = await prisma.notification.count({ where })

      return {
        notifications,
        totalCount,
        hasMore: totalCount > page * limit,
      }
    } catch (error) {
      console.error('Error getting notifications:', error)
      return { notifications: [], totalCount: 0, hasMore: false }
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string) {
    try {
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
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: string) {
    try {
      return await prisma.notification.updateMany({
        where: {
          userId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  // Send push notification (simplified)
  private static async sendPushNotification(
    userId: string,
    title: string,
    message: string
  ) {
    try {
      // In a real implementation, this would use web-push
      console.log(`Push notification sent to ${userId}: ${title} - ${message}`)
    } catch (error) {
      console.error('Error sending push notification:', error)
    }
  }

  // Send email notification (simplified)
  static async sendEmailNotification(
    userId: string,
    subject: string,
    content: string
  ) {
    try {
      // In a real implementation, this would use Resend
      console.log(
        `Email sent to ${userId}: ${subject}\nPreview: ${content.slice(0, 120)}`
      )
    } catch (error) {
      console.error('Error sending email notification:', error)
    }
  }
}
