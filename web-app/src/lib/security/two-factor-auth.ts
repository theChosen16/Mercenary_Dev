import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export interface TwoFactorVerification {
  isValid: boolean
  usedBackupCode?: boolean
}

export class TwoFactorAuthService {
  private static readonly APP_NAME = 'Mercenary Platform'

  /**
   * Generate 2FA setup for a user
   */
  static async generateSetup(
    userId: string,
    userEmail: string
  ): Promise<TwoFactorSetup> {
    // Generate secret
    const secret = authenticator.generateSecret()

    // Generate service name for authenticator apps
    const serviceName = `${this.APP_NAME} (${userEmail})`
    const otpAuthUrl = authenticator.keyuri(userEmail, serviceName, secret)

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl)

    // Generate backup codes
    const backupCodes = this.generateBackupCodes()

    // Store in database (encrypted)
    await prisma.user.update({
      where: { id: userId },
      data: {
        two_factor_secret: this.encryptSecret(secret),
        two_factor_backup_codes: JSON.stringify(
          backupCodes.map(code => this.hashBackupCode(code))
        ),
        two_factor_enabled: false, // Will be enabled after verification
      },
    })

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    }
  }

  /**
   * Verify and enable 2FA for a user
   */
  static async verifyAndEnable(
    userId: string,
    token: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { two_factor_secret: true },
    })

    if (!user?.two_factor_secret) {
      throw new Error('2FA not set up for this user')
    }

    const secret = this.decryptSecret(user.two_factor_secret)
    const isValid = authenticator.verify({ token, secret })

    if (isValid) {
      await prisma.user.update({
        where: { id: userId },
        data: { two_factor_enabled: true },
      })

      // Log security event
      await this.logSecurityEvent(userId, '2FA_ENABLED', { success: true })
    }

    return isValid
  }

  /**
   * Verify 2FA token during login
   */
  static async verifyToken(
    userId: string,
    token: string
  ): Promise<TwoFactorVerification> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        two_factor_secret: true,
        two_factor_enabled: true,
        two_factor_backup_codes: true,
      },
    })

    if (!user?.two_factor_enabled || !user.two_factor_secret) {
      return { isValid: false }
    }

    const secret = this.decryptSecret(user.two_factor_secret)

    // First try TOTP verification
    const isValidTOTP = authenticator.verify({ token, secret })

    if (isValidTOTP) {
      await this.logSecurityEvent(userId, '2FA_LOGIN_SUCCESS', {
        method: 'TOTP',
      })
      return { isValid: true }
    }

    // Try backup codes if TOTP fails
    if (user.two_factor_backup_codes) {
      const backupCodes = JSON.parse(user.two_factor_backup_codes) as string[]
      const hashedToken = this.hashBackupCode(token)

      const codeIndex = backupCodes.findIndex(
        (code: string) => code === hashedToken
      )

      if (codeIndex !== -1) {
        // Remove used backup code
        backupCodes.splice(codeIndex, 1)
        await prisma.user.update({
          where: { id: userId },
          data: { two_factor_backup_codes: JSON.stringify(backupCodes) },
        })

        await this.logSecurityEvent(userId, '2FA_LOGIN_SUCCESS', {
          method: 'BACKUP_CODE',
        })
        return { isValid: true, usedBackupCode: true }
      }
    }

    await this.logSecurityEvent(userId, '2FA_LOGIN_FAILED', {
      token: token.substring(0, 2) + '****',
    })
    return { isValid: false }
  }

  /**
   * Disable 2FA for a user
   */
  static async disable(userId: string, password: string): Promise<boolean> {
    // Verify password before disabling
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    })

    if (!user) return false

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      await this.logSecurityEvent(userId, '2FA_DISABLE_FAILED', {
        reason: 'Invalid password',
      })
      return false
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        two_factor_enabled: false,
        two_factor_secret: null,
        two_factor_backup_codes: null,
      },
    })

    await this.logSecurityEvent(userId, '2FA_DISABLED', { success: true })
    return true
  }

  /**
   * Generate backup codes
   */
  private static generateBackupCodes(): string[] {
    const codes: string[] = []
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase())
    }
    return codes
  }

  /**
   * Encrypt 2FA secret
   */
  private static encryptSecret(secret: string): string {
    const key = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'
    const cipher = crypto.createCipher('aes-256-cbc', key)
    let encrypted = cipher.update(secret, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
  }

  /**
   * Decrypt 2FA secret
   */
  private static decryptSecret(encryptedSecret: string): string {
    const key = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'
    const decipher = crypto.createDecipher('aes-256-cbc', key)
    let decrypted = decipher.update(encryptedSecret, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  /**
   * Hash backup code for storage
   */
  private static hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex')
  }

  /**
   * Log security events
   */
  private static async logSecurityEvent(
    userId: string,
    event: string,
    metadata: Record<string, unknown>
  ) {
    try {
      await prisma.securityLog.create({
        data: {
          user_id: userId,
          event_type: event,
          metadata: JSON.stringify(metadata),
          ip_address: '', // Will be filled by middleware
          user_agent: '', // Will be filled by middleware
          created_at: new Date(),
        },
      })
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }
}
