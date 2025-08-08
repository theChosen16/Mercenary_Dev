import { NextRequest, NextResponse } from 'next/server'
import { MobileAPIService } from '@/lib/mobile-api'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Validar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        MobileAPIService.createResponse(false, undefined, 'Authentication required'),
        { status: 401 }
      )
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')

    // Actualizar actividad del dispositivo si se proporciona
    if (deviceId) {
      await MobileAPIService.updateDeviceActivity(session.user.id, deviceId)
    }

    // Obtener métricas del dashboard
    const metricsResult = await MobileAPIService.getDashboardMetrics(session.user.id)

    return NextResponse.json(metricsResult)
  } catch (error) {
    console.error('Mobile dashboard error:', error)
    return NextResponse.json(
      MobileAPIService.createResponse(false, undefined, 'Internal server error'),
      { status: 500 }
    )
  }
}
