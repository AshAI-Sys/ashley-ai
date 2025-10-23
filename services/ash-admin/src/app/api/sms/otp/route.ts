import { NextRequest, NextResponse } from "next/server";
import { smsService } from "@/lib/sms";
import crypto from "crypto";
import { requireAuth } from "@/lib/auth-middleware";

// In-memory OTP storage (use Redis in production)
const otpStore = new Map<string, { code: string; expires: number }>();

// POST /api/sms/otp - Send OTP code
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Format and validate phone number
    const formattedPhone = smsService.formatPhoneNumber(phone);
    if (!smsService.isValidPhoneNumber(formattedPhone)) {
      return NextResponse.json(
        {
          error:
            "Invalid phone number format. Use Philippine format: 09171234567",
        },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const code = crypto.randomInt(100000, 999999).toString();

    // Store OTP (expires in 5 minutes)
    const expires = Date.now() + 5 * 60 * 1000;
    otpStore.set(formattedPhone, { code, expires });

    // Send SMS
    const result = await smsService.sendOTP(formattedPhone, code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send OTP" },
        { status: 500 }
      );
    }

    // Clean up expired OTPs
    for (const [key, value] of otpStore.entries()) {
      if (value.expires < Date.now()) {
        otpStore.delete(key);
      }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      expires_in: 300, // 5 minutes
      message_id: result.message_id,
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Failed to send OTP", details: error.message },
      { status: 500 }
    );
  }

// PUT /api/sms/otp - Verify OTP code
export const PUT = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Phone number and code are required" },
        { status: 400 }
      );
    }

    // Format phone number
    const formattedPhone = smsService.formatPhoneNumber(phone);

    // Get stored OTP
    const storedOTP = otpStore.get(formattedPhone);

    if (!storedOTP) {
      return NextResponse.json(
        { error: "OTP not found or expired. Please request a new code." },
        { status: 404 }
      );
    }

    // Check if expired
    if (storedOTP.expires < Date.now()) {
      otpStore.delete(formattedPhone);
      return NextResponse.json(
        { error: "OTP has expired. Please request a new code." },
        { status: 410 }
      );
    }

    // Verify code
    if (storedOTP.code !== code) {
      return NextResponse.json(
        { error: "Invalid OTP code. Please try again." },
        { status: 401 }
      );
    }

    // Success - delete OTP
    otpStore.delete(formattedPhone);

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    }
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP", details: error.message },
      { status: 500 }
    );
  }
});
