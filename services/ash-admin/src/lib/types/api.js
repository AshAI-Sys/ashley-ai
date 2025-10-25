"use strict";
/**
 * Shared TypeScript Types for API Responses
 *
 * This file contains all shared types used across the application for API responses,
 * requests, and data structures. This ensures type safety and consistency.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isApiSuccess = isApiSuccess;
exports.isApiError = isApiError;
exports.isPaginatedResponse = isPaginatedResponse;
/**
 * Type guard for successful API response
 */
function isApiSuccess(response) {
    return response.success === true;
}
/**
 * Type guard for error API response
 */
function isApiError(response) {
    return response.success === false;
}
/**
 * Type guard for paginated response
 */
function isPaginatedResponse(data) {
    return (data &&
        typeof data === "object" &&
        "items" in data &&
        "pagination" in data &&
        Array.isArray(data.items));
}
