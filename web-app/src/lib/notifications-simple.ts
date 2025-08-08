import { prisma } from '@/lib/prisma'

export interface NotificationData {
  userId: string
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'PROJECT' | 'CHAT' | 'PAYMENT'
  actionUrl?: string
  metadata?: Record<string, any>
}

export class NotificationService {
  // Create notification
  static async createNotification(data: NotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type as any, // Simplified type casting
          actionUrl: data.actionUrl,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null
        }
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
      const where: any = { userId }
      if (unreadOnly) {
        where.isRead = false
      }

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      })

      const totalCount = await prisma.notification.count({ where })

      return {
        notifications,
        totalCount,
        hasMore: totalCount > page * limit
      }
    } catch (error) {
      console.error('Error getting notifications:', error)
      return { notifications: [], totalCount: 0, hasMore: false }
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string) {
    try {
      return await prisma.notification.update({
        where: {
          id: notificationId,
          userId: userId
        },
        data: {
          isRead: true
        }
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
          isRead: false
        },
        data: {
          isRead: true
        }
      })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  // Send push notification (simplified)
  private static async sendPushNotification(userId: string, title: string, message: string) {
    try {
      // In a real implementation, this would use web-push
      console.log(`Push notification sent to ${userId}: ${title} - ${message}`)
    } catch (error) {
      console.error('Error sending push notification:', error)
    }
  }

  // Send email notification (simplified)
  static async sendEmailNotification(userId: string, subject: string, content: string) {
    try {
      // In a real implementation, this would use Resend
      console.log(`Email sent to ${userId}: ${subject}`)
    } catch (error) {
      console.error('Error sending email notification:', error)
    }
  }
}
