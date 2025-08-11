import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export interface AnalyticsMetrics {
  overview: {
    totalUsers: number
    totalProjects: number
    totalRevenue: number
    activeProjects: number
    completionRate: number
    averageProjectValue: number
    userGrowthRate: number
    revenueGrowthRate: number
  }
  userMetrics: {
    newUsersToday: number
    newUsersThisWeek: number
    newUsersThisMonth: number
    activeUsers: number
    userRetentionRate: number
    topFreelancers: Array<{
      id: string
      name: string
      rating: number
      completedProjects: number
      totalEarnings: number
    }>
    topClients: Array<{
      id: string
      name: string
      rating: number
      postedProjects: number
      totalSpent: number
    }>
  }
  projectMetrics: {
    projectsCreatedToday: number
    projectsCreatedThisWeek: number
    projectsCreatedThisMonth: number
    projectsByCategory: Array<{
      category: string
      count: number
      percentage: number
    }>
    projectsByStatus: Array<{
      status: string
      count: number
      percentage: number
    }>
    averageApplicationsPerProject: number
    averageTimeToCompletion: number
  }
  financialMetrics: {
    revenueToday: number
    revenueThisWeek: number
    revenueThisMonth: number
    revenueThisYear: number
    platformFees: number
    escrowBalance: number
    payoutsPending: number
    revenueByCategory: Array<{
      category: string
      revenue: number
      percentage: number
    }>
    monthlyRevenueChart: Array<{
      month: string
      revenue: number
      projects: number
    }>
  }
  performanceMetrics: {
    averageResponseTime: number
    systemUptime: number
    errorRate: number
    searchConversionRate: number
    applicationSuccessRate: number
    userSatisfactionScore: number
    pageViews: number
    bounceRate: number
  }
}

export interface TimeRange {
  start: Date
  end: Date
}

type UserWithRelations = Prisma.UserGetPayload<{
  include: { profile: true; projects: true; freelancerProjects: true }
}>

export class AnalyticsService {
  // Get comprehensive analytics dashboard data
  static async getDashboardMetrics(
    timeRange: '24h' | '7d' | '30d' | '90d' | '1y' = '30d',
    userId?: string
  ): Promise<AnalyticsMetrics> {
    const { start, end } = this.getTimeRange(timeRange)
    const previousPeriod = this.getPreviousPeriod(start, end)

    const [
      overview,
      userMetrics,
      projectMetrics,
      financialMetrics,
      performanceMetrics,
    ] = await Promise.all([
      this.getOverviewMetrics(start, end, previousPeriod),
      this.getUserMetrics(start, end),
      this.getProjectMetrics(start, end),
      this.getFinancialMetrics(start, end),
      this.getPerformanceMetrics(start, end),
    ])

    return {
      overview,
      userMetrics,
      projectMetrics,
      financialMetrics,
      performanceMetrics,
    }
  }

