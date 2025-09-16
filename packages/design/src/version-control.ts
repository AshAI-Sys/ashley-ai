import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { nanoid } from "nanoid";
import { PrismaClient } from "@ash-ai/database";
import { AshleyAI } from "@ash-ai/ai";
import sharp from "sharp";

const CreateVersionSchema = z.object({
  assetId: z.string(),
  files: z.object({
    mockupUrl: z.string().optional(),
    prodUrl: z.string(),
    separations: z.array(z.string()).optional(),
    dstUrl: z.string().optional()
  }),
  placements: z.array(z.object({
    area: z.string(), // FRONT/BACK/LEFT_SLEEVE/etc
    widthCm: z.number(),
    heightCm: z.number(),
    offsetX: z.number(),
    offsetY: z.number()
  })),
  palette: z.array(z.string()).optional(),
  metadata: z.object({
    dpi: z.number().optional(),
    colorProfile: z.string().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional()
  }).optional(),
  createdBy: z.string()
});

const CompareVersionsSchema = z.object({
  assetId: z.string(),
  fromVersion: z.number(),
  toVersion: z.number(),
  comparisonType: z.enum(["VISUAL", "METADATA", "PLACEMENT", "FULL"]).default("VISUAL")
});

export interface VersionDifference {
  type: "FILE_CHANGED" | "PLACEMENT_MODIFIED" | "PALETTE_UPDATED" | "METADATA_CHANGED";
  field: string;
  oldValue: any;
  newValue: any;
  significance: "MINOR" | "MODERATE" | "MAJOR";
  description: string;
}

export interface VersionComparison {
  fromVersion: number;
  toVersion: number;
  differences: VersionDifference[];
  visualSimilarity: number; // 0-1 score
  ashleyAnalysis?: {
    impactAssessment: string;
    recommendedAction: "APPROVE" | "REVIEW" | "REJECT";
    qualityScore: number;
    riskFactors: string[];
  };
}

export class DesignVersionControlSystem extends EventEmitter {
  constructor(
    private db: PrismaClient,
    private ashley: AshleyAI
  ) {
    super();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.on("version:created", this.handleVersionCreated.bind(this));
    this.on("version:compared", this.handleVersionCompared.bind(this));
    this.on("version:merged", this.handleVersionMerged.bind(this));
    this.on("version:branched", this.handleVersionBranched.bind(this));
  }

  async createVersion(data: z.infer<typeof CreateVersionSchema>) {
    const validated = CreateVersionSchema.parse(data);

    try {
      // Get current highest version for this asset
      const currentVersion = await this.db.designVersion.findFirst({
        where: { assetId: validated.assetId },
        orderBy: { version: "desc" }
      });

      const newVersionNumber = (currentVersion?.version || 0) + 1;

      // Generate Ashley AI analysis for the new version
      let ashleyAnalysis;
      try {
        ashleyAnalysis = await this.ashley.analyzeDesignVersion({
          assetId: validated.assetId,
          files: validated.files,
          placements: validated.placements,
          previousVersion: currentVersion?.version
        });
      } catch (error) {
        console.error("Ashley AI analysis failed:", error);
        ashleyAnalysis = null;
      }

      // Create the new version
      const version = await this.db.designVersion.create({
        data: {
          id: nanoid(),
          assetId: validated.assetId,
          version: newVersionNumber,
          files: JSON.stringify(validated.files),
          placements: JSON.stringify(validated.placements),
          palette: validated.palette ? JSON.stringify(validated.palette) : null,
          meta: validated.metadata ? JSON.stringify({
            ...validated.metadata,
            ashleyAnalysis
          }) : JSON.stringify({ ashleyAnalysis }),
          createdBy: validated.createdBy,
          createdAt: new Date()
        },
        include: {
          designAsset: true
        }
      });

      // If this is an improvement over previous version, update asset current version
      if (ashleyAnalysis?.qualityScore && ashleyAnalysis.qualityScore > 0.8) {
        await this.db.designAsset.update({
          where: { id: validated.assetId },
          data: { currentVersion: newVersionNumber }
        });
      }

      this.emit("version:created", { 
        version, 
        ashleyAnalysis,
        isImprovement: ashleyAnalysis?.qualityScore > 0.8 
      });

      return version;

    } catch (error) {
      console.error("Failed to create design version:", error);
      throw new Error(`Version creation failed: ${error.message}`);
    }
  }

