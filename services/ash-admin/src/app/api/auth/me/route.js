"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return server_1.NextResponse.json({
                success: false,
                message: 'No authorization token provided'
            }, { status: 401 });
        }
        // For demo purposes, accept any bearer token
        return server_1.NextResponse.json({
            success: true,
            user: {
                id: 'demo-user-1',
                email: 'demo@ashleyai.com',
                name: 'Demo User',
                role: 'admin'
            }
        }, { status: 200 });
    }
    catch (error) {
        console.error('Auth verification error:', error);
        return server_1.NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
