// ASH AI Database Utilities
// Helper functions for database operations

import { db, type DatabaseTransaction } from "./client";
import type { WithWorkspaceId, AshleyAnalysis } from "./types";

// Multi-tenancy helpers
export function withWorkspace(workspaceId: string) {
  return {
    where: {
      workspace_id: workspaceId,
      deleted_at: null,
    },
  };
}

export function createWithWorkspace<T extends Record<string, unknown>>(
  workspaceId: string,
  data: T
): WithWorkspaceId<T> {
  return {
    ...data,
    workspace_id: workspaceId,
  };
}

// Audit logging helper
export async function logAudit({
  workspaceId,
  userId,
  action,
  resource,
  resourceId,
  oldValues,
  newValues,
  ipAddress,
  userAgent,
}: {
  workspaceId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  await db.auditLog.create({
    data: {
      workspace_id: workspaceId,
      user_id: userId,
      action,
      resource,
      resource_id: resourceId,
      old_values: oldValues ? JSON.stringify(oldValues) : null,
      new_values: newValues ? JSON.stringify(newValues) : null,
      ip_address: ipAddress,
      user_agent: userAgent,
    },
  });
}

// PO number generation
export async function generatePONumber(brandId: string): Promise<string> {
  const brand = await db.brand.findUnique({
    where: { id: brandId },
    select: { code: true },
  });

  if (!brand?.code) {
    throw new Error("Brand code not found");
  }

  const currentYear = new Date().getFullYear();
  
  // Get the next sequence number for this brand/year
  const lastOrder = await db.order.findFirst({
    where: {
      brand_id: brandId,
      order_number: {
        startsWith: `${brand.code}-${currentYear}-`,
      },
    },
    orderBy: {
      created_at: "desc",
    },
    select: {
      order_number: true,
    },
  });

  let nextSequence = 1;
  if (lastOrder) {
    const parts = lastOrder.order_number.split("-");
    const lastSequence = parseInt(parts[2] || "0");
    nextSequence = lastSequence + 1;
  }

  return `${brand.code}-${currentYear}-${nextSequence.toString().padStart(6, "0")}`;
}

// QR code generation for bundles
export function generateBundleQR(bundleId: string): string {
  return `ash://bundle/${bundleId}`;
}

// Ashley AI analysis helpers
export function parseAshleyAnalysis(jsonString: string | null): AshleyAnalysis | null {
  if (!jsonString) return null;
  
  try {
    return JSON.parse(jsonString) as AshleyAnalysis;
  } catch {
    return null;
  }
}

export function serializeAshleyAnalysis(analysis: AshleyAnalysis): string {
  return JSON.stringify(analysis);
}

// Soft delete helper
export async function softDelete(
  model: keyof typeof db,
  id: string,
  workspaceId: string,
  userId?: string
) {
  const tableName = model.toString();
  
  // Type assertion needed here due to dynamic model access
  const result = await (db[model] as any).update({
    where: { id, workspace_id: workspaceId },
    data: { deleted_at: new Date() },
  });

  // Log the soft delete
  await logAudit({
    workspaceId,
    userId,
    action: "soft_delete",
    resource: tableName,
    resourceId: id,
  });

  return result;
}

// JSON field helpers for PostgreSQL
export function parseJsonField<T>(jsonString: string | null): T | null {
  if (!jsonString) return null;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return null;
  }
}

export function stringifyJsonField<T>(data: T): string {
  return JSON.stringify(data);
}

// Database transaction wrapper with error handling
export async function withTransaction<T>(
  callback: (tx: any) => Promise<T>
): Promise<T> {
  return await db.$transaction(async (tx: any) => {
    try {
      return await callback(tx);
    } catch (error) {
      // Log error and re-throw
      console.error("Transaction failed:", error);
      throw error;
    }
  });
}