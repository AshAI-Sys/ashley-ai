"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequired = validateRequired;
exports.validateUUID = validateUUID;
exports.validateNumber = validateNumber;
exports.validateEnum = validateEnum;
exports.sanitizeInput = sanitizeInput;
exports.validateAndSanitizeMarketTrendData = validateAndSanitizeMarketTrendData;
exports.createValidationErrorResponse = createValidationErrorResponse;
const server_1 = require("next/server");
function validateRequired(value, fieldName) {
    if (!value || (typeof value === "string" && value.trim() === "")) {
        return `${fieldName} is required`;
    }
    return null;
}
function validateUUID(value, fieldName) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
        return `${fieldName} must be a valid UUID`;
    }
    return null;
}
function validateNumber(value, fieldName, min, max) {
    const num = parseInt(value);
    if (isNaN(num)) {
        return `${fieldName} must be a valid number`;
    }
    if (min !== undefined && num < min) {
        return `${fieldName} must be at least ${min}`;
    }
    if (max !== undefined && num > max) {
        return `${fieldName} must be at most ${max}`;
    }
    return null;
}
function validateEnum(value, allowedValues, fieldName) {
    if (!allowedValues.includes(value)) {
        return `${fieldName} must be one of: ${allowedValues.join(", ")}`;
    }
    return null;
}
function sanitizeInput(input) {
    if (typeof input === "string") {
        // Remove potentially dangerous characters
        return input.replace(/[<>\"']/g, "").trim();
    }
    if (typeof input === "object" && input !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(input)) {
            sanitized[key] = sanitizeInput(value);
        }
        return sanitized;
    }
    return input;
}
function validateAndSanitizeMarketTrendData(data) {
    const errors = [];
    // Required fields
    const requiredFields = [
        "trend_name",
        "trend_category",
        "trend_type",
        "confidence_score",
        "impact_score",
    ];
    for (const field of requiredFields) {
        const error = validateRequired(data[field], field);
        if (error)
            errors.push(error);
    }
    // Validate enums
    const validCategories = ["SEASONAL", "COLOR", "STYLE", "MATERIAL"];
    if (data.trend_category &&
        validateEnum(data.trend_category, validCategories, "trend_category")) {
        errors.push(validateEnum(data.trend_category, validCategories, "trend_category"));
    }
    const validTypes = ["PEAK", "EMERGING", "DECLINING"];
    if (data.trend_type &&
        validateEnum(data.trend_type, validTypes, "trend_type")) {
        errors.push(validateEnum(data.trend_type, validTypes, "trend_type"));
    }
    // Validate score ranges
    if (data.confidence_score &&
        (data.confidence_score < 0 || data.confidence_score > 1)) {
        errors.push("confidence_score must be between 0 and 1");
    }
    if (data.impact_score && (data.impact_score < 0 || data.impact_score > 1)) {
        errors.push("impact_score must be between 0 and 1");
    }
    // Sanitize all string inputs
    const sanitizedData = sanitizeInput(data);
    // Remove any dangerous fields that shouldn't be set by users
    const allowedFields = [
        "trend_name",
        "trend_category",
        "trend_type",
        "product_categories",
        "geographic_scope",
        "confidence_score",
        "impact_score",
        "adoption_rate",
        "peak_period_start",
        "peak_period_end",
        "data_sources",
        "keywords",
        "color_palette",
        "style_attributes",
        "target_demographics",
        "opportunity_score",
    ];
    const cleanData = {};
    for (const field of allowedFields) {
        if (sanitizedData[field] !== undefined) {
            cleanData[field] = sanitizedData[field];
        }
    }
    return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: cleanData,
    };
}
function createValidationErrorResponse(errors) {
    return server_1.NextResponse.json({
        error: "Validation failed",
        details: errors,
    }, { status: 400 });
}
