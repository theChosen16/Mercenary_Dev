import { prisma } from '@/lib/prisma'
import { AuditLogger } from './audit-logger'

export interface RateLimitRule {
  endpoint: string
  maxRequests: number
  windowMs: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: unknown) => string
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: Date
  retryAfter?: number
  reason?: string
}

export interface FraudDetectionResult {
  isFraudulent: boolean
  riskScore: number
  reasons: string[]
  action: 'ALLOW' | 'CHALLENGE' | 'BLOCK'
}

export class RateLimiter {
  private static readonly DEFAULT_RULES: Record<string, RateLimitRule> = {
    // Authentication endpoints
    '/api/auth/login': {
      endpoint: '/api/auth/login',
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
    }, // 5 attempts per 15 minutes
    '/api/auth/register': {
      endpoint: '/api/auth/register',
      maxRequests: 3,
      windowMs: 60 * 60 * 1000,
    }, // 3 registrations per hour
    '/api/auth/forgot-password': {
      endpoint: '/api/auth/forgot-password',
      maxRequests: 3,
      windowMs: 60 * 60 * 1000,
    },

    // API endpoints
    '/api/projects': {
      endpoint: '/api/projects',
      maxRequests: 100,
      windowMs: 60 * 60 * 1000,
    }, // 100 requests per hour
    '/api/messages': {
      endpoint: '/api/messages',
      maxRequests: 200,
      windowMs: 60 * 60 * 1000,
    }, // 200 messages per hour
    '/api/search': {
      endpoint: '/api/search',
      maxRequests: 50,
      windowMs: 60 * 60 * 1000,
    }, // 50 searches per hour

    // Payment endpoints
    '/api/payments': {
      endpoint: '/api/payments',
      maxRequests: 10,
      windowMs: 60 * 60 * 1000,
    }, // 10 payments per hour
    '/api/subscription': {
      endpoint: '/api/subscription',
      maxRequests: 5,
      windowMs: 60 * 60 * 1000,
    }, // 5 subscription changes per hour

    // Admin endpoints
    '/api/admin': {
      endpoint: '/api/admin',
      maxRequests: 50,
      windowMs: 60 * 60 * 1000,
    }, // 50 admin actions per hour
  }

  // In-memory CAPTCHA store (ephemeral 5-minute TTL)
  private static captchaStore = new Map<
    string,
    { identifier: string; challenge: string; expiresAt: Date }
  >()

  /**
   * Check rate limit for a request
   * Overloads:
   * - checkRateLimit(identifier, endpoint)
   * - checkRateLimit(endpoint, identifier, ipAddress, userAgent)
   */
  static async checkRateLimit(
    identifier: string,
    endpoint: string
  ): Promise<RateLimitResult>
  static async checkRateLimit(
    endpoint: string,
    identifier: string,
    ipAddress: string,
    userAgent: string
  ): Promise<RateLimitResult>
  static async checkRateLimit(
    a: string,
    b: string,
    c?: string,
    d?: string
  ): Promise<RateLimitResult> {
    // Normalize arguments to internal variables
    const twoArgMode = typeof c === 'undefined' && typeof d === 'undefined'
    const identifier = twoArgMode ? a : b
    const endpoint = twoArgMode ? b : a
    const ipAddress = twoArgMode ? '' : (c as string)
    const userAgent = twoArgMode ? '' : (d as string)

    const rule = this.DEFAULT_RULES[endpoint] || this.getDefaultRule(endpoint)
    const now = new Date()
    const windowThreshold = new Date(now.getTime() - rule.windowMs)

    // Reset outdated window for this identifier/endpoint
    await this.cleanupOldEntries(identifier, endpoint, windowThreshold)

    const uniqueWhere = {
      identifier_endpoint: { identifier, endpoint },
    } as const
    const existing = await prisma.rateLimit.findUnique({ where: uniqueWhere })

    // Start a new window if none or expired
    if (!existing || existing.windowStart < windowThreshold) {
      await prisma.rateLimit.upsert({
        where: uniqueWhere,
        update: {
          requests: 1,
          windowStart: now,
          isBlocked: false,
          blockedUntil: null,
        },
        create: {
          identifier,
          endpoint,
          requests: 1,
          windowStart: now,
          isBlocked: false,
        },
      })

      return {
        allowed: true,
        remaining: Math.max(0, rule.maxRequests - 1),
        resetTime: new Date(now.getTime() + rule.windowMs),
      }
    }

    // Enforce block if active
    if (
      existing.isBlocked &&
      existing.blockedUntil &&
      existing.blockedUntil > now
    ) {
      const retryAfter = Math.ceil(
        (existing.blockedUntil.getTime() - now.getTime()) / 1000
      )
      return {
        allowed: false,
        remaining: 0,
        resetTime: existing.blockedUntil,
        retryAfter,
        reason: 'rate_limit_exceeded',
      }
    }

    const newCount = existing.requests + 1
    const allowed = newCount <= rule.maxRequests
    const remaining = Math.max(0, rule.maxRequests - newCount)
    const resetTime = new Date(existing.windowStart.getTime() + rule.windowMs)

    await prisma.rateLimit.update({
      where: uniqueWhere,
      data: { requests: newCount },
    })

    if (!allowed) {
      await AuditLogger.logSecurityEvent(
        identifier,
        'RATE_LIMIT_EXCEEDED',
        endpoint,
        'request',
        ipAddress,
        userAgent || '',
        {
          currentCount: existing.requests,
          maxRequests: rule.maxRequests,
          windowMs: rule.windowMs,
          identifier,
        }
      )
    }

    return {
      allowed,
      remaining,
      resetTime,
      retryAfter: allowed
        ? undefined
        : Math.ceil((resetTime.getTime() - now.getTime()) / 1000),
      reason: allowed ? undefined : 'rate_limit_exceeded',
    }
  }

