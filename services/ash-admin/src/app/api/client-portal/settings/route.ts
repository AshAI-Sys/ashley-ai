import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getClientFromRequest } from '@/lib/client-portal-auth';

export const dynamic = 'force-dynamic';


// Get client portal settings
export async function GET(request: NextRequest) {
  try {
    const session = await getClientFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch or create settings
    let settings = await db.clientPortalSettings.findFirst({
      where: {
        workspace_id: session.workspace_id,
        client_id: session.client_id,
      },
    });

    if (!settings) {
      // Create default settings
      settings = await db.clientPortalSettings.create({
        data: {
          workspace_id: session.workspace_id,
          client_id: session.client_id,
          email_notifications: true,
          sms_notifications: false,
          push_notifications: true,
          notification_frequency: 'REAL_TIME',
          preferred_language: 'en',
          timezone: 'UTC',
          theme: 'LIGHT',
        },
      });
    }

    // Fetch client profile
    const client = await db.client.findUnique({
      where: { id: session.client_id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        contact_person: true,
      },
    });

    return NextResponse.json({
      success: true,
      settings,
      profile: client,
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// Update client portal settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await getClientFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      email_notifications,
      sms_notifications,
      push_notifications,
      notification_frequency,
      preferred_language,
      timezone,
      theme,
      dashboard_layout,
    } = await request.json();

    // Update settings
    const settings = await db.clientPortalSettings.upsert({
      where: {
        workspace_id_client_id: {
          workspace_id: session.workspace_id,
          client_id: session.client_id,
        },
      },
      update: {
        email_notifications: email_notifications !== undefined ? email_notifications : undefined,
        sms_notifications: sms_notifications !== undefined ? sms_notifications : undefined,
        push_notifications: push_notifications !== undefined ? push_notifications : undefined,
        notification_frequency: notification_frequency || undefined,
        preferred_language: preferred_language || undefined,
        timezone: timezone || undefined,
        theme: theme || undefined,
        dashboard_layout: dashboard_layout || undefined,
      },
      create: {
        workspace_id: session.workspace_id,
        client_id: session.client_id,
        email_notifications: email_notifications !== undefined ? email_notifications : true,
        sms_notifications: sms_notifications !== undefined ? sms_notifications : false,
        push_notifications: push_notifications !== undefined ? push_notifications : true,
        notification_frequency: notification_frequency || 'REAL_TIME',
        preferred_language: preferred_language || 'en',
        timezone: timezone || 'UTC',
        theme: theme || 'LIGHT',
        dashboard_layout: dashboard_layout || null,
      },
    });

    // Log activity
    await db.clientActivity.create({
      data: {
        workspace_id: session.workspace_id,
        client_id: session.client_id,
        activity_type: 'SETTINGS_UPDATED',
        description: 'Client updated portal settings',
      },
    });

    return NextResponse.json({
      success: true,
      settings,
      message: 'Settings updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// Update client profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getClientFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, phone, company, address, contact_person } = await request.json();

    // Update client profile (email cannot be changed here for security)
    const client = await db.client.update({
      where: { id: session.client_id },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        address: address || undefined,
        contact_person: contact_person || undefined,
      },
    });

    // Log activity
    await db.clientActivity.create({
      data: {
        workspace_id: session.workspace_id,
        client_id: session.client_id,
        activity_type: 'PROFILE_UPDATED',
        description: 'Client updated profile information',
      },
    });

    return NextResponse.json({
      success: true,
      client,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
