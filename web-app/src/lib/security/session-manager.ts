import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { UAParser } from 'ua-parser-js'
import type { Prisma } from '@prisma/client'
import { AuditLogger } from './audit-logger'

export interface SessionInfo {
  id: string
  userId: string
  deviceInfo: DeviceInfo
  ipAddress: string
  isActive: boolean
  lastActivity: Date
  createdAt: Date
  expiresAt: Date
}

export interface DeviceInfo {
  browser: string
  os: string
  device: string
  isMobile: boolean
}

export interface BiometricChallenge {
  challengeId: string
  publicKey: string
  timeout: number
}

// Compatibility types expected by tests
export interface CreateSessionInput {
  userId: string
  deviceId?: string
  ipAddress: string
  userAgent: string
  isTrustedDevice?: boolean
}

export interface AnomalyResult {
  hasAnomalies: boolean
  anomalies: string[]
}

export class SessionManager {
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
  private static readonly MAX_SESSIONS_PER_USER = 5
  private static readonly BIOMETRIC_TIMEOUT = 5 * 60 * 1000 // 5 minutes

  /**
   * Create new session with device fingerprinting
   */
  // Overload: test-friendly input object, returns token + active flag
  static async createSession(
    data: CreateSessionInput
  ): Promise<{ sessionToken: string; isActive: boolean }>
  // Overload: original signature retained for backwards compatibility
  static async createSession(
    userId: string,
    ipAddress: string,
    userAgent: string,
    isTrustedDevice?: boolean
  ): Promise<string>
  static async createSession(
    arg1: CreateSessionInput | string,
    arg2?: string,
    arg3?: string,
    arg4?: boolean
  ): Promise<{ sessionToken: string; isActive: boolean } | string> {
    // Object-style (tests)
    if (typeof arg1 === 'object') {
      const {
        userId,
        deviceId,
        ipAddress,
        userAgent,
        isTrustedDevice = false,
      } = arg1
      const deviceInfo = this.parseDeviceInfo(userAgent)
      const sessionToken = this.generateSecureToken()
      const expiresAt = new Date(Date.now() + this.SESSION_DURATION)

      await this.cleanupExpiredSessions(userId)
      await this.enforceSessionLimit(userId)

      await prisma.userSession.create({
        data: {
          userId,
          sessionToken,
          deviceId:
            deviceId ?? this.generateDeviceFingerprint(deviceInfo, ipAddress),
          ipAddress,
          userAgent,
          isActive: true,
          isTrusted: isTrustedDevice,
          lastActivity: new Date(),
          expiresAt,
          createdAt: new Date(),
          location: null,
        },
      })

      await AuditLogger.logSecurityEvent(
        userId,
        'SESSION_EVENT',
        'session',
        'CREATED',
        ipAddress,
        userAgent,
        {
          sessionToken,
          deviceInfo,
          isTrustedDevice,
        }
      )

      return { sessionToken, isActive: true }
    }

    // Original positional args
    const userId = arg1
    const ipAddress = arg2 as string
    const userAgent = arg3 as string
    const isTrustedDevice = arg4 ?? false

    const deviceInfo = this.parseDeviceInfo(userAgent)
    const sessionToken = this.generateSecureToken()
    const expiresAt = new Date(Date.now() + this.SESSION_DURATION)

    await this.cleanupExpiredSessions(userId)
    await this.enforceSessionLimit(userId)

    await prisma.userSession.create({
      data: {
        userId: userId,
        sessionToken: sessionToken,
        deviceId: this.generateDeviceFingerprint(deviceInfo, ipAddress),
        ipAddress: ipAddress,
        userAgent: userAgent,
        isActive: true,
        isTrusted: isTrustedDevice,
        lastActivity: new Date(),
        expiresAt: expiresAt,
        createdAt: new Date(),
        location: null,
      },
    })

    await AuditLogger.logSecurityEvent(
      userId,
      'SESSION_EVENT',
      'session',
      'CREATED',
      ipAddress,
      userAgent,
      {
        sessionToken,
        deviceInfo,
        isTrustedDevice,
      }
    )

    return sessionToken
  }