  /**
   * Detect fraudulent behavior patterns
   */
  static async detectFraud(
    userId: string,
    action: string,
    ipAddress: string,
    userAgent: string,
    metadata?: Record<string, unknown>
  ): Promise<FraudDetectionResult> {
    let riskScore = 0
    const reasons: string[] = []

    // Check for suspicious IP patterns
    const ipRisk = await this.analyzeIPRisk(ipAddress, userId)
    riskScore += ipRisk.score
    if (ipRisk.reasons.length > 0) {
      reasons.push(...ipRisk.reasons)
    }

    // Check for unusual user behavior
    const behaviorRisk = await this.analyzeUserBehavior(userId, action)
    riskScore += behaviorRisk.score
    if (behaviorRisk.reasons.length > 0) {
      reasons.push(...behaviorRisk.reasons)
    }

    // Check for device/browser anomalies
    const deviceRisk = await this.analyzeDeviceRisk(userId, userAgent)
    riskScore += deviceRisk.score
    if (deviceRisk.reasons.length > 0) {
      reasons.push(...deviceRisk.reasons)
    }

    // Check for temporal anomalies
    const temporalRisk = await this.analyzeTemporalPatterns(userId, action)
    riskScore += temporalRisk.score
    if (temporalRisk.reasons.length > 0) {
      reasons.push(...temporalRisk.reasons)
    }

    // Determine action based on risk score
    let action_result: 'ALLOW' | 'CHALLENGE' | 'BLOCK'
    if (riskScore >= 80) action_result = 'BLOCK'
    else if (riskScore >= 50) action_result = 'CHALLENGE'
    else action_result = 'ALLOW'

    const isFraudulent = riskScore >= 50

    // Log fraud detection result
    if (isFraudulent) {
      await AuditLogger.logSecurityEvent(
        userId,
        'FRAUD_DETECTED',
        'fraud_detection',
        action,
        ipAddress,
        userAgent,
        {
          riskScore,
          reasons,
          action: action_result,
          metadata,
        }
      )
    }

    return {
      isFraudulent,
      riskScore,
      reasons,
      action: action_result,
    }
  }

  /**
   * Test-friendly fraud risk calculator expected by integration tests
   * Returns normalized score (0-100) and contributing factors
   */
  static async calculateFraudRisk(input: {
    userId: string
    ipAddress: string
    action: string
    amount?: number
    userAgent?: string
  }): Promise<{ score: number; factors: Record<string, unknown> }> {
    const factors: Record<string, unknown> = {}
    let score = 0

    // Amount-based risk (scale up to 40 points around 100k)
    if (typeof input.amount === 'number') {
      const amountRisk = Math.min(40, (input.amount / 100000) * 40)
      factors.amountRisk = Math.round(amountRisk)
      score += amountRisk
    } else {
      factors.amountRisk = 0
    }

    // IP risk
    const ipRisk = await this.analyzeIPRisk(input.ipAddress, input.userId)
    factors.ipRisk = ipRisk.score
    score += ipRisk.score

    // Behavior risk
    const behaviorRisk = await this.analyzeUserBehavior(
      input.userId,
      input.action
    )
    factors.behaviorRisk = behaviorRisk.score
    score += behaviorRisk.score

    // Device risk
    const deviceRisk = await this.analyzeDeviceRisk(
      input.userId,
      input.userAgent || ''
    )
    factors.deviceRisk = deviceRisk.score
    score += deviceRisk.score

    // Temporal risk
    const temporalRisk = await this.analyzeTemporalPatterns(
      input.userId,
      input.action
    )
    factors.temporalRisk = temporalRisk.score
    score += temporalRisk.score

    // Normalize to 0-100
    score = Math.max(0, Math.min(100, Math.round(score)))

    return { score, factors }
  }

