import { requireAuth } from "@/lib/auth-middleware";
import { NextRequest, NextResponse } from "next/server";

// GET /api/automation/stats - Get automation dashboard statistics (Demo Data)
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("time_range") || "7d"; // 24h, 7d, 30d

    // Return demo data for all buttons to work
    const demoStats = {
      time_range: timeRange,
      summary: {
        automation_rules: {
          total: 45,
          active: 38,
          inactive: 7,
          recent_executions: 324,
        },
        notifications: {
          total: 1287,
          pending: 23,
          sent: 1198,
          failed: 66,
          success_rate: 93,
        },
        alerts: {
          total: 89,
          resolved: 76,
          unresolved: 13,
          resolution_rate: 85,
        },
        integrations: {
          total: 12,
          connected: 10,
          disconnected: 2,
          connection_rate: 83,
        },
        executions: {
          total: 2156,
          successful: 2034,
          failed: 122,
          success_rate: 94,
        },
      },
      charts: {
        rule_executions: generateDemoChart(),
        notifications_by_channel: [
          { channel: "EMAIL", count: 650 },
          { channel: "SMS", count: 234 },
          { channel: "IN_APP", count: 325 },
          { channel: "SLACK", count: 78 },
        ],
        alerts_by_severity: [
          { severity: "LOW", count: 45 },
          { severity: "MEDIUM", count: 31 },
          { severity: "HIGH", count: 10 },
          { severity: "CRITICAL", count: 3 },
        ],
        integration_sync_status: [
          { status: "SUCCESS", count: 234 },
          { status: "FAILED", count: 12 },
          { status: "RUNNING", count: 3 },
        ],
      },
      recent_activity: [
        {
          type: "EXECUTION",
          title: 'Rule "Order Status Alert" executed',
          status: "SUCCESS",
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          details: { rule_id: "rule-1" },
        },
        {
          type: "ALERT",
          title: "High inventory levels detected",
          status: "OPEN",
          timestamp: new Date(Date.now() - 32 * 60 * 1000),
          details: { severity: "MEDIUM", alert_type: "INVENTORY" },
        },
        {
          type: "NOTIFICATION",
          title: "Daily production report sent",
          status: "SENT",
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          details: { channel: "EMAIL", priority: "NORMAL" },
        },
      ],
      generated_at: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: demoStats,
  } catch (error) {
    console.error("Error fetching automation stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch automation statistics" },
      { status: 500 }
    );
  }

// Helper function for demo chart data
function generateDemoChart() {
  const chartData = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    chartData.push({
      timestamp: timestamp.toISOString(),
      successful: Math.floor(Math.random() * 50) + 10,
      failed: Math.floor(Math.random() * 10),
      total: 0,
    });

  return chartData.map(item => ({
    ...item,
    total: item.successful + item.failed,
  }));
});
