/**
 * Google Sheets Auto-Sync Utility
 *
 * Event-triggered automatic sync system that syncs data to Google Sheets
 * whenever changes occur in the database (orders, clients, inventory, etc.)
 *
 * Features:
 * - Non-blocking background sync
 * - Debouncing to prevent excessive API calls
 * - Error handling with graceful fallbacks
 * - Per-workspace sync tracking
 */

import {
  syncOrdersToSheets,
  syncClientsToSheets,
  syncInventoryToSheets,
  syncProductionToSheets,
  syncFinanceToSheets,
  syncHRToSheets,
} from './google-sheets-sync';

// Debounce timer storage (per workspace and type)
const syncTimers: Map<string, NodeJS.Timeout> = new Map();

// Track last sync times to prevent duplicate syncs
const lastSyncTimes: Map<string, number> = new Map();

// Minimum time between syncs (in milliseconds) - 5 seconds
const MIN_SYNC_INTERVAL = 5000;

export type SyncType = 'orders' | 'clients' | 'inventory' | 'production' | 'finance' | 'hr';

interface SyncResult {
  success: boolean;
  type: SyncType;
  workspaceId: string;
  timestamp: Date;
  error?: string;
}

/**
 * Trigger a background sync for a specific data type
 * This function is non-blocking and will not delay API responses
 *
 * @param workspaceId - The workspace to sync
 * @param type - The type of data to sync
 * @param debounceMs - Debounce time in milliseconds (default: 2000ms)
 */
export async function triggerAutoSync(
  workspaceId: string,
  type: SyncType,
  debounceMs: number = 2000
): Promise<void> {
  try {
    // Check if Google Sheets is configured
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      console.log('[AUTO-SYNC] Google Sheets not configured, skipping sync');
      return;
    }

    // Create unique key for this workspace + type combination
    const syncKey = `${workspaceId}:${type}`;

    // Check if we synced too recently (prevent spam)
    const lastSyncTime = lastSyncTimes.get(syncKey) || 0;
    const now = Date.now();
    if (now - lastSyncTime < MIN_SYNC_INTERVAL) {
      console.log(`[AUTO-SYNC] Skipping ${type} sync for workspace ${workspaceId} - too soon since last sync`);
      return;
    }

    // Clear existing timer if any
    const existingTimer = syncTimers.get(syncKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounced timer
    const timer = setTimeout(async () => {
      try {
        console.log(`🔄 [AUTO-SYNC] Starting ${type} sync for workspace ${workspaceId}`);

        // Update last sync time
        lastSyncTimes.set(syncKey, Date.now());

        // Execute sync based on type
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
        }

        console.log(`✅ [AUTO-SYNC] Successfully synced ${type} for workspace ${workspaceId}`);

        // Clean up timer
        syncTimers.delete(syncKey);
      } catch (error: any) {
        console.error(`❌ [AUTO-SYNC] Failed to sync ${type} for workspace ${workspaceId}:`, error.message);
        // Don't throw - we want sync failures to be silent and not break the main API
      }
    }, debounceMs);

    // Store timer
    syncTimers.set(syncKey, timer);

    console.log(`⏱️ [AUTO-SYNC] Scheduled ${type} sync for workspace ${workspaceId} in ${debounceMs}ms`);
  } catch (error: any) {
    // Catch-all error handler - sync should never break the main API
    console.error(`❌ [AUTO-SYNC] Error scheduling sync:`, error.message);
  }
}

/**
 * Trigger sync for multiple data types at once
 * Useful when an action affects multiple data types
 *
 * @param workspaceId - The workspace to sync
 * @param types - Array of data types to sync
 * @param debounceMs - Debounce time in milliseconds
 */
export async function triggerMultiSync(
  workspaceId: string,
  types: SyncType[],
  debounceMs: number = 2000
): Promise<void> {
  for (const type of types) {
    await triggerAutoSync(workspaceId, type, debounceMs);
  }
}

/**
 * Cancel all pending syncs for a workspace
 * Useful when you want to manually trigger a full sync
 *
 * @param workspaceId - The workspace to cancel syncs for
 */
export function cancelPendingSyncs(workspaceId: string): void {
  const keysToDelete: string[] = [];

  syncTimers.forEach((timer, key) => {
    if (key.startsWith(`${workspaceId}:`)) {
      clearTimeout(timer);
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => syncTimers.delete(key));

  console.log(`🚫 [AUTO-SYNC] Cancelled ${keysToDelete.length} pending syncs for workspace ${workspaceId}`);
}

/**
 * Get sync status for debugging
 */
export function getSyncStatus(): {
  pendingSyncs: number;
  syncKeys: string[];
} {
  return {
    pendingSyncs: syncTimers.size,
    syncKeys: Array.from(syncTimers.keys()),
  };
}

/**
 * Helper function to easily add auto-sync to API routes
 * Usage: After successful API operation, call this function
 *
 * @example
 * ```ts
 * // In your API route after creating an order:
 * const order = await prisma.order.create({ ... });
 * await syncAfterChange(user.workspaceId, 'orders');
 * return NextResponse.json({ success: true, order });
 * ```
 */
export async function syncAfterChange(
  workspaceId: string,
  type: SyncType,
  debounceMs?: number
): Promise<void> {
  // Fire and forget - don't await
  triggerAutoSync(workspaceId, type, debounceMs).catch(error => {
    console.error('[AUTO-SYNC] Background sync error:', error);
  });
}
