import { prisma } from '@/lib/prisma'
import { AuditLogger } from './audit-logger'
import crypto from 'crypto'

import {
  AbuseCategory,
  AbuseReportStatus,
  AbusePriority,
  WarningType,
} from '@prisma/client'
import type { AbuseReport as PrismaAbuseReport, Prisma } from '@prisma/client'

export interface AbuseReport {
  id: string
  reporterId: string
  reportedUserId: string
  category: AbuseCategory
  description: string
  evidence?: string[]
  status: AbuseReportStatus
  priority: AbusePriority
  createdAt: Date
  resolvedAt?: Date
  resolvedBy?: string
  resolution?: string
}

export interface ContentModerationResult {
  isAppropriate: boolean
  confidence: number
  flags: string[]
  suggestedAction: 'APPROVE' | 'REVIEW' | 'REJECT' | 'AUTO_MODERATE'
}

export interface UserTrustScore {
  userId: string
  score: number
  factors: {
    accountAge: number
    verificationStatus: number
    reportHistory: number
    activityPattern: number
    communityFeedback: number
  }
  lastUpdated: Date
}

export class AbusePreventionService {
  private static readonly TRUST_SCORE_WEIGHTS = {
    accountAge: 0.2,
    verificationStatus: 0.25,
    reportHistory: 0.3,
    activityPattern: 0.15,
    communityFeedback: 0.1,
  }

  private static readonly CONTENT_FILTERS = {
    SPAM_KEYWORDS: [
      'garantizado',
      'dinero fácil',
      'sin riesgo',
      'oferta limitada',
      'haz clic aquí',
      'compra ahora',
      'gratis',
      'promoción especial',
    ],
    SUSPICIOUS_PATTERNS: [
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card patterns
      /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/, // SSN patterns
      /(whatsapp|telegram|email|contacto)\s*[:=]\s*[\w\+\-\.]+@[\w\-\.]+/i, // Contact info
      /\$\d+|\d+\s*(usd|clp|ars|pesos?)/i, // Money amounts
    ],
    PROFANITY_LIST: [
      // Add appropriate profanity filters for Spanish/Chilean context
      'idiota',
      'estúpido',
      'imbécil',
      'maldito',
    ],
  }

