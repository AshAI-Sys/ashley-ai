import { NextResponse } from 'next/server';
export declare function validateRequired(value: any, fieldName: string): string | null;
export declare function validateUUID(value: string, fieldName: string): string | null;
export declare function validateNumber(value: string, fieldName: string, min?: number, max?: number): string | null;
export declare function validateEnum(value: string, allowedValues: string[], fieldName: string): string | null;
export declare function sanitizeInput(input: any): any;
export declare function validateAndSanitizeMarketTrendData(data: any): {
    isValid: boolean;
    errors: string[];
    sanitizedData?: any;
};
export declare function createValidationErrorResponse(errors: string[]): NextResponse;
