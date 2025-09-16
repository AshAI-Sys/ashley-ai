import { db } from "./client";
import type { WithWorkspaceId, AshleyAnalysis } from "./types";
export declare function withWorkspace(workspaceId: string): {
    where: {
        workspace_id: string;
        deleted_at: any;
    };
};
export declare function createWithWorkspace<T extends Record<string, unknown>>(workspaceId: string, data: T): WithWorkspaceId<T>;
export declare function logAudit({ workspaceId, userId, action, resource, resourceId, oldValues, newValues, ipAddress, userAgent, }: {
    workspaceId: string;
    userId?: string;
    action: string;
    resource: string;
    resourceId: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}): Promise<void>;
export declare function generatePONumber(brandId: string): Promise<string>;
export declare function generateBundleQR(bundleId: string): string;
export declare function parseAshleyAnalysis(jsonString: string | null): AshleyAnalysis | null;
export declare function serializeAshleyAnalysis(analysis: AshleyAnalysis): string;
export declare function softDelete(model: keyof typeof db, id: string, workspaceId: string, userId?: string): Promise<any>;
export declare function parseJsonField<T>(jsonString: string | null): T | null;
export declare function stringifyJsonField<T>(data: T): string;
export declare function withTransaction<T>(callback: (tx: typeof db) => Promise<T>): Promise<T>;
