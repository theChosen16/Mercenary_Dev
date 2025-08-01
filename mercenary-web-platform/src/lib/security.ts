import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface SecurityEvent {
  type: 'LOGIN_ATTEMPT' | 'FAILED_LOGIN' | 'SUSPICIOUS_ACTIVITY' | 'RATE_LIMIT_EXCEEDED' | 'DATA_BREACH_ATTEMPT'
  userId?: string
  ip: string
  userAgent: string
  metadata?: Record<string, any>
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (req: NextRequest) => string
}

export class SecurityService {
  // Rate limiting with Redis-like in-memory store
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>()

  // Rate limiting middleware
  static createRateLimit(config: RateLimitConfig) {
    return async (req: NextRequest) => {
      const key = config.keyGenerator ? config.keyGenerator(req) : this.getClientIP(req)
      const now = Date.now()
      
      // Clean expired entries
      this.cleanupRateLimit()
      
      const entry = this.rateLimitStore.get(key)
      
      if (!entry || now > entry.resetTime) {
        // New window
        this.rateLimitStore.set(key, {
          count: 1,
          resetTime: now + config.windowMs
        })
        return { allowed: true, remaining: config.maxRequests - 1 }
      }
      
      if (entry.count >= config.maxRequests) {
        // Rate limit exceeded
        await this.logSecurityEvent({
          type: 'RATE_LIMIT_EXCEEDED',
          ip: key,
          userAgent: req.headers.get('user-agent') || 'Unknown',
          severity: 'MEDIUM',
          metadata: { maxRequests: config.maxRequests, windowMs: config.windowMs }
        })
        
        return { allowed: false, remaining: 0, resetTime: entry.resetTime }
      }
      
      // Increment counter
      entry.count++
      this.rateLimitStore.set(key, entry)
      
      return { allowed: true, remaining: config.maxRequests - entry.count }
    }
  }

  // DDoS protection
  static async detectDDoS(req: NextRequest): Promise<boolean> {
    const ip = this.getClientIP(req)
    const userAgent = req.headers.get('user-agent') || 'Unknown'
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /bot|crawler|spider/i,
      /curl|wget|python|java/i,
      /scanner|exploit|hack/i
    ]
    
    const isSuspiciousUA = suspiciousPatterns.some(pattern => pattern.test(userAgent))
    
