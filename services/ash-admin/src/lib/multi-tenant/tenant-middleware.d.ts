import { NextRequest, NextResponse } from "next/server";
export interface TenantContext {
    workspace_id: string;
    workspace_slug: string;
    user_id?: string;
    user_role?: string;
}
export declare function extractWorkspaceIdentifier(req: NextRequest): string | null;
export declare function validateTenantMiddleware(req: NextRequest, workspace_id?: string, user_id?: string): Promise<NextResponse | null>;
export declare function addTenantContext(req: NextRequest, context: TenantContext): void;
export declare function getTenantContext(req: NextRequest): TenantContext | null;
export declare function createTenantFilter(workspace_id: string): {
    workspace_id: string;
};
export declare function requireFeature(workspace_id: string, feature: string): Promise<{
    allowed: boolean;
    error?: string;
}>;
export declare function checkTenantLimits(workspace_id: string, operation: "CREATE_USER" | "CREATE_ORDER" | "UPLOAD_FILE", size_gb?: number): Promise<{
    allowed: boolean;
    error?: string;
}>;
export declare function getTenantPrismaClient(workspace_id: string): any;
