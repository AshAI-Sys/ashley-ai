/* eslint-disable */
import { NextRequest } from "next/server";
import {
  createSuccessResponse,
  ValidationError,
  withErrorHandling,
} from "../../../lib/error-handling";
import { prisma as _db } from "../../../lib/db";
// Unused import removed: requireAuth

// Simple health check endpoint to test error handling system
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const test = searchParams.get("test");
  const seed = searchParams.get("seed");

  // Database seeding - Disabled in production
  // Use 'pnpm init-db' script for production database initialization
  if (seed === "ashley-ai-2024" && process.env.NODE_ENV !== "production") {
    
    return createSuccessResponse({
      message:
        "Database seeding disabled - Use production initialization script",
      instructions: "Run: cd services/ash-admin && pnpm init-db",
      documentation: "See PRODUCTION-SETUP.md for details",
    });
  }

  // Test different error scenarios
  if (test === "validation") {
    throw new ValidationError("This is a test validation error", "test_field", {
      providedValue: test,
      expectedFormat: "none",
    });
  }

  return createSuccessResponse({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    message: "Ashley AI API is running successfully",
  });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();

  return createSuccessResponse({
    status: "echo",
    receivedData: body,
    timestamp: new Date().toISOString(),
  });
});
