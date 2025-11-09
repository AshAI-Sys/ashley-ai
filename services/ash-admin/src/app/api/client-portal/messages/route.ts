import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getClientFromRequest } from '@/lib/client-portal-auth';

export const dynamic = 'force-dynamic';


// Get client messages
export async function GET(request: NextRequest) {
  try {
    const session = await getClientFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');
    const threadId = searchParams.get('thread_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {
      workspace_id: session.workspace_id,
      client_id: session.client_id,
    };

    if (orderId) {
      where.order_id = orderId;
    }

    if (threadId) {
      where.thread_id = threadId;
    }

    // Fetch messages
    const [messages, totalCount] = await Promise.all([
      db.clientMessage.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.clientMessage.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      messages,
      pagination: {
        total: totalCount,
        limit,
        offset,
        has_more: offset + messages.length < totalCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// Send a new message
export async function POST(request: NextRequest) {
  try {
    const session = await getClientFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { order_id, thread_id, subject, message, attachments } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Create message
    const newMessage = await db.clientMessage.create({
      data: {
        workspace_id: session.workspace_id,
        client_id: session.client_id,
        order_id: order_id || null,
        thread_id: thread_id || null,
        sender_type: 'CLIENT',
        sender_name: session.name,
        sender_email: session.email,
        subject: subject || null,
        message,
        attachments: attachments ? JSON.stringify(attachments) : null,
        is_read: true, // Client's own message is read
        status: 'OPEN',
      },
    });

    // Log activity
    await db.clientActivity.create({
      data: {
        workspace_id: session.workspace_id,
        client_id: session.client_id,
        activity_type: 'MESSAGE_SENT',
        resource_type: 'MESSAGE',
        resource_id: newMessage.id,
        description: `Client sent a message: "${subject || message.substring(0, 50)}..."`,
      },
    });

    // TODO: Send notification to staff/admin

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// Mark message as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getClientFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { message_id, is_read } = await request.json();

    if (!message_id) {
      return NextResponse.json(
        { success: false, error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Update message
    const updated = await db.clientMessage.updateMany({
      where: {
        id: message_id,
        workspace_id: session.workspace_id,
        client_id: session.client_id,
      },
      data: {
        is_read: is_read !== undefined ? is_read : true,
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update message' },
      { status: 500 }
    );
  }
}
