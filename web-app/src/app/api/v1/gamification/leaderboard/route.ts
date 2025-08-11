import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { AdvancedGamificationService } from '@/lib/gamification-advanced'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type =
      (searchParams.get('type') as 'xp' | 'streak' | 'completed_jobs') || 'xp'
    const limit = parseInt(searchParams.get('limit') || '10')

    const leaderboard = await AdvancedGamificationService.getLeaderboard(
      type,
      limit
    )

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Error getting leaderboard:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
