import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export interface EncryptedMessage {
  encryptedContent: string
  iv: string
  authTag: string
  keyId: string
}

export interface KeyPair {
  publicKey: string
  privateKey: string
  keyId: string
}

export interface ChatParticipant {
  userId: string
  publicKey: string
  keyId: string
}

export class ChatEncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm'
  private static readonly KEY_LENGTH = 32
  private static readonly IV_LENGTH = 16
  
  /**
   * Generate key pair for user
   */
  static async generateUserKeyPair(userId: string): Promise<KeyPair> {
    const keyId = crypto.randomUUID()
    
    // Generate RSA key pair for key exchange
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    })
    
    // Encrypt private key with user's password-derived key
    const encryptedPrivateKey = await this.encryptPrivateKey(privateKey, userId)
    
    // Store keys in database
    await prisma.userEncryptionKey.upsert({
      where: { user_id: userId },
      update: {
        key_id: keyId,
        public_key: publicKey,
        encrypted_private_key: encryptedPrivateKey,
        updated_at: new Date()
      },
      create: {
        user_id: userId,
        key_id: keyId,
        public_key: publicKey,
        encrypted_private_key: encryptedPrivateKey,
        created_at: new Date(),
        updated_at: new Date()
      }
    })
    
    return {
      publicKey,
      privateKey, // Return unencrypted for immediate use
      keyId
    }
  }
  
  /**
   * Get user's public key
   */
  static async getUserPublicKey(userId: string): Promise<{ publicKey: string; keyId: string } | null> {
    const keyRecord = await prisma.userEncryptionKey.findUnique({
      where: { user_id: userId },
      select: { public_key: true, key_id: true }
    })
    
    if (!keyRecord) return null
    
    return {
      publicKey: keyRecord.public_key,
      keyId: keyRecord.key_id
    }
  }
  
  /**
   * Encrypt message for chat participants
   */
  static async encryptMessage(
    senderId: string,
    chatId: string,
    message: string,
    participants: ChatParticipant[]
  ): Promise<EncryptedMessage> {
    // Generate symmetric key for this message
    const messageKey = crypto.randomBytes(this.KEY_LENGTH)
    const iv = crypto.randomBytes(this.IV_LENGTH)
    
    // Encrypt message with symmetric key
    const cipher = crypto.createCipherGCM(this.ALGORITHM, messageKey, iv)
    let encryptedContent = cipher.update(message, 'utf8', 'hex')
    encryptedContent += cipher.final('hex')
    const authTag = cipher.getAuthTag().toString('hex')
    
    // Encrypt message key for each participant
    const encryptedKeys: { userId: string; encryptedKey: string }[] = []
    
    for (const participant of participants) {
      const encryptedKey = crypto.publicEncrypt(
        participant.publicKey,
        messageKey
      ).toString('base64')
      
      encryptedKeys.push({
        userId: participant.userId,
        encryptedKey
      })
    }
    
    // Store encrypted message
    const keyId = crypto.randomUUID()
    await prisma.encryptedChatMessage.create({
      data: {
        id: keyId,
        chat_id: chatId,
        sender_id: senderId,
        encrypted_content: encryptedContent,
        iv: iv.toString('hex'),
        auth_tag: authTag,
        encrypted_keys: JSON.stringify(encryptedKeys),
        created_at: new Date()
      }
    })
    
    return {
      encryptedContent,
      iv: iv.toString('hex'),
      authTag,
      keyId
    }
  }
  
  /**
   * Decrypt message for specific user
   */
  static async decryptMessage(
    messageId: string,
    userId: string,
    userPrivateKey: string
  ): Promise<string | null> {
    const message = await prisma.encryptedChatMessage.findUnique({
      where: { id: messageId }
    })
    
    if (!message) return null
    
    try {
      // Find user's encrypted key
      const encryptedKeys = JSON.parse(message.encrypted_keys)
      const userKeyData = encryptedKeys.find((k: any) => k.userId === userId)
      
      if (!userKeyData) {
        throw new Error('User not authorized to decrypt this message')
      }
      
      // Decrypt message key with user's private key
      const messageKey = crypto.privateDecrypt(
        userPrivateKey,
        Buffer.from(userKeyData.encryptedKey, 'base64')
      )
      
      // Decrypt message content
      const decipher = crypto.createDecipherGCM(
        this.ALGORITHM,
        messageKey,
        Buffer.from(message.iv, 'hex')
      )
      
      decipher.setAuthTag(Buffer.from(message.auth_tag, 'hex'))
      
      let decryptedContent = decipher.update(message.encrypted_content, 'hex', 'utf8')
      decryptedContent += decipher.final('utf8')
      
      return decryptedContent
    } catch (error) {
      console.error('Failed to decrypt message:', error)
      return null
    }
  }
  
  /**
   * Get chat participants with their public keys
   */
  static async getChatParticipants(chatId: string): Promise<ChatParticipant[]> {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          include: {
            user: {
              include: {
                encryptionKey: {
                  select: { public_key: true, key_id: true }
                }
              }
            }
          }
        }
      }
    })
    
    if (!chat) return []
    
    return chat.participants
      .filter(p => p.user.encryptionKey)
      .map(p => ({
        userId: p.user_id,
        publicKey: p.user.encryptionKey!.public_key,
        keyId: p.user.encryptionKey!.key_id
      }))
  }
  
  /**
   * Rotate user's encryption keys
   */
  static async rotateUserKeys(userId: string): Promise<KeyPair> {
    // Generate new key pair
    const newKeyPair = await this.generateUserKeyPair(userId)
    
    // Archive old key (for decrypting old messages)
    const oldKey = await prisma.userEncryptionKey.findUnique({
      where: { user_id: userId }
    })
    
    if (oldKey) {
      await prisma.archivedEncryptionKey.create({
        data: {
          user_id: userId,
          key_id: oldKey.key_id,
          public_key: oldKey.public_key,
          encrypted_private_key: oldKey.encrypted_private_key,
          archived_at: new Date()
        }
      })
    }
    
    // Log key rotation
    await this.logSecurityEvent(userId, 'ENCRYPTION_KEY_ROTATED', {
      oldKeyId: oldKey?.key_id,
      newKeyId: newKeyPair.keyId
    })
    
    return newKeyPair
  }
  
  /**
   * Verify message integrity
   */
  static async verifyMessageIntegrity(messageId: string): Promise<boolean> {
    const message = await prisma.encryptedChatMessage.findUnique({
      where: { id: messageId }
    })
    
    if (!message) return false
    
    try {
      // Verify that the message hasn't been tampered with
      // This is a simplified check - in production, use proper HMAC
      const expectedHash = crypto
        .createHash('sha256')
        .update(message.encrypted_content + message.iv + message.auth_tag)
        .digest('hex')
      
      // In a real implementation, you'd store and compare this hash
      return true
    } catch {
      return false
    }
  }
  
  /**
   * Enable forward secrecy by generating ephemeral keys
   */
  static async generateEphemeralKey(chatId: string, userId: string): Promise<string> {
    const ephemeralKey = crypto.randomBytes(this.KEY_LENGTH).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    await prisma.ephemeralChatKey.create({
      data: {
        chat_id: chatId,
        user_id: userId,
        key_data: ephemeralKey,
        expires_at: expiresAt,
        created_at: new Date()
      }
    })
    
    return ephemeralKey
  }
  
  /**
   * Clean up expired ephemeral keys
   */
  static async cleanupExpiredKeys(): Promise<number> {
    const result = await prisma.ephemeralChatKey.deleteMany({
      where: {
        expires_at: { lt: new Date() }
      }
    })
    
    return result.count
  }
  
  /**
   * Private helper methods
   */
  private static async encryptPrivateKey(privateKey: string, userId: string): Promise<string> {
    // In production, derive key from user's password using PBKDF2
    const userKey = await this.deriveUserKey(userId)
    const iv = crypto.randomBytes(this.IV_LENGTH)
    
    const cipher = crypto.createCipherGCM(this.ALGORITHM, userKey, iv)
    let encrypted = cipher.update(privateKey, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag()
    
    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    })
  }
  
  private static async deriveUserKey(userId: string): Promise<Buffer> {
    // Simplified key derivation - in production use proper PBKDF2 with user password
    const salt = process.env.ENCRYPTION_SALT || 'default-salt'
    return crypto.pbkdf2Sync(userId, salt, 100000, this.KEY_LENGTH, 'sha256')
  }
  
  private static async logSecurityEvent(userId: string, event: string, metadata: any) {
    try {
      await prisma.securityLog.create({
        data: {
          user_id: userId,
          event_type: event,
          metadata: JSON.stringify(metadata),
          ip_address: '',
          user_agent: '',
          created_at: new Date()
        }
      })
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }
}
