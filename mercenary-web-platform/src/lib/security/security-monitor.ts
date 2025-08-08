/**
 * Security Monitoring and Alerting System
 * Real-time security monitoring with automated alerts
 */

import { prisma } from '../prisma'
import { AuditLogger } from './audit-logger'

import type { PrismaClient } from '@prisma/client'

// Use PrismaClient directly for better compatibility
const extendedPrisma = prisma;

interface SecurityMetrics {
  failedLogins: number;
  suspiciousActivities: number;
  fraudAttempts: number;
  abuseReports: number;
  activeThreats: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface AlertConfig {
  type: 'email' | 'slack' | 'discord' | 'webhook';
  endpoint: string;
  threshold: number;
  enabled: boolean;
}

export class SecurityMonitor {
  private static alertConfigs: AlertConfig[] = [
    {
      type: 'email',
      endpoint: process.env.SECURITY_ALERT_EMAILS || '',
      threshold: 5,
      enabled: true
    },
    {
      type: 'slack',
      endpoint: process.env.SLACK_WEBHOOK_URL || '',
      threshold: 3,
      enabled: !!process.env.SLACK_WEBHOOK_URL
    }
  ];

  /**
   * Get current security metrics
   */
  static async getSecurityMetrics(): Promise<SecurityMetrics> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    try {
      // Failed logins in last hour
      const failedLogins = await extendedPrisma.auditLog.count({
        where: {
          action: 'LOGIN_FAILURE',
          createdAt: { gte: oneHourAgo }
        }
      });

      // Suspicious activities
      const suspiciousActivities = await extendedPrisma.securityLog.count({
        where: {
          severity: { in: ['HIGH', 'CRITICAL'] },
          createdAt: { gte: oneHourAgo },
          resolved: false
        }
      });

      // Fraud attempts
      const fraudAttempts = await extendedPrisma.fraudDetection.count({
        where: {
          riskScore: { gte: 70 },
          createdAt: { gte: oneHourAgo }
        }
      });

      // Abuse reports
      const abuseReports = await extendedPrisma.abuseReport.count({
        where: {
          status: 'PENDING',
          priority: { in: ['HIGH', 'URGENT'] },
          createdAt: { gte: oneHourAgo }
        }
      });

      // Active security alerts
      const activeThreats = await extendedPrisma.securityAlert.count({
        where: {
          isResolved: false,
          severity: { in: ['HIGH', 'CRITICAL'] }
        }
      });

      // Determine system health
      let systemHealth: SecurityMetrics['systemHealth'] = 'healthy';
      if (failedLogins > 50 || suspiciousActivities > 10 || activeThreats > 5) {
        systemHealth = 'critical';
      } else if (failedLogins > 20 || suspiciousActivities > 5 || fraudAttempts > 10) {
        systemHealth = 'warning';
      }

      return {
        failedLogins,
        suspiciousActivities,
        fraudAttempts,
        abuseReports,
        activeThreats,
        systemHealth
      };
    } catch (error) {
      console.error('Error getting security metrics:', error);
      return {
        failedLogins: 0,
        suspiciousActivities: 0,
        fraudAttempts: 0,
        abuseReports: 0,
        activeThreats: 0,
        systemHealth: 'critical'
      };
    }
  }

  /**
   * Check for security threats and send alerts
   */
  static async monitorSecurityThreats(): Promise<void> {
    try {
      const metrics = await this.getSecurityMetrics();
      
      // Check for critical threats
      if (metrics.systemHealth === 'critical') {
        await this.sendCriticalAlert(metrics);
      }

      // Check specific threat patterns
      await this.checkBruteForceAttacks();
      await this.checkSuspiciousPatterns();
      await this.checkFraudPatterns();
      await this.checkAbuseEscalation();

      // Log monitoring activity
      await AuditLogger.logSecurityEvent(
        'system',
        'SECURITY_MONITOR_SCAN',
        'security_system',
        'scan',
        'system',
        'SecurityMonitor',
        metrics as Record<string, unknown>
      );

    } catch (error) {
      console.error('Security monitoring error:', error);
      await this.sendSystemAlert('Security monitoring system error', error);
    }
  }

  /**
   * Check for brute force attacks
   */
  private static async checkBruteForceAttacks(): Promise<void> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Check for multiple failed logins from same IP
    const failedAttempts = await extendedPrisma.auditLog.groupBy({
      by: ['ipAddress'],
      where: {
        action: 'LOGIN_FAILURE',
        createdAt: { gte: fiveMinutesAgo }
      },
      _count: {
        id: true
      },
      having: {
        id: {
          _count: {
            gte: 5
          }
        }
      }
    });

