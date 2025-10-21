import { EventEmitter } from "eventemitter3";
import type {
  QCInspection,
  QCCriteriaResult,
  QCDefect,
  QCStage,
} from "./types";
export interface PhotoAnalysisResult {
  defectsDetected: Array<{
    type: string;
    confidence: number;
    location: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description: string;
  }>;
  qualityScore: number;
  overallAssessment: "PASS" | "FAIL" | "REVIEW_REQUIRED";
  analysisMetadata: {
    processingTime: number;
    modelVersion: string;
    imageQuality: number;
  };
}
export interface InspectionRequest {
  orderId: string;
  inspectionPointId: string;
  inspectorId: string;
  bundleId?: string;
  batchNumber?: string;
  sampleSize: number;
  photos?: string[];
  notes?: string;
}
export declare class QualityInspectionSystem extends EventEmitter {
  private workspaceId;
  private userId;
  constructor(workspaceId: string, userId: string);
  createInspection(request: InspectionRequest): Promise<QCInspection>;
  completeInspection(
    inspectionId: string,
    results: {
      criteriaResults: QCCriteriaResult[];
      defects: Omit<QCDefect, "id" | "inspectionId">[];
      passQuantity: number;
      failQuantity: number;
      reworkQuantity: number;
      inspectionTime: number;
      notes?: string;
    }
  ): Promise<QCInspection>;
  performPhotoAnalysis(photoUrls: string[]): Promise<PhotoAnalysisResult>;
  getInspectionsByOrder(orderId: string): Promise<QCInspection[]>;
  getQualityTrends(
    startDate: Date,
    endDate: Date,
    filters?: {
      productionLineId?: string;
      stage?: QCStage;
      clientId?: string;
    }
  ): Promise<{
    overallQuality: Array<{
      date: string;
      score: number;
      inspections: number;
    }>;
    defectTrends: Array<{
      date: string;
      defectType: string;
      count: number;
    }>;
    passRates: Array<{
      date: string;
      passRate: number;
      totalInspected: number;
    }>;
  }>;
  private performAIAnalysis;
  private analyzeIndividualPhoto;
  private applyAIFindingsToCriteria;
  private calculateOverallScore;
  private determineInspectionStatus;
  private checkForQualityAlerts;
  private autoGenerateCAPA;
  private getInspectionById;
  private mapDatabaseToInspection;
}
