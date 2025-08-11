import { NextRequest, NextResponse } from 'next/server'
import { MobileAPIService } from '@/lib/mobile-api'
import { CrossPlatformNotificationService } from '@/lib/cross-platform-notifications'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
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

    // Obtener dispositivos del usuario
    const devices = await CrossPlatformNotificationService.getUserDevices(
      session.user.id
    )

    return NextResponse.json(
      MobileAPIService.createResponse(
        true,
        devices,
        undefined,
        'Devices retrieved successfully'
      )
    )
  } catch (error) {
    console.error('Mobile devices GET error:', error)
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
    const { action, deviceInfo, deviceId } = body

    switch (action) {
      case 'register':
        // Registrar nuevo dispositivo
        if (!deviceInfo) {
          return NextResponse.json(
            MobileAPIService.createResponse(
              false,
              undefined,
              'Device info required'
            ),
            { status: 400 }
          )
        }

        const registerResult = await MobileAPIService.registerDevice(
          session.user.id,
          {
            ...deviceInfo,
            lastSeen: new Date(),
          }
        )

        return NextResponse.json(registerResult)

      case 'updateSubscription':
        // Actualizar suscripción de notificaciones push
        if (!deviceInfo) {
          return NextResponse.json(
            MobileAPIService.createResponse(
              false,
              undefined,
              'Device info required'
            ),
            { status: 400 }
          )
        }

        const subscriptionResult =
          await CrossPlatformNotificationService.registerDeviceSubscription({
            userId: session.user.id,
            ...deviceInfo,
          })

        return NextResponse.json(
          MobileAPIService.createResponse(
            subscriptionResult,
            undefined,
            subscriptionResult ? undefined : 'Failed to update subscription',
            subscriptionResult ? 'Subscription updated successfully' : undefined
          )
        )

      case 'unregister':
        // Desregistrar dispositivo
        if (!deviceId) {
          return NextResponse.json(
            MobileAPIService.createResponse(
              false,
              undefined,
              'Device ID required'
            ),
            { status: 400 }
          )
        }

        await prisma.device.deleteMany({
          where: {
            userId: session.user.id,
            deviceId,
          },
        })

        return NextResponse.json(
          MobileAPIService.createResponse(
            true,
            undefined,
            undefined,
            'Device unregistered successfully'
          )
        )

      case 'updateActivity':
        // Actualizar actividad del dispositivo
        if (!deviceId) {
          return NextResponse.json(
            MobileAPIService.createResponse(
              false,
              undefined,
              'Device ID required'
            ),
            { status: 400 }
          )
        }

        await MobileAPIService.updateDeviceActivity(session.user.id, deviceId)

        return NextResponse.json(
          MobileAPIService.createResponse(
            true,
            undefined,
            undefined,
            'Device activity updated'
          )
        )

      default:
        return NextResponse.json(
          MobileAPIService.createResponse(false, undefined, 'Invalid action'),
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Mobile devices POST error:', error)
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
