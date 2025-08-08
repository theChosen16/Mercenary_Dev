import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { UAParser } from 'ua-parser-js'

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

export class SessionManager {
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
  private static readonly MAX_SESSIONS_PER_USER = 5
  private static readonly BIOMETRIC_TIMEOUT = 5 * 60 * 1000 // 5 minutes
  
  /**
   * Create new session with device fingerprinting
   */
  static async createSession(
    userId: string, 
    ipAddress: string, 
    userAgent: string,
    isTrustedDevice: boolean = false
  ): Promise<string> {
    const deviceInfo = this.parseDeviceInfo(userAgent)
    const sessionToken = this.generateSecureToken()
    const expiresAt = new Date(Date.now() + this.SESSION_DURATION)
    
    // Check for existing sessions and cleanup if needed
    await this.cleanupExpiredSessions(userId)
    await this.enforceSessionLimit(userId)
    
    // Create session record
    await prisma.userSession.create({
      data: {
        id: sessionToken,
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_fingerprint: this.generateDeviceFingerprint(deviceInfo, ipAddress),
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        device_type: deviceInfo.device,
        is_mobile: deviceInfo.isMobile,
        is_trusted: isTrustedDevice,
        last_activity: new Date(),
        expires_at: expiresAt,
        created_at: new Date()
      }
    })
    
    // Log session creation
    await this.logSecurityEvent(userId, 'SESSION_CREATED', {
      sessionId: sessionToken,
      deviceInfo,
      ipAddress,
      isTrustedDevice
    })
    
    return sessionToken
  }
  
  /**
   * Validate and refresh session
   */
  static async validateSession(sessionToken: string, ipAddress: string, userAgent: string): Promise<SessionInfo | null> {
    const session = await prisma.userSession.findUnique({
      where: { id: sessionToken },
      include: { user: { select: { id: true, email: true } } }
    })
    
    if (!session || session.expires_at < new Date()) {
      if (session) {
        await this.destroySession(sessionToken)
      }
      return null
    }
    
    // Check for suspicious activity
    const currentDeviceFingerprint = this.generateDeviceFingerprint(
      this.parseDeviceInfo(userAgent), 
      ipAddress
    )
    
    if (session.device_fingerprint !== currentDeviceFingerprint && !session.is_trusted) {
      await this.logSecurityEvent(session.user_id, 'SUSPICIOUS_SESSION_ACTIVITY', {
        sessionId: sessionToken,
        expectedFingerprint: session.device_fingerprint,
        actualFingerprint: currentDeviceFingerprint,
        ipAddress
      })
      
      // Require re-authentication for suspicious activity
      await this.destroySession(sessionToken)
      return null
    }
    
    // Update last activity
    await prisma.userSession.update({
      where: { id: sessionToken },
      data: { last_activity: new Date() }
    })
    
    return {
      id: session.id,
      userId: session.user_id,
      deviceInfo: {
        browser: session.browser,
        os: session.os,
        device: session.device_type,
        isMobile: session.is_mobile
      },
      ipAddress: session.ip_address,
      isActive: true,
      lastActivity: session.last_activity,
      createdAt: session.created_at,
      expiresAt: session.expires_at
    }
  }
  
  /**
   * Generate biometric authentication challenge
   */
  static async generateBiometricChallenge(userId: string): Promise<BiometricChallenge> {
    const challengeId = this.generateSecureToken()
    const challenge = crypto.randomBytes(32).toString('base64')
    
    // Store challenge temporarily
    await prisma.biometricChallenge.create({
      data: {
        id: challengeId,
        user_id: userId,
        challenge: challenge,
        expires_at: new Date(Date.now() + this.BIOMETRIC_TIMEOUT),
        created_at: new Date()
      }
    })
    
    return {
      challengeId,
      publicKey: challenge,
      timeout: this.BIOMETRIC_TIMEOUT
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
      where: { id: challengeId }
    })
    
    if (!challenge || challenge.expires_at < new Date()) {
      if (challenge) {
        await prisma.biometricChallenge.delete({
          where: { id: challengeId }
        })
      }
      return false
    }
    
    // Verify signature (simplified - in production use proper WebAuthn)
    const isValid = this.verifySignature(challenge.challenge, signature, publicKey)
    
    // Cleanup challenge
    await prisma.biometricChallenge.delete({
      where: { id: challengeId }
    })
    
