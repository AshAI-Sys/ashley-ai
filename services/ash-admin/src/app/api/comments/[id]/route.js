"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = PUT;
exports.DELETE = DELETE;
const server_1 = require("next/server");
// TODO: Fix Prisma client model name issue for DesignComment
// Temporarily disabled all comment operations
async function PUT(_request, { params: _params }) {
    return server_1.NextResponse.json({
        success: false,
        message: 'Comment update temporarily disabled - Prisma model issue'
    }, { status: 503 });
}
async function DELETE(_request, { params: _params }) {
    return server_1.NextResponse.json({
        success: false,
        message: 'Comment deletion temporarily disabled - Prisma model issue'
    }, { status: 503 });
}
