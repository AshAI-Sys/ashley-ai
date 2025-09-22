import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { PrismaClient } from "@ash-ai/database";
import { AshleyAI } from "@ash-ai/ai";
declare const CreateVersionSchema: z.ZodObject<{
    assetId: z.ZodString;
    files: z.ZodObject<{
        mockupUrl: z.ZodOptional<z.ZodString>;
        prodUrl: z.ZodString;
        separations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        dstUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        mockupUrl?: string;
        prodUrl?: string;
        separations?: string[];
        dstUrl?: string;
    }, {
        mockupUrl?: string;
        prodUrl?: string;
        separations?: string[];
        dstUrl?: string;
    }>;
    placements: z.ZodArray<z.ZodObject<{
        area: z.ZodString;
        widthCm: z.ZodNumber;
        heightCm: z.ZodNumber;
        offsetX: z.ZodNumber;
        offsetY: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        area?: string;
        widthCm?: number;
        heightCm?: number;
        offsetX?: number;
        offsetY?: number;
    }, {
        area?: string;
        widthCm?: number;
        heightCm?: number;
        offsetX?: number;
        offsetY?: number;
    }>, "many">;
    palette: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodObject<{
        dpi: z.ZodOptional<z.ZodNumber>;
        colorProfile: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        dpi?: number;
        colorProfile?: string;
        notes?: string;
        tags?: string[];
    }, {
        dpi?: number;
        colorProfile?: string;
        notes?: string;
        tags?: string[];
    }>>;
    createdBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    metadata?: {
        dpi?: number;
        colorProfile?: string;
        notes?: string;
        tags?: string[];
    };
    assetId?: string;
    files?: {
        mockupUrl?: string;
        prodUrl?: string;
        separations?: string[];
        dstUrl?: string;
    };
    placements?: {
        area?: string;
        widthCm?: number;
        heightCm?: number;
        offsetX?: number;
        offsetY?: number;
    }[];
    palette?: string[];
    createdBy?: string;
}, {
    metadata?: {
        dpi?: number;
        colorProfile?: string;
        notes?: string;
        tags?: string[];
    };
    assetId?: string;
    files?: {
        mockupUrl?: string;
        prodUrl?: string;
        separations?: string[];
        dstUrl?: string;
    };
    placements?: {
        area?: string;
        widthCm?: number;
        heightCm?: number;
        offsetX?: number;
        offsetY?: number;
    }[];
    palette?: string[];
    createdBy?: string;
}>;
declare const CompareVersionsSchema: z.ZodObject<{
    assetId: z.ZodString;
    fromVersion: z.ZodNumber;
    toVersion: z.ZodNumber;
    comparisonType: z.ZodDefault<z.ZodEnum<["VISUAL", "METADATA", "PLACEMENT", "FULL"]>>;
}, "strip", z.ZodTypeAny, {
    assetId?: string;
    fromVersion?: number;
    toVersion?: number;
    comparisonType?: "VISUAL" | "METADATA" | "PLACEMENT" | "FULL";
}, {
    assetId?: string;
    fromVersion?: number;
    toVersion?: number;
    comparisonType?: "VISUAL" | "METADATA" | "PLACEMENT" | "FULL";
}>;
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
    visualSimilarity: number;
    ashleyAnalysis?: {
        impactAssessment: string;
        recommendedAction: "APPROVE" | "REVIEW" | "REJECT";
        qualityScore: number;
        riskFactors: string[];
    };
}
export declare class DesignVersionControlSystem extends EventEmitter {
    private db;
    private ashley;
    constructor(db: PrismaClient, ashley: AshleyAI);
    private setupEventHandlers;
    createVersion(data: z.infer<typeof CreateVersionSchema>): Promise<any>;
    compareVersions(data: z.infer<typeof CompareVersionsSchema>): Promise<VersionComparison>;
    getVersionHistory(assetId: string, limit?: number): Promise<any>;
    getVersionAnalytics(assetId: string): Promise<{
        totalVersions: any;
        latestVersion: any;
        creationFrequency: number;
        qualityTrend: string;
        majorChanges: {
            version: any;
            createdAt: any;
            impactLevel: string;
        }[];
        collaboratorActivity: any;
    }>;
    revertToVersion(assetId: string, targetVersion: number, revertedBy: string): Promise<any>;
    createBranch(assetId: string, fromVersion: number, branchName: string, createdBy: string): Promise<{
        branchedAsset: any;
        branchVersion: any;
    }>;
    private analyzeDifferences;
    private comparePlacements;
    private comparePalettes;
    private calculateVisualSimilarity;
    private compareImageStats;
    private calculateCreationFrequency;
    private calculateQualityTrend;
    private identifyMajorChanges;
    private getCollaboratorActivity;
    private handleVersionCreated;
    private handleVersionCompared;
    private handleVersionMerged;
    private handleVersionBranched;
}
export {};
