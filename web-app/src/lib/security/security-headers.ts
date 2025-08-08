import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export interface SecurityConfig {
  csp: {
    enabled: boolean
    reportOnly: boolean
    directives: Record<string, string[]>
  }
  hsts: {
    enabled: boolean
    maxAge: number
    includeSubDomains: boolean
    preload: boolean
  }
  xss: {
    enabled: boolean
    mode: 'block' | 'sanitize'
  }
  frameOptions: {
    enabled: boolean
    policy: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM'
    allowFrom?: string
  }
  contentTypeOptions: boolean
  referrerPolicy: string
  permissionsPolicy: Record<string, string[]>
}

export class SecurityHeadersService {
  private static readonly DEFAULT_CONFIG: SecurityConfig = {
    csp: {
      enabled: true,
      reportOnly: false,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://js.stripe.com', 'https://sdk.mercadopago.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'https:', 'blob:'],
        'connect-src': ["'self'", 'https://api.stripe.com', 'https://api.mercadopago.com', 'wss:'],
        'frame-src': ["'self'", 'https://js.stripe.com', 'https://www.mercadopago.com'],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'upgrade-insecure-requests': []
      }
    },
    hsts: {
      enabled: true,
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    xss: {
      enabled: true,
      mode: 'block'
    },
    frameOptions: {
      enabled: true,
      policy: 'DENY'
    },
    contentTypeOptions: true,
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: {
      'camera': [],
      'microphone': [],
      'geolocation': ["'self'"],
      'payment': ["'self'", 'https://js.stripe.com', 'https://www.mercadopago.com'],
      'usb': [],
      'magnetometer': [],
      'gyroscope': [],
      'accelerometer': []
    }
  }
  
  /**
   * Apply security headers to response
   */
  static applySecurityHeaders(
    request: NextRequest,
    response: NextResponse,
    config: Partial<SecurityConfig> = {}
  ): NextResponse {
    const finalConfig = this.mergeConfig(this.DEFAULT_CONFIG, config)
    
    // Content Security Policy
    if (finalConfig.csp.enabled) {
      const cspHeader = finalConfig.csp.reportOnly 
        ? 'Content-Security-Policy-Report-Only'
        : 'Content-Security-Policy'
      
      const cspValue = this.buildCSPValue(finalConfig.csp.directives, request)
      response.headers.set(cspHeader, cspValue)
    }
    
    // HTTP Strict Transport Security
    if (finalConfig.hsts.enabled) {
      let hstsValue = `max-age=${finalConfig.hsts.maxAge}`
      if (finalConfig.hsts.includeSubDomains) {
        hstsValue += '; includeSubDomains'
      }
      if (finalConfig.hsts.preload) {
        hstsValue += '; preload'
      }
      response.headers.set('Strict-Transport-Security', hstsValue)
    }
    
    // X-XSS-Protection
    if (finalConfig.xss.enabled) {
      const xssValue = finalConfig.xss.mode === 'block' ? '1; mode=block' : '1'
      response.headers.set('X-XSS-Protection', xssValue)
    }
    
    // X-Frame-Options
    if (finalConfig.frameOptions.enabled) {
      let frameValue = finalConfig.frameOptions.policy
      if (finalConfig.frameOptions.policy === 'ALLOW-FROM' && finalConfig.frameOptions.allowFrom) {
        frameValue += ` ${finalConfig.frameOptions.allowFrom}`
      }
      response.headers.set('X-Frame-Options', frameValue)
    }
    
    // X-Content-Type-Options
    if (finalConfig.contentTypeOptions) {
      response.headers.set('X-Content-Type-Options', 'nosniff')
    }
    
    // Referrer-Policy
    response.headers.set('Referrer-Policy', finalConfig.referrerPolicy)
    
    // Permissions-Policy
    const permissionsValue = this.buildPermissionsPolicyValue(finalConfig.permissionsPolicy)
    if (permissionsValue) {
      response.headers.set('Permissions-Policy', permissionsValue)
    }
    
    // Additional security headers
    response.headers.set('X-DNS-Prefetch-Control', 'off')
    response.headers.set('X-Download-Options', 'noopen')
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
    
    // Remove server information
    response.headers.delete('Server')
    response.headers.delete('X-Powered-By')
    
    return response
  }
  
  /**
   * Generate nonce for inline scripts/styles
   */
  static generateNonce(): string {
    return crypto.randomBytes(16).toString('base64')
  }
  
