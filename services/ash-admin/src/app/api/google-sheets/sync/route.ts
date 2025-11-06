import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import {
  syncAllDataToSheets,
  syncOrdersToSheets,
  syncClientsToSheets,
  syncInventoryToSheets,
  syncProductionToSheets,
  syncFinanceToSheets,
  syncHRToSheets,
  getGoogleSheetsUrl,
} from '@/lib/google-sheets-sync';

export const dynamic = 'force-dynamic';

/**
 * POST /api/google-sheets/sync
 * Trigger Google Sheets sync
 *
 * Body:
 * - type: "all" | "orders" | "clients" | "inventory" | "production" | "finance" | "hr"
 */
export async function POST(request: NextRequest) {
  return requireAuth(request, async (user) => {
    try {
      const body = await request.json();
      const { type = 'all' } = body;

      const workspaceId = user.workspace_id;

      console.log(`🔄 Syncing ${type} to Google Sheets for workspace:`, workspaceId);

      let result;

      switch (type) {
        case 'orders':
          result = await syncOrdersToSheets(workspaceId);
          break;
        case 'clients':
          result = await syncClientsToSheets(workspaceId);
          break;
        case 'inventory':
          result = await syncInventoryToSheets(workspaceId);
          break;
        case 'production':
          result = await syncProductionToSheets(workspaceId);
          break;
        case 'finance':
          result = await syncFinanceToSheets(workspaceId);
          break;
        case 'hr':
          result = await syncHRToSheets(workspaceId);
          break;
        case 'all':
        default:
          result = await syncAllDataToSheets(workspaceId);
          break;
      }

      const url = await getGoogleSheetsUrl();

      return NextResponse.json({
        success: true,
        message: `Successfully synced ${type} to Google Sheets`,
        result,
        url,
      });
    } catch (error: any) {
      console.error('❌ Google Sheets sync error:', error);

      // Check for specific error types
      if (error.message.includes('GOOGLE_SERVICE_ACCOUNT_JSON')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Google Sheets not configured',
            message: 'Please configure Google Service Account credentials in environment variables',
            details: error.message,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Sync failed',
          message: error.message,
        },
        { status: 500 }
      );
    }
  });
}

/**
 * GET /api/google-sheets/sync
 * Get Google Sheets sync status
 */
export async function GET(request: NextRequest) {
  return requireAuth(request, async (user) => {
    try {
      const url = await getGoogleSheetsUrl();

      return NextResponse.json({
        success: true,
        configured: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
        url,
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          configured: false,
          error: error.message,
        },
        { status: 500 }
      );
    }
  });
}
