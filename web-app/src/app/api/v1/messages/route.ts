import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// POST /api/v1/messages - Send new message
const sendMessageSchema = z.object({
  roomId: z.string(),
  message: z.string().min(1).max(1000),
  recipientId: z.string(),
  senderId: z.string(),
  senderName: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = sendMessageSchema.parse(body);

    // Verify sender is the authenticated user
    if (validatedData.senderId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        content: validatedData.message,
        senderId: validatedData.senderId,
        recipientId: validatedData.recipientId,
        roomId: validatedData.roomId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/v1/messages - Get user's conversations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Get conversations where user is sender or recipient
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { recipientId: session.user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Group by conversation (roomId or participants)
    const groupedConversations = conversations.reduce((acc: any, message) => {
      const otherUser = message.senderId === session.user.id ? message.recipient : message.sender;
      const conversationKey = [session.user.id, otherUser.id].sort().join('-');
      
      if (!acc[conversationKey]) {
        acc[conversationKey] = {
          id: conversationKey,
          otherUser,
          lastMessage: message,
          messages: []
        };
      }
      
      acc[conversationKey].messages.push(message);
      
      // Keep the most recent message as lastMessage
      if (new Date(message.createdAt) > new Date(acc[conversationKey].lastMessage.createdAt)) {
        acc[conversationKey].lastMessage = message;
      }
      
      return acc;
    }, {});

    return NextResponse.json({
      conversations: Object.values(groupedConversations),
      pagination: {
        page,
        limit,
        total: Object.keys(groupedConversations).length
      }
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
