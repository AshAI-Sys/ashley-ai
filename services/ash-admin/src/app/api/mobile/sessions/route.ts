import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { db } from '@/lib/database';

/**
 * Get mobile app sessions
 * GET /api/mobile/sessions
 *
 * Permissions: admin
 *
 * Query params:
 * - status: 'active' | 'expired' | 'revoked' (optional)
 * - user_id: string (optional)
 * - limit: number (optional, default: 50)
 *
 * Response:
 * - sessions: Array of mobile sessions with user info
 * - stats: Session statistics
 */

// Force dynamic route (don't pre-render during build)
export const dynamic = 'force-dynamic';

export const GET = requireRole('admin')(
  async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status') || undefined;
      const userId = searchParams.get('user_id') || undefined;
      const limit = parseInt(searchParams.get('limit') || '50');

      const workspace_id = user.workspaceId;

      // Build where clause
      const where: any = {
        workspace_id,
      };

      if (status) {
        where.status = status;
      }

      if (userId) {
        where.user_id = userId;
      }

      // Fetch sessions
      const sessions = await db.mobileSession.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
              role: true,
              position: true,
              avatar_url: true,
            },
          },
        },
        orderBy: {
          last_activity_at: 'desc',
        },
        take: limit,
      });

      // Calculate statistics
      const stats = await db.mobileSession.groupBy({
        by: ['status'],
        where: {
          workspace_id,
        },
        _count: {
          id: true,
        },
      });

      // Get app version distribution
      const versionStats = await db.mobileSession.groupBy({
        by: ['app_version'],
        where: {
          workspace_id,
          status: 'active',
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      });

      // Get platform distribution
      const platformStats = await db.mobileSession.groupBy({
        by: ['device_platform'],
        where: {
          workspace_id,
          status: 'active',
        },
        _count: {
          id: true,
        },
      });

      // Format statistics
      const formattedStats = {
        total: sessions.length,
        by_status: stats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.id;
          return acc;
        }, {} as Record<string, number>),
        by_version: versionStats.map((v) => ({
          version: v.app_version,
          count: v._count.id,
        })),
        by_platform: platformStats.reduce((acc, stat) => {
          acc[stat.device_platform] = stat._count.id;
          return acc;
        }, {} as Record<string, number>),
      };

      console.log(`[MOBILE SESSIONS] Fetched ${sessions.length} sessions for workspace ${workspace_id}`);

      return NextResponse.json({
        success: true,
        count: sessions.length,
        sessions: sessions.map((session) => ({
          id: session.id,
          user: {
            id: session.user.id,
            name: `${session.user.first_name} ${session.user.last_name}`,
            email: session.user.email,
            role: session.user.role,
            position: session.user.position,
            avatar_url: session.user.avatar_url,
          },
          device: {
            platform: session.device_platform,
            model: session.device_model,
            os_version: session.device_os_version,
          },
          app_version: session.app_version,
          status: session.status,
          ip_address: session.ip_address,
          location: session.location,
          started_at: session.started_at,
          last_activity_at: session.last_activity_at,
          expires_at: session.expires_at,
          ended_at: session.ended_at,
        })),
        stats: formattedStats,
      });
    } catch (error: any) {
      console.error('[MOBILE SESSIONS] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch mobile sessions' },
        { status: 500 }
      );
    }
  }
);

/**
 * Revoke a mobile session
 * DELETE /api/mobile/sessions
 *
 * Permissions: admin
 *
 * Request body:
 * - session_id: string - Session ID to revoke
 *
 * Response:
 * - success: boolean
 * - message: string
 */
export const DELETE = requireRole('admin')(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const { session_id } = body;

      if (!session_id) {
        return NextResponse.json(
          { error: 'session_id is required' },
          { status: 400 }
        );
      }

      const workspace_id = user.workspaceId;

      // Update session status to revoked
      const session = await db.mobileSession.updateMany({
        where: {
          id: session_id,
          workspace_id,
        },
        data: {
          status: 'revoked',
          ended_at: new Date(),
        },
      });

      if (session.count === 0) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      console.log(`[MOBILE SESSIONS] Revoked session ${session_id} for workspace ${workspace_id}`);

      return NextResponse.json({
        success: true,
        message: 'Session revoked successfully',
      });
    } catch (error: any) {
      console.error('[MOBILE SESSIONS] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to revoke session' },
        { status: 500 }
      );
    }
  }
);
