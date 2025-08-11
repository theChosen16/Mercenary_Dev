import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { GamificationService } from '@/lib/gamification'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await GamificationService.getUserStats(session.user.id)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
