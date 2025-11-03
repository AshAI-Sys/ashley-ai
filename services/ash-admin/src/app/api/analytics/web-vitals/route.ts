import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime
export const runtime = 'nodejs';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType?: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

/**
 * Web Vitals Analytics Endpoint
 * Receives and logs performance metrics from the client
 */
export async function POST(request: NextRequest) {
  try {
    const metric: WebVitalMetric = await request.json();

    // Log metric to console in production (you can send to a database or analytics service)
    console.log('[Web Vitals]', {
      name: metric.name,
      value: `${metric.value.toFixed(2)}ms`,
      rating: metric.rating,
      url: new URL(metric.url).pathname,
      timestamp: new Date(metric.timestamp).toISOString(),
    });

    // TODO: Store in database or send to analytics service (Vercel Analytics, Google Analytics, etc.)
    // Example:
    // await prisma.webVitalMetric.create({
    //   data: {
    //     name: metric.name,
    //     value: metric.value,
    //     rating: metric.rating,
    //     url: metric.url,
    //     user_agent: metric.userAgent,
    //     created_at: new Date(metric.timestamp),
    //   },
    // });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Web Vitals] Error logging metric:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
