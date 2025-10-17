import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database';

const prisma = db

// GET /api/ai-chat/conversations - Get all conversations for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspace_id')
    const userId = searchParams.get('user_id')
    const includeArchived = searchParams.get('include_archived') === 'true'

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspace_id is required' }, { status: 400 })
    }

    const conversations = await prisma.aIChatConversation.findMany({
      where: {
        workspace_id: workspaceId,
        ...(userId && { user_id: userId }),
        ...(includeArchived ? {} : { is_archived: false }),
      },
      orderBy: {
        last_message_at: 'desc',
      },
      include: {
        messages: {
          take: 1,
          orderBy: {
            created_at: 'desc',
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

// POST /api/ai-chat/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspace_id, user_id, title, context_type, context_id } = body

    if (!workspace_id) {
      return NextResponse.json({ error: 'workspace_id is required' }, { status: 400 })
    }

    const conversation = await prisma.aIChatConversation.create({
      data: {
        workspace_id,
        user_id: user_id || null,
        title: title || 'New Conversation',
        context_type: context_type || 'GENERAL',
        context_id: context_id || null,
      },
    })

    return NextResponse.json({ conversation }, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
