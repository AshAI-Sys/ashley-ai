import { NextRequest, NextResponse } from "next/server";
import { Permission, Role } from "./rbac";
export interface AuthUser {
    id: string;
    email: string;
    role: Role;
    workspaceId: string;
    permissions: Permission[];
}
export declare function authenticateRequest(request: NextRequest): Promise<AuthUser | null>;
export declare function requireAuth<T = any>(handler: (request: NextRequest, user: AuthUser, context?: T) => Promise<NextResponse>): (request: NextRequest, context?: T) => Promise<NextResponse<unknown>>;
export declare function requirePermission<T = any>(permission: Permission): (handler: (request: NextRequest, user: AuthUser, context?: T) => Promise<NextResponse>) => (request: NextRequest, context?: T) => Promise<NextResponse<unknown>>;
export declare function requireAnyPermission<T = any>(permissions: Permission[]): (handler: (request: NextRequest, user: AuthUser, context?: T) => Promise<NextResponse>) => (request: NextRequest, context?: T) => Promise<NextResponse<unknown>>;
export declare function requireRole<T = any>(role: Role): (handler: (request: NextRequest, user: AuthUser, context?: T) => Promise<NextResponse>) => (request: NextRequest, context?: T) => Promise<NextResponse<unknown>>;
export declare function requireAdmin(): (handler: (request: NextRequest, user: AuthUser, context?: any) => Promise<NextResponse>) => (request: NextRequest, context?: any) => Promise<NextResponse<unknown>>;
export declare function validateWorkspaceAccess(userWorkspaceId: string, requestedWorkspaceId: string): boolean;