  /**
   * Validate CSP violation reports
   */
  static async handleCSPViolation(request: NextRequest): Promise<NextResponse> {
    try {
      const violation = await request.json()
      
      // Log CSP violation
      console.warn('CSP Violation:', {
        documentUri: violation['document-uri'],
        violatedDirective: violation['violated-directive'],
        blockedUri: violation['blocked-uri'],
        sourceFile: violation['source-file'],
        lineNumber: violation['line-number'],
        columnNumber: violation['column-number'],
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      })
      
      // Store violation in database for analysis
      // await this.storeCSPViolation(violation, request)
      
      return new NextResponse('OK', { status: 200 })
    } catch (error) {
      console.error('Error handling CSP violation:', error)
      return new NextResponse('Bad Request', { status: 400 })
    }
  }
  
  /**
   * Security middleware for API routes
   */
  static securityMiddleware(
    handler: (req: NextRequest) => Promise<NextResponse>
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      // Check for security threats
      const securityCheck = await this.performSecurityChecks(request)
      
      if (!securityCheck.passed) {
        return new NextResponse(securityCheck.message, { 
          status: securityCheck.statusCode 
        })
      }
      
      // Execute the handler
      const response = await handler(request)
      
      // Apply security headers
      return this.applySecurityHeaders(request, response)
    }
  }
  
  /**
   * Perform basic security checks
   */
  private static async performSecurityChecks(request: NextRequest): Promise<{
    passed: boolean
    message?: string
    statusCode?: number
  }> {
    const userAgent = request.headers.get('user-agent') || ''
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    
    // Check for malicious user agents
    const maliciousPatterns = [
      /sqlmap/i,
      /nikto/i,
      /nessus/i,
      /burpsuite/i,
      /nmap/i,
      /masscan/i
    ]
    
    if (maliciousPatterns.some(pattern => pattern.test(userAgent))) {
      return {
        passed: false,
        message: 'Blocked: Malicious user agent detected',
        statusCode: 403
      }
    }
    
    // Check for suspicious headers
    const suspiciousHeaders = [
      'x-forwarded-host',
      'x-original-url',
      'x-rewrite-url'
    ]
    
    for (const header of suspiciousHeaders) {
      if (request.headers.has(header)) {
        const value = request.headers.get(header)
        if (value && this.containsSuspiciousContent(value)) {
          return {
            passed: false,
            message: 'Blocked: Suspicious header content',
            statusCode: 403
          }
        }
      }
    }
    
    // Validate origin for sensitive operations
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const allowedOrigins = [
        'https://mercenary-dev.vercel.app',
        'https://mercenary-job.netlify.app',
        'http://localhost:3000',
        'http://localhost:3001'
      ]
      
      if (origin && !allowedOrigins.includes(origin)) {
        return {
          passed: false,
          message: 'Blocked: Invalid origin',
          statusCode: 403
        }
      }
    }
    
    return { passed: true }
  }
  
  /**
   * Private helper methods
   */
  private static mergeConfig(
    defaultConfig: SecurityConfig,
    userConfig: Partial<SecurityConfig>
  ): SecurityConfig {
    return {
      ...defaultConfig,
      ...userConfig,
      csp: { ...defaultConfig.csp, ...userConfig.csp },
      hsts: { ...defaultConfig.hsts, ...userConfig.hsts },
      xss: { ...defaultConfig.xss, ...userConfig.xss },
      frameOptions: { ...defaultConfig.frameOptions, ...userConfig.frameOptions },
      permissionsPolicy: { ...defaultConfig.permissionsPolicy, ...userConfig.permissionsPolicy }
    }
  }
  
  private static buildCSPValue(
    directives: Record<string, string[]>,
    request: NextRequest
  ): string {
    const cspParts: string[] = []
    
    for (const [directive, sources] of Object.entries(directives)) {
      if (sources.length === 0) {
        cspParts.push(directive)
      } else {
        cspParts.push(`${directive} ${sources.join(' ')}`)
      }
    }
    
    return cspParts.join('; ')
  }
  
  private static buildPermissionsPolicyValue(
    policies: Record<string, string[]>
  ): string {
    const policyParts: string[] = []
    
    for (const [feature, allowlist] of Object.entries(policies)) {
      if (allowlist.length === 0) {
        policyParts.push(`${feature}=()`)
      } else {
        policyParts.push(`${feature}=(${allowlist.join(' ')})`)
      }
    }
    
    return policyParts.join(', ')
  }
  
  private static containsSuspiciousContent(value: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /eval\(/i,
      /expression\(/i,
      /url\(/i,
      /@import/i
    ]
    
    return suspiciousPatterns.some(pattern => pattern.test(value))
  }
}

/**
 * Middleware configuration for Next.js
 */
export const securityMiddlewareConfig = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

/**
 * Security headers for static files
 */
export const staticFileHeaders = {
  'Cache-Control': 'public, max-age=31536000, immutable',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}
