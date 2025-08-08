/**
 * Security System Integration Tests
 * Tests for enterprise-grade security features
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TwoFactorAuthService } from '../../src/lib/security/two-factor-auth';
import { SessionManager } from '../../src/lib/security/session-manager';
import { ChatEncryptionService } from '../../src/lib/security/chat-encryption';
import { AuditLogger } from '../../src/lib/security/audit-logger';
import { RateLimiter } from '../../src/lib/security/rate-limiter';
import { AbusePreventionService } from '../../src/lib/security/abuse-prevention';
import { prisma } from '../../src/lib/prisma';

// Mock user for testing
const mockUser = {
  id: 'test-user-123',
  email: 'test@mercenary.dev',
  name: 'Test User'
};

const mockRequest = {
  ip: '192.168.1.100',
  headers: {
    'user-agent': 'Mozilla/5.0 (Test Browser)'
  }
};

describe('Security System Integration Tests', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.twoFactorAuth.deleteMany({ where: { userId: mockUser.id } });
    await prisma.userSession.deleteMany({ where: { userId: mockUser.id } });
    await prisma.userEncryptionKey.deleteMany({ where: { userId: mockUser.id } });
    await prisma.auditLog.deleteMany({ where: { userId: mockUser.id } });
    await prisma.rateLimit.deleteMany({ where: { identifier: mockRequest.ip } });
  });

  afterEach(async () => {
    // Clean up test data after each test
    await prisma.twoFactorAuth.deleteMany({ where: { userId: mockUser.id } });
    await prisma.userSession.deleteMany({ where: { userId: mockUser.id } });
    await prisma.userEncryptionKey.deleteMany({ where: { userId: mockUser.id } });
    await prisma.auditLog.deleteMany({ where: { userId: mockUser.id } });
    await prisma.rateLimit.deleteMany({ where: { identifier: mockRequest.ip } });
  });

  describe('Two-Factor Authentication', () => {
    it('should enable 2FA for user', async () => {
      const result = await TwoFactorAuthService.enableTwoFactor(mockUser.id);
      
      expect(result.success).toBe(true);
      expect(result.secret).toBeDefined();
      expect(result.qrCode).toBeDefined();
      expect(result.backupCodes).toHaveLength(10);

      // Verify 2FA is stored in database
      const twoFactor = await prisma.twoFactorAuth.findUnique({
        where: { userId: mockUser.id }
      });
      expect(twoFactor).toBeTruthy();
      expect(twoFactor?.isEnabled).toBe(true);
    });

    it('should verify TOTP token', async () => {
      // Enable 2FA first
      const enableResult = await TwoFactorAuthService.enableTwoFactor(mockUser.id);
      
      // Generate a token (this would normally be done by authenticator app)
      const token = TwoFactorAuthService.generateToken(enableResult.secret!);
      
      const verifyResult = await TwoFactorAuthService.verifyToken(mockUser.id, token);
      expect(verifyResult.success).toBe(true);
    });

    it('should verify backup code', async () => {
      const enableResult = await TwoFactorAuthService.enableTwoFactor(mockUser.id);
      const backupCode = enableResult.backupCodes![0];
      
      const verifyResult = await TwoFactorAuthService.verifyBackupCode(mockUser.id, backupCode);
      expect(verifyResult.success).toBe(true);
      
      // Backup code should be consumed
      const secondVerify = await TwoFactorAuthService.verifyBackupCode(mockUser.id, backupCode);
      expect(secondVerify.success).toBe(false);
    });
  });

  describe('Session Management', () => {
    it('should create and validate session', async () => {
      const sessionData = {
        userId: mockUser.id,
        deviceId: 'test-device-123',
        ipAddress: mockRequest.ip,
        userAgent: mockRequest.headers['user-agent']
      };

      const session = await SessionManager.createSession(sessionData);
      expect(session.sessionToken).toBeDefined();
      expect(session.isActive).toBe(true);

      // Validate session
      const isValid = await SessionManager.validateSession(session.sessionToken);
      expect(isValid).toBe(true);
    });

    it('should detect session anomalies', async () => {
      const sessionData = {
        userId: mockUser.id,
        deviceId: 'test-device-123',
        ipAddress: mockRequest.ip,
        userAgent: mockRequest.headers['user-agent']
      };

      await SessionManager.createSession(sessionData);

      // Try to create session from different IP (anomaly)
      const anomalyData = {
        ...sessionData,
        ipAddress: '10.0.0.1'
      };

      const anomalyResult = await SessionManager.detectAnomalies(anomalyData);
      expect(anomalyResult.hasAnomalies).toBe(true);
      expect(anomalyResult.anomalies).toContain('ip_change');
    });

    it('should enforce session limits', async () => {
      const sessionData = {
        userId: mockUser.id,
        deviceId: 'test-device-123',
        ipAddress: mockRequest.ip,
        userAgent: mockRequest.headers['user-agent']
      };

      // Create maximum allowed sessions (5)
      const sessions = [];
      for (let i = 0; i < 5; i++) {
        const session = await SessionManager.createSession({
          ...sessionData,
          deviceId: `device-${i}`
        });
        sessions.push(session);
      }

      // Try to create 6th session - should fail or invalidate oldest
      const extraSession = await SessionManager.createSession({
        ...sessionData,
        deviceId: 'device-extra'
      });

      const activeSessions = await SessionManager.getActiveSessions(mockUser.id);
      expect(activeSessions.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Chat Encryption', () => {
    it('should generate encryption keys for user', async () => {
      const keys = await ChatEncryptionService.generateUserKeys(mockUser.id);
      
      expect(keys.success).toBe(true);
      expect(keys.publicKey).toBeDefined();
      expect(keys.keyFingerprint).toBeDefined();

      // Verify keys are stored in database
      const userKey = await prisma.userEncryptionKey.findUnique({
        where: { userId: mockUser.id }
      });
      expect(userKey).toBeTruthy();
    });

    it('should encrypt and decrypt messages', async () => {
      const senderId = mockUser.id;
      const receiverId = 'receiver-123';
      
      // Generate keys for both users
      await ChatEncryptionService.generateUserKeys(senderId);
      await ChatEncryptionService.generateUserKeys(receiverId);

      const message = 'This is a secret message';
      
      // Encrypt message
      const encrypted = await ChatEncryptionService.encryptMessage(
        senderId,
        receiverId,
        message
      );
      expect(encrypted.success).toBe(true);
      expect(encrypted.encryptedData).toBeDefined();

      // Decrypt message
      const decrypted = await ChatEncryptionService.decryptMessage(
        receiverId,
        encrypted.encryptedData!,
        encrypted.keyFingerprint!
      );
      expect(decrypted.success).toBe(true);
      expect(decrypted.message).toBe(message);
    });
  });

  describe('Audit Logging', () => {
    it('should log security events', async () => {
      await AuditLogger.logEvent({
        userId: mockUser.id,
        action: 'LOGIN_SUCCESS',
        resource: 'authentication',
        ipAddress: mockRequest.ip,
        userAgent: mockRequest.headers['user-agent'],
        severity: 'LOW'
      });

      const logs = await prisma.auditLog.findMany({
        where: { userId: mockUser.id }
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('LOGIN_SUCCESS');
    });

    it('should detect suspicious patterns', async () => {
      // Create multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        await AuditLogger.logEvent({
          userId: mockUser.id,
          action: 'LOGIN_FAILURE',
          resource: 'authentication',
          ipAddress: mockRequest.ip,
          userAgent: mockRequest.headers['user-agent'],
          severity: 'MEDIUM'
        });
      }

      const suspicious = await AuditLogger.detectSuspiciousActivity(mockUser.id);
      expect(suspicious.isSuspicious).toBe(true);
      expect(suspicious.patterns).toContain('multiple_failed_logins');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const endpoint = '/api/auth/login';
      
      // Make requests up to the limit
      for (let i = 0; i < 5; i++) {
        const result = await RateLimiter.checkRateLimit(mockRequest.ip, endpoint);
        expect(result.allowed).toBe(true);
      }

      // Next request should be blocked
      const blockedResult = await RateLimiter.checkRateLimit(mockRequest.ip, endpoint);
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.reason).toBe('rate_limit_exceeded');
    });

    it('should calculate fraud risk score', async () => {
      const riskData = {
        userId: mockUser.id,
        ipAddress: mockRequest.ip,
        action: 'payment',
        amount: 1000000, // High amount
        userAgent: mockRequest.headers['user-agent']
      };

      const riskScore = await RateLimiter.calculateFraudRisk(riskData);
      expect(riskScore.score).toBeGreaterThan(0);
      expect(riskScore.score).toBeLessThanOrEqual(100);
      expect(riskScore.factors).toBeDefined();
    });
  });

  describe('Abuse Prevention', () => {
    it('should create abuse report', async () => {
      const reportData = {
        reporterId: mockUser.id,
        reportedId: 'reported-user-123',
        category: 'SPAM' as const,
        description: 'User is sending spam messages'
      };

      const report = await AbusePreventionService.createReport(reportData);
      expect(report.success).toBe(true);
      expect(report.reportId).toBeDefined();

      // Verify report is stored
      const storedReport = await prisma.abuseReport.findUnique({
        where: { id: report.reportId }
      });
      expect(storedReport).toBeTruthy();
      expect(storedReport?.category).toBe('SPAM');
    });

    it('should calculate user trust score', async () => {
      const trustScore = await AbusePreventionService.calculateTrustScore(mockUser.id);
      
      expect(trustScore.overallScore).toBeGreaterThanOrEqual(0);
      expect(trustScore.overallScore).toBeLessThanOrEqual(100);
      expect(trustScore.factors).toBeDefined();
    });

    it('should moderate content automatically', async () => {
      const spamContent = 'BUY NOW!!! CLICK HERE!!! FREE MONEY!!!';
      
      const moderation = await AbusePreventionService.moderateContent(spamContent);
      expect(moderation.isAppropriate).toBe(false);
      expect(moderation.flags).toContain('spam');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete security flow', async () => {
      // 1. Enable 2FA
      const twoFactor = await TwoFactorAuthService.enableTwoFactor(mockUser.id);
      expect(twoFactor.success).toBe(true);

      // 2. Create secure session
      const session = await SessionManager.createSession({
        userId: mockUser.id,
        deviceId: 'integration-test-device',
        ipAddress: mockRequest.ip,
        userAgent: mockRequest.headers['user-agent']
      });
      expect(session.sessionToken).toBeDefined();

      // 3. Generate encryption keys
      const keys = await ChatEncryptionService.generateUserKeys(mockUser.id);
      expect(keys.success).toBe(true);

      // 4. Log security event
      await AuditLogger.logEvent({
        userId: mockUser.id,
        action: 'SECURITY_SETUP_COMPLETE',
        resource: 'user_account',
        ipAddress: mockRequest.ip,
        userAgent: mockRequest.headers['user-agent'],
        severity: 'LOW'
      });

      // 5. Verify all components are working
      const auditLogs = await prisma.auditLog.findMany({
        where: { userId: mockUser.id }
      });
      expect(auditLogs.length).toBeGreaterThan(0);

      const userSessions = await prisma.userSession.findMany({
        where: { userId: mockUser.id }
      });
      expect(userSessions.length).toBe(1);

      const encryptionKeys = await prisma.userEncryptionKey.findMany({
        where: { userId: mockUser.id }
      });
      expect(encryptionKeys.length).toBe(1);
    });
  });
});
