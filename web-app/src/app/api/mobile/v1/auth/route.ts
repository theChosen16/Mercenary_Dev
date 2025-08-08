import { NextRequest, NextResponse } from 'next/server'
import { MobileAPIService } from '@/lib/mobile-api'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, password, deviceInfo, token } = body

    switch (action) {
      case 'login':
        return await handleMobileLogin(email, password, deviceInfo)
      
      case 'refresh':
        return await handleTokenRefresh(token)
      
      case 'logout':
        return await handleMobileLogout(token, deviceInfo)
      
      case 'validate':
        return await handleTokenValidation(token)
      
      default:
        return NextResponse.json(
          MobileAPIService.createResponse(false, undefined, 'Invalid action'),
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Mobile auth error:', error)
    return NextResponse.json(
      MobileAPIService.createResponse(false, undefined, 'Internal server error'),
      { status: 500 }
    )
  }
}

async function handleMobileLogin(email: string, password: string, deviceInfo: any) {
  try {
    if (!email || !password) {
      return NextResponse.json(
        MobileAPIService.createResponse(false, undefined, 'Email and password required'),
        { status: 400 }
      )
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    })

    if (!user) {
      return NextResponse.json(
        MobileAPIService.createResponse(false, undefined, 'Invalid credentials'),
        { status: 401 }
      )
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        MobileAPIService.createResponse(false, undefined, 'Invalid credentials'),
        { status: 401 }
      )
    }

    // Generar token JWT para móvil
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    )

    // Registrar dispositivo si se proporciona
    if (deviceInfo) {
      await MobileAPIService.registerDevice(user.id, {
        ...deviceInfo,
        lastActive: new Date()
      })
    }

    // Preparar datos del usuario (sin contraseña)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      MobileAPIService.createResponse(true, {
        user: userWithoutPassword,
        token,
        expiresIn: 30 * 24 * 60 * 60 * 1000 // 30 días en ms
      }, undefined, 'Login successful')
    )
  } catch (error) {
    console.error('Mobile login error:', error)
    return NextResponse.json(
      MobileAPIService.createResponse(false, undefined, 'Login failed'),
      { status: 500 }
    )
  }
}

async function handleTokenRefresh(token: string) {
  try {
    if (!token) {
      return NextResponse.json(
        MobileAPIService.createResponse(false, undefined, 'Token required'),
        { status: 400 }
      )
    }

    // Verificar token actual
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true }
    })

    if (!user) {
      return NextResponse.json(
        MobileAPIService.createResponse(false, undefined, 'User not found'),
        { status: 404 }
      )
    }

    // Generar nuevo token
    const newToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    )

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      MobileAPIService.createResponse(true, {
        user: userWithoutPassword,
        token: newToken,
        expiresIn: 30 * 24 * 60 * 60 * 1000
      }, undefined, 'Token refreshed successfully')
    )
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      MobileAPIService.createResponse(false, undefined, 'Invalid or expired token'),
      { status: 401 }
    )
  }
}

async function handleMobileLogout(token: string, deviceInfo: any) {
  try {
    if (token) {
      // Verificar token para obtener userId
      try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
        
        // Actualizar última actividad del dispositivo
        if (deviceInfo?.deviceId) {
          await prisma.device.updateMany({
            where: {
              userId: decoded.userId,
              deviceId: deviceInfo.deviceId
            },
            data: {
              lastActive: new Date()
            }
          })
        }
      } catch (error) {
        // Token inválido, pero permitir logout
        console.log('Invalid token during logout, proceeding anyway')
      }
    }

    return NextResponse.json(
      MobileAPIService.createResponse(true, undefined, undefined, 'Logout successful')
    )
  } catch (error) {
    console.error('Mobile logout error:', error)
    return NextResponse.json(
      MobileAPIService.createResponse(false, undefined, 'Logout failed'),
      { status: 500 }
    )
  }
}

async function handleTokenValidation(token: string) {
  try {
    if (!token) {
      return NextResponse.json(
        MobileAPIService.createResponse(false, undefined, 'Token required'),
        { status: 400 }
      )
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true,
        profile: true
      }
    })

    if (!user) {
      return NextResponse.json(
        MobileAPIService.createResponse(false, undefined, 'User not found'),
        { status: 404 }
      )
    }

    return NextResponse.json(
      MobileAPIService.createResponse(true, {
        valid: true,
        user,
        expiresAt: new Date(decoded.exp * 1000).toISOString()
      }, undefined, 'Token is valid')
    )
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      MobileAPIService.createResponse(false, {
        valid: false
      }, 'Invalid or expired token'),
      { status: 401 }
    )
  }
}
