import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';


const JWT_SECRET = process.env.JWT_SECRET || 'ashley-ai-client-portal-secret-key-2024';
const JWT_EXPIRY = '7d'; // 7 days

// Verify magic link token and create JWT session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Magic link token is required' },
        { status: 400 }
      );
    }

    // Find session by token
    const session = await db.clientSession.findUnique({
      where: { magic_token: token },
      include: {
        client: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired magic link' },
        { status: 401 }
      );
    }

    // Check if already used
    if (session.is_used) {
      return NextResponse.json(
        { success: false, error: 'This magic link has already been used' },
        { status: 401 }
      );
    }

    // Check if expired
    if (new Date() > session.expires_at) {
      return NextResponse.json(
        { success: false, error: 'This magic link has expired. Please request a new one.' },
        { status: 401 }
      );
    }

    // Mark session as used
    await db.clientSession.update({
      where: { id: session.id },
      data: { is_used: true },
    });

    // Create JWT token
    const jwtPayload = {
      client_id: session.client.id,
      workspace_id: session.client.workspace_id,
      email: session.client.email,
      name: session.client.name,
      type: 'client_portal',
    };

    const jwtToken = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('client_portal_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/client-portal',
    });

    // Log activity
    await db.clientActivity.create({
      data: {
        workspace_id: session.client.workspace_id,
        client_id: session.client.id,
        session_id: session.id,
        activity_type: 'LOGIN',
        description: 'Client logged in via magic link',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Create welcome notification if first login
    const existingActivities = await db.clientActivity.count({
      where: {
        client_id: session.client.id,
        activity_type: 'LOGIN',
      },
    });

    if (existingActivities === 1) {
      // First login
      await db.clientNotification.create({
        data: {
          workspace_id: session.client.workspace_id,
          client_id: session.client.id,
          type: 'WELCOME',
          title: 'Welcome to Ashley AI Client Portal! 🎉',
          message: 'Track your orders, manage payments, and communicate with our team all in one place.',
          priority: 'HIGH',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully logged in',
      client: {
        id: session.client.id,
        name: session.client.name,
        email: session.client.email,
        contact_person: session.client.contact_person,
      },
      token: jwtToken,
      redirect_url: '/client-portal/dashboard',
    });
  } catch (error: any) {
    console.error('Error verifying magic link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify magic link' },
      { status: 500 }
    );
  }
}
