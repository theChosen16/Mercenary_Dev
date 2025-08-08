/**
 * Advanced Security Audit Logger
 * Enterprise-grade audit logging with threat detection and alerting
 */

import { prisma } from '../prisma'
import * as crypto from 'crypto'

// Type definitions that match the Prisma schema
export interface AuditEvent {
  id: string
  userId: string | null
  action: string
  resource: string
  details: string | null
  ipAddress: string
  userAgent: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'SUCCESS' | 'FAILURE' | 'WARNING'
  createdAt: Date
}

export interface SecurityAlert {
  id: string
  userId: string | null
  alertType: string
  title: string
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  isResolved: boolean
  resolvedAt: Date | null
  resolvedBy: string | null
  createdAt: Date
}

export interface AuditQuery {
  userId?: string
  eventType?: string
  resource?: string
  severity?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export class AuditLogger {
  private static readonly MAX_FAILED_ATTEMPTS = 5
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes
  private static readonly SUSPICIOUS_PATTERNS = {
    RAPID_LOGIN_ATTEMPTS: { count: 10, timeWindow: 5 * 60 * 1000 }, // 10 attempts in 5 minutes
    MULTIPLE_IP_ADDRESSES: { count: 3, timeWindow: 60 * 60 * 1000 }, // 3 IPs in 1 hour
    UNUSUAL_ACTIVITY_HOURS: { startHour: 2, endHour: 6 }, // 2 AM - 6 AM
    BULK_DATA_ACCESS: { count: 100, timeWindow: 10 * 60 * 1000 } // 100 records in 10 minutes
  }

  /**
   * Log security event with automatic threat detection
   */
  static async logSecurityEvent(
    userId: string,
    eventType: string,
    resource: string,
    action: string,
    ipAddress: string,
    userAgent: string,
    metadata?: Record<string, unknown>,
    oldValue?: unknown,
    newValue?: unknown
  ): Promise<void> {
    const severity = this.calculateSeverity(eventType, action, metadata)
    const eventId = crypto.randomUUID()

    // Store audit log
    await prisma.auditLog.create({
      data: {
        id: eventId,
        userId: userId,
        action: `${eventType}:${action}`,
        resource,
        details: JSON.stringify({
          eventType,
          oldValue,
          newValue,
          metadata
        }),
        ipAddress: ipAddress,
        userAgent: userAgent,
        severity: severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        createdAt: new Date()
      }
    })

    // Check for suspicious activity patterns
    await this.detectSuspiciousActivity(userId, eventType, ipAddress, metadata)

    // Generate security alert for critical events
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      await this.generateSecurityAlert(
        userId,
        eventType,
        severity,
        { ...metadata, eventId, action, resource }
      )
    }
  }

