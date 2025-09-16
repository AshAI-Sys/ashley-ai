export type DesignFileType = "AI" | "PSD" | "PNG" | "JPG" | "SVG" | "PDF" | "DST" | "EPS";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "REVISION_REQUESTED" | "CONDITIONALLY_APPROVED";
export type CollaboratorType = "INTERNAL" | "CLIENT" | "EXTERNAL";
export type PermissionLevel = "VIEW" | "COMMENT" | "EDIT" | "APPROVE";
export type MockupType = "FLAT_LAY" | "HANGING" | "MODEL_WEARING" | "3D_RENDER";
export type ValidationStatus = "PENDING" | "VALIDATING" | "PASSED" | "FAILED" | "WARNING";
export interface DesignValidationRule {
    id: string;
    name: string;
    type: "FILE_FORMAT" | "RESOLUTION" | "COLOR_MODE" | "PRINT_SPECS" | "DIMENSION";
    conditions: Record<string, any>;
    severity: "ERROR" | "WARNING" | "INFO";
    errorMessage: string;
    fixSuggestion?: string;
}
export interface FileValidationResult {
    isValid: boolean;
    errors: Array<{
        rule: string;
        message: string;
        severity: "ERROR" | "WARNING" | "INFO";
        suggestion?: string;
    }>;
    metadata: {
        dimensions?: {
            width: number;
            height: number;
        };
        dpi?: number;
        colorMode?: string;
        fileSize: number;
        format: string;
    };
}
export interface MockupGenerationOptions {
    type: MockupType;
    garmentStyle: string;
    garmentColor: string;
    backgroundColor?: string;
    shadowIntensity?: number;
    lightingAngle?: number;
    isClientFacing?: boolean;
    watermarked?: boolean;
    highRes?: boolean;
}
export interface CostBreakdown {
    setupCost: number;
    unitCost: number;
    materialCosts: Record<string, number>;
    laborCosts: Record<string, number>;
    overheadCosts: number;
    margin: number;
    totalCost: number;
}
export interface CollaborationEvent {
    type: "COMMENT_ADDED" | "STATUS_CHANGED" | "FILE_UPLOADED" | "APPROVAL_REQUESTED" | "MOCKUP_GENERATED";
    timestamp: Date;
    userId: string;
    data: Record<string, any>;
}
export interface DesignWorkflowStage {
    id: string;
    name: string;
    description: string;
    requiredRole?: string;
    autoAdvance?: boolean;
    approvalRequired: boolean;
    notificationSettings: {
        onEntry: boolean;
        onApproval: boolean;
        onRejection: boolean;
        reminderInterval?: number;
    };
}
