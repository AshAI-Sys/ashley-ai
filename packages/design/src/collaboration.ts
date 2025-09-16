import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { nanoid } from "nanoid";
import { PrismaClient } from "@ash-ai/database";
import type {
  CollaboratorType,
  PermissionLevel,
  CollaborationEvent
} from "./types";

const CreateCollaborationSchema = z.object({
  workspaceId: z.string(),
  designAssetId: z.string(),
  versionId: z.string(),
  collaboratorId: z.string(),
  collaboratorType: z.enum(["INTERNAL", "CLIENT", "EXTERNAL"]),
  permissionLevel: z.enum(["VIEW", "COMMENT", "EDIT", "APPROVE"]),
  invitedBy: z.string(),
  expiresAt: z.date().optional()
});

const CreateCommentSchema = z.object({
  workspaceId: z.string(),
  designAssetId: z.string(),
  versionId: z.string(),
  commentText: z.string(),
  commentType: z.enum(["GENERAL", "REVISION", "APPROVAL", "TECHNICAL"]),
  coordinates: z.object({
    x: z.number(),
    y: z.number()
  }).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  taggedUsers: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional()
});

export class DesignCollaborationSystem extends EventEmitter {
  constructor(private db: PrismaClient) {
    super();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.on("collaboration:created", this.handleCollaborationCreated.bind(this));
    this.on("comment:added", this.handleCommentAdded.bind(this));
    this.on("comment:resolved", this.handleCommentResolved.bind(this));
    this.on("version:created", this.handleVersionCreated.bind(this));
  }

  async inviteCollaborator(data: z.infer<typeof CreateCollaborationSchema>) {
    const validated = CreateCollaborationSchema.parse(data);

    try {
      // Check if collaboration already exists
      const existing = await this.db.designCollaboration.findFirst({
        where: {
          designAssetId: validated.designAssetId,
          versionId: validated.versionId,
          collaboratorId: validated.collaboratorId
        }
      });

      if (existing) {
        // Update existing collaboration
        const updated = await this.db.designCollaboration.update({
          where: { id: existing.id },
          data: {
            permissionLevel: validated.permissionLevel,
            expiresAt: validated.expiresAt,
            invitedAt: new Date(),
            invitedBy: validated.invitedBy
          },
          include: {
            collaborator: true,
            designAsset: true,
            designVersion: true
          }
        });

        this.emit("collaboration:updated", { collaboration: updated });
        return updated;
      }

      // Create new collaboration
      const collaboration = await this.db.designCollaboration.create({
        data: {
          id: nanoid(),
          workspaceId: validated.workspaceId,
          designAssetId: validated.designAssetId,
          versionId: validated.versionId,
          collaboratorId: validated.collaboratorId,
          collaboratorType: validated.collaboratorType,
          permissionLevel: validated.permissionLevel,
          status: "ACTIVE",
          invitedBy: validated.invitedBy,
          invitedAt: new Date(),
          expiresAt: validated.expiresAt,
          createdAt: new Date()
        },
        include: {
          collaborator: true,
          designAsset: true,
          designVersion: true,
          inviter: true
        }
      });

      this.emit("collaboration:created", { collaboration });
      return collaboration;

    } catch (error) {
      console.error("Failed to invite collaborator:", error);
      throw new Error(`Collaboration invitation failed: ${error.message}`);
    }
  }

  async addComment(data: z.infer<typeof CreateCommentSchema>, authorId: string) {
    const validated = CreateCommentSchema.parse(data);

    try {
      // Check if user has permission to comment
      const hasPermission = await this.checkCommentPermission(
        validated.designAssetId,
        validated.versionId,
        authorId
      );

      if (!hasPermission) {
        throw new Error("Insufficient permissions to add comment");
      }

      const comment = await this.db.designComment.create({
        data: {
          id: nanoid(),
          workspaceId: validated.workspaceId,
          designAssetId: validated.designAssetId,
          versionId: validated.versionId,
          commentText: validated.commentText,
          commentType: validated.commentType,
          priority: validated.priority,
          coordinates: validated.coordinates ? JSON.stringify(validated.coordinates) : null,
          status: "OPEN",
          taggedUsers: validated.taggedUsers ? JSON.stringify(validated.taggedUsers) : null,
          attachmentUrls: validated.attachments ? JSON.stringify(validated.attachments) : null,
          authorId,
          createdAt: new Date()
        },
        include: {
          author: true,
          designAsset: true,
          designVersion: true
        }
      });

      // Create notifications for tagged users
      if (validated.taggedUsers?.length) {
        await this.createCommentNotifications(comment.id, validated.taggedUsers);
      }

      this.emit("comment:added", { 
        comment,
        taggedUsers: validated.taggedUsers || []
      });

      return comment;

    } catch (error) {
      console.error("Failed to add comment:", error);
      throw new Error(`Comment creation failed: ${error.message}`);
    }
  }

