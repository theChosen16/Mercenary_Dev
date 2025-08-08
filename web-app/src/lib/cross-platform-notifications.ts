import { prisma } from '@/lib/prisma'

export interface CrossPlatformNotification {
  id: string
  userId: string
  title: string
  message: string
  type: 'PROJECT' | 'CHAT' | 'PAYMENT' | 'SYSTEM' | 'ACHIEVEMENT'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  platforms: ('web' | 'mobile' | 'email')[]
  actionUrl?: string
  metadata?: Record<string, any>
  scheduledFor?: Date
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: number
  data?: Record<string, any>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

export interface DeviceSubscription {
  userId: string
  deviceId: string
  platform: 'web' | 'ios' | 'android'
  pushToken?: string
  webPushSubscription?: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  }
  preferences: {
    projects: boolean
    chat: boolean
    payments: boolean
    system: boolean
    achievements: boolean
  }
}

export class CrossPlatformNotificationService {
  // Enviar notificación a todas las plataformas
  static async sendNotification(notification: CrossPlatformNotification): Promise<boolean> {
    try {
      // Crear notificación en base de datos
      const dbNotification = await prisma.notification.create({
        data: {
          userId: notification.userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          actionUrl: notification.actionUrl,
          metadata: notification.metadata ? JSON.stringify(notification.metadata) : null
        }
      })

      // Obtener dispositivos del usuario
      const devices = await this.getUserDevices(notification.userId)

      // Filtrar dispositivos según plataformas especificadas
      const targetDevices = devices.filter(device => 
        notification.platforms.includes(device.platform as any)
      )

      // Enviar a cada plataforma
      const results = await Promise.allSettled([
        ...targetDevices.map(device => this.sendToDevice(device, notification)),
        // Enviar email si está en las plataformas
        notification.platforms.includes('email') 
          ? this.sendEmailNotification(notification)
          : Promise.resolve(true)
      ])

      // Verificar si al menos una notificación fue exitosa
      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value === true
      ).length

      return successCount > 0
    } catch (error) {
      console.error('Error sending cross-platform notification:', error)
      return false
    }
  }

  // Obtener dispositivos del usuario
  static async getUserDevices(userId: string): Promise<DeviceSubscription[]> {
    try {
      const devices = await prisma.device.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              notificationPreferences: true
            }
          }
        }
      })

      return devices.map(device => ({
        userId: device.userId,
        deviceId: device.deviceId,
        platform: device.platform as 'web' | 'ios' | 'android',
        pushToken: device.pushToken || undefined,
        webPushSubscription: device.webPushSubscription 
          ? JSON.parse(device.webPushSubscription)
          : undefined,
        preferences: device.user?.notificationPreferences 
          ? JSON.parse(device.user.notificationPreferences)
          : {
              projects: true,
              chat: true,
              payments: true,
              system: true,
              achievements: true
            }
      }))
    } catch (error) {
      console.error('Error getting user devices:', error)
      return []
    }
  }

  // Enviar notificación a un dispositivo específico
  static async sendToDevice(
    device: DeviceSubscription, 
    notification: CrossPlatformNotification
  ): Promise<boolean> {
    try {
      // Verificar preferencias del usuario
      const notificationType = notification.type.toLowerCase() as keyof typeof device.preferences
      if (!device.preferences[notificationType]) {
        return true // Usuario ha deshabilitado este tipo de notificación
      }

      const payload: PushNotificationPayload = {
        title: notification.title,
        body: notification.message,
        icon: '/icons/notification-icon.png',
        badge: await this.getUnreadCount(device.userId),
        data: {
          url: notification.actionUrl,
          type: notification.type,
          ...notification.metadata
        }
      }

      switch (device.platform) {
        case 'web':
          return await this.sendWebPush(device, payload)
        case 'ios':
          return await this.sendIOSPush(device, payload)
        case 'android':
          return await this.sendAndroidPush(device, payload)
        default:
          return false
      }
    } catch (error) {
      console.error(`Error sending notification to ${device.platform} device:`, error)
      return false
    }
  }

  // Enviar push notification web
  static async sendWebPush(device: DeviceSubscription, payload: PushNotificationPayload): Promise<boolean> {
    try {
      if (!device.webPushSubscription) {
        return false
      }

      // En una implementación real, usarías web-push library
      console.log('Sending web push notification:', {
        subscription: device.webPushSubscription,
        payload
      })

      // Simular envío exitoso
      return true
    } catch (error) {
      console.error('Error sending web push:', error)
      return false
    }
  }

  // Enviar push notification iOS
  static async sendIOSPush(device: DeviceSubscription, payload: PushNotificationPayload): Promise<boolean> {
    try {
      if (!device.pushToken) {
        return false
      }

      // En una implementación real, usarías APNs
      console.log('Sending iOS push notification:', {
        token: device.pushToken,
        payload: {
          aps: {
            alert: {
              title: payload.title,
              body: payload.body
            },
            badge: payload.badge,
            sound: 'default'
          },
          data: payload.data
        }
      })

      // Simular envío exitoso
      return true
    } catch (error) {
      console.error('Error sending iOS push:', error)
      return false
    }
  }

  // Enviar push notification Android
  static async sendAndroidPush(device: DeviceSubscription, payload: PushNotificationPayload): Promise<boolean> {
    try {
      if (!device.pushToken) {
        return false
      }

      // En una implementación real, usarías FCM
      console.log('Sending Android push notification:', {
        token: device.pushToken,
        notification: {
          title: payload.title,
          body: payload.body,
          icon: payload.icon
        },
        data: payload.data
      })

      // Simular envío exitoso
      return true
    } catch (error) {
      console.error('Error sending Android push:', error)
      return false
    }
  }

  // Enviar notificación por email
  static async sendEmailNotification(notification: CrossPlatformNotification): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: notification.userId },
        select: { email: true, name: true }
      })

      if (!user) {
        return false
      }

      // En una implementación real, usarías Resend o similar
      console.log('Sending email notification:', {
        to: user.email,
        subject: notification.title,
        html: `
          <h2>${notification.title}</h2>
          <p>Hola ${user.name},</p>
          <p>${notification.message}</p>
          ${notification.actionUrl ? `<a href="${notification.actionUrl}">Ver más</a>` : ''}
          <p>Saludos,<br>Equipo Mercenary</p>
        `
      })

      // Simular envío exitoso
      return true
    } catch (error) {
      console.error('Error sending email notification:', error)
      return false
    }
  }

  // Obtener cantidad de notificaciones no leídas
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      return await prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      })
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }

  // Registrar suscripción de dispositivo
  static async registerDeviceSubscription(subscription: DeviceSubscription): Promise<boolean> {
    try {
      await prisma.device.upsert({
        where: {
          userId_deviceId: {
            userId: subscription.userId,
            deviceId: subscription.deviceId
          }
        },
        update: {
          platform: subscription.platform,
          pushToken: subscription.pushToken,
          webPushSubscription: subscription.webPushSubscription 
            ? JSON.stringify(subscription.webPushSubscription)
            : null,
          lastActive: new Date()
        },
        create: {
          userId: subscription.userId,
          deviceId: subscription.deviceId,
          platform: subscription.platform,
          pushToken: subscription.pushToken,
          webPushSubscription: subscription.webPushSubscription 
            ? JSON.stringify(subscription.webPushSubscription)
            : null,
          lastActive: new Date()
        }
      })

      // Actualizar preferencias de notificación del usuario
      await prisma.user.update({
        where: { id: subscription.userId },
        data: {
          notificationPreferences: JSON.stringify(subscription.preferences)
        }
      })

      return true
    } catch (error) {
      console.error('Error registering device subscription:', error)
      return false
    }
  }

  // Actualizar preferencias de notificación
  static async updateNotificationPreferences(
    userId: string, 
    preferences: Partial<DeviceSubscription['preferences']>
  ): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { notificationPreferences: true }
      })

      const currentPreferences = user?.notificationPreferences 
        ? JSON.parse(user.notificationPreferences)
        : {
            projects: true,
            chat: true,
            payments: true,
            system: true,
            achievements: true
          }

      const updatedPreferences = {
        ...currentPreferences,
        ...preferences
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          notificationPreferences: JSON.stringify(updatedPreferences)
        }
      })

      return true
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      return false
    }
  }

  // Enviar notificación de proyecto
  static async notifyProjectUpdate(
    projectId: string, 
    type: 'created' | 'updated' | 'completed' | 'cancelled',
    message: string
  ): Promise<void> {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          client: true,
          freelancer: true
        }
      })

      if (!project) return

      // Notificar al cliente y freelancer
      const recipients = [project.client, project.freelancer].filter(Boolean)

      for (const recipient of recipients) {
        if (!recipient) continue

        await this.sendNotification({
          id: `project-${type}-${projectId}`,
          userId: recipient.id,
          title: `Proyecto ${type === 'created' ? 'Creado' : type === 'updated' ? 'Actualizado' : type === 'completed' ? 'Completado' : 'Cancelado'}`,
          message,
          type: 'PROJECT',
          priority: type === 'completed' ? 'HIGH' : 'MEDIUM',
          platforms: ['web', 'mobile', 'email'],
          actionUrl: `/projects/${projectId}`,
          metadata: {
            projectId,
            projectTitle: project.title,
            type
          }
        })
      }
    } catch (error) {
      console.error('Error sending project notification:', error)
    }
  }

  // Enviar notificación de chat
  static async notifyNewMessage(
    senderId: string,
    receiverId: string,
    message: string,
    roomId: string
  ): Promise<void> {
    try {
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: { name: true }
      })

      if (!sender) return

      await this.sendNotification({
        id: `message-${Date.now()}`,
        userId: receiverId,
        title: `Nuevo mensaje de ${sender.name}`,
        message: message.length > 100 ? `${message.substring(0, 100)}...` : message,
        type: 'CHAT',
        priority: 'MEDIUM',
        platforms: ['web', 'mobile'],
        actionUrl: `/chat/${roomId}`,
        metadata: {
          senderId,
          senderName: sender.name,
          roomId
        }
      })
    } catch (error) {
      console.error('Error sending chat notification:', error)
    }
  }

  // Enviar notificación de pago
  static async notifyPayment(
    userId: string,
    type: 'received' | 'sent' | 'released' | 'disputed',
    amount: number,
    projectTitle: string
  ): Promise<void> {
    try {
      const titles = {
        received: 'Pago Recibido',
        sent: 'Pago Enviado',
        released: 'Pago Liberado',
        disputed: 'Disputa de Pago'
      }

      await this.sendNotification({
        id: `payment-${type}-${Date.now()}`,
        userId,
        title: titles[type],
        message: `${type === 'received' ? 'Has recibido' : type === 'sent' ? 'Has enviado' : type === 'released' ? 'Se ha liberado' : 'Se ha disputado'} un pago de $${amount} para el proyecto "${projectTitle}"`,
        type: 'PAYMENT',
        priority: 'HIGH',
        platforms: ['web', 'mobile', 'email'],
        actionUrl: '/dashboard/payments',
        metadata: {
          amount,
          projectTitle,
          type
        }
      })
    } catch (error) {
      console.error('Error sending payment notification:', error)
    }
  }
}
