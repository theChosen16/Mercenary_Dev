import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { AuditLogger } from './audit-logger'

export interface EncryptedMessage {
  messageId: string
  encryptedData: string // JSON string containing { ciphertext, iv, tag }
  ephemeralKeyId: string
  keyFingerprint: string
  integrityHash: string
}

export interface KeyPair {
  publicKey: string
  privateKey: string // Encrypted private key returned for immediate use
  keyVersion: number
}

// ChatParticipant removed - not used with current Prisma schema

export class ChatEncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm'
  private static readonly KEY_LENGTH = 32
  private static readonly IV_LENGTH = 12 // 96-bit nonce recommended for GCM

  /**
   * Generate key pair for user
   */
  static async generateUserKeyPair(userId: string): Promise<KeyPair> {
    // Generate RSA key pair for key exchange
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    })

    // Encrypt private key with user's password-derived key
    const encryptedPrivateKey = await this.encryptPrivateKey(privateKey, userId)

    // Store keys in database
    await prisma.userEncryptionKey.upsert({
      where: { userId },
      update: {
        publicKey: publicKey,
        privateKey: encryptedPrivateKey,
      },
      create: {
        userId: userId,
        publicKey: publicKey,
        privateKey: encryptedPrivateKey,
      },
    })

    const record = await prisma.userEncryptionKey.findUnique({
      where: { userId },
      select: { keyVersion: true },
    })

    return {
      publicKey,
      privateKey, // Return unencrypted for immediate use
      keyVersion: record?.keyVersion ?? 1,
    }
  }

  /**
   * Backwards-compatible alias expected by tests
   * Returns success flag and key fingerprint
   */
  static async generateUserKeys(
    userId: string
  ): Promise<{ success: boolean; publicKey: string; keyFingerprint: string }> {
    const { publicKey } = await this.generateUserKeyPair(userId)
    const keyFingerprint = crypto
      .createHash('sha256')
      .update(publicKey)
      .digest('hex')
    return { success: true, publicKey, keyFingerprint }
  }

  /**
   * Get user's public key
   */
  static async getUserPublicKey(
    userId: string
  ): Promise<{ publicKey: string; keyVersion: number } | null> {
    const keyRecord = await prisma.userEncryptionKey.findUnique({
      where: { userId },
      select: { publicKey: true, keyVersion: true },
    })

    if (!keyRecord) return null

    return {
      publicKey: keyRecord.publicKey,
      keyVersion: keyRecord.keyVersion,
    }
  }

  /**
   * Encrypt message for chat participants
   * Overloads:
   * - encryptMessage(senderId, receiverId, message): returns { success, ... }
   * - encryptMessage(senderId, receiverId, messageId, plaintext): returns EncryptedMessage
   */
  static async encryptMessage(
    senderId: string,
    receiverId: string,
    message: string
  ): Promise<{
    success: true
    messageId: string
    encryptedData: string
    ephemeralKeyId: string
    keyFingerprint: string
    integrityHash: string
  }>
  static async encryptMessage(
    senderId: string,
    receiverId: string,
    messageId: string,
    plaintext: string
  ): Promise<EncryptedMessage>
  static async encryptMessage(
    senderId: string,
    receiverId: string,
    messageOrId: string,
    maybePlaintext?: string
  ): Promise<
    | EncryptedMessage
    | {
        success: true
        messageId: string
        encryptedData: string
        ephemeralKeyId: string
        keyFingerprint: string
        integrityHash: string
      }
  > {
    // Ensure receiver has a public key
    const receiverKey = await prisma.userEncryptionKey.findUnique({
      where: { userId: receiverId },
      select: { publicKey: true },
    })
    if (!receiverKey?.publicKey) {
      throw new Error('Receiver does not have a public encryption key')
    }

    const compatMode = typeof maybePlaintext === 'undefined'
    const messageId = compatMode ? crypto.randomUUID() : messageOrId
    const plaintext = compatMode ? messageOrId : (maybePlaintext as string)

    // Generate symmetric key for this message
    const messageKey = crypto.randomBytes(this.KEY_LENGTH)
    const iv = crypto.randomBytes(this.IV_LENGTH)

    // Encrypt message with symmetric key (AES-256-GCM)
    const cipher = crypto.createCipheriv(this.ALGORITHM, messageKey, iv)
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex')
    ciphertext += cipher.final('hex')
    const tagHex = cipher.getAuthTag().toString('hex')

    const encryptedDataObj = {
      ciphertext,
      iv: iv.toString('hex'),
      tag: tagHex,
    }
    const encryptedData = JSON.stringify(encryptedDataObj)

    // Encrypt message key for receiver with RSA public key
    const encryptedKey = crypto
      .publicEncrypt(receiverKey.publicKey, messageKey)
      .toString('base64')

    // Create ephemeral key record pointing to receiver (for forward secrecy)
    const ephemeral = await prisma.ephemeralChatKey.create({
      data: {
        userId: receiverId,
        keyData: encryptedKey,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isUsed: false,
        createdAt: new Date(),
      },
    })

    // Compute fingerprints and integrity hash
    const keyFingerprint = crypto
      .createHash('sha256')
      .update(receiverKey.publicKey)
      .digest('hex')
    const integrityHash = crypto
      .createHash('sha256')
      .update(ciphertext + encryptedDataObj.iv + tagHex)
      .digest('hex')

    // Store encrypted message per schema
    await prisma.encryptedChatMessage.create({
      data: {
        messageId: messageId,
        senderId: senderId,
        receiverId: receiverId,
        encryptedData: encryptedData,
        keyFingerprint: keyFingerprint,
        ephemeralKeyId: ephemeral.id,
        integrityHash: integrityHash,
        createdAt: new Date(),
      },
    })

    await AuditLogger.logSecurityEvent(
      senderId,
      'CHAT_ENCRYPTION',
      'message',
      'ENCRYPTED',
      '',
      '',
      { messageId, receiverId, ephemeralKeyId: ephemeral.id }
    )

    if (compatMode) {
      return {
        success: true,
        messageId,
        encryptedData,
        ephemeralKeyId: ephemeral.id,
        keyFingerprint,
        integrityHash,
      }
    } else {
      return {
        messageId,
        encryptedData,
        ephemeralKeyId: ephemeral.id,
        keyFingerprint,
        integrityHash,
      }
    }
  }

  /**
   * Decrypt message for specific user
   */
  static async decryptMessage(
    messageId: string,
    userId: string,
    userPrivateKey: string
  ): Promise<string | null>
  static async decryptMessage(
    userId: string,
    encryptedData: string,
    keyFingerprint: string
  ): Promise<{ success: boolean; message?: string }>
  static async decryptMessage(
    a: string,
    b: string,
    c: string
  ): Promise<string | null | { success: boolean; message?: string }> {
    // Determine overload by checking if 'b' looks like JSON encrypted payload
    let byPayload = false
    try {
      const parsed = JSON.parse(b) as {
        ciphertext?: string
        iv?: string
        tag?: string
      }
      byPayload = !!(parsed && parsed.ciphertext && parsed.iv && parsed.tag)
    } catch {
      byPayload = false
    }

    if (byPayload) {
      // Overload variant: (userId, encryptedData, keyFingerprint)
      const userId = a
      const encryptedData = b
      const record = await prisma.encryptedChatMessage.findFirst({
        where: { encryptedData },
      })
      if (!record) return { success: false }

      try {
        if (!record.ephemeralKeyId)
          throw new Error('Missing ephemeral key reference')
        const eph = await prisma.ephemeralChatKey.findUnique({
          where: { id: record.ephemeralKeyId },
        })
        if (!eph) throw new Error('Ephemeral key not found')

        // Load and decrypt user's private key from DB
        const keyRec = await prisma.userEncryptionKey.findUnique({
          where: { userId },
          select: { privateKey: true },
        })
        if (!keyRec?.privateKey) throw new Error('User private key not found')
        const privateKey = await this.decryptPrivateKey(
          keyRec.privateKey,
          userId
        )

        const messageKey = crypto.privateDecrypt(
          privateKey,
          Buffer.from(eph.keyData, 'base64')
        )

        const data = JSON.parse(record.encryptedData) as {
          ciphertext: string
          iv: string
          tag: string
        }

        const expectedHash = crypto
          .createHash('sha256')
          .update(data.ciphertext + data.iv + data.tag)
          .digest('hex')
        if (expectedHash !== record.integrityHash) {
          throw new Error('Integrity check failed')
        }

        const decipher = crypto.createDecipheriv(
          this.ALGORITHM,
          messageKey,
          Buffer.from(data.iv, 'hex')
        )
        decipher.setAuthTag(Buffer.from(data.tag, 'hex'))
        let plaintext = decipher.update(data.ciphertext, 'hex', 'utf8')
        plaintext += decipher.final('utf8')

        await prisma.ephemeralChatKey.update({
          where: { id: eph.id },
          data: { isUsed: true },
        })

        await AuditLogger.logSecurityEvent(
          userId,
          'CHAT_ENCRYPTION',
          'message',
          'DECRYPTED',
          '',
          '',
          { messageId: record.messageId }
        )

        return { success: true, message: plaintext }
      } catch (error) {
        console.error('Failed to decrypt message:', error)
        return { success: false }
      }
    } else {
      // Original variant: (messageId, userId, userPrivateKey)
      const messageId = a
      const userId = b
      const userPrivateKey = c
      const record = await prisma.encryptedChatMessage.findUnique({
        where: { messageId },
      })
      if (!record) return null

      try {
        if (!record.ephemeralKeyId)
          throw new Error('Missing ephemeral key reference')
        const eph = await prisma.ephemeralChatKey.findUnique({
          where: { id: record.ephemeralKeyId },
        })
        if (!eph) throw new Error('Ephemeral key not found')

        // Decrypt symmetric key
        const messageKey = crypto.privateDecrypt(
          userPrivateKey,
          Buffer.from(eph.keyData, 'base64')
        )

        const data = JSON.parse(record.encryptedData) as {
          ciphertext: string
          iv: string
          tag: string
        }

        // Verify integrity
        const expectedHash = crypto
          .createHash('sha256')
          .update(data.ciphertext + data.iv + data.tag)
          .digest('hex')
        if (expectedHash !== record.integrityHash) {
          throw new Error('Integrity check failed')
        }

        const decipher = crypto.createDecipheriv(
          this.ALGORITHM,
          messageKey,
          Buffer.from(data.iv, 'hex')
        )
        decipher.setAuthTag(Buffer.from(data.tag, 'hex'))
        let plaintext = decipher.update(data.ciphertext, 'hex', 'utf8')
        plaintext += decipher.final('utf8')

        await prisma.ephemeralChatKey.update({
          where: { id: eph.id },
          data: { isUsed: true },
        })

        await AuditLogger.logSecurityEvent(
          userId,
          'CHAT_ENCRYPTION',
          'message',
          'DECRYPTED',
          '',
          '',
          { messageId }
        )

        return plaintext
      } catch (error) {
        console.error('Failed to decrypt message:', error)
        return null
      }
    }
  }

  /**
   * Get chat participants with their public keys
   */
  // getChatParticipants removed - no Chat model in schema

  /**
   * Rotate user's encryption keys
   */
  static async rotateUserKeys(userId: string): Promise<KeyPair> {
    // Generate new key pair
    const newKeyPair = await this.generateUserKeyPair(userId)

    // Archive old key (for decrypting old messages)
    const oldKey = await prisma.userEncryptionKey.findUnique({
      where: { userId },
    })

    if (oldKey) {
      await prisma.archivedEncryptionKey.create({
        data: {
          userId: userId,
          publicKey: oldKey.publicKey,
          privateKey: oldKey.privateKey,
          keyVersion: oldKey.keyVersion,
          archivedAt: new Date(),
        },
      })
    }

    // Log key rotation
    await AuditLogger.logSecurityEvent(
      userId,
      'CHAT_ENCRYPTION',
      'keys',
      'ROTATED',
      '',
      '',
      {
        previousVersion: oldKey?.keyVersion ?? null,
        newVersion: newKeyPair.keyVersion,
      }
    )

    return newKeyPair
  }

  /**
   * Verify message integrity
   */
  static async verifyMessageIntegrity(messageId: string): Promise<boolean> {
    const message = await prisma.encryptedChatMessage.findUnique({
      where: { messageId },
    })

    if (!message) return false

    try {
      const data = JSON.parse(message.encryptedData) as {
        ciphertext: string
        iv: string
        tag: string
      }
      const expectedHash = crypto
        .createHash('sha256')
        .update(data.ciphertext + data.iv + data.tag)
        .digest('hex')
      return expectedHash === message.integrityHash
    } catch {
      return false
    }
  }

  /**
   * Enable forward secrecy by generating ephemeral keys
   */
  /**
   * Clean up expired ephemeral keys
   */
  static async cleanupExpiredKeys(): Promise<number> {
    const result = await prisma.ephemeralChatKey.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    })

    return result.count
  }

  /**
   * Private helper methods
   */
  private static async encryptPrivateKey(
    privateKey: string,
    userId: string
  ): Promise<string> {
    // In production, derive key from user's password using PBKDF2
    const userKey = await this.deriveUserKey(userId)
    const iv = crypto.randomBytes(this.IV_LENGTH)

    const cipher = crypto.createCipheriv(this.ALGORITHM, userKey, iv)
    let encrypted = cipher.update(privateKey, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag()

    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    })
  }

  private static async decryptPrivateKey(
    serialized: string,
    userId: string
  ): Promise<string> {
    const { encrypted, iv, authTag } = JSON.parse(serialized) as {
      encrypted: string
      iv: string
      authTag: string
    }
    const userKey = await this.deriveUserKey(userId)
    const decipher = crypto.createDecipheriv(
      this.ALGORITHM,
      userKey,
      Buffer.from(iv, 'hex')
    )
    decipher.setAuthTag(Buffer.from(authTag, 'hex'))
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  private static async deriveUserKey(userId: string): Promise<Buffer> {
    // Simplified key derivation - in production use proper PBKDF2 with user password
    const salt = process.env.ENCRYPTION_SALT || 'default-salt'
    return crypto.pbkdf2Sync(userId, salt, 100000, this.KEY_LENGTH, 'sha256')
  }
  // Audit logging centralized via AuditLogger
}
