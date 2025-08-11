import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { SecurityService } from '@/lib/security'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange =
      (searchParams.get('timeRange') as '24h' | '7d' | '30d') || '24h'

    const dashboardData = await SecurityService.getSecurityDashboard(timeRange)

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching security dashboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
