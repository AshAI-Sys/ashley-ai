"use strict";
/**
 * Workspace Management Utility
 *
 * Provides utilities for managing workspace context throughout the application.
 * This replaces hardcoded workspace IDs with a flexible, multi-tenant approach.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspaceId = getWorkspaceId;
exports.getWorkspaceIdFromRequest = getWorkspaceIdFromRequest;
exports.setWorkspaceId = setWorkspaceId;
exports.isValidWorkspaceId = isValidWorkspaceId;
exports.getWorkspaceFromToken = getWorkspaceFromToken;
exports.getWorkspaceContext = getWorkspaceContext;
const headers_1 = require("next/headers");
/**
 * No default workspace in production
 * Workspace ID must come from authenticated user session
 */
/**
 * Get workspace ID from various sources
 * Priority order:
 * 1. Request headers (X-Workspace-ID)
 * 2. Cookies (workspace_id)
 * 3. Query parameters (?workspaceId=...)
 *
 * IMPORTANT: Returns null if no workspace found - requires authentication
 */
async function getWorkspaceId(request) {
    // Try to get from request headers
    if (request) {
        const headerWorkspaceId = request.headers.get("X-Workspace-ID");
        if (headerWorkspaceId) {
            return headerWorkspaceId;
        }
        // Try to get from query parameters
        const url = new URL(request.url);
        const queryWorkspaceId = url.searchParams.get("workspaceId");
        if (queryWorkspaceId) {
            return queryWorkspaceId;
        }
        // Try to get from cookies
        const cookieWorkspaceId = request.cookies.get("workspace_id")?.value;
        if (cookieWorkspaceId) {
            return cookieWorkspaceId;
        }
    }
    // Try to get from server-side cookies
    try {
        const cookieStore = (0, headers_1.cookies)();
        const workspaceCookie = cookieStore.get("workspace_id");
        if (workspaceCookie?.value) {
            return workspaceCookie.value;
        }
    }
    catch (error) {
        // Cookies may not be available in all contexts
        console.warn("Failed to read workspace cookie:", error);
    }
    // No workspace found - user must authenticate
    return null;
}
/**
 * Get workspace ID from request (synchronous version for API routes)
 * Returns null if no workspace found - requires authentication
 */
function getWorkspaceIdFromRequest(request) {
    // Try request headers first
    const headerWorkspaceId = request.headers.get("X-Workspace-ID");
    if (headerWorkspaceId) {
        return headerWorkspaceId;
    }
    // Try query parameters
    const url = new URL(request.url);
    const queryWorkspaceId = url.searchParams.get("workspaceId");
    if (queryWorkspaceId) {
        return queryWorkspaceId;
    }
    // Try cookies
    const cookieWorkspaceId = request.cookies.get("workspace_id")?.value;
    if (cookieWorkspaceId) {
        return cookieWorkspaceId;
    }
    // No workspace found - user must authenticate
    return null;
}
/**
 * Set workspace ID in cookies
 * This should be called after user authentication
 */
function setWorkspaceId(workspaceId) {
    try {
        const cookieStore = (0, headers_1.cookies)();
        cookieStore.set("workspace_id", workspaceId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });
    }
    catch (error) {
        console.error("Failed to set workspace cookie:", error);
    }
}
/**
 * Validate workspace ID format
 */
function isValidWorkspaceId(workspaceId) {
    // Workspace IDs should be alphanumeric with hyphens
    return (/^[a-zA-Z0-9-_]+$/.test(workspaceId) &&
        workspaceId.length > 0 &&
        workspaceId.length <= 50);
}
/**
 * Get workspace context from JWT token (for future implementation)
 * This is a placeholder for when proper JWT authentication is implemented
 */
function getWorkspaceFromToken(_token) {
    // TODO: Implement JWT token parsing to extract workspace ID
    // For now, return null to fall back to other methods
    return null;
}
/**
 * Get full workspace context with metadata
 * Returns null if no workspace found
 */
async function getWorkspaceContext(request) {
    const workspaceId = await getWorkspaceId(request);
    if (!workspaceId) {
        return null;
    }
    return {
        workspaceId,
        isDefault: false, // No default workspace in production
    };
}
