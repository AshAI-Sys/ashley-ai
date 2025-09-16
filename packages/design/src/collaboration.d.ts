import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { PrismaClient } from "@ash-ai/database";
import type { PermissionLevel, CollaborationEvent } from "./types";
declare const CreateCollaborationSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    designAssetId: z.ZodString;
    versionId: z.ZodString;
    collaboratorId: z.ZodString;
    collaboratorType: z.ZodEnum<["INTERNAL", "CLIENT", "EXTERNAL"]>;
    permissionLevel: z.ZodEnum<["VIEW", "COMMENT", "EDIT", "APPROVE"]>;
    invitedBy: z.ZodString;
    expiresAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    workspaceId?: string;
    designAssetId?: string;
    versionId?: string;
    collaboratorId?: string;
    collaboratorType?: "CLIENT" | "INTERNAL" | "EXTERNAL";
    permissionLevel?: "VIEW" | "COMMENT" | "EDIT" | "APPROVE";
    invitedBy?: string;
    expiresAt?: Date;
}, {
    workspaceId?: string;
    designAssetId?: string;
    versionId?: string;
    collaboratorId?: string;
    collaboratorType?: "CLIENT" | "INTERNAL" | "EXTERNAL";
    permissionLevel?: "VIEW" | "COMMENT" | "EDIT" | "APPROVE";
    invitedBy?: string;
    expiresAt?: Date;
}>;
declare const CreateCommentSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    designAssetId: z.ZodString;
    versionId: z.ZodString;
    commentText: z.ZodString;
    commentType: z.ZodEnum<["GENERAL", "REVISION", "APPROVAL", "TECHNICAL"]>;
    coordinates: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        y?: number;
        x?: number;
    }, {
        y?: number;
        x?: number;
    }>>;
    priority: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH"]>>;
    taggedUsers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    workspaceId?: string;
    designAssetId?: string;
    versionId?: string;
    commentText?: string;
    commentType?: "GENERAL" | "REVISION" | "APPROVAL" | "TECHNICAL";
    coordinates?: {
        y?: number;
        x?: number;
    };
    priority?: "LOW" | "MEDIUM" | "HIGH";
    taggedUsers?: string[];
    attachments?: string[];
}, {
    workspaceId?: string;
    designAssetId?: string;
    versionId?: string;
    commentText?: string;
    commentType?: "GENERAL" | "REVISION" | "APPROVAL" | "TECHNICAL";
    coordinates?: {
        y?: number;
        x?: number;
    };
    priority?: "LOW" | "MEDIUM" | "HIGH";
    taggedUsers?: string[];
    attachments?: string[];
}>;
export declare class DesignCollaborationSystem extends EventEmitter {
    private db;
    constructor(db: PrismaClient);
    private setupEventHandlers;
    inviteCollaborator(data: z.infer<typeof CreateCollaborationSchema>): Promise<any>;
    addComment(data: z.infer<typeof CreateCommentSchema>, authorId: string): Promise<any>;
    resolveComment(commentId: string, resolverId: string, resolution?: string): Promise<any>;
    getDesignCollaborators(designAssetId: string, versionId?: string): Promise<any>;
    getDesignComments(designAssetId: string, versionId?: string): Promise<any>;
    getCollaborationActivity(designAssetId: string, limit?: number): Promise<CollaborationEvent[]>;
    updateCollaboratorPermission(collaborationId: string, newPermissionLevel: PermissionLevel, updatedBy: string): Promise<any>;
    removeCollaborator(collaborationId: string, removedBy: string): Promise<any>;
    private checkCommentPermission;
    private createCommentNotifications;
    private handleCollaborationCreated;
    private handleCommentAdded;
    private handleCommentResolved;
    private handleVersionCreated;
}
export {};
