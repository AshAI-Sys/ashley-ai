"use strict";
// Multi-Tenant Middleware
// Ensures data isolation between tenants
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractWorkspaceIdentifier = extractWorkspaceIdentifier;
exports.validateTenantMiddleware = validateTenantMiddleware;
exports.addTenantContext = addTenantContext;
exports.getTenantContext = getTenantContext;
exports.createTenantFilter = createTenantFilter;
exports.requireFeature = requireFeature;
exports.checkTenantLimits = checkTenantLimits;
exports.getTenantPrismaClient = getTenantPrismaClient;
const server_1 = require("next/server");
const tenant_manager_1 = require("./tenant-manager");
// Extract workspace from request (subdomain, header, or query param)
function extractWorkspaceIdentifier(req) {
    // Method 1: Check custom header
    const headerWorkspace = req.headers.get("X-Workspace-ID");
    if (headerWorkspace)
        return headerWorkspace;
    // Method 2: Check subdomain
    const host = req.headers.get("host") || "";
    const subdomain = host.split(".")[0];
    if (subdomain &&
        subdomain !== "www" &&
        subdomain !== "localhost" &&
        !subdomain.includes(":")) {
        return subdomain; // Treat subdomain as workspace slug
    }
    // Method 3: Check query parameter
    const searchParams = req.nextUrl.searchParams;
    const queryWorkspace = searchParams.get("workspace");
    if (queryWorkspace)
        return queryWorkspace;
    // Method 4: Check session/cookie (simplified - would use actual session in production)
    const cookieWorkspace = req.cookies.get("workspace_id")?.value;
    if (cookieWorkspace)
        return cookieWorkspace;
    return null;
}
// Middleware function to validate tenant access
async function validateTenantMiddleware(req, workspace_id, user_id) {
    try {
        // If no workspace_id provided, try to extract from request
        const workspaceIdentifier = workspace_id || extractWorkspaceIdentifier(req);
        if (!workspaceIdentifier) {
            return server_1.NextResponse.json({ error: "Workspace not specified", code: "NO_WORKSPACE" }, { status: 400 });
        }
        // Resolve workspace (could be ID or slug)
        let resolvedWorkspaceId = workspaceIdentifier;
        // Check if it's a slug (not a cuid)
        if (!workspaceIdentifier.startsWith("cl") &&
            workspaceIdentifier.length < 20) {
            const workspace = await tenant_manager_1.tenantManager.getTenantConfig(workspaceIdentifier);
            if (!workspace) {
                // Try to find by slug
                const { prisma } = await Promise.resolve().then(() => __importStar(require("@/lib/database")));
                const workspaceBySlug = await prisma.workspace.findUnique({
                    where: { slug: workspaceIdentifier },
                });
                if (!workspaceBySlug) {
                    return server_1.NextResponse.json({ error: "Workspace not found", code: "WORKSPACE_NOT_FOUND" }, { status: 404 });
                }
                resolvedWorkspaceId = workspaceBySlug.id;
            }
            else {
                resolvedWorkspaceId = workspace.workspace_id;
            }
        }
        // Validate access
        const validation = await tenant_manager_1.tenantManager.validateTenantAccess(resolvedWorkspaceId, user_id);
        if (!validation.valid) {
            return server_1.NextResponse.json({ error: validation.reason || "Access denied", code: "ACCESS_DENIED" }, { status: 403 });
        }
        // Access is valid - return null to continue
        return null;
    }
    catch (error) {
        console.error("Tenant middleware error:", error);
        return server_1.NextResponse.json({ error: "Tenant validation failed", details: error.message }, { status: 500 });
    }
}
// Helper to add tenant context to request
function addTenantContext(req, context) {
    // In a real implementation, would attach to request context
    // For now, we'll use headers (Next.js middleware pattern)
    req.tenantContext = context;
}
// Helper to get tenant context from request
function getTenantContext(req) {
    return req.tenantContext || null;
}
// Enforce tenant-scoped queries (Prisma middleware helper)
function createTenantFilter(workspace_id) {
    return { workspace_id };
}
// Check feature access for tenant
async function requireFeature(workspace_id, feature) {
    const isEnabled = await tenant_manager_1.tenantManager.isFeatureEnabled(workspace_id, feature);
    if (!isEnabled) {
        return {
            allowed: false,
            error: `Feature '${feature}' is not enabled for this workspace`,
        };
    }
    return { allowed: true };
}
// Check tenant limits before operations
async function checkTenantLimits(workspace_id, operation, size_gb) {
    const limits = await tenant_manager_1.tenantManager.checkLimits(workspace_id);
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
function getTenantPrismaClient(workspace_id) {
    const { prisma } = require("@ash/database");
    // Create a proxy that automatically adds workspace_id to all queries
    return new Proxy(prisma, {
        get(target, prop) {
            const original = target[prop];
            // If it's a model (Client, Order, etc.)
            if (typeof original === "object" && original !== null) {
                return new Proxy(original, {
                    get(modelTarget, modelProp) {
                        const modelMethod = modelTarget[modelProp];
                        // If it's a query method (findMany, findUnique, create, etc.)
                        if (typeof modelMethod === "function") {
                            return function (...args) {
                                // Add workspace_id to where clause if it exists
                                if (args[0] && typeof args[0] === "object") {
                                    if (args[0].where) {
                                        args[0].where = {
                                            ...args[0].where,
                                            workspace_id,
                                        };
                                    }
                                    else if (modelProp !== "count" &&
                                        modelProp !== "deleteMany") {
                                        args[0].where = { workspace_id };
                                    }
                                    // For create/createMany, add workspace_id to data
                                    if ((modelProp === "create" || modelProp === "createMany") &&
                                        args[0].data) {
                                        if (Array.isArray(args[0].data)) {
                                            args[0].data = args[0].data.map((d) => ({
                                                ...d,
                                                workspace_id,
                                            }));
                                        }
                                        else {
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
