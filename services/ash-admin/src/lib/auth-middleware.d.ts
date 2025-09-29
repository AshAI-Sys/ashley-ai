import { NextRequest, NextResponse } from 'next/server';
import { Permission, Role } from './rbac';
export interface AuthUser {
    id: string;
    email: string;
    role: Role;
    workspaceId: string;
    permissions: Permission[];
}
export declare function authenticateRequest(request: NextRequest): Promise<AuthUser | null>;
export declare function requireAuth(handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>): (request: NextRequest) => Promise<NextResponse<unknown>>;
export declare function requirePermission(permission: Permission): (handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) => (request: NextRequest) => Promise<NextResponse<unknown>>;
export declare function requireAnyPermission(permissions: Permission[]): (handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) => (request: NextRequest) => Promise<NextResponse<unknown>>;
export declare function requireRole(role: Role): (handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) => (request: NextRequest) => Promise<NextResponse<unknown>>;
export declare function requireAdmin(): (handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) => (request: NextRequest) => Promise<NextResponse<unknown>>;
export declare function validateWorkspaceAccess(userWorkspaceId: string, requestedWorkspaceId: string): boolean;