  async compareVersions(data: z.infer<typeof CompareVersionsSchema>): Promise<VersionComparison> {
    const validated = CompareVersionsSchema.parse(data);

    try {
      // Get both versions
      const [fromVersion, toVersion] = await Promise.all([
        this.db.designVersion.findFirst({
          where: { assetId: validated.assetId, version: validated.fromVersion }
        }),
        this.db.designVersion.findFirst({
          where: { assetId: validated.assetId, version: validated.toVersion }
        })
      ]);

      if (!fromVersion || !toVersion) {
        throw new Error("One or both versions not found");
      }

      // Parse version data
      const fromData = {
        files: JSON.parse(fromVersion.files),
        placements: JSON.parse(fromVersion.placements),
        palette: fromVersion.palette ? JSON.parse(fromVersion.palette) : [],
        meta: fromVersion.meta ? JSON.parse(fromVersion.meta) : {}
      };

      const toData = {
        files: JSON.parse(toVersion.files),
        placements: JSON.parse(toVersion.placements),
        palette: toVersion.palette ? JSON.parse(toVersion.palette) : [],
        meta: toVersion.meta ? JSON.parse(toVersion.meta) : {}
      };

      // Perform comparison based on type
      const differences = await this.analyzeDifferences(fromData, toData, validated.comparisonType);
      
      // Calculate visual similarity if comparing files
      let visualSimilarity = 1;
      if (validated.comparisonType === "VISUAL" || validated.comparisonType === "FULL") {
        visualSimilarity = await this.calculateVisualSimilarity(
          fromData.files.prodUrl,
          toData.files.prodUrl
        );
      }

      // Get Ashley AI analysis of the changes
      const ashleyAnalysis = await this.ashley.analyzeVersionComparison({
        assetId: validated.assetId,
        fromVersion: validated.fromVersion,
        toVersion: validated.toVersion,
        differences,
        visualSimilarity
      });

      const comparison: VersionComparison = {
        fromVersion: validated.fromVersion,
        toVersion: validated.toVersion,
        differences,
        visualSimilarity,
        ashleyAnalysis
      };

      this.emit("version:compared", { comparison, fromVersion, toVersion });

      return comparison;

    } catch (error) {
      console.error("Failed to compare versions:", error);
      throw new Error(`Version comparison failed: ${error.message}`);
    }
  }

  async getVersionHistory(assetId: string, limit = 20) {
    return await this.db.designVersion.findMany({
      where: { assetId },
      include: {
        designAsset: true
      },
      orderBy: { version: "desc" },
      take: limit
    });
  }

  async getVersionAnalytics(assetId: string) {
    const versions = await this.db.designVersion.findMany({
      where: { assetId },
      orderBy: { version: "asc" }
    });

    if (versions.length === 0) {
      return null;
    }

    // Calculate analytics
    const analytics = {
      totalVersions: versions.length,
      latestVersion: versions[versions.length - 1].version,
      creationFrequency: this.calculateCreationFrequency(versions),
      qualityTrend: this.calculateQualityTrend(versions),
      majorChanges: this.identifyMajorChanges(versions),
      collaboratorActivity: await this.getCollaboratorActivity(assetId)
    };

    return analytics;
  }

  async revertToVersion(assetId: string, targetVersion: number, revertedBy: string) {
    try {
      // Get the target version
      const targetVersionData = await this.db.designVersion.findFirst({
        where: { assetId, version: targetVersion }
      });

      if (!targetVersionData) {
        throw new Error("Target version not found");
      }

      // Create a new version based on the target version
      const newVersion = await this.createVersion({
        assetId,
        files: JSON.parse(targetVersionData.files),
        placements: JSON.parse(targetVersionData.placements),
        palette: targetVersionData.palette ? JSON.parse(targetVersionData.palette) : undefined,
        metadata: {
          ...(targetVersionData.meta ? JSON.parse(targetVersionData.meta) : {}),
          notes: `Reverted to version ${targetVersion}`,
          revertedFrom: targetVersion
        },
        createdBy: revertedBy
      });

      this.emit("version:reverted", {
        assetId,
        targetVersion,
        newVersion: newVersion.version,
        revertedBy
      });

      return newVersion;

    } catch (error) {
      console.error("Failed to revert version:", error);
      throw error;
    }
  }

