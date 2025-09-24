"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const db_1 = require("@/lib/db");
const error_handling_1 = require("../../../lib/error-handling");
// Test database connection and Prisma client singleton
exports.GET = (0, error_handling_1.withErrorHandling)(async (request) => {
    try {
        // Test basic database connection
        await db_1.prisma.$connect();
        // Test a simple query to verify schema is accessible
        const workspaceCount = await db_1.prisma.workspace.count();
        return (0, error_handling_1.createSuccessResponse)({
            database: 'connected',
            prismaClient: 'working',
            workspaceCount: workspaceCount,
            timestamp: new Date().toISOString(),
            message: 'Database connection and Prisma client singleton working correctly'
        });
    }
    catch (error) {
        // Use our standardized database error handling
        const dbError = (0, error_handling_1.handleDatabaseError)(error);
        throw dbError;
    }
});
exports.POST = (0, error_handling_1.withErrorHandling)(async (request) => {
    const body = await request.json();
    const { name, slug } = body;
    if (!name || !slug) {
        return (0, error_handling_1.createSuccessResponse)({
            test: 'validation',
            message: 'This endpoint tests database operations but requires name and slug'
        });
    }
    try {
        // Test creating a workspace to verify write operations
        const workspace = await db_1.prisma.workspace.create({
            data: {
                name: name,
                slug: slug,
                is_active: true
            }
        });
        return (0, error_handling_1.createSuccessResponse)({
            operation: 'create',
            workspace: workspace,
            message: 'Database write operation successful'
        });
    }
    catch (error) {
        const dbError = (0, error_handling_1.handleDatabaseError)(error);
        throw dbError;
    }
});
