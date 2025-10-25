"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const sms_1 = require("@/lib/sms");
const crypto_1 = __importDefault(require("crypto"));
const auth_middleware_1 = require("@/lib/auth-middleware");
// In-memory OTP storage (use Redis in production)
const otpStore = new Map();
// POST /api/sms/otp - Send OTP code
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        const { phone } = body;
        if (!phone) {
            return server_1.NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }
        // Format and validate phone number
        const formattedPhone = sms_1.smsService.formatPhoneNumber(phone);
        if (!sms_1.smsService.isValidPhoneNumber(formattedPhone)) {
            return server_1.NextResponse.json({
                error: "Invalid phone number format. Use Philippine format: 09171234567",
            }, { status: 400 });
        }
        // Generate 6-digit OTP
        const code = crypto_1.default.randomInt(100000, 999999).toString();
        // Store OTP (expires in 5 minutes)
        const expires = Date.now() + 5 * 60 * 1000;
        otpStore.set(formattedPhone, { code, expires });
        // Send SMS
        const result = await sms_1.smsService.sendOTP(formattedPhone, code);
        if (!result.success) {
            return server_1.NextResponse.json({ error: result.error || "Failed to send OTP" }, { status: 500 });
        }
        // Clean up expired OTPs
        for (const [key, value] of otpStore.entries()) {
            if (value.expires < Date.now()) {
                otpStore.delete(key);
                return server_1.NextResponse.json({
                    success: true,
                    message: "OTP sent successfully",
                    expires_in: 300, // 5 minutes
                    message_id: result.message_id,
                });
                try { }
                catch (error) {
                    console.error("Error sending OTP:", error);
                    return server_1.NextResponse.json({ error: "Failed to send OTP", details: error.message }, { status: 500 });
                }
                // PUT /api/sms/otp - Verify OTP code
                export const PUT = (0, auth_middleware_1.requireAuth)(async (request, user) => {
                    try {
                        const body = await request.json();
                        const { phone, code } = body;
                        if (!phone || !code) {
                            return server_1.NextResponse.json({ error: "Phone number and code are required" }, { status: 400 });
                        }
                        // Format phone number
                        const formattedPhone = sms_1.smsService.formatPhoneNumber(phone);
                        // Get stored OTP
                        const storedOTP = otpStore.get(formattedPhone);
                        if (!storedOTP) {
                            return server_1.NextResponse.json({ error: "OTP not found or expired. Please request a new code." }, { status: 404 });
                        }
                        // Check if expired
                        if (storedOTP.expires < Date.now()) {
                            otpStore.delete(formattedPhone);
                            return server_1.NextResponse.json({ error: "OTP has expired. Please request a new code." }, { status: 410 });
                        }
                        // Verify code
                        if (storedOTP.code !== code) {
                            return server_1.NextResponse.json({ error: "Invalid OTP code. Please try again." }, { status: 401 });
                        }
                        // Success - delete OTP
                        otpStore.delete(formattedPhone);
                        return server_1.NextResponse.json({
                            success: true,
                            message: "OTP verified successfully",
                        });
                    }
                    catch (error) {
                        console.error("Error verifying OTP:", error);
                        return server_1.NextResponse.json({ error: "Failed to verify OTP", details: error.message }, { status: 500 });
                    }
                });
            }
        }
    }
    finally { }
});
