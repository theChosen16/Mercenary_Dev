import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { SecurityHeadersService } from "./lib/security/security-headers"
import { RateLimiter } from "./lib/security/rate-limiter"
import { SessionManager } from "./lib/security/session-manager"
import { AuditLogger } from "./lib/security/audit-logger"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || ''
  
  // Apply security headers first
  let response = NextResponse.next()
  
  try {
    // 1. Check if IP is blocked
    if (await RateLimiter.isIPBlocked(ipAddress)) {
      return new NextResponse('Access Denied', { status: 403 })
    }
    
    // 2. Perform basic security checks
    const securityCheck = await performSecurityChecks(request)
    if (!securityCheck.passed) {
      return new NextResponse(securityCheck.message, { 
        status: securityCheck.statusCode 
      })
    }
    
    // 3. Rate limiting for API routes
    if (pathname.startsWith('/api/')) {
      const rateLimitResult = await RateLimiter.checkRateLimit(
        pathname,
        ipAddress,
        ipAddress,
        userAgent
      )
      
      if (!rateLimitResult.allowed) {
        response = new NextResponse('Rate Limit Exceeded', { status: 429 })
        response.headers.set('Retry-After', rateLimitResult.retryAfter?.toString() || '60')
        response.headers.set('X-RateLimit-Remaining', '0')
        response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toISOString())
        return SecurityHeadersService.applySecurityHeaders(request, response)
      }
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toISOString())
    }
    
    // 4. Get the token from the request
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    // 5. Session validation for authenticated users
    if (token?.sessionId) {
      const sessionInfo = await SessionManager.validateSession(
        token.sessionId as string,
        ipAddress,
        userAgent
      )
      
      if (!sessionInfo) {
        // Invalid session, redirect to login
        await AuditLogger.logSecurityEvent(
          token.sub || 'unknown',
          'INVALID_SESSION',
          'authentication',
          'session_validation',
          ipAddress,
          userAgent
        )
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
    
    // 6. Public routes that don't require authentication
    const publicRoutes = ["/", "/login", "/register", "/auth/error", "/csp-violation"]
    const isPublicRoute = publicRoutes.includes(pathname)
    
    // 7. Redirect authenticated users away from auth pages
    if (token && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    
    // 8. Check if user is trying to access protected route without authentication
    if (!isPublicRoute && !token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    
    // 9. Check role-based access for admin routes
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      await AuditLogger.logSecurityEvent(
        token?.sub || 'unknown',
        'UNAUTHORIZED_ADMIN_ACCESS',
        'authorization',
        'admin_access_denied',
        ipAddress,
        userAgent
      )
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    
    // 10. Fraud detection for sensitive operations
    if (token?.sub && isSensitiveOperation(pathname, request.method)) {
      const fraudResult = await RateLimiter.detectFraud(
        token.sub,
        `${request.method}_${pathname}`,
        ipAddress,
        userAgent
      )
      
      if (fraudResult.action === 'BLOCK') {
        return new NextResponse('Access Denied: Suspicious Activity', { status: 403 })
      } else if (fraudResult.action === 'CHALLENGE') {
        // In a real implementation, redirect to additional verification
        response.headers.set('X-Requires-Verification', 'true')
      }
    }
    
    // 11. Log successful access for audit trail
    if (token?.sub && !isPublicRoute) {
      await AuditLogger.logSecurityEvent(
        token.sub,
        'PAGE_ACCESS',
        'navigation',
        'page_view',
        ipAddress,
        userAgent,
        { pathname }
      )
    }
    
    // 12. Apply security headers to response
    return SecurityHeadersService.applySecurityHeaders(request, response)
    
  } catch (error) {
    console.error('Middleware error:', error)
    // Fail securely - apply basic security headers
    return SecurityHeadersService.applySecurityHeaders(request, response)
  }
}

// Helper function to perform basic security checks
async function performSecurityChecks(request: NextRequest): Promise<{
  passed: boolean
  message?: string
  statusCode?: number
}> {
  const userAgent = request.headers.get('user-agent') || ''
  const origin = request.headers.get('origin')
  
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

// Helper function to identify sensitive operations
function isSensitiveOperation(pathname: string, method: string): boolean {
  const sensitivePatterns = [
    /\/api\/payments/,
    /\/api\/subscription/,
    /\/api\/admin/,
    /\/api\/user\/delete/,
    /\/api\/projects\/delete/
  ]
  
  return method !== 'GET' && sensitivePatterns.some(pattern => pattern.test(pathname))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
