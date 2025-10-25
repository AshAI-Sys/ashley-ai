interface DefectImage {
    url: string;
    base64?: string;
    width?: number;
    height?: number;
}
interface DefectDetectionResult {
    defects_found: number;
    confidence: number;
    detected_defects: Array<{
        type: string;
        severity: "MINOR" | "MAJOR" | "CRITICAL";
        confidence: number;
        location?: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        description: string;
        recommendation: string;
    }>;
    quality_score: number;
    pass_fail: "PASS" | "FAIL";
    analysis_time_ms: number;
    model_version: string;
}
interface PatternAnalysis {
    pattern_type: string;
    defect_rate: number;
    common_defects: Array<{
        type: string;
        frequency: number;
        avg_severity: number;
    }>;
    root_causes: string[];
    prevention_tips: string[];
}
export declare class DefectDetectionAI {
    private modelVersion;
    detectDefects(image: DefectImage, garmentType?: string): Promise<DefectDetectionResult>;
    detectDefectsBatch(images: DefectImage[], garmentType?: string): Promise<DefectDetectionResult[]>;
    private analyzeImage;
    private generateDefect;
    private generateDefectDescription;
    private generateRecommendation;
    private calculateQualityScore;
    analyzeDefectPatterns(inspections: Array<{
        date: Date;
        operator_id?: string;
        station?: string;
        defects: DefectDetectionResult["detected_defects"];
    }>): Promise<PatternAnalysis>;
    private identifyRootCauses;
    private generatePreventionTips;
    compareQuality(data: Array<{
        entity_id: string;
        entity_name: string;
        inspections: DefectDetectionResult[];
    }>): Promise<Array<{
        entity_id: string;
        entity_name: string;
        avg_quality_score: number;
        defect_rate: number;
        critical_defects: number;
        ranking: number;
    }>>;
}
export declare const defectDetectionAI: DefectDetectionAI;
export {};
