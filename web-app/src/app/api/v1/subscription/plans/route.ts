import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AdvancedGamificationService } from '@/lib/gamification-advanced'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const plans = AdvancedGamificationService.getSubscriptionPlans()
    const userLimits = await AdvancedGamificationService.getUserLimits(session.user.id)
    
    return NextResponse.json({
      plans,
      userLimits
    })
  } catch (error) {
    console.error('Error getting subscription plans:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
