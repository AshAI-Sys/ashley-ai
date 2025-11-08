import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getClientFromRequest } from '@/lib/client-portal-auth';

// Get client dashboard overview data
export async function GET(request: NextRequest) {
  try {
    const session = await getClientFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch client data
    const client = await db.client.findUnique({
      where: { id: session.client_id },
      include: {
        workspace: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Fetch orders summary
    const [
      totalOrders,
      activeOrders,
      completedOrders,
      recentOrders,
    ] = await Promise.all([
      db.order.count({
        where: {
          workspace_id: session.workspace_id,
          client_id: session.client_id,
        },
      }),
      db.order.count({
        where: {
          workspace_id: session.workspace_id,
          client_id: session.client_id,
          status: {
            notIn: ['COMPLETED', 'CANCELLED', 'DELIVERED'],
          },
        },
      }),
      db.order.count({
        where: {
          workspace_id: session.workspace_id,
          client_id: session.client_id,
          status: 'COMPLETED',
        },
      }),
      db.order.findMany({
        where: {
          workspace_id: session.workspace_id,
          client_id: session.client_id,
        },
        orderBy: { created_at: 'desc' },
        take: 5,
        select: {
          id: true,
          order_number: true,
          status: true,
          total_amount: true,
          created_at: true,
          delivery_date: true,
        },
      }),
    ]);

    // Fetch unread notifications count
    const unreadNotifications = await db.clientNotification.count({
      where: {
        workspace_id: session.workspace_id,
        client_id: session.client_id,
        is_read: false,
      },
    });

    // Fetch unread messages count
    const unreadMessages = await db.clientMessage.count({
      where: {
        workspace_id: session.workspace_id,
        client_id: session.client_id,
        is_read: false,
        sender_type: 'STAFF', // Only count messages from staff
      },
    });

    // Fetch pending invoices
    const pendingInvoices = await db.invoice.count({
      where: {
        workspace_id: session.workspace_id,
        client_id: session.client_id,
        status: 'PENDING',
      },
    });

    // Fetch total outstanding balance
    const outstandingInvoices = await db.invoice.findMany({
      where: {
        workspace_id: session.workspace_id,
        client_id: session.client_id,
        status: {
          in: ['PENDING', 'OVERDUE'],
        },
      },
      select: {
        total_amount: true,
        paid_amount: true,
      },
    });

    const outstandingBalance = outstandingInvoices.reduce(
      (sum, inv) => sum + (inv.total_amount - inv.paid_amount),
      0
    );

    // Fetch recent notifications
    const recentNotifications = await db.clientNotification.findMany({
      where: {
        workspace_id: session.workspace_id,
        client_id: session.client_id,
      },
      orderBy: { created_at: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      dashboard: {
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          company: client.company,
          phone: client.phone,
        },
        stats: {
          total_orders: totalOrders,
          active_orders: activeOrders,
          completed_orders: completedOrders,
          unread_notifications: unreadNotifications,
          unread_messages: unreadMessages,
          pending_invoices: pendingInvoices,
          outstanding_balance: outstandingBalance,
        },
        recent_orders: recentOrders,
        recent_notifications: recentNotifications,
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