  /**
   * Validate and refresh session
   */
  // Overloads for test compatibility and full validation
  static async validateSession(sessionToken: string): Promise<boolean>
  static async validateSession(
    sessionToken: string,
    ipAddress: string,
    userAgent: string
  ): Promise<SessionInfo | null>
  static async validateSession(
    sessionToken: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<boolean | SessionInfo | null> {
    const session = await prisma.userSession.findUnique({
      where: { sessionToken: sessionToken },
      include: { user: { select: { id: true, email: true } } },
    })

    const isExpiredOrMissing = !session || session.expiresAt < new Date()
    if (isExpiredOrMissing) {
      if (session) {
        await this.destroySession(sessionToken)
      }
      // If called with only token, return boolean
      return ipAddress && userAgent ? null : false
    }

    // If only token provided -> simple validation path
    if (!ipAddress || !userAgent) {
      await prisma.userSession.update({
        where: { sessionToken: sessionToken },
        data: { lastActivity: new Date() },
      })
      return true
    }

    // Full validation with anomaly check
    const currentDeviceFingerprint = this.generateDeviceFingerprint(
      this.parseDeviceInfo(userAgent),
      ipAddress
    )
    if (session.deviceId !== currentDeviceFingerprint && !session.isTrusted) {
      await AuditLogger.logSecurityEvent(
        session.userId,
        'SESSION_EVENT',
        'session',
        'SUSPICIOUS_ACTIVITY',
        ipAddress,
        userAgent,
        {
          sessionToken,
          expectedFingerprint: session.deviceId,
          actualFingerprint: currentDeviceFingerprint,
        }
      )

      await this.destroySession(sessionToken)
      return null
    }

    await prisma.userSession.update({
      where: { sessionToken: sessionToken },
      data: { lastActivity: new Date() },
    })

    return {
      id: session.id,
      userId: session.userId,
      deviceInfo: this.parseDeviceInfo(session.userAgent),
      ipAddress: session.ipAddress,
      isActive: session.isActive,
      lastActivity: session.lastActivity,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    }
  }

  /**
   * Generate biometric authentication challenge
   */
  static async generateBiometricChallenge(
    userId: string
  ): Promise<BiometricChallenge> {
    const challengeId = this.generateSecureToken()
    const challenge = crypto.randomBytes(32).toString('base64')

    // Store challenge temporarily
    await prisma.biometricChallenge.create({
      data: {
        id: challengeId,
        userId: userId,
        challenge: challenge,
        deviceId: 'unknown',
        expiresAt: new Date(Date.now() + this.BIOMETRIC_TIMEOUT),
        createdAt: new Date(),
      },
    })

    return {
      challengeId,
      publicKey: challenge,
      timeout: this.BIOMETRIC_TIMEOUT,
    }
  }

  /**
   * Verify biometric authentication
   */
  static async verifyBiometricAuth(
    challengeId: string,
    signature: string,
    publicKey: string
  ): Promise<boolean> {
    const challenge = await prisma.biometricChallenge.findUnique({
      where: { id: challengeId },
    })

    if (!challenge || challenge.expiresAt < new Date()) {
      if (challenge) {
        await prisma.biometricChallenge.delete({
          where: { id: challengeId },
        })
      }
      return false
    }

    // Verify signature (simplified - in production use proper WebAuthn)
    const isValid = this.verifySignature(
      challenge.challenge,
      signature,
      publicKey
    )

    // Cleanup challenge
    await prisma.biometricChallenge.delete({
      where: { id: challengeId },
    })

    if (isValid) {
      await AuditLogger.logSecurityEvent(
        challenge.userId,
        'BIOMETRIC',
        'auth',
        'AUTH_SUCCESS',
        '',
        '',
        { challengeId }
      )
    } else {
      await AuditLogger.logSecurityEvent(
        challenge.userId,
        'BIOMETRIC',
        'auth',
        'AUTH_FAILED',
        '',
        '',
        { challengeId }
      )
    }

    return isValid
  }

  /**
   * Get all active sessions for a user
   */
  static async getUserSessions(userId: string): Promise<SessionInfo[]> {
    const sessions = await prisma.userSession.findMany({
      where: {
        userId: userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivity: 'desc' },
    })

    return sessions.map(session => ({
      id: session.id,
      userId: session.userId,
      deviceInfo: this.parseDeviceInfo(session.userAgent),
      ipAddress: session.ipAddress,
      isActive: session.isActive,
      lastActivity: session.lastActivity,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    }))
  }

  /**
   * Test-expected alias: get active sessions for a user
   */
  static async getActiveSessions(
    userId: string
  ): Promise<Array<{ id: string; sessionToken: string; isActive: boolean }>> {
    const sessions = await prisma.userSession.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivity: 'desc' },
    })
    return sessions.map(s => ({
      id: s.id,
      sessionToken: s.sessionToken,
      isActive: s.isActive,
    }))
  }

  /**
   * Test-expected method: detect session anomalies
   */
  static async detectAnomalies(data: {
    userId: string
    deviceId: string
    ipAddress: string
    userAgent: string
  }): Promise<AnomalyResult> {
    const anomalies: string[] = []
    const recentSession = await prisma.userSession.findFirst({
      where: { userId: data.userId, expiresAt: { gt: new Date() } },
      orderBy: { lastActivity: 'desc' },
    })

    // Compare IP change
    if (recentSession && recentSession.ipAddress !== data.ipAddress) {
      anomalies.push('ip_change')
    }

    // Compare device change (use provided deviceId or fingerprint)
    const providedFingerprint =
      data.deviceId ||
      this.generateDeviceFingerprint(
        this.parseDeviceInfo(data.userAgent),
        data.ipAddress
      )
    if (recentSession && recentSession.deviceId !== providedFingerprint) {
      anomalies.push('device_change')
    }

    return { hasAnomalies: anomalies.length > 0, anomalies }
  }

  /**
   * Destroy specific session
   */
  static async destroySession(sessionToken: string): Promise<boolean> {
    const session = await prisma.userSession.findUnique({
      where: { sessionToken: sessionToken },
    })

    if (session) {
      await prisma.userSession.delete({
        where: { sessionToken: sessionToken },
      })

      await AuditLogger.logSecurityEvent(
        session.userId,
        'SESSION_EVENT',
        'session',
        'DESTROYED',
        '',
        '',
        { sessionToken }
      )

      return true
    }

    return false
  }

  /**
   * Destroy all sessions for a user (except current)
   */
  static async destroyAllUserSessions(
    userId: string,
    exceptSessionId?: string
  ): Promise<number> {
    const where: Prisma.UserSessionWhereInput = exceptSessionId
      ? { userId, sessionToken: { not: exceptSessionId } }
      : { userId }

    const result = await prisma.userSession.deleteMany({
      where,
    })

    await AuditLogger.logSecurityEvent(
      userId,
      'SESSION_EVENT',
      'session',
      'ALL_DESTROYED',
      '',
      '',
      { count: result.count, exceptSessionId }
    )

    return result.count
  }

  /**
   * Mark device as trusted
   */
  static async trustDevice(sessionToken: string): Promise<boolean> {
    const updated = await prisma.userSession.update({
      where: { sessionToken: sessionToken },
      data: { isTrusted: true },
    })

    if (updated) {
      await AuditLogger.logSecurityEvent(
        updated.userId,
        'SESSION_EVENT',
        'session',
        'DEVICE_TRUSTED',
        '',
        '',
        { sessionToken }
      )
      return true
    }

    return false
  }

  /**
   * Private helper methods
   */
  private static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  private static parseDeviceInfo(userAgent: string): DeviceInfo {
    const parser = new UAParser(userAgent)
    const result = parser.getResult()
    const browserName = result.browser.name ?? 'Unknown'
    const browserVersion = result.browser.version ?? ''
    const osName = result.os.name ?? 'Unknown'
    const osVersion = result.os.version ?? ''
    const deviceType = result.device.type ?? 'desktop'
    const deviceModel = result.device.model ?? 'Desktop'

    return {
      browser: `${browserName} ${browserVersion}`.trim(),
      os: `${osName} ${osVersion}`.trim(),
      device: deviceModel,
      isMobile: deviceType === 'mobile' || deviceType === 'tablet',
    }
  }

  private static generateDeviceFingerprint(
    deviceInfo: DeviceInfo,
    ipAddress: string
  ): string {
    const fingerprint = `${deviceInfo.browser}-${deviceInfo.os}-${ipAddress}`
    return crypto.createHash('sha256').update(fingerprint).digest('hex')
  }

  private static async cleanupExpiredSessions(userId: string): Promise<void> {
    await prisma.userSession.deleteMany({
      where: {
        userId: userId,
        expiresAt: { lt: new Date() },
      },
    })
  }

  private static async enforceSessionLimit(userId: string): Promise<void> {
    const activeSessions = await prisma.userSession.count({
      where: {
        userId: userId,
        expiresAt: { gt: new Date() },
      },
    })

    if (activeSessions >= this.MAX_SESSIONS_PER_USER) {
      const oldestSession = await prisma.userSession.findFirst({
        where: {
          userId: userId,
          expiresAt: { gt: new Date() },
        },
        orderBy: { lastActivity: 'asc' },
      })

      if (oldestSession) {
        await prisma.userSession.delete({
          where: { id: oldestSession.id },
        })
      }
    }
  }

  private static verifySignature(
    challenge: string,
    signature: string,
    publicKey: string
  ): boolean {
    // Simplified signature verification; for production, implement WebAuthn/FIDO2
    try {
      const expectedSignature = crypto
        .createHmac('sha256', publicKey)
        .update(challenge)
        .digest('hex')

      return signature === expectedSignature
    } catch {
      return false
    }
  }
}