  /**
   * Block IP address temporarily or permanently
   */
  static async blockIP(
    ipAddress: string,
    reason: string,
    duration?: number,
    blockedBy?: string
  ): Promise<void> {
    const expiresAt = duration
      ? new Date(Date.now() + duration)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    const endpoint = 'GLOBAL'
    const uniqueWhere = {
      identifier_endpoint: { identifier: ipAddress, endpoint },
    } as const
    const now = new Date()
    await prisma.rateLimit.upsert({
      where: uniqueWhere,
      update: {
        isBlocked: true,
        blockedUntil: expiresAt,
        windowStart: now,
      },
      create: {
        identifier: ipAddress,
        endpoint,
        requests: 0,
        windowStart: now,
        isBlocked: true,
        blockedUntil: expiresAt,
      },
    })

    // Log IP blocking
    await AuditLogger.logSecurityEvent(
      blockedBy || 'system',
      'IP_BLOCKED',
      'security',
      'block_ip',
      ipAddress,
      '',
      {
        reason,
        duration,
        permanent: !duration,
      }
    )
  }

  /**
   * Check if IP address is blocked
   */
  static async isIPBlocked(ipAddress: string): Promise<boolean> {
    const record = await prisma.rateLimit.findUnique({
      where: {
        identifier_endpoint: { identifier: ipAddress, endpoint: 'GLOBAL' },
      },
    })
    if (!record) return false
    if (!record.isBlocked) return false
    if (record.blockedUntil && record.blockedUntil < new Date()) {
      await prisma.rateLimit.update({
        where: {
          identifier_endpoint: { identifier: ipAddress, endpoint: 'GLOBAL' },
        },
        data: { isBlocked: false, blockedUntil: null },
      })
      return false
    }
    return true
  }

  /**
   * Implement CAPTCHA challenge
   */
  static async createCaptchaChallenge(identifier: string): Promise<{
    challengeId: string
    challenge: string
    expiresAt: Date
  }> {
    const challengeId = this.generateChallengeId()
    const challenge = this.generateCaptchaChallenge()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    this.captchaStore.set(challengeId, { identifier, challenge, expiresAt })
    return { challengeId, challenge, expiresAt }
  }

  /**
   * Verify CAPTCHA response
   */
  static async verifyCaptcha(
    challengeId: string,
    response: string
  ): Promise<boolean> {
    const item = this.captchaStore.get(challengeId)
    if (!item) return false
    if (item.expiresAt < new Date()) {
      this.captchaStore.delete(challengeId)
      return false
    }
    const isValid = this.validateCaptchaResponse(item.challenge, response)
    this.captchaStore.delete(challengeId)
    return isValid
  }