  /**
   * Log user authentication attempts
   */
  static async logAuthAttempt(
    email: string,
    success: boolean,
    ipAddress: string,
    userAgent: string,
    failureReason?: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } })
    const userId = user?.id || 'unknown'

    const metadata = {
      email,
      success,
      failureReason: failureReason || null,
      timestamp: new Date().toISOString()
    }

    await this.logSecurityEvent(
      userId,
      'AUTH_ATTEMPT',
      'user',
      success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      ipAddress,
      userAgent,
      metadata
    )

    // Handle failed login attempts
    if (!success && userId !== 'unknown') {
      await this.handleFailedLogin(userId, ipAddress)
    }
  }

  /**
   * Log data access events
   */
  static async logDataAccess(
    userId: string,
    resource: string,
    action: string,
    recordId: string,
    ipAddress: string,
    userAgent: string,
    sensitive: boolean = false
  ): Promise<void> {
    const metadata = {
      recordId,
      sensitive,
      timestamp: new Date().toISOString()
    }

    await this.logSecurityEvent(
      userId,
      'DATA_ACCESS',
      resource,
      action,
      ipAddress,
      userAgent,
      metadata
    )

    // Log bulk data access pattern for monitoring
    if (sensitive) {
      await this.logSecurityEvent(
        userId,
        'BULK_DATA_ACCESS',
        resource,
        'READ_BULK',
        ipAddress,
        userAgent || 'Unknown',
        { recordCount: 1, bulkAccess: true }
      )
    }
  }

  /**
   * Log administrative actions
   */
  static async logAdminAction(
    adminUserId: string,
    targetUserId: string,
    action: string,
    resource: string,
    ipAddress: string,
    userAgent: string,
    oldValue?: unknown,
    newValue?: unknown
  ): Promise<void> {
    await this.logSecurityEvent(
      adminUserId,
      'ADMIN_ACTION',
      resource,
      action,
      ipAddress,
      userAgent,
      {
        targetUserId,
        adminAction: true,
        timestamp: new Date().toISOString(),
        oldValue: oldValue,
        newValue: newValue
      }
    )
  }

  /**
   * Query audit logs with filtering
   */
  static async queryAuditLogs(query: AuditQuery): Promise<AuditEvent[]> {
    const whereClause: Record<string, unknown> = {}
    
    if (query.userId) whereClause.userId = query.userId
    if (query.eventType) whereClause.action = { contains: query.eventType }
    if (query.resource) whereClause.resource = query.resource
    if (query.severity) whereClause.severity = query.severity
    if (query.startDate || query.endDate) {
      whereClause.createdAt = {} as { gte?: Date; lte?: Date }
      if (query.startDate) (whereClause.createdAt as { gte?: Date; lte?: Date }).gte = query.startDate
      if (query.endDate) (whereClause.createdAt as { gte?: Date; lte?: Date }).lte = query.endDate
    }
    
    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: query.limit || 100,
      skip: query.offset || 0
    })
    
    return logs.map((log: any) => {
      return {
        id: log.id,
        userId: log.userId,
        action: log.action,
        resource: log.resource,
        details: log.details,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        severity: log.severity,
        status: log.status,
        createdAt: log.createdAt
      } as AuditEvent
    })
  }

  /**
   * Get security alerts for a user
   */
  static async getSecurityAlerts(userId: string, onlyUnresolved: boolean = true): Promise<SecurityAlert[]> {
    const whereClause: { userId: string; isResolved?: boolean } = { userId }
    if (onlyUnresolved) {
      whereClause.isResolved = false
    }
    
    const alerts = await prisma.securityAlert.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })
    
    return alerts.map((alert: any) => ({
      id: alert.id,
      userId: alert.userId,
      alertType: alert.alertType,
      title: alert.title,
      description: alert.description,
      severity: alert.severity,
      isResolved: alert.isResolved,
      resolvedAt: alert.resolvedAt,
      resolvedBy: alert.resolvedBy,
      createdAt: alert.createdAt
    } as SecurityAlert))
  }

  /**
   * Resolve security alert
   */
  static async resolveSecurityAlert(alertId: string, resolvedBy: string): Promise<boolean> {
    try {
      await prisma.securityAlert.update({
        where: { id: alertId },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          resolvedBy
        }
      })
      return true
    } catch (error) {
      console.error('Failed to resolve security alert:', error)
      return false
    }
  }

  /**
   * Generate security report
   */
  static async generateSecurityReport(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<{
    totalEvents: number
    eventsByType: Record<string, number>
    eventsBySeverity: Record<string, number>
    topUsers: Array<{ userId: string; eventCount: number }>
    topIpAddresses: Array<{ ipAddress: string; eventCount: number }>
    alerts: SecurityAlert[]
  }> {
    const whereClause: Record<string, unknown> = {
      createdAt: { gte: startDate, lte: endDate }
    }
    if (userId) whereClause.userId = userId
    
    // Get total events
    const totalEvents = await prisma.auditLog.count({ where: whereClause })
    
    // Get events by action
    const eventsByActionRaw = await prisma.auditLog.groupBy({
      by: ['action'],
      where: whereClause,
      _count: { action: true }
    })
    const eventsByType = Object.fromEntries(
      eventsByActionRaw.map((item: { action: string; _count: { action: number } }) => [item.action, item._count.action])
    )

    // Get events by severity
    const eventsBySeverityRaw = await prisma.auditLog.groupBy({
      by: ['severity'],
      where: whereClause,
      _count: { severity: true }
    })
    const eventsBySeverity = Object.fromEntries(
      eventsBySeverityRaw.map((item: { severity: string; _count: { severity: number } }) => [item.severity, item._count.severity])
    )

    // Get top users
    const topUsersRaw = await prisma.auditLog.groupBy({
      by: ['userId'],
      where: whereClause,
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 10
    })
    const topUsers = topUsersRaw.map((item: { userId: string; _count: { userId: number } }) => ({
      userId: item.userId,
      eventCount: item._count.userId
    }))

    // Get top IP addresses
    const topIpAddressesRaw = await prisma.auditLog.groupBy({
      by: ['ipAddress'],
      where: whereClause,
      _count: { ipAddress: true },
      orderBy: { _count: { ipAddress: 'desc' } },
      take: 10
    })
    const topIpAddresses = topIpAddressesRaw.map((item: { ipAddress: string; _count: { ipAddress: number } }) => ({
      ipAddress: item.ipAddress,
      eventCount: item._count.ipAddress
    }))

    // Get alerts in the same period
    const alerts = await this.getSecurityAlerts(userId || '')

    return {
      totalEvents,
      eventsByType,
      eventsBySeverity,
      topUsers,
      topIpAddresses,
      alerts
    }
  }

  /**
   * Private helper methods
   */
  private static calculateSeverity(
    eventType: string,
    action: string,
    metadata?: Record<string, unknown>
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    // Critical events
    if (eventType === 'SECURITY_BREACH' || eventType === 'UNAUTHORIZED_ACCESS') {
      return 'CRITICAL'
    }
    
    // High severity events
    if (eventType === 'AUTH_ATTEMPT' && action === 'LOGIN_FAILED') {
      return 'HIGH'
    }
    if (eventType === 'ADMIN_ACTION' || eventType === 'PRIVILEGE_ESCALATION') {
      return 'HIGH'
    }
    
    // Medium severity events
    if (eventType === 'DATA_ACCESS' && metadata?.sensitive) {
      return 'MEDIUM'
    }
    if (eventType === 'PERMISSION_CHANGE' || eventType === 'ACCOUNT_MODIFICATION') {
      return 'MEDIUM'
    }
    
    // Default to low
    return 'LOW'
  }

  private static async detectSuspiciousActivity(
    userId: string,
    eventType: string,
    ipAddress: string,
    _metadata?: Record<string, unknown>
  ): Promise<void> {
    const now = Date.now()
    
    // Check for rapid login attempts
    if (eventType === 'AUTH_ATTEMPT') {
      const recentAttempts = await prisma.auditLog.count({
        where: {
          userId,
          action: { contains: 'AUTH_ATTEMPT' },
          createdAt: { gte: new Date(now - this.SUSPICIOUS_PATTERNS.RAPID_LOGIN_ATTEMPTS.timeWindow) }
        }
      })
      
      if (recentAttempts >= this.SUSPICIOUS_PATTERNS.RAPID_LOGIN_ATTEMPTS.count) {
        await this.generateSecurityAlert(
          userId,
          'RAPID_LOGIN_ATTEMPTS',
          'HIGH',
          { attempts: recentAttempts, ipAddress }
        )
      }
    }
  }

  private static async handleFailedLogin(userId: string, ipAddress: string): Promise<void> {
    const recentFailures = await prisma.auditLog.count({
      where: {
        userId,
        action: 'AUTH_ATTEMPT:LOGIN_FAILED',
        createdAt: { gte: new Date(Date.now() - this.LOCKOUT_DURATION) }
      }
    })
    
    if (recentFailures >= this.MAX_FAILED_ATTEMPTS) {
      await this.generateSecurityAlert(
        userId,
        'ACCOUNT_LOCKED',
        'HIGH',
        { reason: 'Too many failed login attempts', ipAddress }
      )
    }
  }

  private static async generateSecurityAlert(
    userId: string,
    alertType: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const description = this.generateAlertDescription(alertType, metadata)
    
    await prisma.securityAlert.create({
      data: {
        id: crypto.randomUUID(),
        userId: userId,
        alertType: alertType as any, // Cast to SecurityAlertType enum
        title: `Security Alert: ${alertType}`,
        description,
        severity: severity as any, // Cast to SecuritySeverity enum
        isResolved: false,
        createdAt: new Date()
      }
    })
  }

  private static generateAlertDescription(alertType: string, metadata?: Record<string, unknown>): string {
    switch (alertType) {
      case 'RAPID_LOGIN_ATTEMPTS':
        return `Rapid login attempts detected: ${metadata?.attempts} attempts from IP ${metadata?.ipAddress}`
      case 'MULTIPLE_IP_ADDRESSES':
        return `Multiple IP addresses detected: ${metadata?.ipCount} different IPs in recent activity`
      case 'ACCOUNT_LOCKED':
        return `Account locked due to ${metadata?.reason}`
      case 'SUSPICIOUS_DATA_ACCESS':
        return `Suspicious data access pattern detected`
      case 'PRIVILEGE_ESCALATION':
        return `Potential privilege escalation attempt detected`
      case 'UNAUTHORIZED_ACCESS':
        return `Unauthorized access attempt detected`
      default:
        return `Security alert: ${alertType}`
    }
  }
}
