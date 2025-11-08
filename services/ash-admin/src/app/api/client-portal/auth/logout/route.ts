import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ashley-ai-client-portal-secret-key-2024';

// Logout client and clear session
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('client_portal_token')?.value;

    if (token) {
      try {
        // Decode JWT to get client info
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        // Log activity
        await db.clientActivity.create({
          data: {
            workspace_id: decoded.workspace_id,
            client_id: decoded.client_id,
            activity_type: 'LOGOUT',
            description: 'Client logged out',
            ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            user_agent: request.headers.get('user-agent') || 'unknown',
          },
        });
      } catch (error) {
        // Token invalid or expired, continue with logout
        console.error('Error decoding token during logout:', error);
      }
    }

    // Clear cookie
    cookieStore.delete('client_portal_token');

    return NextResponse.json({
      success: true,
      message: 'Successfully logged out',
    });
  } catch (error: any) {
    console.error('Error logging out:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
