import { prisma } from '@/lib/prisma'
import { AuditLogger } from './audit-logger'

export interface RateLimitRule {
  endpoint: string
  maxRequests: number
  windowMs: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: any) => string
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: Date
  retryAfter?: number
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
    '/api/auth/login': { endpoint: '/api/auth/login', maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    '/api/auth/register': { endpoint: '/api/auth/register', maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 registrations per hour
    '/api/auth/forgot-password': { endpoint: '/api/auth/forgot-password', maxRequests: 3, windowMs: 60 * 60 * 1000 },
    
    // API endpoints
    '/api/projects': { endpoint: '/api/projects', maxRequests: 100, windowMs: 60 * 60 * 1000 }, // 100 requests per hour
    '/api/messages': { endpoint: '/api/messages', maxRequests: 200, windowMs: 60 * 60 * 1000 }, // 200 messages per hour
    '/api/search': { endpoint: '/api/search', maxRequests: 50, windowMs: 60 * 60 * 1000 }, // 50 searches per hour
    
    // Payment endpoints
    '/api/payments': { endpoint: '/api/payments', maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 payments per hour
    '/api/subscription': { endpoint: '/api/subscription', maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 subscription changes per hour
    
    // Admin endpoints
    '/api/admin': { endpoint: '/api/admin', maxRequests: 50, windowMs: 60 * 60 * 1000 }, // 50 admin actions per hour
  }
  
  /**
   * Check rate limit for a request
   */
  static async checkRateLimit(
    endpoint: string,
    identifier: string,
    ipAddress: string,
    userAgent: string
  ): Promise<RateLimitResult> {
    const rule = this.DEFAULT_RULES[endpoint] || this.getDefaultRule(endpoint)
    const key = this.generateKey(endpoint, identifier, ipAddress)
    const now = new Date()
    const windowStart = new Date(now.getTime() - rule.windowMs)
    
    // Clean up old entries
    await this.cleanupOldEntries(key, windowStart)
    
    // Count current requests in window
    const currentCount = await prisma.rateLimitEntry.count({
      where: {
        key,
        created_at: { gte: windowStart }
      }
    })
    
    const allowed = currentCount < rule.maxRequests
    const remaining = Math.max(0, rule.maxRequests - currentCount - 1)
    const resetTime = new Date(now.getTime() + rule.windowMs)
    
    if (allowed) {
      // Record this request
      await prisma.rateLimitEntry.create({
        data: {
          key,
          endpoint,
          identifier,
          ip_address: ipAddress,
          user_agent: userAgent,
          created_at: now
        }
      })
    } else {
      // Log rate limit exceeded
      await AuditLogger.logSecurityEvent(
        identifier,
        'RATE_LIMIT_EXCEEDED',
        endpoint,
        'request',
        ipAddress,
        userAgent,
        {
          currentCount,
          maxRequests: rule.maxRequests,
          windowMs: rule.windowMs
        }
      )
    }
    
    return {
      allowed,
      remaining,
      resetTime,
      retryAfter: allowed ? undefined : Math.ceil(rule.windowMs / 1000)
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
    metadata?: Record<string, any>
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
    const behaviorRisk = await this.analyzeUserBehavior(userId, action, metadata)
    riskScore += behaviorRisk.score
    if (behaviorRisk.reasons.length > 0) {
      reasons.push(...behaviorRisk.reasons)
    }
    
    // Check for device/browser anomalies
    const deviceRisk = await this.analyzeDeviceRisk(userId, userAgent, ipAddress)
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
    if (riskScore >= 80) {
      action_result = 'BLOCK'
    } else if (riskScore >= 50) {
      action_result = 'CHALLENGE'
    } else {
      action_result = 'ALLOW'
    }
    
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
          metadata
        }
      )
    }
    
    return {
      isFraudulent,
      riskScore,
      reasons,
      action: action_result
    }
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
    const expiresAt = duration ? new Date(Date.now() + duration) : null
    
    await prisma.blockedIP.upsert({
      where: { ip_address: ipAddress },
      update: {
        reason,
        expires_at: expiresAt,
        updated_at: new Date(),
        updated_by: blockedBy
      },
      create: {
        ip_address: ipAddress,
        reason,
        expires_at: expiresAt,
        created_at: new Date(),
        created_by: blockedBy
      }
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
        permanent: !duration
      }
    )
  }
  
  /**
   * Check if IP address is blocked
   */
  static async isIPBlocked(ipAddress: string): Promise<boolean> {
    const blockedIP = await prisma.blockedIP.findUnique({
      where: { ip_address: ipAddress }
    })
    
    if (!blockedIP) return false
    
    // Check if temporary block has expired
    if (blockedIP.expires_at && blockedIP.expires_at < new Date()) {
      await prisma.blockedIP.delete({
        where: { ip_address: ipAddress }
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
    
    await prisma.captchaChallenge.create({
      data: {
        id: challengeId,
        identifier,
        challenge,
        expires_at: expiresAt,
        created_at: new Date()
      }
    })
    
    return { challengeId, challenge, expiresAt }
  }
  
  /**
   * Verify CAPTCHA response
   */
  static async verifyCaptcha(challengeId: string, response: string): Promise<boolean> {
    const challenge = await prisma.captchaChallenge.findUnique({
      where: { id: challengeId }
    })
    
    if (!challenge || challenge.expires_at < new Date()) {
      if (challenge) {
        await prisma.captchaChallenge.delete({
          where: { id: challengeId }
        })
      }
      return false
    }
    
    const isValid = this.validateCaptchaResponse(challenge.challenge, response)
    
    // Cleanup challenge
    await prisma.captchaChallenge.delete({
      where: { id: challengeId }
    })
    
    return isValid
  }
  
  /**
   * Get rate limit statistics
   */
  static async getRateLimitStats(timeWindow: number = 24 * 60 * 60 * 1000): Promise<{
    totalRequests: number
    blockedRequests: number
    topEndpoints: Array<{ endpoint: string; count: number }>
    topIPs: Array<{ ipAddress: string; count: number }>
  }> {
    const since = new Date(Date.now() - timeWindow)
    
    const totalRequests = await prisma.rateLimitEntry.count({
      where: { created_at: { gte: since } }
    })
    
    const blockedRequests = await prisma.auditLog.count({
      where: {
        event_type: 'RATE_LIMIT_EXCEEDED',
        created_at: { gte: since }
      }
    })
    
    const topEndpointsRaw = await prisma.rateLimitEntry.groupBy({
      by: ['endpoint'],
      where: { created_at: { gte: since } },
      _count: { endpoint: true },
      orderBy: { _count: { endpoint: 'desc' } },
      take: 10
    })
    
    const topEndpoints = topEndpointsRaw.map(item => ({
      endpoint: item.endpoint,
      count: item._count.endpoint
    }))
    
    const topIPsRaw = await prisma.rateLimitEntry.groupBy({
      by: ['ip_address'],
      where: { created_at: { gte: since } },
      _count: { ip_address: true },
      orderBy: { _count: { ip_address: 'desc' } },
      take: 10
    })
    
    const topIPs = topIPsRaw.map(item => ({
      ipAddress: item.ip_address,
      count: item._count.ip_address
    }))
    
    return {
      totalRequests,
      blockedRequests,
      topEndpoints,
      topIPs
    }
  }
  
  /**
   * Private helper methods
   */
  private static generateKey(endpoint: string, identifier: string, ipAddress: string): string {
    return `${endpoint}:${identifier}:${ipAddress}`
  }
  
  private static getDefaultRule(endpoint: string): RateLimitRule {
    return {
      endpoint,
      maxRequests: 60,
      windowMs: 60 * 60 * 1000 // Default: 60 requests per hour
    }
  }
  
  private static async cleanupOldEntries(key: string, windowStart: Date): Promise<void> {
    await prisma.rateLimitEntry.deleteMany({
      where: {
        key,
        created_at: { lt: windowStart }
      }
    })
  }
  
  private static async analyzeIPRisk(ipAddress: string, userId: string): Promise<{
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
        ip_address: ipAddress,
        created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      },
      select: { user_id: true },
      distinct: ['user_id']
    })
    
    if (usersFromIP.length > 5) {
      score += 20
      reasons.push('Multiple users from same IP')
    }
    
    // Check for rapid IP changes for this user
    const recentIPs = await prisma.auditLog.findMany({
      where: {
        user_id: userId,
        created_at: { gte: new Date(Date.now() - 60 * 60 * 1000) }
      },
      select: { ip_address: true },
      distinct: ['ip_address']
    })
    
    if (recentIPs.length > 3) {
      score += 15
      reasons.push('Rapid IP address changes')
    }
    
    return { score, reasons }
  }
  
  private static async analyzeUserBehavior(
    userId: string,
    action: string,
    metadata?: Record<string, any>
  ): Promise<{ score: number; reasons: string[] }> {
    let score = 0
    const reasons: string[] = []
    
    // Check for unusual activity volume
    const recentActivity = await prisma.auditLog.count({
      where: {
        user_id: userId,
        created_at: { gte: new Date(Date.now() - 60 * 60 * 1000) }
      }
    })
    
    if (recentActivity > 100) {
      score += 25
      reasons.push('Unusually high activity volume')
    }
    
    // Check for new user with high-value actions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { created_at: true }
    })
    
    if (user && user.created_at > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      if (action.includes('payment') || action.includes('transfer')) {
        score += 30
        reasons.push('New user attempting high-value action')
      }
    }
    
    return { score, reasons }
  }
  
  private static async analyzeDeviceRisk(
    userId: string,
    userAgent: string,
    ipAddress: string
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
        user_id: userId,
        created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      select: { user_agent: true, ip_address: true }
    })
    
    const uniqueUserAgents = new Set(recentSessions.map(s => s.user_agent))
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
    if ((dayOfWeek === 0 || dayOfWeek === 6) && 
        (action.includes('payment') || action.includes('admin'))) {
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
      /python/i
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
  
  private static validateCaptchaResponse(challenge: string, response: string): boolean {
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
