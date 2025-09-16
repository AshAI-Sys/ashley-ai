import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { PrismaClient } from "@ash-ai/database";
import type { FileValidationResult } from "./types";
declare const FileValidationSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    designVersionId: z.ZodString;
    fileUrl: z.ZodString;
    fileName: z.ZodString;
    fileType: z.ZodEnum<["AI", "PSD", "PNG", "JPG", "SVG", "PDF", "DST", "EPS"]>;
    printMethod: z.ZodEnum<["SILKSCREEN", "DTG", "SUBLIMATION", "EMBROIDERY", "HEAT_TRANSFER"]>;
    validationRules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    workspaceId?: string;
    designVersionId?: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: "AI" | "PSD" | "PNG" | "JPG" | "SVG" | "PDF" | "DST" | "EPS";
    printMethod?: "SILKSCREEN" | "SUBLIMATION" | "EMBROIDERY" | "DTG" | "HEAT_TRANSFER";
    validationRules?: string[];
}, {
    workspaceId?: string;
    designVersionId?: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: "AI" | "PSD" | "PNG" | "JPG" | "SVG" | "PDF" | "DST" | "EPS";
    printMethod?: "SILKSCREEN" | "SUBLIMATION" | "EMBROIDERY" | "DTG" | "HEAT_TRANSFER";
    validationRules?: string[];
}>;
export declare class DesignFileValidationSystem extends EventEmitter {
    private db;
    private validationRules;
    constructor(db: PrismaClient);
    private setupEventHandlers;
    private initializeValidationRules;
    private addValidationRule;
    validateDesignFile(data: z.infer<typeof FileValidationSchema>): Promise<{
        validation: any;
        result: FileValidationResult;
    }>;
    private performValidation;
    private extractFileMetadata;
    private getColorMode;
    private getApplicableRules;
    private applyValidationRule;
    private validateResolution;
    private validateFileFormat;
    private validateColorMode;
    private validateDimensions;
    private validatePrintSpecs;
    getValidationHistory(designVersionId: string): Promise<any>;
    revalidateFile(validationId: string): Promise<{
        validation: any;
        result: FileValidationResult;
    }>;
    private handleValidationStarted;
    private handleValidationCompleted;
    private handleValidationFailed;
}
export {};