    if (isValid) {
      await this.logSecurityEvent(challenge.user_id, 'BIOMETRIC_AUTH_SUCCESS', {
        challengeId
      })
    } else {
      await this.logSecurityEvent(challenge.user_id, 'BIOMETRIC_AUTH_FAILED', {
        challengeId
      })
    }
    
    return isValid
  }
  
  /**
   * Get all active sessions for a user
   */
  static async getUserSessions(userId: string): Promise<SessionInfo[]> {
    const sessions = await prisma.userSession.findMany({
      where: { 
        user_id: userId,
        expires_at: { gt: new Date() }
      },
      orderBy: { last_activity: 'desc' }
    })
    
    return sessions.map(session => ({
      id: session.id,
      userId: session.user_id,
      deviceInfo: {
        browser: session.browser,
        os: session.os,
        device: session.device_type,
        isMobile: session.is_mobile
      },
      ipAddress: session.ip_address,
      isActive: true,
      lastActivity: session.last_activity,
      createdAt: session.created_at,
      expiresAt: session.expires_at
    }))
  }
  
  /**
   * Destroy specific session
   */
  static async destroySession(sessionToken: string): Promise<boolean> {
    const session = await prisma.userSession.findUnique({
      where: { id: sessionToken }
    })
    
    if (session) {
      await prisma.userSession.delete({
        where: { id: sessionToken }
      })
      
      await this.logSecurityEvent(session.user_id, 'SESSION_DESTROYED', {
        sessionId: sessionToken
      })
      
      return true
    }
    
    return false
  }
  
  /**
   * Destroy all sessions for a user (except current)
   */
  static async destroyAllUserSessions(userId: string, exceptSessionId?: string): Promise<number> {
    const whereClause: any = { user_id: userId }
    if (exceptSessionId) {
      whereClause.id = { not: exceptSessionId }
    }
    
    const result = await prisma.userSession.deleteMany({
      where: whereClause
    })
    
    await this.logSecurityEvent(userId, 'ALL_SESSIONS_DESTROYED', {
      count: result.count,
      exceptSessionId
    })
    
    return result.count
  }
  
  /**
   * Mark device as trusted
   */
  static async trustDevice(sessionToken: string): Promise<boolean> {
    const updated = await prisma.userSession.update({
      where: { id: sessionToken },
      data: { is_trusted: true }
    })
    
    if (updated) {
      await this.logSecurityEvent(updated.user_id, 'DEVICE_TRUSTED', {
        sessionId: sessionToken
      })
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
    
    return {
      browser: `${result.browser.name} ${result.browser.version}`,
      os: `${result.os.name} ${result.os.version}`,
      device: result.device.model || 'Desktop',
      isMobile: result.device.type === 'mobile' || result.device.type === 'tablet'
    }
  }
  
  private static generateDeviceFingerprint(deviceInfo: DeviceInfo, ipAddress: string): string {
    const fingerprint = `${deviceInfo.browser}-${deviceInfo.os}-${ipAddress}`
    return crypto.createHash('sha256').update(fingerprint).digest('hex')
  }
  
  private static async cleanupExpiredSessions(userId: string): Promise<void> {
    await prisma.userSession.deleteMany({
      where: {
        user_id: userId,
        expires_at: { lt: new Date() }
      }
    })
  }
  
  private static async enforceSessionLimit(userId: string): Promise<void> {
    const activeSessions = await prisma.userSession.count({
      where: {
        user_id: userId,
        expires_at: { gt: new Date() }
      }
    })
    
    if (activeSessions >= this.MAX_SESSIONS_PER_USER) {
      // Remove oldest session
      const oldestSession = await prisma.userSession.findFirst({
        where: {
          user_id: userId,
          expires_at: { gt: new Date() }
        },
        orderBy: { last_activity: 'asc' }
      })
      
      if (oldestSession) {
        await prisma.userSession.delete({
          where: { id: oldestSession.id }
        })
      }
    }
  }
  
  private static verifySignature(challenge: string, signature: string, publicKey: string): boolean {
    // Simplified signature verification
    // In production, implement proper WebAuthn/FIDO2 verification
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
  
  private static async logSecurityEvent(userId: string, event: string, metadata: any) {
    try {
      await prisma.securityLog.create({
        data: {
          user_id: userId,
          event_type: event,
          metadata: JSON.stringify(metadata),
          ip_address: metadata.ipAddress || '',
          user_agent: '',
          created_at: new Date()
        }
      })
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }
}
