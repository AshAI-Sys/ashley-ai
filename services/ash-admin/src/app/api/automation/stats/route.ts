import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../packages/database/node_modules/.prisma/client';

const prisma = new PrismaClient();

// GET /api/automation/stats - Get automation dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id') || 'workspace_1';
    const timeRange = searchParams.get('time_range') || '7d'; // 24h, 7d, 30d

    const timeFilter = getTimeFilter(timeRange);

    // Get automation rules stats
    const rulesStats = await getRulesStats(workspaceId, timeFilter);

    // Get notifications stats
    const notificationsStats = await getNotificationsStats(workspaceId, timeFilter);

    // Get alerts stats
    const alertsStats = await getAlertsStats(workspaceId, timeFilter);

    // Get integrations stats
    const integrationsStats = await getIntegrationsStats(workspaceId, timeFilter);

    // Get execution performance
    const executionStats = await getExecutionStats(workspaceId, timeFilter);

    // Get recent activity
    const recentActivity = await getRecentActivity(workspaceId, 10);

    return NextResponse.json({
      success: true,
      data: {
        time_range: timeRange,
        summary: {
          automation_rules: rulesStats.summary,
          notifications: notificationsStats.summary,
          alerts: alertsStats.summary,
          integrations: integrationsStats.summary,
          executions: executionStats.summary
        },
        charts: {
          rule_executions: executionStats.chart,
          notifications_by_channel: notificationsStats.by_channel,
          alerts_by_severity: alertsStats.by_severity,
          integration_sync_status: integrationsStats.sync_status
        },
        recent_activity: recentActivity,
        generated_at: new Date()
      }
    });

  } catch (error) {
    console.error('Error fetching automation stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch automation statistics' },
      { status: 500 }
    );
  }
}

