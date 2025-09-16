"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;
        // Simple bypass authentication for demo purposes
        if (email && password) {
            // For demo, accept any credentials
            return server_1.NextResponse.json({
                success: true,
                user: {
                    id: 'demo-user-1',
                    email: email,
                    name: 'Demo User',
                    role: 'admin'
                },
                token: 'demo-jwt-token-12345'
            }, { status: 200 });
        }
        return server_1.NextResponse.json({
            success: false,
            message: 'Email and password required'
        }, { status: 400 });
    }
    catch (error) {
        console.error('Login error:', error);
        return server_1.NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