  async resolveComment(commentId: string, resolverId: string, resolution?: string) {
    try {
      const comment = await this.db.designComment.update({
        where: { id: commentId },
        data: {
          status: "RESOLVED",
          resolution,
          resolvedBy: resolverId,
          resolvedAt: new Date()
        },
        include: {
          author: true,
          resolver: true,
          designAsset: true
        }
      });

      this.emit("comment:resolved", { comment, resolution });
      return comment;

    } catch (error) {
      console.error("Failed to resolve comment:", error);
      throw error;
    }
  }

  async getDesignCollaborators(designAssetId: string, versionId?: string) {
    const where: any = { designAssetId };
    if (versionId) {
      where.versionId = versionId;
    }

    return await this.db.designCollaboration.findMany({
      where,
      include: {
        collaborator: true,
        inviter: true
      },
      orderBy: { invitedAt: "desc" }
    });
  }

  async getDesignComments(designAssetId: string, versionId?: string) {
    const where: any = { designAssetId };
    if (versionId) {
      where.versionId = versionId;
    }

    return await this.db.designComment.findMany({
      where,
      include: {
        author: true,
        resolver: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getCollaborationActivity(designAssetId: string, limit = 50): Promise<CollaborationEvent[]> {
    // Get recent comments
    const comments = await this.db.designComment.findMany({
      where: { designAssetId },
      include: { author: true },
      orderBy: { createdAt: "desc" },
      take: Math.floor(limit / 2)
    });

    // Get recent collaborations
    const collaborations = await this.db.designCollaboration.findMany({
      where: { designAssetId },
      include: { collaborator: true, inviter: true },
      orderBy: { invitedAt: "desc" },
      take: Math.floor(limit / 2)
    });

    // Convert to unified event format
    const events: CollaborationEvent[] = [
      ...comments.map(comment => ({
        type: "COMMENT_ADDED" as const,
        timestamp: comment.createdAt,
        userId: comment.authorId,
        data: {
          commentId: comment.id,
          commentText: comment.commentText,
          commentType: comment.commentType,
          authorName: comment.author.fullName
        }
      })),
      ...collaborations.map(collab => ({
        type: "STATUS_CHANGED" as const,
        timestamp: collab.invitedAt,
        userId: collab.invitedBy,
        data: {
          collaborationId: collab.id,
          collaboratorName: collab.collaborator.fullName,
          permissionLevel: collab.permissionLevel,
          action: "INVITED"
        }
      }))
    ];

    // Sort by timestamp and limit
    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async updateCollaboratorPermission(
    collaborationId: string,
    newPermissionLevel: PermissionLevel,
    updatedBy: string
  ) {
    try {
      const collaboration = await this.db.designCollaboration.update({
        where: { id: collaborationId },
        data: {
          permissionLevel: newPermissionLevel,
          updatedAt: new Date()
        },
        include: {
          collaborator: true,
          designAsset: true
        }
      });

      this.emit("permission:updated", {
        collaboration,
        newPermission: newPermissionLevel,
        updatedBy
      });

      return collaboration;

    } catch (error) {
      console.error("Failed to update collaborator permission:", error);
      throw error;
    }
  }

  async removeCollaborator(collaborationId: string, removedBy: string) {
    try {
      const collaboration = await this.db.designCollaboration.update({
        where: { id: collaborationId },
        data: {
          status: "INACTIVE",
          updatedAt: new Date()
        },
        include: {
          collaborator: true,
          designAsset: true
        }
      });

      this.emit("collaborator:removed", {
        collaboration,
        removedBy
      });

      return collaboration;

    } catch (error) {
      console.error("Failed to remove collaborator:", error);
      throw error;
    }
  }

  private async checkCommentPermission(
    designAssetId: string,
    versionId: string,
    userId: string
  ): Promise<boolean> {
    // Check if user is a collaborator with comment permission
    const collaboration = await this.db.designCollaboration.findFirst({
      where: {
        designAssetId,
        versionId,
        collaboratorId: userId,
        status: "ACTIVE"
      }
    });

    if (!collaboration) {
      // Check if user is the design creator or has workspace access
      const designAsset = await this.db.designAsset.findUnique({
        where: { id: designAssetId }
      });

      return designAsset?.createdBy === userId;
    }

    return ["COMMENT", "EDIT", "APPROVE"].includes(collaboration.permissionLevel);
  }

  private async createCommentNotifications(commentId: string, userIds: string[]) {
    // TODO: Implement notification system
    // This would integrate with a notification service to send
    // emails, in-app notifications, or webhooks
    console.log(`Creating notifications for comment ${commentId} to users:`, userIds);
  }

  // Event handlers
  private async handleCollaborationCreated(data: any) {
    console.log(`New collaboration created: ${data.collaboration.id}`);
    // TODO: Send invitation email/notification
  }

  private async handleCommentAdded(data: any) {
    console.log(`New comment added: ${data.comment.id}`);
    // TODO: Send notifications to tagged users and other collaborators
  }

  private async handleCommentResolved(data: any) {
    console.log(`Comment resolved: ${data.comment.id}`);
    // TODO: Send resolution notification to comment author
  }

  private async handleVersionCreated(data: any) {
    console.log(`New design version created: ${data.version.id}`);
    // TODO: Notify all collaborators about new version
  }
}