// Helper functions
function getTimeFilter(timeRange: string) {
  const now = new Date();
  switch (timeRange) {
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

async function getRulesStats(workspaceId: string, timeFilter: Date) {
  const [total, active, recentExecutions] = await Promise.all([
    prisma.automationRule.count({ where: { workspace_id: workspaceId } }),
    prisma.automationRule.count({
      where: { workspace_id: workspaceId, is_active: true }
    }),
    prisma.automationExecution.count({
      where: {
        workspace_id: workspaceId,
        started_at: { gte: timeFilter }
      }
    })
  ]);

  return {
    summary: {
      total,
      active,
      inactive: total - active,
      recent_executions: recentExecutions
    }
  };
}

async function getNotificationsStats(workspaceId: string, timeFilter: Date) {
  const [total, pending, sent, failed, byChannel] = await Promise.all([
    prisma.notification.count({
      where: { workspace_id: workspaceId, created_at: { gte: timeFilter } }
    }),
    prisma.notification.count({
      where: {
        workspace_id: workspaceId,
        status: 'PENDING',
        created_at: { gte: timeFilter }
      }
    }),
    prisma.notification.count({
      where: {
        workspace_id: workspaceId,
        status: 'SENT',
        created_at: { gte: timeFilter }
      }
    }),
    prisma.notification.count({
      where: {
        workspace_id: workspaceId,
        status: 'FAILED',
        created_at: { gte: timeFilter }
      }
    }),
    prisma.notification.groupBy({
      by: ['channel'],
      where: { workspace_id: workspaceId, created_at: { gte: timeFilter } },
      _count: { id: true }
    })
  ]);

  return {
    summary: {
      total,
      pending,
      sent,
      failed,
      success_rate: total > 0 ? Math.round((sent / total) * 100) : 0
    },
    by_channel: byChannel.map(group => ({
      channel: group.channel,
      count: group._count.id
    }))
  };
}

async function getAlertsStats(workspaceId: string, timeFilter: Date) {
  const [total, unresolved, bySeverity] = await Promise.all([
    prisma.alert.count({
      where: { workspace_id: workspaceId, created_at: { gte: timeFilter } }
    }),
    prisma.alert.count({
      where: {
        workspace_id: workspaceId,
        is_resolved: false,
        created_at: { gte: timeFilter }
      }
    }),
    prisma.alert.groupBy({
      by: ['severity'],
      where: { workspace_id: workspaceId, created_at: { gte: timeFilter } },
      _count: { id: true }
    })
  ]);

  return {
    summary: {
      total,
      resolved: total - unresolved,
      unresolved,
      resolution_rate: total > 0 ? Math.round(((total - unresolved) / total) * 100) : 0
    },
    by_severity: bySeverity.map(group => ({
      severity: group.severity,
      count: group._count.id
    }))
  };
}

async function getIntegrationsStats(workspaceId: string, timeFilter: Date) {
  const [total, connected, syncLogs] = await Promise.all([
    prisma.integration.count({ where: { workspace_id: workspaceId } }),
    prisma.integration.count({
      where: { workspace_id: workspaceId, is_connected: true }
    }),
    prisma.integrationSyncLog.groupBy({
      by: ['status'],
      where: { workspace_id: workspaceId, started_at: { gte: timeFilter } },
      _count: { id: true }
    })
  ]);

  return {
    summary: {
      total,
      connected,
      disconnected: total - connected,
      connection_rate: total > 0 ? Math.round((connected / total) * 100) : 0
    },
    sync_status: syncLogs.map(group => ({
      status: group.status,
      count: group._count.id
    }))
  };
}

async function getExecutionStats(workspaceId: string, timeFilter: Date) {
  const [total, successful, failed, chartData] = await Promise.all([
    prisma.automationExecution.count({
      where: { workspace_id: workspaceId, started_at: { gte: timeFilter } }
    }),
    prisma.automationExecution.count({
      where: {
        workspace_id: workspaceId,
        execution_status: 'SUCCESS',
        started_at: { gte: timeFilter }
      }
    }),
    prisma.automationExecution.count({
      where: {
        workspace_id: workspaceId,
        execution_status: 'FAILED',
        started_at: { gte: timeFilter }
      }
    }),
    getExecutionChartData(workspaceId, timeFilter)
  ]);

  return {
    summary: {
      total,
      successful,
      failed,
      success_rate: total > 0 ? Math.round((successful / total) * 100) : 0
    },
    chart: chartData
  };
}

async function getExecutionChartData(workspaceId: string, timeFilter: Date) {
  // Get hourly execution counts for the time range
  const executions = await prisma.automationExecution.findMany({
    where: {
      workspace_id: workspaceId,
      started_at: { gte: timeFilter }
    },
    select: {
      started_at: true,
      execution_status: true
    }
  });

  // Group by hour
  const hourlyData: Record<string, { successful: number; failed: number }> = {};

  executions.forEach(execution => {
    const hour = new Date(execution.started_at).toISOString().slice(0, 13) + ':00:00.000Z';
    if (!hourlyData[hour]) {
      hourlyData[hour] = { successful: 0, failed: 0 };
    }

    if (execution.execution_status === 'SUCCESS') {
      hourlyData[hour].successful++;
    } else if (execution.execution_status === 'FAILED') {
      hourlyData[hour].failed++;
    }
  });

  return Object.entries(hourlyData)
    .map(([hour, data]) => ({
      timestamp: hour,
      successful: data.successful,
      failed: data.failed,
      total: data.successful + data.failed
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

async function getRecentActivity(workspaceId: string, limit: number) {
  const [recentExecutions, recentAlerts, recentNotifications] = await Promise.all([
    prisma.automationExecution.findMany({
      where: { workspace_id: workspaceId },
      include: {
        rule: { select: { name: true } }
      },
      orderBy: { started_at: 'desc' },
      take: limit
    }),
    prisma.alert.findMany({
      where: { workspace_id: workspaceId },
      orderBy: { created_at: 'desc' },
      take: limit
    }),
    prisma.notification.findMany({
      where: { workspace_id: workspaceId },
      orderBy: { created_at: 'desc' },
      take: limit
    })
  ]);

  // Combine and sort all activities
  const activities = [
    ...recentExecutions.map(exec => ({
      type: 'EXECUTION',
      title: `Rule "${exec.rule.name}" executed`,
      status: exec.execution_status,
      timestamp: exec.started_at,
      details: { rule_id: exec.rule_id }
    })),
    ...recentAlerts.map(alert => ({
      type: 'ALERT',
      title: alert.title,
      status: alert.is_resolved ? 'RESOLVED' : alert.is_acknowledged ? 'ACKNOWLEDGED' : 'OPEN',
      timestamp: alert.created_at,
      details: { severity: alert.severity, alert_type: alert.alert_type }
    })),
    ...recentNotifications.map(notif => ({
      type: 'NOTIFICATION',
      title: notif.subject || 'Notification',
      status: notif.status,
      timestamp: notif.created_at,
      details: { channel: notif.channel, priority: notif.priority }
    }))
  ];

  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}