  /**
   * Get rate limit statistics
   */
  static async getRateLimitStats(
    timeWindow: number = 24 * 60 * 60 * 1000
  ): Promise<{
    totalRequests: number
    blockedRequests: number
    topEndpoints: Array<{ endpoint: string; count: number }>
    topIPs: Array<{ ipAddress: string; count: number }>
  }> {
    const since = new Date(Date.now() - timeWindow)

    const totalAgg = await prisma.rateLimit.aggregate({
      where: { windowStart: { gte: since } },
      _sum: { requests: true },
    })
    const totalRequests = totalAgg._sum.requests || 0

    const blockedRequests = await prisma.auditLog.count({
      where: {
        action: { contains: 'RATE_LIMIT_EXCEEDED' },
        createdAt: { gte: since },
      },
    })

    const topEndpointsRaw = await prisma.rateLimit.groupBy({
      by: ['endpoint'],
      where: { windowStart: { gte: since } },
      _sum: { requests: true },
      orderBy: { _sum: { requests: 'desc' } },
      take: 10,
    })

    const topEndpoints = topEndpointsRaw.map(
      (item: { endpoint: string; _sum: { requests: number | null } }) => ({
        endpoint: item.endpoint,
        count: item._sum.requests || 0,
      })
    )

    const recent = await prisma.rateLimit.findMany({
      where: { windowStart: { gte: since } },
    })
    const ipCounts = new Map<string, number>()
    const ipv4Pattern = /^(?:\d{1,3}\.){3}\d{1,3}$/
    for (const r of recent) {
      if (ipv4Pattern.test(r.identifier)) {
        ipCounts.set(
          r.identifier,
          (ipCounts.get(r.identifier) || 0) + r.requests
        )
      }
    }
    const topIPs = Array.from(ipCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ip, count]) => ({ ipAddress: ip, count }))

    return {
      totalRequests,
      blockedRequests,
      topEndpoints,
      topIPs,
    }
  }

  /**
   * Private helper methods
   */
  private static getDefaultRule(endpoint: string): RateLimitRule {
    return {
      endpoint,
      maxRequests: 60,
      windowMs: 60 * 60 * 1000, // Default: 60 requests per hour
    }
  }

  private static async cleanupOldEntries(
    identifier: string,
    endpoint: string,
    windowStart: Date
  ): Promise<void> {
    await prisma.rateLimit.updateMany({
      where: { identifier, endpoint, windowStart: { lt: windowStart } },
      data: { requests: 0, windowStart },
    })
  }

  private static async analyzeIPRisk(
    ipAddress: string,
    userId: string
  ): Promise<{
    score: number
    reasons: string[]
  }> {
    let score = 0
    const reasons: string[] = []

    // Check if IP is in known threat databases (simplified)
    if (await this.isKnownThreatIP(ipAddress)) {
      score += 40
      reasons.push('IP address in threat database')
    }

    // Check for multiple users from same IP
    const usersFromIP = await prisma.auditLog.findMany({
      where: {
        ipAddress: ipAddress,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      select: { userId: true },
      distinct: ['userId'],
    })

    if (usersFromIP.length > 5) {
      score += 20
      reasons.push('Multiple users from same IP')
    }

    // Check for rapid IP changes for this user
    const recentIPs = await prisma.auditLog.findMany({
      where: {
        userId: userId,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
      select: { ipAddress: true },
      distinct: ['ipAddress'],
    })

    if (recentIPs.length > 3) {
      score += 15
      reasons.push('Rapid IP address changes')
    }

    return { score, reasons }
  }

  private static async analyzeUserBehavior(
    userId: string,
    action: string
  ): Promise<{ score: number; reasons: string[] }> {
    let score = 0
    const reasons: string[] = []

    // Check for unusual activity volume
    const recentActivity = await prisma.auditLog.count({
      where: {
        userId: userId,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    })

    if (recentActivity > 100) {
      score += 25
      reasons.push('Unusually high activity volume')
    }

    // Check for new user with high-value actions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    })

    if (user && user.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      if (action.includes('payment') || action.includes('transfer')) {
        score += 30
        reasons.push('New user attempting high-value action')
      }
    }

    return { score, reasons }
  }

  private static async analyzeDeviceRisk(
    userId: string,
    userAgent: string
  ): Promise<{ score: number; reasons: string[] }> {
    let score = 0
    const reasons: string[] = []

    // Check for unusual user agent
    if (this.isUnusualUserAgent(userAgent)) {
      score += 15
      reasons.push('Unusual or suspicious user agent')
    }

    // Check for device consistency
    const recentSessions = await prisma.userSession.findMany({
      where: {
        userId: userId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { userAgent: true, ipAddress: true },
    })

    const uniqueUserAgents = new Set(recentSessions.map(s => s.userAgent))
    if (uniqueUserAgents.size > 5) {
      score += 10
      reasons.push('Multiple different devices/browsers')
    }

    return { score, reasons }
  }

  private static async analyzeTemporalPatterns(
    userId: string,
    action: string
  ): Promise<{ score: number; reasons: string[] }> {
    let score = 0
    const reasons: string[] = []

    const now = new Date()
    const hour = now.getHours()

    // Check for unusual hours (2 AM - 6 AM)
    if (hour >= 2 && hour <= 6) {
      score += 10
      reasons.push('Activity during unusual hours')
    }

    // Check for weekend high-value activities
    const dayOfWeek = now.getDay()
    if (
      (dayOfWeek === 0 || dayOfWeek === 6) &&
      (action.includes('payment') || action.includes('admin'))
    ) {
      score += 5
      reasons.push('High-value action during weekend')
    }

    return { score, reasons }
  }

  private static async isKnownThreatIP(ipAddress: string): Promise<boolean> {
    // In production, integrate with threat intelligence APIs
    // For now, check against a simple blocklist
    const knownThreats = ['192.168.1.100', '10.0.0.1'] // Example IPs
    return knownThreats.includes(ipAddress)
  }

  private static isUnusualUserAgent(userAgent: string): boolean {
    // Check for suspicious patterns in user agent
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
    ]

    return suspiciousPatterns.some(pattern => pattern.test(userAgent))
  }

  private static generateChallengeId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  private static generateCaptchaChallenge(): string {
    // Simple math CAPTCHA
    const a = Math.floor(Math.random() * 10) + 1
    const b = Math.floor(Math.random() * 10) + 1
    return `${a} + ${b}`
  }

  private static validateCaptchaResponse(
    challenge: string,
    response: string
  ): boolean {
    try {
      const [a, , b] = challenge.split(' ')
      const expected = parseInt(a) + parseInt(b)
      const actual = parseInt(response)
      return expected === actual
    } catch {
      return false
    }
  }
}