  async createBranch(
    assetId: string,
    fromVersion: number,
    branchName: string,
    createdBy: string
  ) {
    try {
      // Get the source version
      const sourceVersion = await this.db.designVersion.findFirst({
        where: { assetId, version: fromVersion }
      });

      if (!sourceVersion) {
        throw new Error("Source version not found");
      }

      // Create new asset for the branch
      const originalAsset = await this.db.designAsset.findUnique({
        where: { id: assetId }
      });

      const branchedAsset = await this.db.designAsset.create({
        data: {
          id: nanoid(),
          workspaceId: originalAsset!.workspaceId,
          brandId: originalAsset!.brandId,
          orderId: originalAsset!.orderId,
          name: `${originalAsset!.name} - ${branchName}`,
          method: originalAsset!.method,
          status: "DRAFT",
          currentVersion: 1,
          tags: `${originalAsset!.tags || ""},[BRANCH:${branchName}]`,
          createdBy: createdBy,
          createdAt: new Date()
        }
      });

      // Create initial version in the new branch
      const branchVersion = await this.createVersion({
        assetId: branchedAsset.id,
        files: JSON.parse(sourceVersion.files),
        placements: JSON.parse(sourceVersion.placements),
        palette: sourceVersion.palette ? JSON.parse(sourceVersion.palette) : undefined,
        metadata: {
          ...(sourceVersion.meta ? JSON.parse(sourceVersion.meta) : {}),
          branchedFrom: assetId,
          branchedFromVersion: fromVersion,
          branchName
        },
        createdBy
      });

      this.emit("version:branched", {
        originalAssetId: assetId,
        branchedAssetId: branchedAsset.id,
        sourceVersion: fromVersion,
        branchName,
        createdBy
      });

      return { branchedAsset, branchVersion };

    } catch (error) {
      console.error("Failed to create branch:", error);
      throw error;
    }
  }

  private async analyzeDifferences(
    fromData: any,
    toData: any,
    comparisonType: string
  ): Promise<VersionDifference[]> {
    const differences: VersionDifference[] = [];

    // File changes
    if (comparisonType === "VISUAL" || comparisonType === "FULL") {
      if (fromData.files.prodUrl !== toData.files.prodUrl) {
        differences.push({
          type: "FILE_CHANGED",
          field: "prodUrl",
          oldValue: fromData.files.prodUrl,
          newValue: toData.files.prodUrl,
          significance: "MAJOR",
          description: "Production file has been changed"
        });
      }
    }

    // Placement changes
    if (comparisonType === "PLACEMENT" || comparisonType === "FULL") {
      const placementChanges = this.comparePlacements(fromData.placements, toData.placements);
      differences.push(...placementChanges);
    }

    // Palette changes
    if (comparisonType === "FULL") {
      const paletteChanges = this.comparePalettes(fromData.palette, toData.palette);
      differences.push(...paletteChanges);
    }

    return differences;
  }

  private comparePlacements(fromPlacements: any[], toPlacements: any[]): VersionDifference[] {
    const differences: VersionDifference[] = [];
    
    // Simple comparison - in reality would be more sophisticated
    if (fromPlacements.length !== toPlacements.length) {
      differences.push({
        type: "PLACEMENT_MODIFIED",
        field: "count",
        oldValue: fromPlacements.length,
        newValue: toPlacements.length,
        significance: "MODERATE",
        description: "Number of design placements changed"
      });
    }

    return differences;
  }

  private comparePalettes(fromPalette: string[], toPalette: string[]): VersionDifference[] {
    const differences: VersionDifference[] = [];
    
    const fromSet = new Set(fromPalette);
    const toSet = new Set(toPalette);
    
    const added = [...toSet].filter(color => !fromSet.has(color));
    const removed = [...fromSet].filter(color => !toSet.has(color));

    if (added.length || removed.length) {
      differences.push({
        type: "PALETTE_UPDATED",
        field: "colors",
        oldValue: fromPalette,
        newValue: toPalette,
        significance: "MODERATE",
        description: `Palette changed: ${added.length} added, ${removed.length} removed`
      });
    }

    return differences;
  }

