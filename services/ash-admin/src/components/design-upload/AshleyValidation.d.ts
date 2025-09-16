import React from 'react';
interface ValidationIssue {
    code: string;
    message: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    placement_ref?: string;
    suggestion?: string;
}
interface ValidationMetrics {
    min_dpi?: number;
    expected_ink_g?: number;
    stitch_count?: number;
    aop_area_cm2?: number;
    color_count?: number;
    complexity_score?: number;
    estimated_cost?: number;
    production_time?: number;
}
interface ValidationResult {
    status: 'PASS' | 'WARN' | 'FAIL';
    issues: ValidationIssue[];
    metrics: ValidationMetrics;
    confidence: number;
    analysis_time: number;
    recommendations?: string[];
}
interface AshleyValidationProps {
    designId?: string;
    version?: number;
    method: string;
    files: any;
    placements: any[];
    palette: string[];
    onValidationComplete?: (result: ValidationResult) => void;
    className?: string;
}
export default function AshleyValidation({ designId, version, method, files, placements, palette, onValidationComplete, className }: AshleyValidationProps): React.JSX.Element;
export {};
