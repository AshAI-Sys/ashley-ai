/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';

// POST /api/analytics/vitals - Track web vitals and performance metrics
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const data = await request.json();
    const {
      metric_name,
      value,
      rating,
      page_url,
      user_agent,
      connection_type
    } = data;

    if (!metric_name || value === undefined) {
      return NextResponse.json(
        { error: "Metric name and value are required" },
        { status: 400 }
      );
    }

    // Store web vital metric (in production, this would save to database)
    const vitalRecord = {
      id: Math.random().toString(36).substring(7),
      workspace_id: user.workspaceId,
      user_id: user.id,
      metric_name,
      value,
      rating: rating || 'good',
      page_url: page_url || '/',
      user_agent: user_agent || '',
      connection_type: connection_type || 'unknown',
      timestamp: new Date().toISOString()
    };

    // Log to console for monitoring
    console.log('[Web Vitals]', {
      metric: metric_name,
      value: `${value}ms`,
      rating,
      page: page_url
    });

    return NextResponse.json({
      success: true,
      message: 'Web vital recorded',
      data: vitalRecord
    });
  } catch (error) {
    console.error("Error recording web vital:", error);
    return NextResponse.json(
      { error: "Failed to record web vital" },
      { status: 500 }
    );
  }
});

// GET /api/analytics/vitals - Retrieve web vitals statistics
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "/";
    const timeRange = searchParams.get("range") || "24h";

    // Mock aggregated web vitals data
    const vitals = {
      LCP: {
        name: 'Largest Contentful Paint',
        value: 1250,
        rating: 'good',
        unit: 'ms',
        threshold: { good: 2500, needs_improvement: 4000 }
      },
      FID: {
        name: 'First Input Delay',
        value: 45,
        rating: 'good',
        unit: 'ms',
        threshold: { good: 100, needs_improvement: 300 }
      },
      CLS: {
        name: 'Cumulative Layout Shift',
        value: 0.08,
        rating: 'good',
        unit: '',
        threshold: { good: 0.1, needs_improvement: 0.25 }
      },
      INP: {
        name: 'Interaction to Next Paint',
        value: 150,
        rating: 'good',
        unit: 'ms',
        threshold: { good: 200, needs_improvement: 500 }
      },
      TTFB: {
        name: 'Time to First Byte',
        value: 280,
        rating: 'good',
        unit: 'ms',
        threshold: { good: 800, needs_improvement: 1800 }
      },
      FCP: {
        name: 'First Contentful Paint',
        value: 920,
        rating: 'good',
        unit: 'ms',
        threshold: { good: 1800, needs_improvement: 3000 }
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        page,
        time_range: timeRange,
        vitals,
        overall_score: 92,
        total_samples: 1247,
        last_updated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error fetching web vitals:", error);
    return NextResponse.json(
      { error: "Failed to fetch web vitals" },
      { status: 500 }
    );
  }
});
