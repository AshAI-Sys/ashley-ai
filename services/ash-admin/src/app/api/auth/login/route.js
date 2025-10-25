"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
/* eslint-disable */
const server_1 = require("next/server");
const jwt_1 = require("../../../../lib/jwt");
const db_1 = require("../../../../lib/db");
const bcrypt = __importStar(require("bcryptjs"));
const audit_logger_1 = require("../../../../lib/audit-logger");
const session_manager_1 = require("../../../../lib/session-manager");
const account_lockout_1 = require("../../../../lib/account-lockout");
const logger_1 = require("../../../../lib/logger");
async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;
        // Validate required fields
        if (!email || !password) {
            return server_1.NextResponse.json({
                success: false,
                error: "Email and password are required",
            }, { status: 400 });
        }
        // Check if account is locked
        const lockStatus = await (0, account_lockout_1.isAccountLocked)(email);
        if (lockStatus.isLocked) {
            const minutesRemaining = lockStatus.canRetryAt
                ? Math.ceil((lockStatus.canRetryAt.getTime() - Date.now()) / 60000)
                : 30;
            await (0, audit_logger_1.logAuthEvent)("LOGIN_BLOCKED_LOCKED", "system", undefined, request, {
                email,
                reason: "Account locked",
                lockoutExpiresAt: lockStatus.lockoutExpiresAt,
            });
            return server_1.NextResponse.json({
                success: false,
                error: `Account temporarily locked due to multiple failed login attempts. Please try again in ${minutesRemaining} minutes.`,
                code: "ACCOUNT_LOCKED",
                lockoutExpiresAt: lockStatus.lockoutExpiresAt,
            }, { status: 423 }); // 423 Locked
        }
        // Find user in database
        const user = await db_1.prisma.user.findFirst({
            where: {
                email: email.toLowerCase(),
                is_active: true,
            },
            include: {
                workspace: true,
            },
        });
        if (!user) {
            // Log failed login attempt
            await (0, audit_logger_1.logAuthEvent)("LOGIN_FAILED", "system", undefined, request, {
                email,
                reason: "User not found"
            });
            return server_1.NextResponse.json({
                success: false,
                error: "Invalid email or password",
            }, { status: 401 });
        }
        // Verify password using bcrypt
        if (!user.password_hash) {
            // Log failed login attempt
            await (0, audit_logger_1.logAuthEvent)("LOGIN_FAILED", user.workspace_id, user.id, request, {
                email,
                reason: "No password hash"
            });
            return server_1.NextResponse.json({
                success: false,
                error: "Invalid email or password",
            }, { status: 401 });
        }
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            // Record failed login attempt
            const failedLoginStatus = await (0, account_lockout_1.recordFailedLogin)(email);
            // Log failed login attempt
            await (0, audit_logger_1.logAuthEvent)("LOGIN_FAILED", user.workspace_id, user.id, request, {
                email,
                reason: "Invalid password",
                failedAttempts: failedLoginStatus.failedAttempts,
                remainingAttempts: failedLoginStatus.remainingAttempts,
            });
            // Inform user of remaining attempts
            let errorMessage = "Invalid email or password";
            if (failedLoginStatus.remainingAttempts <= 2 &&
                failedLoginStatus.remainingAttempts > 0) {
                errorMessage += `. Warning: ${failedLoginStatus.remainingAttempts} ${failedLoginStatus.remainingAttempts === 1 ? "attempt" : "attempts"} remaining before account lockout.`;
            }
            return server_1.NextResponse.json({
                success: false,
                error: errorMessage,
                remainingAttempts: failedLoginStatus.remainingAttempts,
            }, { status: 401 });
        }
        // Email verification disabled - allow login directly
        // Email verification check removed to allow direct login after registration
        // Clear failed attempts on successful login
        await (0, account_lockout_1.clearFailedAttempts)(email);
        // Generate JWT token pair (access + refresh tokens)
        const tokenPair = (0, jwt_1.generateTokenPair)({
            id: user.id,
            email: user.email,
            role: user.role,
            workspaceId: user.workspace_id,
        });
        // Update last login timestamp
        await db_1.prisma.user.update({
            where: { id: user.id },
            data: { last_login_at: new Date() },
        });
        // Create session for the user with access token
        await (0, session_manager_1.createSession)(user.id, tokenPair.accessToken, request);
        // Log successful login
        await (0, audit_logger_1.logAuthEvent)("LOGIN", user.workspace_id, user.id, request, {
            email: user.email,
            role: user.role,
        });
        logger_1.authLogger.info("User logged in successfully", {
            userId: user.id,
            email: user.email,
            workspaceId: user.workspace_id,
        });
        // Set HTTP-only cookie with access token
        const response = server_1.NextResponse.json({
            success: true,
            access_token: tokenPair.accessToken,
            refresh_token: tokenPair.refreshToken,
            expires_in: tokenPair.expiresIn,
            user: {
                id: user.id,
                email: user.email,
                name: `${user.first_name} ${user.last_name}`,
                role: user.role,
                position: user.position || null,
                department: user.department || null,
                workspaceId: user.workspace_id,
            },
        });
        // Set secure HTTP-only cookie for auth token
        response.cookies.set("auth_token", tokenPair.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: tokenPair.expiresIn, // 15 minutes
            path: "/",
        });
        // Set refresh token as HTTP-only cookie (7 days)
        response.cookies.set("refresh_token", tokenPair.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
            path: "/",
        });
        return response;
    }
    catch (error) {
        logger_1.authLogger.error("Login error", error);
        return server_1.NextResponse.json({
            success: false,
            error: error.message || "Internal server error",
        }, { status: 500 });
    }
}
