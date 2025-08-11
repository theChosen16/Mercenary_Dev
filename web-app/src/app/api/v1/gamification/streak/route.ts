import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { AdvancedGamificationService } from '@/lib/gamification-advanced'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const streak = await AdvancedGamificationService.updateJobCompletionStreak(
      session.user.id
    )

    return NextResponse.json(streak)
  } catch (error) {
    console.error('Error getting streak:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Update streak when a job is completed
    const streak = await AdvancedGamificationService.updateJobCompletionStreak(
      session.user.id
    )

    return NextResponse.json({
      message: 'Racha actualizada',
      streak,
    })
  } catch (error) {
    console.error('Error updating streak:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