  private async calculateVisualSimilarity(url1: string, url2: string): Promise<number> {
    try {
      // This is a simplified implementation
      // In reality, you'd use more sophisticated computer vision techniques
      const [response1, response2] = await Promise.all([
        fetch(url1),
        fetch(url2)
      ]);

      const [buffer1, buffer2] = await Promise.all([
        Buffer.from(await response1.arrayBuffer()),
        Buffer.from(await response2.arrayBuffer())
      ]);

      // Simple similarity check based on file size and basic image metrics
      const [info1, info2] = await Promise.all([
        sharp(buffer1).stats(),
        sharp(buffer2).stats()
      ]);

      // Calculate similarity based on statistical properties
      const similarity = this.compareImageStats(info1, info2);
      return Math.max(0, Math.min(1, similarity));

    } catch (error) {
      console.error("Failed to calculate visual similarity:", error);
      return 0.5; // Default neutral similarity
    }
  }

  private compareImageStats(stats1: any, stats2: any): number {
    // Simplified statistical comparison
    // In reality, would use perceptual hashing or feature detection
    const channels1 = stats1.channels;
    const channels2 = stats2.channels;
    
    let totalSimilarity = 0;
    let channelCount = 0;

    for (let i = 0; i < Math.min(channels1.length, channels2.length); i++) {
      const channel1 = channels1[i];
      const channel2 = channels2[i];
      
      const meanSimilarity = 1 - Math.abs(channel1.mean - channel2.mean) / 255;
      const stdSimilarity = 1 - Math.abs(channel1.std - channel2.std) / 255;
      
      totalSimilarity += (meanSimilarity + stdSimilarity) / 2;
      channelCount++;
    }

    return channelCount > 0 ? totalSimilarity / channelCount : 0;
  }

  private calculateCreationFrequency(versions: any[]) {
    if (versions.length < 2) return 0;

    const first = new Date(versions[0].createdAt);
    const last = new Date(versions[versions.length - 1].createdAt);
    const daysDiff = (last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24);
    
    return versions.length / Math.max(daysDiff, 1);
  }

  private calculateQualityTrend(versions: any[]) {
    const qualityScores = versions
      .map(v => {
        const meta = v.meta ? JSON.parse(v.meta) : {};
        return meta.ashleyAnalysis?.qualityScore || 0.5;
      })
      .filter(score => score > 0);

    if (qualityScores.length < 2) return "STABLE";

    const firstHalf = qualityScores.slice(0, Math.floor(qualityScores.length / 2));
    const secondHalf = qualityScores.slice(Math.floor(qualityScores.length / 2));

    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const improvement = avgSecond - avgFirst;

    if (improvement > 0.1) return "IMPROVING";
    if (improvement < -0.1) return "DECLINING";
    return "STABLE";
  }

  private identifyMajorChanges(versions: any[]) {
    // Identify versions with significant changes
    return versions
      .filter((version, index) => {
        if (index === 0) return false;
        
        const meta = version.meta ? JSON.parse(version.meta) : {};
        return meta.ashleyAnalysis?.impactLevel === "MAJOR";
      })
      .map(v => ({
        version: v.version,
        createdAt: v.createdAt,
        impactLevel: "MAJOR"
      }));
  }

  private async getCollaboratorActivity(assetId: string) {
    const collaborations = await this.db.designCollaboration.findMany({
      where: { designAssetId: assetId },
      include: { collaborator: true },
      orderBy: { invitedAt: "desc" }
    });

    return collaborations.map(c => ({
      collaboratorId: c.collaboratorId,
      collaboratorName: c.collaborator.fullName,
      permissionLevel: c.permissionLevel,
      lastActivity: c.invitedAt
    }));
  }

  // Event handlers
  private async handleVersionCreated(data: any) {
    console.log(`New design version created: ${data.version.id}`);
  }

  private async handleVersionCompared(data: any) {
    console.log(`Design versions compared: ${data.comparison.fromVersion} vs ${data.comparison.toVersion}`);
  }

  private async handleVersionMerged(data: any) {
    console.log(`Design versions merged: ${data.sourceVersion} → ${data.targetVersion}`);
  }

  private async handleVersionBranched(data: any) {
    console.log(`Design branch created: ${data.branchName}`);
  }
}