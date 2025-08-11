import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { NotificationService } from '@/lib/notifications'

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await NotificationService.markAllAsRead(session.user.id)

    return NextResponse.json({
      message: 'All notifications marked as read',
      count: result.count,
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