    for (const attempt of failedAttempts) {
      await this.createSecurityAlert({
        alertType: 'BRUTE_FORCE',
        title: 'Brute Force Attack Detected',
        description: `Multiple failed login attempts from IP: ${attempt.ipAddress}`,
        severity: 'HIGH',
        metadata: { ipAddress: attempt.ipAddress, attempts: attempt._count.id }
      });
    }
  }

  /**
   * Check for suspicious activity patterns
   */
  private static async checkSuspiciousPatterns(): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Check for unusual login locations
    const suspiciousLogins = await extendedPrisma.userSession.findMany({
      where: {
        createdAt: { gte: oneHourAgo },
        location: { not: null }
      },
      include: {
        user: true
      }
    });

    // Group by user and check for location anomalies
    const userLocations = new Map<string, string[]>();
    
    for (const session of suspiciousLogins) {
      if (!userLocations.has(session.userId)) {
        userLocations.set(session.userId, []);
      }
      if (session.location) {
        userLocations.get(session.userId)!.push(session.location);
      }
    }

    // Alert on multiple different locations for same user
    for (const [userId, locations] of Array.from(userLocations.entries())) {
      const uniqueLocations = Array.from(new Set(locations));
      if (uniqueLocations.length > 2) {
        await this.createSecurityAlert({
          userId,
          alertType: 'UNUSUAL_ACTIVITY',
          title: 'Unusual Login Locations',
          description: `User logged in from ${uniqueLocations.length} different locations`,
          severity: 'MEDIUM',
          metadata: { locations: uniqueLocations }
        });
      }
    }
  }

  /**
   * Check for fraud patterns
   */
  private static async checkFraudPatterns(): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Check for high-risk fraud scores
    const highRiskFraud = await extendedPrisma.fraudDetection.findMany({
      where: {
        riskScore: { gte: 80 },
        createdAt: { gte: oneHourAgo },
        reviewRequired: false
      }
    });

    for (const fraud of highRiskFraud) {
      await this.createSecurityAlert({
        userId: fraud.userId,
        alertType: 'ACCOUNT_COMPROMISE',
        title: 'High Fraud Risk Detected',
        description: `Fraud risk score: ${fraud.riskScore}% for action: ${fraud.action}`,
        severity: 'CRITICAL',
        metadata: { 
          riskScore: fraud.riskScore,
          action: fraud.action,
          riskFactors: fraud.riskFactors
        }
      });

      // Mark for manual review
      await extendedPrisma.fraudDetection.update({
        where: { id: fraud.id },
        data: { reviewRequired: true }
      });
    }
  }

  /**
   * Check for abuse report escalation
   */
  private static async checkAbuseEscalation(): Promise<void> {
    // Check for users with multiple reports
    const multipleReports = await extendedPrisma.abuseReport.groupBy({
      by: ['reportedId'],
      where: {
        status: 'PENDING',
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      },
      _count: {
        id: true
      },
      having: {
        id: {
          _count: {
            gte: 3
          }
        }
      }
    });

    for (const report of multipleReports) {
      await this.createSecurityAlert({
        userId: report.reportedId,
        alertType: 'UNUSUAL_ACTIVITY',
        title: 'Multiple Abuse Reports',
        description: `User has received ${report._count.id} abuse reports in 24 hours`,
        severity: 'HIGH',
        metadata: { reportCount: report._count.id }
      });
    }
  }

  /**
   * Create security alert
   */
  private static async createSecurityAlert(alertData: {
    userId?: string;
    alertType: 'BRUTE_FORCE' | 'SUSPICIOUS_LOGIN' | 'MULTIPLE_FAILED_ATTEMPTS' | 'UNUSUAL_ACTIVITY' | 'ACCOUNT_COMPROMISE' | 'DATA_BREACH';
    title: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    try {
      await extendedPrisma.securityAlert.create({
        data: {
          userId: alertData.userId,
          alertType: alertData.alertType,
          title: alertData.title,
          description: alertData.description,
          severity: alertData.severity
        }
      });

      // Send notifications based on severity
      if (alertData.severity === 'CRITICAL' || alertData.severity === 'HIGH') {
        await this.sendAlert(alertData.title, alertData.description, alertData.severity);
      }

      // Log the alert creation
      await AuditLogger.logSecurityEvent(
        alertData.userId || 'system',
        'SECURITY_ALERT_CREATED',
        'security_alert',
        'create',
        'system',
        'SecurityMonitor',
        alertData
      );

    } catch (error) {
      console.error('Error creating security alert:', error);
    }
  }

  /**
   * Send critical system alert
   */
  private static async sendCriticalAlert(metrics: SecurityMetrics): Promise<void> {
    const message = `🚨 CRITICAL SECURITY ALERT 🚨
    
System Health: ${metrics.systemHealth.toUpperCase()}
Failed Logins (1h): ${metrics.failedLogins}
Suspicious Activities: ${metrics.suspiciousActivities}
Fraud Attempts: ${metrics.fraudAttempts}
Active Threats: ${metrics.activeThreats}
Abuse Reports: ${metrics.abuseReports}

Immediate action required!`;

    await this.sendAlert('Critical Security Alert', message, 'CRITICAL');
  }

  /**
   * Send alert through configured channels
   */
  private static async sendAlert(title: string, message: string, severity: string): Promise<void> {
    for (const config of this.alertConfigs) {
      if (!config.enabled) continue;

      try {
        switch (config.type) {
          case 'email':
            await this.sendEmailAlert(title, message, config.endpoint);
            break;
          case 'slack':
            await this.sendSlackAlert(title, message, config.endpoint);
            break;
          case 'discord':
            await this.sendDiscordAlert(title, message, config.endpoint);
            break;
          case 'webhook':
            await this.sendWebhookAlert(title, message, config.endpoint);
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${config.type} alert:`, error);
      }
    }
  }

  /**
   * Send email alert
   */
  private static async sendEmailAlert(title: string, message: string, recipients: string): Promise<void> {
    // Email implementation would go here
    // For now, just log the alert
    console.log(`EMAIL ALERT: ${title}\n${message}\nTo: ${recipients}`);
  }

  /**
   * Send Slack alert
   */
  private static async sendSlackAlert(title: string, message: string, webhookUrl: string): Promise<void> {
    if (!webhookUrl) return;

    const payload = {
      text: `🔒 ${title}`,
      attachments: [{
        color: 'danger',
        text: message,
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.statusText}`);
    }
  }

  /**
   * Send Discord alert
   */
  private static async sendDiscordAlert(title: string, message: string, webhookUrl: string): Promise<void> {
    if (!webhookUrl) return;

    const payload = {
      embeds: [{
        title: `🔒 ${title}`,
        description: message,
        color: 15158332, // Red color
        timestamp: new Date().toISOString()
      }]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.statusText}`);
    }
  }

  /**
   * Send webhook alert
   */
  private static async sendWebhookAlert(title: string, message: string, webhookUrl: string): Promise<void> {
    const payload = {
      title,
      message,
      timestamp: new Date().toISOString(),
      severity: 'high'
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }
  }

  /**
   * Send system error alert
   */
  private static async sendSystemAlert(title: string, error: Error | unknown): Promise<void> {
    const message = `System Error: ${title}
    
Error: ${error instanceof Error ? error.message : String(error)}
Stack: ${error instanceof Error ? error.stack : 'No stack trace'}
Time: ${new Date().toISOString()}`;

    await this.sendAlert(title, message, 'CRITICAL');
  }

  /**
   * Start security monitoring (call this in your app startup)
   */
  static startMonitoring(): void {
    const interval = parseInt(process.env.SECURITY_SCAN_INTERVAL || '15') * 60 * 1000; // Default 15 minutes
    
    console.log(`🔒 Security monitoring started (interval: ${interval/1000/60} minutes)`);
    
    // Initial scan
    this.monitorSecurityThreats();
    
    // Schedule regular scans
    setInterval(() => {
      this.monitorSecurityThreats();
    }, interval);
  }

  /**
   * Get security dashboard data
   */
  static async getSecurityDashboard(): Promise<{
    metrics: SecurityMetrics;
    recentAlerts: Array<{
      id: string;
      alertType: string;
      title: string;
      description: string;
      severity: string;
      createdAt: Date;
      isResolved: boolean;
    }>;
    systemStatus: string;
  }> {
    const metrics = await this.getSecurityMetrics();
    
    const recentAlerts = await extendedPrisma.securityAlert.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const systemStatus = metrics.systemHealth === 'healthy' ? 'All systems operational' :
                        metrics.systemHealth === 'warning' ? 'Minor issues detected' :
                        'Critical issues require attention';

    return {
      metrics,
      recentAlerts,
      systemStatus
    };
  }
}
