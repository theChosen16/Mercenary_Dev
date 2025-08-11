import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { NotificationService } from '@/lib/notifications'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notification = await NotificationService.markAsRead(
      params.id,
      session.user.id
    )

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