  /**
   * Submit abuse report
   */
  static async submitReport(
    reporterId: string,
    reportedUserId: string,
    category: AbuseCategory,
    description: string,
    _contentType: string = 'USER',
    _reportedContentId?: string,
    evidence?: string[]
  ): Promise<AbuseReport> {
    // Validate reporter can submit reports
    const canReport = await this.canUserReport(reporterId)
    if (!canReport) {
      throw new Error('Usuario no autorizado para reportar')
    }

    // Check for duplicate reports
    const existingReport = await prisma.abuseReport.findFirst({
      where: {
        reporterId: reporterId,
        reportedId: reportedUserId,
        status: {
          in: [AbuseReportStatus.PENDING, AbuseReportStatus.UNDER_REVIEW],
        },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    })

    if (existingReport) {
      throw new Error('Ya existe un reporte similar pendiente')
    }

    const reportId = crypto.randomUUID()
    const priority = this.calculateReportPriority(category, description)

    // Create report
    const report = await prisma.abuseReport.create({
      data: {
        id: reportId,
        reporterId: reporterId,
        reportedId: reportedUserId,
        category,
        description,
        evidence: evidence ? JSON.stringify(evidence) : undefined,
        priority,
        status: AbuseReportStatus.PENDING,
        createdAt: new Date(),
      },
    })

    // Update reported user's trust score
    await this.updateUserTrustScore(reportedUserId, 'REPORT_RECEIVED')

    // Auto-escalate critical reports
    if (priority === AbusePriority.URGENT) {
      await this.escalateReport(reportId)
    }

    // Log the report
    await AuditLogger.logSecurityEvent(
      reporterId,
      'ABUSE_REPORT_SUBMITTED',
      'moderation',
      'report',
      '',
      '',
      {
        reportId,
        reportedUserId,
        category,
        priority,
      }
    )

    return this.mapReportToInterface(report)
  }

  /**
   * Moderate content automatically
   */
  static async moderateContent(
    content: string,
    contentType: string,
    userId: string
  ): Promise<ContentModerationResult> {
    const flags: string[] = []
    let confidence = 0

    // Check for spam keywords
    const spamScore = this.checkSpamKeywords(content)
    if (spamScore > 0.3) {
      flags.push('POTENTIAL_SPAM')
      confidence += spamScore * 0.4
    }

    // Check for suspicious patterns
    const patternScore = this.checkSuspiciousPatterns(content)
    if (patternScore > 0.2) {
      flags.push('SUSPICIOUS_PATTERNS')
      confidence += patternScore * 0.3
    }

    // Check for profanity
    const profanityScore = this.checkProfanity(content)
    if (profanityScore > 0.1) {
      flags.push('INAPPROPRIATE_LANGUAGE')
      confidence += profanityScore * 0.2
    }

    // Check user trust score
    const userTrust = await this.getUserTrustScore(userId)
    if (userTrust.score < 0.3) {
      flags.push('LOW_TRUST_USER')
      confidence += 0.1
    }

    // Determine action
    let suggestedAction: 'APPROVE' | 'REVIEW' | 'REJECT' | 'AUTO_MODERATE'
    if (confidence >= 0.8) {
      suggestedAction = 'REJECT'
    } else if (confidence >= 0.5) {
      suggestedAction = 'REVIEW'
    } else if (confidence >= 0.3) {
      suggestedAction = 'AUTO_MODERATE'
    } else {
      suggestedAction = 'APPROVE'
    }

    const isAppropriate = confidence < 0.5

    // Log moderation result
    if (!isAppropriate) {
      await AuditLogger.logSecurityEvent(
        userId,
        'CONTENT_MODERATED',
        'moderation',
        'auto_moderate',
        '',
        '',
        {
          contentType,
          flags,
          confidence,
          suggestedAction,
        }
      )
    }

    return {
      isAppropriate,
      confidence,
      flags,
      suggestedAction,
    }
  }

  /**
   * Calculate and update user trust score
   */
  static async updateUserTrustScore(
    userId: string,
    event:
      | 'REPORT_RECEIVED'
      | 'REPORT_DISMISSED'
      | 'POSITIVE_FEEDBACK'
      | 'NEGATIVE_FEEDBACK'
      | 'VERIFICATION_COMPLETED'
  ): Promise<UserTrustScore> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            receivedReports: true,
            submittedReports: true,
            projects: true,
            reviews: true,
          },
        },
      },
    })

    if (!user) throw new Error('Usuario no encontrado')

    // Calculate factors (0-1 scale)
    const factors = {
      accountAge: this.calculateAccountAgeFactor(user.createdAt),
      verificationStatus: user.emailVerified ? 1.0 : 0.3,
      reportHistory: this.calculateReportHistoryFactor(
        user._count.receivedReports
      ),
      activityPattern: this.calculateActivityPatternFactor(
        user._count.projects
      ),
      communityFeedback: await this.calculateCommunityFeedbackFactor(userId),
    }

    // Apply event-based adjustments
    switch (event) {
      case 'REPORT_RECEIVED':
        factors.reportHistory = Math.max(0, factors.reportHistory - 0.1)
        break
      case 'REPORT_DISMISSED':
        factors.reportHistory = Math.min(1, factors.reportHistory + 0.05)
        break
      case 'POSITIVE_FEEDBACK':
        factors.communityFeedback = Math.min(
          1,
          factors.communityFeedback + 0.02
        )
        break
      case 'NEGATIVE_FEEDBACK':
        factors.communityFeedback = Math.max(
          0,
          factors.communityFeedback - 0.05
        )
        break
      case 'VERIFICATION_COMPLETED':
        factors.verificationStatus = 1.0
        break
    }

    // Calculate weighted score (0-1)
    const score = Object.entries(factors).reduce((total, [key, value]) => {
      const weight =
        this.TRUST_SCORE_WEIGHTS[key as keyof typeof this.TRUST_SCORE_WEIGHTS]
      return total + value * weight
    }, 0)

    // Map factors to schema fields (0-100 ints)
    const overallScore = Math.round(score * 100)
    const accountAgeScore = Math.round(factors.accountAge * 100)
    const verificationScore = Math.round(factors.verificationStatus * 100)
    const activityScore = Math.round(factors.activityPattern * 100)
    const reputationScore = Math.round(factors.communityFeedback * 100)
    const behaviorScore = Math.round(factors.reportHistory * 100)

    // Update or create trust score record (schema fields)
    await prisma.userTrustScore.upsert({
      where: { userId },
      update: {
        overallScore,
        accountAgeScore,
        verificationScore,
        activityScore,
        reputationScore,
        behaviorScore,
        lastCalculated: new Date(),
      },
      create: {
        userId,
        overallScore,
        accountAgeScore,
        verificationScore,
        activityScore,
        reputationScore,
        behaviorScore,
        lastCalculated: new Date(),
        createdAt: new Date(),
      },
    })

    return {
      userId,
      score, // keep 0-1 scale for internal usage
      factors,
      lastUpdated: new Date(),
    }
  }

  /**
   * Get user trust score
   */
  static async getUserTrustScore(userId: string): Promise<UserTrustScore> {
    const trustScore = await prisma.userTrustScore.findUnique({
      where: { userId },
    })

    if (!trustScore) {
      // Calculate initial trust score
      return await this.updateUserTrustScore(userId, 'POSITIVE_FEEDBACK')
    }

    return {
      userId: trustScore.userId,
      score: trustScore.overallScore / 100,
      factors: {
        accountAge: trustScore.accountAgeScore / 100,
        verificationStatus: trustScore.verificationScore / 100,
        reportHistory: trustScore.behaviorScore / 100,
        activityPattern: trustScore.activityScore / 100,
        communityFeedback: trustScore.reputationScore / 100,
      },
      lastUpdated: trustScore.updatedAt,
    }
  }

  /**
   * Process abuse report
   */
  static async processReport(
    reportId: string,
    moderatorId: string,
    action: 'DISMISS' | 'WARN' | 'SUSPEND' | 'BAN',
    resolution: string
  ): Promise<boolean> {
    const report = await prisma.abuseReport.findUnique({
      where: { id: reportId },
    })

    if (!report || report.status !== AbuseReportStatus.PENDING) {
      return false
    }

    // Update report status
    await prisma.abuseReport.update({
      where: { id: reportId },
      data: {
        status: AbuseReportStatus.RESOLVED,
        reviewedAt: new Date(),
        reviewedBy: moderatorId,
        resolution,
      },
    })

    // Apply action to reported user
    await this.applyModerationAction(
      report.reportedId,
      action,
      resolution,
      moderatorId
    )

    // Update trust scores
    if (action === 'DISMISS') {
      await this.updateUserTrustScore(report.reportedId, 'REPORT_DISMISSED')
    } else {
      await this.updateUserTrustScore(report.reportedId, 'NEGATIVE_FEEDBACK')
    }

    // Log moderation action
    await AuditLogger.logAdminAction(
      moderatorId,
      report.reportedId,
      `MODERATION_${action}`,
      'user_moderation',
      '',
      '',
      { reportId: report.id },
      { action, resolution }
    )

    return true
  }

  /**
   * Get pending reports for moderation
   */
  static async getPendingReports(
    limit: number = 50,
    priority?: AbusePriority
  ): Promise<AbuseReport[]> {
    const whereClause: Prisma.AbuseReportWhereInput = {
      status: AbuseReportStatus.PENDING,
    }
    if (priority) {
      whereClause.priority = priority
    }

    const reports = await prisma.abuseReport.findMany({
      where: whereClause,
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      take: limit,
      include: {
        reporter: { select: { id: true, email: true, name: true } },
        reported: { select: { id: true, email: true, name: true } },
      },
    })

    return reports.map(report => this.mapReportToInterface(report))
  }

  /**
   * Auto-moderate based on patterns
   */
  static async autoModerate(): Promise<{
    processed: number
    actions: Array<{ userId: string; action: string; reason: string }>
  }> {
    const actions: Array<{ userId: string; action: string; reason: string }> =
      []

    // Find users with multiple recent reports
    const problematicUsers = await prisma.abuseReport.groupBy({
      by: ['reportedId'],
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        status: AbuseReportStatus.PENDING,
      },
      _count: { reportedId: true },
      having: { reportedId: { _count: { gte: 3 } } },
    })

    for (const user of problematicUsers) {
      const trustScore = await this.getUserTrustScore(
        (user as unknown as { reportedId: string }).reportedId
      )

      if (trustScore.score < 0.2) {
        const targetUserId = (user as unknown as { reportedId: string })
          .reportedId
        await this.applyModerationAction(
          targetUserId,
          'SUSPEND',
          'Auto-suspended due to multiple reports and low trust score',
          'system'
        )

        actions.push({
          userId: targetUserId,
          action: 'SUSPEND',
          reason: 'Multiple reports + low trust score',
        })
      }
    }

    return {
      processed: actions.length,
      actions,
    }
  }

  /**
   * Private helper methods
   */
  private static async canUserReport(userId: string): Promise<boolean> {
    // Check if user is not suspended/banned
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true },
    })

    if (!user || user.status === 'SUSPENDED' || user.status === 'BANNED') {
      return false
    }

    // Check report rate limiting (max 5 reports per day)
    const recentReports = await prisma.abuseReport.count({
      where: {
        reporterId: userId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    })

    return recentReports < 5
  }

  private static calculateReportPriority(
    category: AbuseCategory,
    description: string
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
    if (category === 'FRAUD' || category === 'SCAM') {
      return 'URGENT'
    }

    if (
      category === 'HARASSMENT' ||
      description.toLowerCase().includes('amenaza')
    ) {
      return 'HIGH'
    }

    if (category === 'SPAM' || category === 'INAPPROPRIATE_CONTENT') {
      return 'MEDIUM'
    }

    return 'LOW'
  }

  private static checkSpamKeywords(content: string): number {
    const lowerContent = content.toLowerCase()
    const matches = this.CONTENT_FILTERS.SPAM_KEYWORDS.filter(keyword =>
      lowerContent.includes(keyword.toLowerCase())
    )

    return Math.min(
      1,
      (matches.length / this.CONTENT_FILTERS.SPAM_KEYWORDS.length) * 2
    )
  }

  private static checkSuspiciousPatterns(content: string): number {
    const matches = this.CONTENT_FILTERS.SUSPICIOUS_PATTERNS.filter(pattern =>
      pattern.test(content)
    )

    return Math.min(
      1,
      matches.length / this.CONTENT_FILTERS.SUSPICIOUS_PATTERNS.length
    )
  }

  private static checkProfanity(content: string): number {
    const lowerContent = content.toLowerCase()
    const matches = this.CONTENT_FILTERS.PROFANITY_LIST.filter(word =>
      lowerContent.includes(word)
    )

    return Math.min(
      1,
      matches.length / this.CONTENT_FILTERS.PROFANITY_LIST.length
    )
  }

  private static calculateAccountAgeFactor(createdAt: Date): number {
    const ageInDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    return Math.min(1, ageInDays / 365) // Full score after 1 year
  }

  private static calculateReportHistoryFactor(reportCount: number): number {
    return Math.max(0, 1 - reportCount * 0.1) // Decrease by 0.1 per report
  }

  private static calculateActivityPatternFactor(projectCount: number): number {
    return Math.min(1, projectCount / 10) // Full score after 10 projects
  }

  private static async calculateCommunityFeedbackFactor(
    userId: string
  ): Promise<number> {
    // Simplified - in production, calculate from reviews and ratings
    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      select: { rating: true },
    })

    if (reviews.length === 0) return 0.5 // Neutral for new users

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    return avgRating / 5 // Normalize to 0-1
  }

  private static async escalateReport(reportId: string): Promise<void> {
    await prisma.abuseReport.update({
      where: { id: reportId },
      data: { status: AbuseReportStatus.UNDER_REVIEW },
    })

    // In production, send notification to moderators
  }

  private static async applyModerationAction(
    userId: string,
    action: 'DISMISS' | 'WARN' | 'SUSPEND' | 'BAN',
    reason: string,
    moderatorId: string
  ): Promise<void> {
    switch (action) {
      case 'WARN':
        await prisma.userWarning.create({
          data: {
            userId: userId,
            type: WarningType.BEHAVIOR,
            reason,
            issuedBy: moderatorId,
            createdAt: new Date(),
          },
        })
        break

      case 'SUSPEND':
        await prisma.user.update({
          where: { id: userId },
          data: {
            status: 'SUSPENDED',
            suspended_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            suspension_reason: reason,
          },
        })
        break

      case 'BAN':
        await prisma.user.update({
          where: { id: userId },
          data: {
            status: 'BANNED',
            ban_reason: reason,
          },
        })
        break
    }
  }

  private static mapReportToInterface(report: PrismaAbuseReport): AbuseReport {
    return {
      id: report.id,
      reporterId: report.reporterId,
      reportedUserId: report.reportedId,
      category: report.category,
      description: report.description,
      evidence: report.evidence ? JSON.parse(report.evidence) : undefined,
      status: report.status,
      priority: report.priority,
      createdAt: report.createdAt,
      resolvedAt: report.reviewedAt ?? undefined,
      resolvedBy: report.reviewedBy ?? undefined,
      resolution: report.resolution ?? undefined,
    }
  }
}
