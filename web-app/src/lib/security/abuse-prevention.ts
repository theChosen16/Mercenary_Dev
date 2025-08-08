import { prisma } from '@/lib/prisma'
import { AuditLogger } from './audit-logger'
import crypto from 'crypto'

export interface AbuseReport {
  id: string
  reporterId: string
  reportedUserId: string
  reportedContentId?: string
  contentType: 'USER' | 'PROJECT' | 'MESSAGE' | 'REVIEW' | 'OTHER'
  category: 'SPAM' | 'HARASSMENT' | 'FRAUD' | 'INAPPROPRIATE_CONTENT' | 'FAKE_PROFILE' | 'SCAM' | 'OTHER'
  description: string
  evidence?: string[]
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
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
    communityFeedback: 0.1
  }
  
  private static readonly CONTENT_FILTERS = {
    SPAM_KEYWORDS: [
      'garantizado', 'dinero fácil', 'sin riesgo', 'oferta limitada',
      'haz clic aquí', 'compra ahora', 'gratis', 'promoción especial'
    ],
    SUSPICIOUS_PATTERNS: [
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card patterns
      /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/, // SSN patterns
      /(whatsapp|telegram|email|contacto)\s*[:=]\s*[\w\+\-\.]+@[\w\-\.]+/i, // Contact info
      /\$\d+|\d+\s*(usd|clp|ars|pesos?)/i // Money amounts
    ],
    PROFANITY_LIST: [
      // Add appropriate profanity filters for Spanish/Chilean context
      'idiota', 'estúpido', 'imbécil', 'maldito'
    ]
  }
  
  /**
   * Submit abuse report
   */
  static async submitReport(
    reporterId: string,
    reportedUserId: string,
    category: string,
    description: string,
    contentType: string = 'USER',
    reportedContentId?: string,
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
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        reported_content_id: reportedContentId,
        status: { in: ['PENDING', 'INVESTIGATING'] },
        created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    })
    
    if (existingReport) {
      throw new Error('Ya existe un reporte similar pendiente')
    }
    
    const reportId = crypto.randomUUID()
    const severity = this.calculateReportSeverity(category, description)
    
    // Create report
    const report = await prisma.abuseReport.create({
      data: {
        id: reportId,
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        reported_content_id: reportedContentId,
        content_type: contentType as any,
        category: category as any,
        description,
        evidence: evidence ? JSON.stringify(evidence) : null,
        severity,
        status: 'PENDING',
        created_at: new Date()
      }
    })
    
    // Update reported user's trust score
    await this.updateUserTrustScore(reportedUserId, 'REPORT_RECEIVED')
    
    // Auto-escalate critical reports
    if (severity === 'CRITICAL') {
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
        severity
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
    let flags: string[] = []
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
          suggestedAction
        }
      )
    }
    
    return {
      isAppropriate,
      confidence,
      flags,
      suggestedAction
    }
  }
  
  /**
   * Calculate and update user trust score
   */
  static async updateUserTrustScore(
    userId: string,
    event: 'REPORT_RECEIVED' | 'REPORT_DISMISSED' | 'POSITIVE_FEEDBACK' | 'NEGATIVE_FEEDBACK' | 'VERIFICATION_COMPLETED'
  ): Promise<UserTrustScore> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            receivedReports: true,
            submittedReports: true,
            projects: true,
            reviews: true
          }
        }
      }
    })
    
    if (!user) throw new Error('Usuario no encontrado')
    
    // Calculate factors
    const factors = {
      accountAge: this.calculateAccountAgeFactor(user.created_at),
      verificationStatus: user.email_verified ? 1.0 : 0.3,
      reportHistory: this.calculateReportHistoryFactor(user._count.receivedReports),
      activityPattern: this.calculateActivityPatternFactor(user._count.projects),
      communityFeedback: await this.calculateCommunityFeedbackFactor(userId)
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
        factors.communityFeedback = Math.min(1, factors.communityFeedback + 0.02)
        break
      case 'NEGATIVE_FEEDBACK':
        factors.communityFeedback = Math.max(0, factors.communityFeedback - 0.05)
        break
      case 'VERIFICATION_COMPLETED':
        factors.verificationStatus = 1.0
        break
    }
    
    // Calculate weighted score
    const score = Object.entries(factors).reduce((total, [key, value]) => {
      const weight = this.TRUST_SCORE_WEIGHTS[key as keyof typeof this.TRUST_SCORE_WEIGHTS]
      return total + (value * weight)
    }, 0)
    
    // Update or create trust score record
    await prisma.userTrustScore.upsert({
      where: { user_id: userId },
      update: {
        score,
        account_age_factor: factors.accountAge,
        verification_factor: factors.verificationStatus,
        report_history_factor: factors.reportHistory,
        activity_pattern_factor: factors.activityPattern,
        community_feedback_factor: factors.communityFeedback,
        updated_at: new Date()
      },
      create: {
        user_id: userId,
        score,
        account_age_factor: factors.accountAge,
        verification_factor: factors.verificationStatus,
        report_history_factor: factors.reportHistory,
        activity_pattern_factor: factors.activityPattern,
        community_feedback_factor: factors.communityFeedback,
        created_at: new Date(),
        updated_at: new Date()
      }
    })
    
    return {
      userId,
      score,
      factors,
      lastUpdated: new Date()
    }
  }
  
  /**
   * Get user trust score
   */
  static async getUserTrustScore(userId: string): Promise<UserTrustScore> {
    const trustScore = await prisma.userTrustScore.findUnique({
      where: { user_id: userId }
    })
    
    if (!trustScore) {
      // Calculate initial trust score
      return await this.updateUserTrustScore(userId, 'POSITIVE_FEEDBACK')
    }
    
    return {
      userId: trustScore.user_id,
      score: trustScore.score,
      factors: {
        accountAge: trustScore.account_age_factor,
        verificationStatus: trustScore.verification_factor,
        reportHistory: trustScore.report_history_factor,
        activityPattern: trustScore.activity_pattern_factor,
        communityFeedback: trustScore.community_feedback_factor
      },
      lastUpdated: trustScore.updated_at
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
      where: { id: reportId }
    })
    
    if (!report || report.status !== 'PENDING') {
      return false
    }
    
    // Update report status
    await prisma.abuseReport.update({
      where: { id: reportId },
      data: {
        status: 'RESOLVED',
        resolved_at: new Date(),
        resolved_by: moderatorId,
        resolution
      }
    })
    
    // Apply action to reported user
    await this.applyModerationAction(report.reported_user_id, action, resolution, moderatorId)
    
    // Update trust scores
    if (action === 'DISMISS') {
      await this.updateUserTrustScore(report.reported_user_id, 'REPORT_DISMISSED')
    } else {
      await this.updateUserTrustScore(report.reported_user_id, 'NEGATIVE_FEEDBACK')
    }
    
    // Log moderation action
    await AuditLogger.logAdminAction(
      moderatorId,
      report.reported_user_id,
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
    severity?: string
  ): Promise<AbuseReport[]> {
    const whereClause: any = { status: 'PENDING' }
    if (severity) {
      whereClause.severity = severity
    }
    
    const reports = await prisma.abuseReport.findMany({
      where: whereClause,
      orderBy: [
        { severity: 'desc' },
        { created_at: 'asc' }
      ],
      take: limit,
      include: {
        reporter: { select: { id: true, email: true, name: true } },
        reportedUser: { select: { id: true, email: true, name: true } }
      }
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
    const actions: Array<{ userId: string; action: string; reason: string }> = []
    
    // Find users with multiple recent reports
    const problematicUsers = await prisma.abuseReport.groupBy({
      by: ['reported_user_id'],
      where: {
        created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        status: 'PENDING'
      },
      _count: { reported_user_id: true },
      having: { reported_user_id: { _count: { gte: 3 } } }
    })
    
    for (const user of problematicUsers) {
      const trustScore = await this.getUserTrustScore(user.reported_user_id)
      
      if (trustScore.score < 0.2) {
        await this.applyModerationAction(
          user.reported_user_id,
          'SUSPEND',
          'Auto-suspended due to multiple reports and low trust score',
          'system'
        )
        
        actions.push({
          userId: user.reported_user_id,
          action: 'SUSPEND',
          reason: 'Multiple reports + low trust score'
        })
      }
    }
    
    return {
      processed: actions.length,
      actions
    }
  }
  
  /**
   * Private helper methods
   */
  private static async canUserReport(userId: string): Promise<boolean> {
    // Check if user is not suspended/banned
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true }
    })
    
    if (!user || user.status === 'SUSPENDED' || user.status === 'BANNED') {
      return false
    }
    
    // Check report rate limiting (max 5 reports per day)
    const recentReports = await prisma.abuseReport.count({
      where: {
        reporter_id: userId,
        created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    })
    
    return recentReports < 5
  }
  
  private static calculateReportSeverity(category: string, description: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (category === 'FRAUD' || category === 'SCAM') {
      return 'CRITICAL'
    }
    
    if (category === 'HARASSMENT' || description.toLowerCase().includes('amenaza')) {
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
    
    return Math.min(1, matches.length / this.CONTENT_FILTERS.SPAM_KEYWORDS.length * 2)
  }
  
  private static checkSuspiciousPatterns(content: string): number {
    const matches = this.CONTENT_FILTERS.SUSPICIOUS_PATTERNS.filter(pattern =>
      pattern.test(content)
    )
    
    return Math.min(1, matches.length / this.CONTENT_FILTERS.SUSPICIOUS_PATTERNS.length)
  }
  
  private static checkProfanity(content: string): number {
    const lowerContent = content.toLowerCase()
    const matches = this.CONTENT_FILTERS.PROFANITY_LIST.filter(word =>
      lowerContent.includes(word)
    )
    
    return Math.min(1, matches.length / this.CONTENT_FILTERS.PROFANITY_LIST.length)
  }
  
  private static calculateAccountAgeFactor(createdAt: Date): number {
    const ageInDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    return Math.min(1, ageInDays / 365) // Full score after 1 year
  }
  
  private static calculateReportHistoryFactor(reportCount: number): number {
    return Math.max(0, 1 - (reportCount * 0.1)) // Decrease by 0.1 per report
  }
  
  private static calculateActivityPatternFactor(projectCount: number): number {
    return Math.min(1, projectCount / 10) // Full score after 10 projects
  }
  
  private static async calculateCommunityFeedbackFactor(userId: string): Promise<number> {
    // Simplified - in production, calculate from reviews and ratings
    const reviews = await prisma.review.findMany({
      where: { reviewed_user_id: userId },
      select: { rating: true }
    })
    
    if (reviews.length === 0) return 0.5 // Neutral for new users
    
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    return avgRating / 5 // Normalize to 0-1
  }
  
  private static async escalateReport(reportId: string): Promise<void> {
    await prisma.abuseReport.update({
      where: { id: reportId },
      data: { status: 'INVESTIGATING' }
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
            user_id: userId,
            reason,
            issued_by: moderatorId,
            created_at: new Date()
          }
        })
        break
        
      case 'SUSPEND':
        await prisma.user.update({
          where: { id: userId },
          data: {
            status: 'SUSPENDED',
            suspended_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            suspension_reason: reason
          }
        })
        break
        
      case 'BAN':
        await prisma.user.update({
          where: { id: userId },
          data: {
            status: 'BANNED',
            ban_reason: reason
          }
        })
        break
    }
  }
  
  private static mapReportToInterface(report: any): AbuseReport {
    return {
      id: report.id,
      reporterId: report.reporter_id,
      reportedUserId: report.reported_user_id,
      reportedContentId: report.reported_content_id,
      contentType: report.content_type,
      category: report.category,
      description: report.description,
      evidence: report.evidence ? JSON.parse(report.evidence) : undefined,
      status: report.status,
      severity: report.severity,
      createdAt: report.created_at,
      resolvedAt: report.resolved_at,
      resolvedBy: report.resolved_by,
      resolution: report.resolution
    }
  }
}
