"use strict";
// ASH AI Database Utilities
// Helper functions for database operations
Object.defineProperty(exports, "__esModule", { value: true });
exports.withWorkspace = withWorkspace;
exports.createWithWorkspace = createWithWorkspace;
exports.logAudit = logAudit;
exports.generatePONumber = generatePONumber;
exports.generateBundleQR = generateBundleQR;
exports.parseAshleyAnalysis = parseAshleyAnalysis;
exports.serializeAshleyAnalysis = serializeAshleyAnalysis;
exports.softDelete = softDelete;
exports.parseJsonField = parseJsonField;
exports.stringifyJsonField = stringifyJsonField;
exports.withTransaction = withTransaction;
const client_1 = require("./client");
// Multi-tenancy helpers
function withWorkspace(workspaceId) {
    return {
        where: {
            workspace_id: workspaceId,
            deleted_at: null,
        },
    };
}
function createWithWorkspace(workspaceId, data) {
    return {
        ...data,
        workspace_id: workspaceId,
    };
}
// Audit logging helper
async function logAudit({ workspaceId, userId, action, resource, resourceId, oldValues, newValues, ipAddress, userAgent, }) {
    await client_1.db.auditLog.create({
        data: {
            workspace_id: workspaceId,
            user_id: userId,
            action,
            resource,
            resource_id: resourceId,
            old_values: oldValues ? JSON.stringify(oldValues) : null,
            new_values: newValues ? JSON.stringify(newValues) : null,
            ip_address: ipAddress,
            user_agent: userAgent,
        },
    });
}
// PO number generation
async function generatePONumber(brandId) {
    const brand = await client_1.db.brand.findUnique({
        where: { id: brandId },
        select: { code: true },
    });
    if (!brand?.code) {
        throw new Error("Brand code not found");
    }
    const currentYear = new Date().getFullYear();
    // Get the next sequence number for this brand/year
    const lastOrder = await client_1.db.order.findFirst({
        where: {
            brand_id: brandId,
            order_number: {
                startsWith: `${brand.code}-${currentYear}-`,
            },
        },
        orderBy: {
            created_at: "desc",
        },
        select: {
            order_number: true,
        },
    });
    let nextSequence = 1;
    if (lastOrder) {
        const parts = lastOrder.order_number.split("-");
        const lastSequence = parseInt(parts[2] || "0");
        nextSequence = lastSequence + 1;
    }
    return `${brand.code}-${currentYear}-${nextSequence.toString().padStart(6, "0")}`;
}
// QR code generation for bundles
function generateBundleQR(bundleId) {
    return `ash://bundle/${bundleId}`;
}
// Ashley AI analysis helpers
function parseAshleyAnalysis(jsonString) {
    if (!jsonString)
        return null;
    try {
        return JSON.parse(jsonString);
    }
    catch {
        return null;
    }
}
function serializeAshleyAnalysis(analysis) {
    return JSON.stringify(analysis);
}
// Soft delete helper
async function softDelete(model, id, workspaceId, userId) {
    const tableName = model.toString();
    // Type assertion needed here due to dynamic model access
    const result = await client_1.db[model].update({
        where: { id, workspace_id: workspaceId },
        data: { deleted_at: new Date() },
    });
    // Log the soft delete
    await logAudit({
        workspaceId,
        userId,
        action: "soft_delete",
        resource: tableName,
        resourceId: id,
    });
    return result;
}
// JSON field helpers for PostgreSQL
function parseJsonField(jsonString) {
    if (!jsonString)
        return null;
    try {
        return JSON.parse(jsonString);
    }
    catch {
        return null;
    }
}
function stringifyJsonField(data) {
    return JSON.stringify(data);
}
// Database transaction wrapper with error handling
async function withTransaction(callback) {
    return await client_1.db.$transaction(async (tx) => {
        try {
            return await callback(tx);
        }
        catch (error) {
            // Log error and re-throw
            console.error("Transaction failed:", error);
            throw error;
        }
    });
}
