import { NextRequest, NextResponse } from 'next/server'
import { MobileAPIService } from '@/lib/mobile-api'
import { CrossPlatformNotificationService } from '@/lib/cross-platform-notifications'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Validar autenticación
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        MobileAPIService.createResponse(
          false,
          undefined,
          'Authentication required'
        ),
        { status: 401 }
      )
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const deviceId = searchParams.get('deviceId')

    // Actualizar actividad del dispositivo
    if (deviceId) {
      await MobileAPIService.updateDeviceActivity(session.user.id, deviceId)
    }

    // Obtener notificaciones del usuario
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Obtener conteo total
    const totalCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        ...(unreadOnly && { isRead: false }),
      },
    })

    // Obtener conteo de no leídas
    const unreadCount = await CrossPlatformNotificationService.getUnreadCount(
      session.user.id
    )

    const data = {
      notifications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: totalCount > page * limit,
      },
      unreadCount,
    }

    return NextResponse.json(
      MobileAPIService.createResponse(
        true,
        data,
        undefined,
        'Notifications retrieved successfully'
      )
    )
  } catch (error) {
    console.error('Mobile notifications GET error:', error)
    return NextResponse.json(
      MobileAPIService.createResponse(
        false,
        undefined,
        'Internal server error'
      ),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validar autenticación
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        MobileAPIService.createResponse(
          false,
          undefined,
          'Authentication required'
        ),
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, notificationId, notificationIds, preferences } = body

    switch (action) {
      case 'markAsRead':
        if (notificationId) {
          // Marcar una notificación como leída
          await prisma.notification.update({
            where: {
              id: notificationId,
              userId: session.user.id,
            },
            data: { isRead: true },
          })
        } else if (notificationIds && Array.isArray(notificationIds)) {
          // Marcar múltiples notificaciones como leídas
          await prisma.notification.updateMany({
            where: {
              id: { in: notificationIds },
              userId: session.user.id,
            },
            data: { isRead: true },
          })
        }
        break

      case 'markAllAsRead':
        // Marcar todas las notificaciones como leídas
        await prisma.notification.updateMany({
          where: {
            userId: session.user.id,
            isRead: false,
          },
          data: { isRead: true },
        })
        break

      case 'updatePreferences':
        // Actualizar preferencias de notificación
        if (preferences) {
          await CrossPlatformNotificationService.updateNotificationPreferences(
            session.user.id,
            preferences
          )
        }
        break

      default:
        return NextResponse.json(
          MobileAPIService.createResponse(false, undefined, 'Invalid action'),
          { status: 400 }
        )
    }

    return NextResponse.json(
      MobileAPIService.createResponse(
        true,
        undefined,
        undefined,
        'Action completed successfully'
      )
    )
  } catch (error) {
    console.error('Mobile notifications POST error:', error)
    return NextResponse.json(
      MobileAPIService.createResponse(
        false,
        undefined,
        'Internal server error'
      ),
      { status: 500 }
    )
  }
}
