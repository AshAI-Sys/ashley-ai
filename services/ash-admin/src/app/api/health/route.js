"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const error_handling_1 = require("../../../lib/error-handling");
// Simple health check endpoint to test error handling system
exports.GET = (0, error_handling_1.withErrorHandling)(async (request) => {
    const { searchParams } = new URL(request.url);
    const test = searchParams.get("test");
    const seed = searchParams.get("seed");
    // Database seeding - Disabled in production
    // Use 'pnpm init-db' script for production database initialization
    if (seed === "ashley-ai-2024" && process.env.NODE_ENV !== "production") {
        return (0, error_handling_1.createSuccessResponse)({
            message: "Database seeding disabled - Use production initialization script",
            instructions: "Run: cd services/ash-admin && pnpm init-db",
            documentation: "See PRODUCTION-SETUP.md for details",
        });
    }
    // Test different error scenarios
    if (test === "validation") {
        throw new error_handling_1.ValidationError("This is a test validation error", "test_field", {
            providedValue: test,
            expectedFormat: "none",
        });
    }
    return (0, error_handling_1.createSuccessResponse)({
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        message: "Ashley AI API is running successfully",
    });
});
exports.POST = (0, error_handling_1.withErrorHandling)(async (request) => {
    const body = await request.json();
    return (0, error_handling_1.createSuccessResponse)({
        status: "echo",
        receivedData: body,
        timestamp: new Date().toISOString(),
    });
});
