import { NextRequest, NextResponse } from 'next/server';
export interface AuthUser {
    id: string;
    email: string;
    role: string;
    workspaceId: string;
}
export declare function authenticateRequest(request: NextRequest): Promise<AuthUser | null>;
export declare function requireAuth(handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>): (request: NextRequest) => Promise<NextResponse<unknown>>;
export declare function validateWorkspaceAccess(userWorkspaceId: string, requestedWorkspaceId: string): boolean;
