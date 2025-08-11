import { NextRequest, NextResponse } from 'next/server'
import { MobileAPIService } from '@/lib/mobile-api'
import { auth } from '@/lib/auth'

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
    const lastSync = searchParams.get('lastSync')
    const deviceId = searchParams.get('deviceId')

    // Actualizar actividad del dispositivo si se proporciona
    if (deviceId) {
      await MobileAPIService.updateDeviceActivity(session.user.id, deviceId)
    }

    // Sincronizar datos
    const syncResult = await MobileAPIService.syncData(
      session.user.id,
      lastSync || undefined
    )

    return NextResponse.json(syncResult)
  } catch (error) {
    console.error('Mobile sync error:', error)
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
    const { deviceInfo, lastSync } = body

    // Registrar dispositivo si se proporciona información
    if (deviceInfo) {
      await MobileAPIService.registerDevice(session.user.id, {
        ...deviceInfo,
        lastSeen: new Date(),
      })
    }

    // Sincronizar datos
    const syncResult = await MobileAPIService.syncData(
      session.user.id,
      lastSync
    )

    return NextResponse.json(syncResult)
  } catch (error) {
    console.error('Mobile sync POST error:', error)
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
