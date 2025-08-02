import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export interface AuditEvent {
  id: string
  userId: string
  eventType: string
  resource: string
  action: string
  oldValue?: any
  newValue?: any
  ipAddress: string
  userAgent: string
  timestamp: Date
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  metadata?: Record<string, any>
}

export interface SecurityAlert {
  id: string
  userId: string
  alertType: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  isResolved: boolean
  createdAt: Date
  resolvedAt?: Date
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
    metadata?: Record<string, any>,
    oldValue?: any,
    newValue?: any
  ): Promise<void> {
    const severity = this.calculateSeverity(eventType, action, metadata)
    const eventId = crypto.randomUUID()
    
    // Store audit log
    await prisma.auditLog.create({
      data: {
        id: eventId,
        user_id: userId,
        event_type: eventType,
        resource,
        action,
        old_value: oldValue ? JSON.stringify(oldValue) : null,
        new_value: newValue ? JSON.stringify(newValue) : null,
        ip_address: ipAddress,
        user_agent: userAgent,
        severity,
        metadata: metadata ? JSON.stringify(metadata) : null,
        created_at: new Date()
      }
    })
    
    // Check for suspicious patterns
    await this.detectSuspiciousActivity(userId, eventType, ipAddress, metadata)
    
    // Generate alerts for critical events
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      await this.generateSecurityAlert(userId, eventType, severity, metadata)
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
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    })
    
    const userId = user?.id || 'unknown'
    
    await this.logSecurityEvent(
      userId,
      success ? 'AUTH_SUCCESS' : 'AUTH_FAILURE',
      'authentication',
      'login',
      ipAddress,
      userAgent,
      {
        email,
        success,
        failureReason,
        timestamp: new Date().toISOString()
      }
    )
    
    // Handle failed login attempts
    if (!success && user) {
      await this.handleFailedLogin(user.id, ipAddress)
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
    await this.logSecurityEvent(
      userId,
      'DATA_ACCESS',
      resource,
      action,
      ipAddress,
      userAgent,
      {
        recordId,
        sensitive,
        timestamp: new Date().toISOString()
      }
    )
    
    // Track bulk data access
    if (sensitive) {
      await this.trackBulkDataAccess(userId, resource, ipAddress)
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
    oldValue?: any,
    newValue?: any
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
        timestamp: new Date().toISOString()
      },
      oldValue,
      newValue
    )
  }
  
  /**
   * Query audit logs with filtering
   */
  static async queryAuditLogs(query: AuditQuery): Promise<AuditEvent[]> {
    const whereClause: any = {}
    
    if (query.userId) whereClause.user_id = query.userId
    if (query.eventType) whereClause.event_type = query.eventType
    if (query.resource) whereClause.resource = query.resource
    if (query.severity) whereClause.severity = query.severity
    if (query.startDate || query.endDate) {
      whereClause.created_at = {}
      if (query.startDate) whereClause.created_at.gte = query.startDate
      if (query.endDate) whereClause.created_at.lte = query.endDate
    }
    
    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      take: query.limit || 100,
      skip: query.offset || 0
    })
    
    return logs.map(log => ({
      id: log.id,
      userId: log.user_id,
      eventType: log.event_type,
      resource: log.resource,
      action: log.action,
      oldValue: log.old_value ? JSON.parse(log.old_value) : undefined,
      newValue: log.new_value ? JSON.parse(log.new_value) : undefined,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      timestamp: log.created_at,
      severity: log.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
      metadata: log.metadata ? JSON.parse(log.metadata) : undefined
    }))
  }
  
  /**
   * Get security alerts for a user
   */
  static async getSecurityAlerts(userId: string, onlyUnresolved: boolean = true): Promise<SecurityAlert[]> {
    const whereClause: any = { user_id: userId }
    if (onlyUnresolved) {
      whereClause.is_resolved = false
    }
    
    const alerts = await prisma.securityAlert.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' }
    })
    
    return alerts.map(alert => ({
      id: alert.id,
      userId: alert.user_id,
      alertType: alert.alert_type,
      severity: alert.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
      description: alert.description,
      isResolved: alert.is_resolved,
      createdAt: alert.created_at,
      resolvedAt: alert.resolved_at || undefined
    }))
  }
  
  /**
   * Resolve security alert
   */
  static async resolveSecurityAlert(alertId: string, resolvedBy: string): Promise<boolean> {
    try {
      await prisma.securityAlert.update({
        where: { id: alertId },
        data: {
          is_resolved: true,
          resolved_at: new Date(),
          resolved_by: resolvedBy
        }
      })
      return true
    } catch {
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
    const whereClause: any = {
      created_at: { gte: startDate, lte: endDate }
    }
    if (userId) whereClause.user_id = userId
    
    // Get total events
    const totalEvents = await prisma.auditLog.count({ where: whereClause })
    
    // Get events by type
    const eventsByTypeRaw = await prisma.auditLog.groupBy({
      by: ['event_type'],
      where: whereClause,
      _count: { event_type: true }
    })
    const eventsByType = Object.fromEntries(
      eventsByTypeRaw.map(item => [item.event_type, item._count.event_type])
    )
    
    // Get events by severity
    const eventsBySeverityRaw = await prisma.auditLog.groupBy({
      by: ['severity'],
      where: whereClause,
      _count: { severity: true }
    })
    const eventsBySeverity = Object.fromEntries(
      eventsBySeverityRaw.map(item => [item.severity, item._count.severity])
    )
    
    // Get top users
    const topUsersRaw = await prisma.auditLog.groupBy({
      by: ['user_id'],
      where: whereClause,
      _count: { user_id: true },
      orderBy: { _count: { user_id: 'desc' } },
      take: 10
    })
    const topUsers = topUsersRaw.map(item => ({
      userId: item.user_id,
      eventCount: item._count.user_id
    }))
    
    // Get top IP addresses
    const topIpAddressesRaw = await prisma.auditLog.groupBy({
      by: ['ip_address'],
      where: whereClause,
      _count: { ip_address: true },
      orderBy: { _count: { ip_address: 'desc' } },
      take: 10
    })
    const topIpAddresses = topIpAddressesRaw.map(item => ({
      ipAddress: item.ip_address,
      eventCount: item._count.ip_address
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
    metadata?: Record<string, any>
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    // Critical events
    if (eventType.includes('ADMIN_ACTION') || 
        eventType.includes('PRIVILEGE_ESCALATION') ||
        eventType.includes('DATA_BREACH')) {
      return 'CRITICAL'
    }
    
    // High severity events
    if (eventType.includes('AUTH_FAILURE') ||
        eventType.includes('SUSPICIOUS_ACTIVITY') ||
        eventType.includes('UNAUTHORIZED_ACCESS')) {
      return 'HIGH'
    }
    
    // Medium severity events
    if (eventType.includes('PASSWORD_CHANGE') ||
        eventType.includes('PROFILE_UPDATE') ||
        eventType.includes('SENSITIVE_DATA_ACCESS')) {
      return 'MEDIUM'
    }
    
    // Default to low
    return 'LOW'
  }
  
  private static async detectSuspiciousActivity(
    userId: string,
    eventType: string,
    ipAddress: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const now = new Date()
    
    // Check for rapid login attempts
    if (eventType === 'AUTH_FAILURE') {
      const recentFailures = await prisma.auditLog.count({
        where: {
          user_id: userId,
          event_type: 'AUTH_FAILURE',
          created_at: {
            gte: new Date(now.getTime() - this.SUSPICIOUS_PATTERNS.RAPID_LOGIN_ATTEMPTS.timeWindow)
          }
        }
      })
      
      if (recentFailures >= this.SUSPICIOUS_PATTERNS.RAPID_LOGIN_ATTEMPTS.count) {
        await this.generateSecurityAlert(
          userId,
          'RAPID_LOGIN_ATTEMPTS',
          'HIGH',
          { failureCount: recentFailures, ipAddress }
        )
      }
    }
    
    // Check for multiple IP addresses
    const recentIPs = await prisma.auditLog.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: new Date(now.getTime() - this.SUSPICIOUS_PATTERNS.MULTIPLE_IP_ADDRESSES.timeWindow)
        }
      },
      select: { ip_address: true },
      distinct: ['ip_address']
    })
    
    if (recentIPs.length >= this.SUSPICIOUS_PATTERNS.MULTIPLE_IP_ADDRESSES.count) {
      await this.generateSecurityAlert(
        userId,
        'MULTIPLE_IP_ADDRESSES',
        'MEDIUM',
        { ipAddresses: recentIPs.map(r => r.ip_address) }
      )
    }
  }
  
  private static async handleFailedLogin(userId: string, ipAddress: string): Promise<void> {
    const recentFailures = await prisma.auditLog.count({
      where: {
        user_id: userId,
        event_type: 'AUTH_FAILURE',
        created_at: {
          gte: new Date(Date.now() - this.LOCKOUT_DURATION)
        }
      }
    })
    
    if (recentFailures >= this.MAX_FAILED_ATTEMPTS) {
      // Lock account temporarily
      await prisma.user.update({
        where: { id: userId },
        data: {
          account_locked_until: new Date(Date.now() + this.LOCKOUT_DURATION)
        }
      })
      
      await this.generateSecurityAlert(
        userId,
        'ACCOUNT_LOCKED',
        'HIGH',
        { reason: 'Too many failed login attempts', ipAddress }
      )
    }
  }
  
  private static async trackBulkDataAccess(
    userId: string,
    resource: string,
    ipAddress: string
  ): Promise<void> {
    const recentAccess = await prisma.auditLog.count({
      where: {
        user_id: userId,
        event_type: 'DATA_ACCESS',
        resource,
        created_at: {
          gte: new Date(Date.now() - this.SUSPICIOUS_PATTERNS.BULK_DATA_ACCESS.timeWindow)
        }
      }
    })
    
    if (recentAccess >= this.SUSPICIOUS_PATTERNS.BULK_DATA_ACCESS.count) {
      await this.generateSecurityAlert(
        userId,
        'BULK_DATA_ACCESS',
        'MEDIUM',
        { resource, accessCount: recentAccess, ipAddress }
      )
    }
  }
  
  private static async generateSecurityAlert(
    userId: string,
    alertType: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    metadata?: Record<string, any>
  ): Promise<void> {
    const description = this.generateAlertDescription(alertType, metadata)
    
    await prisma.securityAlert.create({
      data: {
        id: crypto.randomUUID(),
        user_id: userId,
        alert_type: alertType,
        severity,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
        is_resolved: false,
        created_at: new Date()
      }
    })
  }
  
  private static generateAlertDescription(alertType: string, metadata?: Record<string, any>): string {
    switch (alertType) {
      case 'RAPID_LOGIN_ATTEMPTS':
        return `Múltiples intentos de inicio de sesión fallidos detectados desde ${metadata?.ipAddress}`
      case 'MULTIPLE_IP_ADDRESSES':
        return `Acceso desde múltiples direcciones IP en corto período de tiempo`
      case 'ACCOUNT_LOCKED':
        return `Cuenta bloqueada temporalmente por intentos de acceso sospechosos`
      case 'BULK_DATA_ACCESS':
        return `Acceso masivo a datos detectado en el recurso ${metadata?.resource}`
      default:
        return `Actividad sospechosa detectada: ${alertType}`
    }
  }
}
