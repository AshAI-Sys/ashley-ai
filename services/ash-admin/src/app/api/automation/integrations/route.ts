import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// GET /api/automation/integrations - Get integrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id') || 'workspace_1';
    const type = searchParams.get('type');
    const provider = searchParams.get('provider');
    const isActive = searchParams.get('is_active');
    const isConnected = searchParams.get('is_connected');

    const where: any = { workspace_id: workspaceId };

    if (type) where.type = type;
    if (provider) where.provider = provider;
    if (isActive !== null) where.is_active = isActive === 'true';
    if (isConnected !== null) where.is_connected = isConnected === 'true';

    const integrations = await prisma.integration.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, username: true }
        },
        sync_logs: {
          take: 5,
          orderBy: { started_at: 'desc' },
          select: {
            id: true,
            sync_type: true,
            operation: true,
            status: true,
            records_processed: true,
            records_success: true,
            records_failed: true,
            started_at: true,
            completed_at: true
          }
        }
      },
      orderBy: { updated_at: 'desc' }
    });

    // Mask sensitive configuration data
    const sanitizedIntegrations = integrations.map(integration => ({
      ...integration,
      config: maskSensitiveConfig(JSON.parse(integration.config))
    }));

    return NextResponse.json({
      success: true,
      data: sanitizedIntegrations,
      meta: {
        total: integrations.length,
        filters: { type, provider, isActive, isConnected }
      }
    });

  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

// POST /api/automation/integrations - Create integration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      workspace_id = 'workspace_1',
      name,
      type,
      provider,
      config,
      sync_frequency,
      is_active = true,
      created_by = 'user_1'
    } = body;

    // Validate required fields
    if (!name || !type || !provider || !config) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, type, provider, config' },
        { status: 400 }
      );
    }

    // Validate configuration based on integration type
    const validationResult = validateIntegrationConfig(type, provider, config);
    if (!validationResult.valid) {
      return NextResponse.json(
        { success: false, error: validationResult.error },
        { status: 400 }
      );
    }

    // Test connection if possible
    const connectionTest = await testConnection(type, provider, config);

    const integration = await prisma.integration.create({
      data: {
        workspace_id,
        name,
        type,
        provider,
        config: JSON.stringify(config),
        sync_frequency,
        is_active,
        is_connected: connectionTest.success,
        last_error: connectionTest.success ? null : connectionTest.error,
        created_by
      },
      include: {
        user: {
          select: { id: true, email: true, username: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...integration,
        config: maskSensitiveConfig(JSON.parse(integration.config))
      },
      message: 'Integration created successfully',
      connection_test: connectionTest
    });

  } catch (error) {
    console.error('Error creating integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create integration' },
      { status: 500 }
    );
  }
}

// PUT /api/automation/integrations - Update integration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Integration ID is required' },
        { status: 400 }
      );
    }

    // Convert config to JSON string if provided
    if (updateData.config) {
      updateData.config = JSON.stringify(updateData.config);
    }

    const integration = await prisma.integration.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, email: true, username: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...integration,
        config: maskSensitiveConfig(JSON.parse(integration.config))
      },
      message: 'Integration updated successfully'
    });

  } catch (error) {
    console.error('Error updating integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update integration' },
      { status: 500 }
    );
  }
}

// DELETE /api/automation/integrations - Delete integration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Integration ID is required' },
        { status: 400 }
      );
    }

    await prisma.integration.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Integration deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete integration' },
      { status: 500 }
    );
  }
}

// Helper functions
function maskSensitiveConfig(config: any): any {
  const masked = { ...config };
  const sensitiveKeys = ['api_key', 'password', 'secret', 'token', 'private_key'];

  for (const key of sensitiveKeys) {
    if (masked[key]) {
      masked[key] = '***MASKED***';
    }
  }

  return masked;
}

function validateIntegrationConfig(type: string, provider: string, config: any): { valid: boolean; error?: string } {
  const requiredFields: Record<string, string[]> = {
    EMAIL: {
      MAILGUN: ['api_key', 'domain'],
      SENDGRID: ['api_key'],
      SES: ['access_key_id', 'secret_access_key', 'region']
    },
    SMS: {
      TWILIO: ['account_sid', 'auth_token', 'from_number']
    },
    ACCOUNTING: {
      QUICKBOOKS: ['client_id', 'client_secret', 'sandbox'],
      XERO: ['client_id', 'client_secret']
    },
    CRM: {
      SALESFORCE: ['client_id', 'client_secret', 'username', 'password']
    },
    SHIPPING: {
      FEDEX: ['api_key', 'secret_key', 'account_number'],
      UPS: ['api_key', 'username', 'password']
    },
    SLACK: {
      SLACK: ['webhook_url']
    }
  };

  const typeConfig = requiredFields[type];
  if (!typeConfig) {
    return { valid: false, error: `Unsupported integration type: ${type}` };
  }

  const providerConfig = typeConfig[provider];
  if (!providerConfig) {
    return { valid: false, error: `Unsupported provider for ${type}: ${provider}` };
  }

  for (const field of providerConfig) {
    if (!config[field]) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  return { valid: true };
}

async function testConnection(type: string, provider: string, config: any): Promise<{ success: boolean; error?: string }> {
  try {
    // This would implement actual connection testing based on the integration type
    // For now, we'll do basic validation

    switch (type) {
      case 'EMAIL':
        if (provider === 'MAILGUN' && config.api_key && config.domain) {
          return { success: true };
        }
        if (provider === 'SENDGRID' && config.api_key) {
          return { success: true };
        }
        break;

      case 'SMS':
        if (provider === 'TWILIO' && config.account_sid && config.auth_token) {
          return { success: true };
        }
        break;

      case 'SLACK':
        if (provider === 'SLACK' && config.webhook_url) {
          return { success: true };
        }
        break;

      default:
        return { success: true }; // Assume success for other types
    }

    return { success: false, error: 'Invalid configuration' };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed'
    };
  }
}