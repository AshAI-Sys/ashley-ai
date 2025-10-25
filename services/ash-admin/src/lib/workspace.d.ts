/**
 * Workspace Management Utility
 *
 * Provides utilities for managing workspace context throughout the application.
 * This replaces hardcoded workspace IDs with a flexible, multi-tenant approach.
 */
import { NextRequest } from "next/server";
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
export declare function getWorkspaceId(request?: NextRequest): Promise<string | null>;
/**
 * Get workspace ID from request (synchronous version for API routes)
 * Returns null if no workspace found - requires authentication
 */
export declare function getWorkspaceIdFromRequest(request: NextRequest): string | null;
/**
 * Set workspace ID in cookies
 * This should be called after user authentication
 */
export declare function setWorkspaceId(workspaceId: string): void;
/**
 * Validate workspace ID format
 */
export declare function isValidWorkspaceId(workspaceId: string): boolean;
/**
 * Get workspace context from JWT token (for future implementation)
 * This is a placeholder for when proper JWT authentication is implemented
 */
export declare function getWorkspaceFromToken(_token: string): string | null;
/**
 * Workspace context type for use in API routes and components
 */
export interface WorkspaceContext {
    workspaceId: string;
    isDefault: boolean;
}
/**
 * Get full workspace context with metadata
 * Returns null if no workspace found
 */
export declare function getWorkspaceContext(request?: NextRequest): Promise<WorkspaceContext | null>;
