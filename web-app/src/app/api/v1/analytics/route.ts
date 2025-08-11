import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { AnalyticsService } from '@/lib/analytics'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange =
      (searchParams.get('timeRange') as '30d' | '90d' | '1y') || '30d'
    const type = searchParams.get('type') || 'dashboard'

    // Check if user is admin for full analytics
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (type === 'dashboard') {
      if (user?.role === 'ADMIN') {
        const metrics = await AnalyticsService.getDashboardMetrics(timeRange)
        return NextResponse.json(metrics)
      } else {
        // Return user-specific analytics
        const userAnalytics = await AnalyticsService.getUserAnalytics(
          session.user.id,
          timeRange
        )
        return NextResponse.json(userAnalytics)
      }
    }

    if (type === 'realtime') {
      const realTimeMetrics = await AnalyticsService.getRealTimeMetrics()
      return NextResponse.json(realTimeMetrics)
    }

    return NextResponse.json(
      { error: 'Invalid type parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { reportType, timeRange, format = 'json' } = body

    const report = await AnalyticsService.generateReport(
      reportType,
      timeRange,
      format
    )

    if (format === 'csv') {
      return new NextResponse(report as string, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}-report-${timeRange}.csv"`,
        },
      })
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Analytics report generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
