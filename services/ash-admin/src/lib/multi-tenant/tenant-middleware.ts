// Multi-Tenant Middleware
// Ensures data isolation between tenants

import { NextRequest, NextResponse } from "next/server";
import { tenantManager } from "./tenant-manager";

export interface TenantContext {
  workspace_id: string;
  workspace_slug: string;
  user_id?: string;
  user_role?: string;
}

// Extract workspace from request (subdomain, header, or query param)
export function extractWorkspaceIdentifier(req: NextRequest): string | null {
  // Method 1: Check custom header
  const headerWorkspace = req.headers.get("X-Workspace-ID");
  if (headerWorkspace) return headerWorkspace;

  // Method 2: Check subdomain
  const host = req.headers.get("host") || "";
  const subdomain = host.split(".")[0];
  if (
    subdomain &&
    subdomain !== "www" &&
    subdomain !== "localhost" &&
    !subdomain.includes(":")
  ) {
    return subdomain; // Treat subdomain as workspace slug
  }

  // Method 3: Check query parameter
  const searchParams = req.nextUrl.searchParams;
  const queryWorkspace = searchParams.get("workspace");
  if (queryWorkspace) return queryWorkspace;

  // Method 4: Check session/cookie (simplified - would use actual session in production)
  const cookieWorkspace = req.cookies.get("workspace_id")?.value;
  if (cookieWorkspace) return cookieWorkspace;

  return null;
}

// Middleware function to validate tenant access
export async function validateTenantMiddleware(
  req: NextRequest,
  workspace_id?: string,
  user_id?: string
): Promise<NextResponse | null> {
  try {
    // If no workspace_id provided, try to extract from request
    const workspaceIdentifier = workspace_id || extractWorkspaceIdentifier(req);

    if (!workspaceIdentifier) {
      return NextResponse.json(
        { error: "Workspace not specified", code: "NO_WORKSPACE" },
        { status: 400 }
      );
    }

    // Resolve workspace (could be ID or slug)
    let resolvedWorkspaceId = workspaceIdentifier;

    // Check if it's a slug (not a cuid)
    if (
      !workspaceIdentifier.startsWith("cl") &&
      workspaceIdentifier.length < 20
    ) {
      const workspace =
        await tenantManager.getTenantConfig(workspaceIdentifier);
      if (!workspace) {
        // Try to find by slug
        const { prisma } = await import("@/lib/database");
        const workspaceBySlug = await prisma.workspace.findUnique({
          where: { slug: workspaceIdentifier },
        });

        if (!workspaceBySlug) {
          return NextResponse.json(
            { error: "Workspace not found", code: "WORKSPACE_NOT_FOUND" },
            { status: 404 }
          );
        }

        resolvedWorkspaceId = workspaceBySlug.id;
      } else {
        resolvedWorkspaceId = workspace.workspace_id;
      }
    }

    // Validate access
    const validation = await tenantManager.validateTenantAccess(
      resolvedWorkspaceId,
      user_id
    );

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason || "Access denied", code: "ACCESS_DENIED" },
        { status: 403 }
      );
    }

    // Access is valid - return null to continue
    return null;
  } catch (error: any) {
    console.error("Tenant middleware error:", error);
    return NextResponse.json(
      { error: "Tenant validation failed", details: error.message },
      { status: 500 }
    );
  }
}

// Helper to add tenant context to request
export function addTenantContext(
  req: NextRequest,
  context: TenantContext
): void {
  // In a real implementation, would attach to request context
  // For now, we'll use headers (Next.js middleware pattern)
  (req as any).tenantContext = context;
}

// Helper to get tenant context from request
export function getTenantContext(req: NextRequest): TenantContext | null {
  return (req as any).tenantContext || null;
}

// Enforce tenant-scoped queries (Prisma middleware helper)
export function createTenantFilter(workspace_id: string): {
  workspace_id: string;
} {
  return { workspace_id };
}

// Check feature access for tenant
export async function requireFeature(
  workspace_id: string,
  feature: string
): Promise<{ allowed: boolean; error?: string }> {
  const isEnabled = await tenantManager.isFeatureEnabled(workspace_id, feature);

  if (!isEnabled) {
    return {
      allowed: false,
      error: `Feature '${feature}' is not enabled for this workspace`,
    };
  }

  return { allowed: true };
}

// Check tenant limits before operations
export async function checkTenantLimits(
  workspace_id: string,
  operation: "CREATE_USER" | "CREATE_ORDER" | "UPLOAD_FILE",
  size_gb?: number
): Promise<{ allowed: boolean; error?: string }> {
  const limits = await tenantManager.checkLimits(workspace_id);

  switch (operation) {
    case "CREATE_USER":
      if (limits.users.available <= 0) {
        return {
          allowed: false,
          error: `User limit reached (${limits.users.max}/${limits.users.max})`,
        };
      }
      break;

    case "CREATE_ORDER":
      if (limits.orders.available <= 0) {
        return {
          allowed: false,
          error: `Monthly order limit reached (${limits.orders.max}/${limits.orders.max})`,
        };
      }
      break;

    case "UPLOAD_FILE":
      if (size_gb && limits.storage.available_gb < size_gb) {
        return {
          allowed: false,
          error: `Storage quota exceeded (${limits.storage.used_gb}GB/${limits.storage.max_gb}GB used)`,
        };
      }
      break;
  }

  return { allowed: true };
}

// Tenant-aware Prisma client wrapper
export function getTenantPrismaClient(workspace_id: string) {
  const { prisma } = require("@ash/database");

  // Create a proxy that automatically adds workspace_id to all queries
  return new Proxy(prisma, {
    get(target: any, prop: string) {
      const original = target[prop];

      // If it's a model (Client, Order, etc.)
      if (typeof original === "object" && original !== null) {
        return new Proxy(original, {
          get(modelTarget: any, modelProp: string) {
            const modelMethod = modelTarget[modelProp];

            // If it's a query method (findMany, findUnique, create, etc.)
            if (typeof modelMethod === "function") {
              return function (...args: any[]) {
                // Add workspace_id to where clause if it exists
                if (args[0] && typeof args[0] === "object") {
                  if (args[0].where) {
                    args[0].where = {
                      ...args[0].where,
                      workspace_id,
                    };
                  } else if (
                    modelProp !== "count" &&
                    modelProp !== "deleteMany"
                  ) {
                    args[0].where = { workspace_id };
                  }

                  // For create/createMany, add workspace_id to data
                  if (
                    (modelProp === "create" || modelProp === "createMany") &&
                    args[0].data
                  ) {
                    if (Array.isArray(args[0].data)) {
                      args[0].data = args[0].data.map((d: any) => ({
                        ...d,
                        workspace_id,
                      }));
                    } else {
                      args[0].data = {
                        ...args[0].data,
                        workspace_id,
                      };
                    }
                  }
                }

                return modelMethod.apply(modelTarget, args);
              };
            }

            return modelMethod;
          },
        });
      }

      return original;
    },
  });
}
