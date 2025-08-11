import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// POST /api/v1/messages - Send new message
const sendMessageSchema = z
  .object({
    message: z.string().min(1).max(1000),
    receiverId: z.string().optional(),
    recipientId: z.string().optional(), // legacy field from frontend
    senderId: z.string(),
    projectId: z.string().optional(),
  })
  .refine(d => !!(d.receiverId ?? d.recipientId), {
    path: ['receiverId'],
    message: 'receiverId or recipientId is required',
  })
  .transform(d => ({
    message: d.message,
    receiverId: d.receiverId ?? (d.recipientId as string),
    senderId: d.senderId,
    projectId: d.projectId,
  }))

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = sendMessageSchema.parse(body)

    // Verify sender is the authenticated user
    if (validatedData.senderId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const message = await prisma.message.create({
      data: {
        content: validatedData.message,
        senderId: validatedData.senderId,
        receiverId: validatedData.receiverId,
        projectId: validatedData.projectId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/v1/messages - Get user's conversations
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Get conversations where user is sender or recipient
    const conversations = await prisma.message.findMany({
      where: {
        OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    // Group by participants (two-user conversation key)
    type Conversation = {
      id: string
      otherUser: { id: string; name: string | null; image: string | null }
      lastMessage: (typeof conversations)[number]
      messages: typeof conversations
    }
    const groupedConversations = conversations.reduce<
      Record<string, Conversation>
    >((acc, msg) => {
      const otherUser =
        msg.senderId === session.user.id ? msg.receiver : msg.sender
      const conversationKey = [session.user.id, otherUser.id].sort().join('-')

      if (!acc[conversationKey]) {
        acc[conversationKey] = {
          id: conversationKey,
          otherUser,
          lastMessage: msg,
          messages: [],
        }
      }

      acc[conversationKey].messages.push(msg)
      if (msg.createdAt > acc[conversationKey].lastMessage.createdAt) {
        acc[conversationKey].lastMessage = msg
      }

      return acc
    }, {})

    return NextResponse.json({
      conversations: Object.values(groupedConversations),
      pagination: {
        page,
        limit,
        total: Object.keys(groupedConversations).length,
      },
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
