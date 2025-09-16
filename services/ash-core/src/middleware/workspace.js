"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWorkspace = validateWorkspace;
const database_1 = require("@ash/database");
async function validateWorkspace(req, res, next) {
    try {
        const workspaceId = req.user?.workspace_id;
        if (!workspaceId) {
            return res.status(400).json({
                success: false,
                error: 'Workspace ID not found in user context'
            });
        }
        // Verify workspace exists and is active
        const workspace = await database_1.prisma.workspace.findUnique({
            where: { id: workspaceId }
        });
        if (!workspace) {
            return res.status(404).json({
                success: false,
                error: 'Workspace not found'
            });
        }
        if (!workspace.is_active) {
            return res.status(403).json({
                success: false,
                error: 'Workspace is inactive'
            });
        }
        // Add workspace to request context
        req.workspace = workspace;
        next();
    }
    catch (error) {
        console.error('Workspace validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to validate workspace'
        });
    }
}
