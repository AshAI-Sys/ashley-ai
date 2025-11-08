/**
 * Audit Middleware
 *
 * Automatically logs all data changes (CREATE, UPDATE, DELETE) to the audit trail
 * Captures before/after values, user info, IP address, and timestamps
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./db";
import { logDataChange } from "./audit-logger";

export interface AuditContext {
  user: {
    id: string;
    workspace_id: string;
    email?: string;
  };
  resource: string; // e.g., "order", "client", "invoice"
}

/**
 * Wraps an API route handler with automatic audit logging
 *
 * @param handler - The original API route handler
 * @param options - Configuration options
 * @returns Wrapped handler with audit logging
 */
export function withAudit<T = any>(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse<T>>,
  options: {
    resource: string; // Entity being modified (e.g., "order", "client")
    action?: "CREATE" | "UPDATE" | "DELETE"; // Optional: auto-detect if not provided
    captureOldValues?: boolean; // Default: true for UPDATE/DELETE
  }
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse<T>> => {
    const { resource, action, captureOldValues = true } = options;

    // Extract user from context or request
    const user = context?.user || context;

    if (!user || !user.id || !user.workspace_id) {
      // If no user context, just run the handler without audit logging
      return handler(request, context);
    }

    // Determine action from HTTP method if not provided
    const detectedAction = action || detectActionFromMethod(request.method);

    // Extract resource ID from request (if available)
    const resourceId = await extractResourceId(request);

    // Capture old values BEFORE the operation (for UPDATE/DELETE)
    let oldValues: any = null;
    if (captureOldValues && resourceId && (detectedAction === "UPDATE" || detectedAction === "DELETE")) {
      try {
        oldValues = await fetchOldValues(resource, resourceId);
      } catch (error) {
        console.error("Failed to fetch old values for audit:", error);
      }
    }

    // Execute the original handler
    const response = await handler(request, context);

    // Only log if the operation was successful (2xx status)
    if (response.status >= 200 && response.status < 300) {
      try {
        // Parse response to get new values
        const responseBody = await response.clone().json();
        const newData = responseBody.data || responseBody;

        // Extract resource ID from response if not from request
        const finalResourceId = resourceId || extractResourceIdFromResponse(newData, resource);

        // Get IP address and user agent
        const ipAddress = request.headers.get("x-forwarded-for") ||
                          request.headers.get("x-real-ip") ||
                          "unknown";
        const userAgent = request.headers.get("user-agent") || "unknown";

        // Log the audit entry
        await logDataChange(
          detectedAction,
          resource,
          finalResourceId,
          user.workspace_id,
          user.id,
          oldValues,
          newData,
          { ip_address: ipAddress, user_agent: userAgent }
        );
      } catch (error) {
        // Log error but don't fail the request
        console.error("Failed to create audit log:", error);
      }
    }

    return response;
  };
}

/**
 * Detect action type from HTTP method
 */
function detectActionFromMethod(method: string): "CREATE" | "UPDATE" | "DELETE" | "READ" {
  switch (method.toUpperCase()) {
    case "POST":
      return "CREATE";
    case "PUT":
    case "PATCH":
      return "UPDATE";
    case "DELETE":
      return "DELETE";
    default:
      return "READ";
  }
}

/**
 * Extract resource ID from request URL or body
 */
async function extractResourceId(request: NextRequest): Promise<string | null> {
  // Try to get ID from URL path (e.g., /api/orders/[id])
  const urlParts = request.nextUrl.pathname.split('/');
  const possibleId = urlParts[urlParts.length - 1];

  // Check if it's a valid CUID or UUID
  if (possibleId && (possibleId.startsWith('c') || possibleId.match(/^[0-9a-f]{8}-/))) {
    return possibleId;
  }

  // Try to get ID from request body for POST/PUT/PATCH
  if (request.method !== "GET" && request.method !== "DELETE") {
    try {
      const body = await request.clone().json();
      return body.id || null;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Extract resource ID from API response
 */
function extractResourceIdFromResponse(data: any, resource: string): string {
  if (!data) return "unknown";

  // Try common ID field names
  if (data.id) return data.id;
  if (data[`${resource}_id`]) return data[`${resource}_id`];
  if (data.order_id) return data.order_id;
  if (data.client_id) return data.client_id;
  if (data.invoice_id) return data.invoice_id;

  return "unknown";
}

/**
 * Fetch old values from database before update/delete
 */
async function fetchOldValues(resource: string, resourceId: string): Promise<any> {
  try {
    // Map resource name to Prisma model
    const modelName = capitalizeFirstLetter(resource);
    const model = (prisma as any)[modelName.toLowerCase()];

    if (!model) {
      console.warn(`No Prisma model found for resource: ${resource}`);
      return null;
    }

    const record = await model.findUnique({
      where: { id: resourceId },
    });

    return record;
  } catch (error) {
    console.error(`Failed to fetch old values for ${resource}:`, error);
    return null;
  }
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Create audit log entry manually (for custom scenarios)
 */
export async function createAuditLog(params: {
  workspaceId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        workspace_id: params.workspaceId,
        user_id: params.userId,
        action: params.action,
        resource: params.resource,
        resource_id: params.resourceId,
        old_values: params.oldValues ? JSON.stringify(params.oldValues) : null,
        new_values: params.newValues ? JSON.stringify(params.newValues) : null,
        ip_address: params.ipAddress || "unknown",
        user_agent: params.userAgent || "unknown",
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    throw error;
  }
}