    if (isSuspiciousUA) {
      await this.logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        ip,
        userAgent,
        severity: 'HIGH',
        metadata: { reason: 'Suspicious User Agent' }
      })
      return true
    }
    
    // Check request frequency (simplified)
    const recentRequests = await this.getRecentRequestCount(ip, 60000) // Last minute
    if (recentRequests > 100) {
      await this.logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        ip,
        userAgent,
        severity: 'HIGH',
        metadata: { reason: 'High Request Frequency', count: recentRequests }
      })
      return true
    }
    
    return false
  }

  // Input validation and sanitization
  static sanitizeInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim()
  }

  // SQL injection detection
  static detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(;|\-\-|\|\|)/,
      /(\bOR\b.*=.*\bOR\b|\bAND\b.*=.*\bAND\b)/i,
      /'.*(\bOR\b|\bAND\b).*'/i
    ]
    
    return sqlPatterns.some(pattern => pattern.test(input))
  }

  // XSS detection
  static detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe\b[^>]*>/i,
      /<object\b[^>]*>/i,
      /<embed\b[^>]*>/i
    ]
    
    return xssPatterns.some(pattern => pattern.test(input))
  }

  // Fraud detection for payments
  static async detectPaymentFraud(paymentData: {
    amount: number
    userId: string
    ip: string
    userAgent: string
  }): Promise<{ isFraud: boolean; riskScore: number; reasons: string[] }> {
    const reasons: string[] = []
    let riskScore = 0
    
    // Check for unusual amount
    if (paymentData.amount > 100000) { // $100k+
      riskScore += 30
      reasons.push('High amount transaction')
    }
    
    // Check user history
    const userPayments = await prisma.transaction.count({
      where: { 
        OR: [
          { clientId: paymentData.userId },
          { freelancerId: paymentData.userId }
        ]
      }
    })
    
    if (userPayments === 0) {
      riskScore += 20
      reasons.push('First-time user')
    }
    
    // Check for multiple rapid transactions
    const recentTransactions = await prisma.transaction.count({
      where: {
        OR: [
          { clientId: paymentData.userId },
          { freelancerId: paymentData.userId }
        ],
        createdAt: {
          gte: new Date(Date.now() - 3600000) // Last hour
        }
      }
    })
    
    if (recentTransactions > 5) {
      riskScore += 25
      reasons.push('Multiple rapid transactions')
    }
    
    // Check IP reputation (simplified)
    const suspiciousIPs = await this.getSuspiciousIPs()
    if (suspiciousIPs.includes(paymentData.ip)) {
      riskScore += 40
      reasons.push('Suspicious IP address')
    }
    
    const isFraud = riskScore >= 50
    
    if (isFraud) {
      await this.logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        userId: paymentData.userId,
        ip: paymentData.ip,
        userAgent: paymentData.userAgent,
        severity: 'HIGH',
        metadata: { 
          type: 'Payment Fraud Detection',
          amount: paymentData.amount,
          riskScore,
          reasons 
        }
      })
    }
    
    return { isFraud, riskScore, reasons }
  }

  // Identity verification
  static async verifyIdentity(userId: string, documentData: {
    type: 'ID' | 'PASSPORT' | 'DRIVER_LICENSE'
    documentNumber: string
    frontImage: string
    backImage?: string
  }) {
    try {
      // This would integrate with a real identity verification service
      // For demo purposes, we'll simulate the process
      
      const verification = await prisma.identityVerification.create({
        data: {
          userId,
          documentType: documentData.type,
          documentNumber: documentData.documentNumber,
          status: 'PENDING',
          submittedAt: new Date()
        }
      })
      
      // Simulate verification process (in real app, this would be async)
      setTimeout(async () => {
        const isValid = Math.random() > 0.1 // 90% success rate for demo
        
        await prisma.identityVerification.update({
          where: { id: verification.id },
          data: {
            status: isValid ? 'VERIFIED' : 'REJECTED',
            verifiedAt: isValid ? new Date() : null,
            rejectionReason: isValid ? null : 'Document could not be verified'
          }
        })
        
        // Update user verification status
        if (isValid) {
          await prisma.user.update({
            where: { id: userId },
            data: { isVerified: true }
          })
        }
      }, 5000) // 5 second delay for demo
      
      return verification
    } catch (error) {
      console.error('Error in identity verification:', error)
      throw error
    }
  }

  // Security audit logging
  static async logSecurityEvent(event: SecurityEvent) {
    try {
      await prisma.securityLog.create({
        data: {
          type: event.type,
          userId: event.userId,
          ip: event.ip,
          userAgent: event.userAgent,
          severity: event.severity,
          metadata: event.metadata ? JSON.stringify(event.metadata) : null,
          timestamp: new Date()
        }
      })
      
      // Alert on critical events
      if (event.severity === 'CRITICAL') {
        await this.sendSecurityAlert(event)
      }
    } catch (error) {
      console.error('Error logging security event:', error)
    }
  }

  // Get security dashboard data
  static async getSecurityDashboard(timeRange: '24h' | '7d' | '30d' = '24h') {
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)
    
    const [
      totalEvents,
      eventsByType,
      eventsBySeverity,
      topIPs,
      recentEvents
    ] = await Promise.all([
      prisma.securityLog.count({
        where: { timestamp: { gte: since } }
      }),
      prisma.securityLog.groupBy({
        by: ['type'],
        where: { timestamp: { gte: since } },
        _count: { type: true }
      }),
      prisma.securityLog.groupBy({
        by: ['severity'],
        where: { timestamp: { gte: since } },
        _count: { severity: true }
      }),
      prisma.securityLog.groupBy({
        by: ['ip'],
        where: { timestamp: { gte: since } },
        _count: { ip: true },
        orderBy: { _count: { ip: 'desc' } },
        take: 10
      }),
      prisma.securityLog.findMany({
        where: { timestamp: { gte: since } },
        orderBy: { timestamp: 'desc' },
        take: 50,
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      })
    ])
    
    return {
      summary: {
        totalEvents,
        timeRange
      },
      eventsByType,
      eventsBySeverity,
      topIPs,
      recentEvents
    }
  }

  // Helper methods
  private static getClientIP(req: NextRequest): string {
    return req.headers.get('x-forwarded-for')?.split(',')[0] ||
           req.headers.get('x-real-ip') ||
           req.ip ||
           'unknown'
  }

  private static cleanupRateLimit() {
    const now = Date.now()
    for (const [key, entry] of this.rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        this.rateLimitStore.delete(key)
      }
    }
  }

  private static async getRecentRequestCount(ip: string, windowMs: number): Promise<number> {
    // This would typically use Redis or a proper database
    // For demo, we'll use the security log
    const since = new Date(Date.now() - windowMs)
    return await prisma.securityLog.count({
      where: {
        ip,
        timestamp: { gte: since }
      }
    })
  }

  private static async getSuspiciousIPs(): Promise<string[]> {
    // This would typically come from threat intelligence feeds
    // For demo, we'll return IPs with many security events
    const result = await prisma.securityLog.groupBy({
      by: ['ip'],
      where: {
        severity: { in: ['HIGH', 'CRITICAL'] },
        timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      _count: { ip: true },
      having: {
        ip: { _count: { gt: 10 } }
      }
    })
    
    return result.map(r => r.ip)
  }

  private static async sendSecurityAlert(event: SecurityEvent) {
    // This would send alerts to security team
    console.warn('CRITICAL SECURITY EVENT:', event)
    
    // Could integrate with services like:
    // - Slack notifications
    // - Email alerts
    // - SMS alerts
    // - PagerDuty
  }
}
