"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPaginatedResponse = exports.isApiError = exports.isApiSuccess = void 0;
exports.apiSuccess = apiSuccess;
exports.apiError = apiError;
exports.apiSuccessPaginated = apiSuccessPaginated;
exports.apiCreated = apiCreated;
exports.apiNoContent = apiNoContent;
exports.apiNotFound = apiNotFound;
exports.apiUnauthorized = apiUnauthorized;
exports.apiForbidden = apiForbidden;
exports.apiValidationError = apiValidationError;
exports.apiServerError = apiServerError;
const server_1 = require("next/server");
// Re-export type guards
var api_1 = require("./types/api");
Object.defineProperty(exports, "isApiSuccess", { enumerable: true, get: function () { return api_1.isApiSuccess; } });
Object.defineProperty(exports, "isApiError", { enumerable: true, get: function () { return api_1.isApiError; } });
Object.defineProperty(exports, "isPaginatedResponse", { enumerable: true, get: function () { return api_1.isPaginatedResponse; } });
/**
 * Success Response - Standard format
 */
function apiSuccess(data, message, status = 200) {
    return server_1.NextResponse.json({
        success: true,
        data,
        ...(message && { message }),
    }, { status });
}
/**
 * Error Response - Standard format
 */
function apiError(error, details, status = 400) {
    return server_1.NextResponse.json({
        success: false,
        error,
        ...(details && { details }),
    }, { status });
}
/**
 * Paginated Response - Standard format
 */
function apiSuccessPaginated(items, page, limit, total, message) {
    const totalPages = Math.ceil(total / limit);
    return apiSuccess({
        items,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasMore: page < totalPages,
        },
    }, message, 200);
}
/**
 * Created Response (201) - For POST endpoints
 */
function apiCreated(data, message = "Resource created successfully") {
    return apiSuccess(data, message, 201);
}
/**
 * No Content Response (204) - For DELETE endpoints
 */
function apiNoContent() {
    return new server_1.NextResponse(null, { status: 204 });
}
/**
 * Not Found Response (404)
 */
function apiNotFound(resource = "Resource") {
    return apiError(`${resource} not found`, undefined, 404);
}
/**
 * Unauthorized Response (401)
 */
function apiUnauthorized(message = "Unauthorized") {
    return apiError(message, undefined, 401);
}
/**
 * Forbidden Response (403)
 */
function apiForbidden(message = "Forbidden") {
    return apiError(message, undefined, 403);
}
/**
 * Validation Error Response (422)
 */
function apiValidationError(errors) {
    return apiError("Validation failed", errors, 422);
}
/**
 * Internal Server Error Response (500)
 */
function apiServerError(error) {
    console.error("Server Error:", error);
    return apiError("Internal server error", process.env.NODE_ENV === "development" ? error : undefined, 500);
}
