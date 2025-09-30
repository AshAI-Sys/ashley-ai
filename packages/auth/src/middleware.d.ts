import { NextRequest, NextResponse } from "next/server";
import { UserRole, Permission } from "./types";
export interface RouteConfig {
    path: string;
    roles?: UserRole[];
    permissions?: Permission[];
    requireAuth?: boolean;
}
export declare const PROTECTED_ROUTES: RouteConfig[];
export declare const PUBLIC_ROUTES: string[];
export declare const PROTECTED_API_ROUTES: RouteConfig[];
export declare function authMiddleware(request: NextRequest): Promise<NextResponse<unknown>>;
export declare function requirePermissions(permissions: Permission[]): (userRole: UserRole) => boolean;
export declare function requireRoles(roles: UserRole[]): (userRole: UserRole) => boolean;
export declare function rateLimit(maxRequests?: number, windowMs?: number): (request: NextRequest) => NextResponse | null;
