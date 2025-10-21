import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { PrismaClient } from "@ash-ai/database";
import type { PermissionLevel, CollaborationEvent } from "./types";
declare const CreateCollaborationSchema: z.ZodObject<
  {
    workspaceId: z.ZodString;
    designAssetId: z.ZodString;
    versionId: z.ZodString;
    collaboratorId: z.ZodString;
    collaboratorType: z.ZodEnum<["INTERNAL", "CLIENT", "EXTERNAL"]>;
    permissionLevel: z.ZodEnum<["VIEW", "COMMENT", "EDIT", "APPROVE"]>;
    invitedBy: z.ZodString;
    expiresAt: z.ZodOptional<z.ZodDate>;
  },
  "strip",
  z.ZodTypeAny,
  {
    workspaceId?: string;
    designAssetId?: string;
    versionId?: string;
    collaboratorId?: string;
    collaboratorType?: "CLIENT" | "INTERNAL" | "EXTERNAL";
    permissionLevel?: "VIEW" | "COMMENT" | "EDIT" | "APPROVE";
    invitedBy?: string;
    expiresAt?: Date;
  },
  {
    workspaceId?: string;
    designAssetId?: string;
    versionId?: string;
    collaboratorId?: string;
    collaboratorType?: "CLIENT" | "INTERNAL" | "EXTERNAL";
    permissionLevel?: "VIEW" | "COMMENT" | "EDIT" | "APPROVE";
    invitedBy?: string;
    expiresAt?: Date;
  }
>;
declare const CreateCommentSchema: z.ZodObject<
  {
    workspaceId: z.ZodString;
    designAssetId: z.ZodString;
    versionId: z.ZodString;
    commentText: z.ZodString;
    commentType: z.ZodEnum<["GENERAL", "REVISION", "APPROVAL", "TECHNICAL"]>;
    coordinates: z.ZodOptional<
      z.ZodObject<
        {
          x: z.ZodNumber;
          y: z.ZodNumber;
        },
        "strip",
        z.ZodTypeAny,
        {
          y?: number;
          x?: number;
        },
        {
          y?: number;
          x?: number;
        }
      >
    >;
    priority: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH"]>>;
    taggedUsers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
  },
  "strip",
  z.ZodTypeAny,
  {
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
  },
  {
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
  }
>;
export declare class DesignCollaborationSystem extends EventEmitter {
  private db;
  constructor(db: PrismaClient);
  private setupEventHandlers;
  inviteCollaborator(data: z.infer<typeof CreateCollaborationSchema>): Promise<{
    id: string;
    workspace_id: string;
    is_active: boolean;
    design_asset_id: string;
    version_id: string;
    collaborator_id: string;
    collaborator_type: string;
    permission_level: string;
    invited_by: string;
    invited_at: Date;
    accepted_at: Date | null;
    last_accessed: Date | null;
  }>;
  addComment(
    data: z.infer<typeof CreateCommentSchema>,
    authorId: string
  ): Promise<{
    id: string;
    workspace_id: string;
    created_at: Date;
    updated_at: Date;
    status: string;
    created_by: string;
    priority: string;
    attachments: string | null;
    design_asset_id: string;
    version_id: string;
    comment_text: string;
    comment_type: string;
    position_x: number | null;
    position_y: number | null;
    annotation_area: string | null;
    mentioned_users: string | null;
    ashley_analysis: string | null;
    resolved_at: Date | null;
    collaboration_id: string | null;
    parent_comment_id: string | null;
    resolved_by: string | null;
  }>;
  resolveComment(
    commentId: string,
    resolverId: string,
    resolution?: string
  ): Promise<{
    id: string;
    workspace_id: string;
    created_at: Date;
    updated_at: Date;
    status: string;
    created_by: string;
    priority: string;
    attachments: string | null;
    design_asset_id: string;
    version_id: string;
    comment_text: string;
    comment_type: string;
    position_x: number | null;
    position_y: number | null;
    annotation_area: string | null;
    mentioned_users: string | null;
    ashley_analysis: string | null;
    resolved_at: Date | null;
    collaboration_id: string | null;
    parent_comment_id: string | null;
    resolved_by: string | null;
  }>;
  getDesignCollaborators(
    designAssetId: string,
    versionId?: string
  ): Promise<
    {
      id: string;
      workspace_id: string;
      is_active: boolean;
      design_asset_id: string;
      version_id: string;
      collaborator_id: string;
      collaborator_type: string;
      permission_level: string;
      invited_by: string;
      invited_at: Date;
      accepted_at: Date | null;
      last_accessed: Date | null;
    }[]
  >;
  getDesignComments(
    designAssetId: string,
    versionId?: string
  ): Promise<
    {
      id: string;
      workspace_id: string;
      created_at: Date;
      updated_at: Date;
      status: string;
      created_by: string;
      priority: string;
      attachments: string | null;
      design_asset_id: string;
      version_id: string;
      comment_text: string;
      comment_type: string;
      position_x: number | null;
      position_y: number | null;
      annotation_area: string | null;
      mentioned_users: string | null;
      ashley_analysis: string | null;
      resolved_at: Date | null;
      collaboration_id: string | null;
      parent_comment_id: string | null;
      resolved_by: string | null;
    }[]
  >;
  getCollaborationActivity(
    designAssetId: string,
    limit?: number
  ): Promise<CollaborationEvent[]>;
  updateCollaboratorPermission(
    collaborationId: string,
    newPermissionLevel: PermissionLevel,
    updatedBy: string
  ): Promise<{
    id: string;
    workspace_id: string;
    is_active: boolean;
    design_asset_id: string;
    version_id: string;
    collaborator_id: string;
    collaborator_type: string;
    permission_level: string;
    invited_by: string;
    invited_at: Date;
    accepted_at: Date | null;
    last_accessed: Date | null;
  }>;
  removeCollaborator(
    collaborationId: string,
    removedBy: string
  ): Promise<{
    id: string;
    workspace_id: string;
    is_active: boolean;
    design_asset_id: string;
    version_id: string;
    collaborator_id: string;
    collaborator_type: string;
    permission_level: string;
    invited_by: string;
    invited_at: Date;
    accepted_at: Date | null;
    last_accessed: Date | null;
  }>;
  private checkCommentPermission;
  private createCommentNotifications;
  private handleCollaborationCreated;
  private handleCommentAdded;
  private handleCommentResolved;
  private handleVersionCreated;
}
export {};
