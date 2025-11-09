import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getClientFromRequest } from '@/lib/client-portal-auth';

export const dynamic = 'force-dynamic';


// Get client notifications
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
    const isRead = searchParams.get('is_read');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {
      workspace_id: session.workspace_id,
      client_id: session.client_id,
    };

    if (isRead !== null) {
      where.is_read = isRead === 'true';
    }

    // Fetch notifications
    const [notifications, totalCount, unreadCount] = await Promise.all([
      db.clientNotification.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.clientNotification.count({ where }),
      db.clientNotification.count({
        where: {
          workspace_id: session.workspace_id,
          client_id: session.client_id,
          is_read: false,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      unread_count: unreadCount,
      pagination: {
        total: totalCount,
        limit,
        offset,
        has_more: offset + notifications.length < totalCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getClientFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { notification_id, mark_all_read } = await request.json();

    if (mark_all_read) {
      // Mark all notifications as read
      await db.clientNotification.updateMany({
        where: {
          workspace_id: session.workspace_id,
          client_id: session.client_id,
          is_read: false,
        },
        data: {
          is_read: true,
          read_at: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      });
    }

    if (!notification_id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Mark single notification as read
    const updated = await db.clientNotification.updateMany({
      where: {
        id: notification_id,
        workspace_id: session.workspace_id,
        client_id: session.client_id,
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}