  // Get user-specific analytics (for freelancers/clients)
  static async getUserAnalytics(
    userId: string,
    timeRange: '30d' | '90d' | '1y' = '30d'
  ) {
    const { start, end } = this.getTimeRange(timeRange)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        projects: true,
        freelancerProjects: true,
      },
    })

    if (!user) return null

    if (user.role === 'CLIENT') {
      return this.getClientAnalytics(user, start, end)
    } else {
      return this.getFreelancerAnalytics(user, start, end)
    }
  }

  // Real-time metrics for live dashboard
  static async getRealTimeMetrics() {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const [
      activeUsers,
      newProjectsLastHour,
      newApplicationsLastHour,
      revenueToday,
      onlineUsers,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          lastLoginAt: { gte: oneHourAgo },
        },
      }),
      prisma.project.count({
        where: {
          createdAt: { gte: oneHourAgo },
        },
      }),
      Promise.resolve(0),
      prisma.project.aggregate({
        where: {
          createdAt: { gte: oneDayAgo },
          status: { in: ['COMPLETED', 'IN_PROGRESS'] },
        },
        _sum: { budget: true },
      }),
      // Simulate online users (would use Redis/WebSocket in real implementation)
      Math.floor(Math.random() * 50) + 10,
    ])

    return {
      activeUsers,
      onlineUsers,
      newProjectsLastHour,
      newApplicationsLastHour,
      revenueToday: revenueToday._sum.budget || 0,
      timestamp: now,
    }
  }

  // Generate detailed reports
  static async generateReport(
    type: 'users' | 'projects' | 'financial' | 'performance',
    timeRange: '30d' | '90d' | '1y',
    format: 'json' | 'csv' = 'json'
  ) {
    const { start, end } = this.getTimeRange(timeRange)

    switch (type) {
      case 'users':
        return this.generateUserReport(start, end, format)
      case 'projects':
        return this.generateProjectReport(start, end, format)
      case 'financial':
        return this.generateFinancialReport(start, end, format)
      case 'performance':
        return this.generatePerformanceReport(start, end, format)
      default:
        throw new Error('Invalid report type')
    }
  }

  // Private helper methods
  private static getTimeRange(range: string): TimeRange {
    const end = new Date()
    const start = new Date()

    switch (range) {
      case '24h':
        start.setDate(end.getDate() - 1)
        break
      case '7d':
        start.setDate(end.getDate() - 7)
        break
      case '30d':
        start.setDate(end.getDate() - 30)
        break
      case '90d':
        start.setDate(end.getDate() - 90)
        break
      case '1y':
        start.setFullYear(end.getFullYear() - 1)
        break
    }

    return { start, end }
  }

  private static getPreviousPeriod(start: Date, end: Date): TimeRange {
    const duration = end.getTime() - start.getTime()
    const previousEnd = new Date(start.getTime())
    const previousStart = new Date(start.getTime() - duration)

    return { start: previousStart, end: previousEnd }
  }

  private static async getOverviewMetrics(
    start: Date,
    end: Date,
    previousPeriod: TimeRange
  ) {
    const [
      totalUsers,
      totalProjects,
      activeProjects,
      completedProjects,
      totalRevenue,
      previousUsers,
      previousRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.project.count({ where: { status: 'COMPLETED' } }),
      prisma.project.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { budget: true },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: previousPeriod.start,
            lte: previousPeriod.end,
          },
        },
      }),
      prisma.project.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: previousPeriod.start,
            lte: previousPeriod.end,
          },
        },
        _sum: { budget: true },
      }),
    ])

    const currentUsers = await prisma.user.count({
      where: {
        createdAt: { gte: start, lte: end },
      },
    })

    const currentRevenue = await prisma.project.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end },
      },
      _sum: { budget: true },
    })

    const userGrowthRate =
      previousUsers > 0
        ? ((currentUsers - previousUsers) / previousUsers) * 100
        : 0

    const revenueGrowthRate =
      (previousRevenue._sum.budget || 0) > 0
        ? (((currentRevenue._sum.budget || 0) -
            (previousRevenue._sum.budget || 0)) /
            (previousRevenue._sum.budget || 1)) *
          100
        : 0

    return {
      totalUsers,
      totalProjects,
      totalRevenue: totalRevenue._sum.budget || 0,
      activeProjects,
      completionRate:
        totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
      averageProjectValue:
        totalProjects > 0 ? (totalRevenue._sum.budget || 0) / totalProjects : 0,
      userGrowthRate,
      revenueGrowthRate,
    }
  }

  private static async getUserMetrics(start: Date, end: Date) {
    const [
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      activeUsers,
      topFreelancers,
      topClients,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.user.count({
        where: {
          lastLoginAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      // Top freelancers by rating and completed projects
      prisma.user.findMany({
        where: { role: 'FREELANCER' },
        include: {
          profile: true,
          _count: {
            select: {
              freelancerProjects: true,
            },
          },
        },
        orderBy: [
          { profile: { rating: 'desc' } },
          { freelancerProjects: { _count: 'desc' } },
        ],
        take: 10,
      }),
      // Top clients by projects posted and total spent
      prisma.user.findMany({
        where: { role: 'CLIENT' },
        include: {
          profile: true,
          _count: {
            select: {
              projects: true,
            },
          },
          projects: {
            where: { status: 'COMPLETED' },
            select: { budget: true },
          },
        },
        orderBy: [{ projects: { _count: 'desc' } }],
        take: 10,
      }),
    ])

    return {
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      activeUsers,
      userRetentionRate: 75.5, // Would calculate based on actual retention logic
      topFreelancers: topFreelancers.map(user => ({
        id: user.id,
        name: user.name || 'Usuario',
        rating: user.profile?.rating || 0,
        completedProjects: user._count.freelancerProjects,
        totalEarnings: 0, // Would calculate from completed projects
      })),
      topClients: topClients.map(user => ({
        id: user.id,
        name: user.name || 'Cliente',
        rating: user.profile?.rating || 0,
        postedProjects: user._count.projects,
        totalSpent: user.projects.reduce((sum, p) => sum + p.budget, 0),
      })),
    }
  }

  private static async getProjectMetrics(start: Date, end: Date) {
    const [
      projectsToday,
      projectsThisWeek,
      projectsThisMonth,
      projectsByCategory,
      projectsByStatus,
      applications,
    ] = await Promise.all([
      prisma.project.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.project.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.project.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.project.groupBy({
        by: ['category'],
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
      }),
      prisma.project.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      Promise.resolve(0),
    ])

    const totalProjects = await prisma.project.count()
    const totalApplications = applications

    return {
      projectsCreatedToday: projectsToday,
      projectsCreatedThisWeek: projectsThisWeek,
      projectsCreatedThisMonth: projectsThisMonth,
      projectsByCategory: projectsByCategory.map(item => ({
        category: item.category,
        count: item._count.category,
        percentage: (item._count.category / totalProjects) * 100,
      })),
      projectsByStatus: projectsByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
        percentage: (item._count.status / totalProjects) * 100,
      })),
      averageApplicationsPerProject:
        totalProjects > 0 ? totalApplications / totalProjects : 0,
      averageTimeToCompletion: 14, // Would calculate from actual completion times
    }
  }

  private static async getFinancialMetrics(start: Date, end: Date) {
    const [
      revenueToday,
      revenueThisWeek,
      revenueThisMonth,
      revenueThisYear,
      revenueByCategory,
    ] = await Promise.all([
      prisma.project.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        _sum: { budget: true },
      }),
      prisma.project.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        _sum: { budget: true },
      }),
      prisma.project.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _sum: { budget: true },
      }),
      prisma.project.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
        },
        _sum: { budget: true },
      }),
      prisma.project.groupBy({
        by: ['category'],
        where: { status: 'COMPLETED' },
        _sum: { budget: true },
        orderBy: { _sum: { budget: 'desc' } },
      }),
    ])

    const totalRevenue = revenueThisYear._sum.budget || 0
    const platformFeeRate = 0.05 // 5% platform fee

    return {
      revenueToday: revenueToday._sum.budget || 0,
      revenueThisWeek: revenueThisWeek._sum.budget || 0,
      revenueThisMonth: revenueThisMonth._sum.budget || 0,
      revenueThisYear: totalRevenue,
      platformFees: totalRevenue * platformFeeRate,
      escrowBalance: 125000, // Would get from actual escrow system
      payoutsPending: 45000, // Would get from actual payout system
      revenueByCategory: revenueByCategory.map(item => ({
        category: item.category,
        revenue: item._sum.budget || 0,
        percentage:
          totalRevenue > 0 ? ((item._sum.budget || 0) / totalRevenue) * 100 : 0,
      })),
      monthlyRevenueChart: [], // Would generate 12-month chart data
    }
  }

  private static async getPerformanceMetrics(start: Date, end: Date) {
    // These would typically come from monitoring systems like New Relic, DataDog, etc.
    return {
      averageResponseTime: 245, // ms
      systemUptime: 99.8, // %
      errorRate: 0.2, // %
      searchConversionRate: 12.5, // %
      applicationSuccessRate: 68.3, // %
      userSatisfactionScore: 4.2, // out of 5
      pageViews: 15420,
      bounceRate: 32.1, // %
    }
  }

  private static async getClientAnalytics(
    user: UserWithRelations,
    start: Date,
    end: Date
  ) {
    const projects = user.projects
    const totalSpent = projects.reduce((sum: number, p) => sum + p.budget, 0)
    const completedProjects = projects.filter(
      p => p.status === 'COMPLETED'
    ).length
    const averageApplications = 0

    return {
      type: 'client',
      totalProjects: projects.length,
      completedProjects,
      totalSpent,
      averageProjectValue:
        projects.length > 0 ? totalSpent / projects.length : 0,
      averageApplicationsPerProject: averageApplications || 0,
      successRate:
        projects.length > 0 ? (completedProjects / projects.length) * 100 : 0,
      rating: user.profile?.rating || 0,
      totalReviews: user.profile?.totalReviews || 0,
    }
  }

  private static async getFreelancerAnalytics(
    user: UserWithRelations,
    start: Date,
    end: Date
  ) {
    const projects = user.freelancerProjects
    const applications: unknown[] = []
    const totalEarnings = projects.reduce((sum: number, p) => sum + p.budget, 0)
    const completedProjects = projects.filter(
      p => p.status === 'COMPLETED'
    ).length
    const acceptedApplications = 0

    return {
      type: 'freelancer',
      totalApplications: applications.length,
      acceptedApplications,
      totalProjects: projects.length,
      completedProjects,
      totalEarnings,
      averageProjectValue:
        projects.length > 0 ? totalEarnings / projects.length : 0,
      applicationSuccessRate:
        applications.length > 0
          ? (acceptedApplications / applications.length) * 100
          : 0,
      completionRate:
        projects.length > 0 ? (completedProjects / projects.length) * 100 : 0,
      rating: user.profile?.rating || 0,
      totalReviews: user.profile?.totalReviews || 0,
    }
  }

  private static async generateUserReport(
    start: Date,
    end: Date,
    format: string
  ) {
    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      include: {
        profile: true,
        _count: {
          select: {
            projects: true,
            freelancerProjects: true,
          },
        },
      },
    })

    const reportData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      isVerified: Boolean(user.emailVerified),
      rating: user.profile?.rating || 0,
      projectsPosted: user._count.projects,
      projectsCompleted: user._count.freelancerProjects,
      applications: 0,
    }))

    return format === 'csv' ? this.convertToCSV(reportData) : reportData
  }

  private static async generateProjectReport(
    start: Date,
    end: Date,
    format: string
  ) {
    const projects = await prisma.project.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      include: {
        client: { select: { name: true, email: true } },
        freelancer: { select: { name: true, email: true } },
      },
    })

    const reportData = projects.map(project => ({
      id: project.id,
      title: project.title,
      category: project.category,
      budget: project.budget,
      status: project.status,
      createdAt: project.createdAt,
      deadline: project.deadline,
      clientName: project.client.name,
      freelancerName: project.freelancer?.name || 'No asignado',
      applications: 0,
    }))

    return format === 'csv' ? this.convertToCSV(reportData) : reportData
  }

  private static async generateFinancialReport(
    start: Date,
    end: Date,
    format: string
  ) {
    // Implementation for financial report
    return []
  }

  private static async generatePerformanceReport(
    start: Date,
    end: Date,
    format: string
  ) {
    // Implementation for performance report
    return []
  }

  private static convertToCSV<T extends Record<string, unknown>>(
    data: T[]
  ): string {
    if (data.length === 0) return ''

    const headerKeys = Object.keys(data[0]) as (keyof T)[]
    const headerRow = headerKeys.map(h => String(h)).join(',')
    const csvContent = [
      headerRow,
      ...data.map(row =>
        headerKeys
          .map(header =>
            JSON.stringify(
              (row as Record<string, unknown>)[header as string] ?? ''
            )
          )
          .join(',')
      ),
    ].join('\n')

    return csvContent
  }
}
