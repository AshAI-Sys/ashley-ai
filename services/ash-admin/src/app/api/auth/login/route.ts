/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { generateTokenPair } from "../../../../lib/jwt";
import { prisma } from "../../../../lib/db";
import { createSession } from "../../../../lib/session-manager";
import bcrypt from 'bcryptjs';

// Force Node.js runtime (Prisma doesn't support Edge)
export const runtime = "nodejs";

// Prevent static generation
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        is_active: true,
      },
      include: {
        workspace: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Verify password using bcrypt
    if (!user.password_hash) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Generate JWT token pair (access + refresh tokens)
    const tokenPair = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role as any,
      workspaceId: user.workspace_id,
    });

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    // Create session in database (with error handling to not block login)
    try {
      await createSession(user.id, tokenPair.accessToken, request);
      console.log("Session created successfully for user:", user.email);
    } catch (sessionError) {
      console.error("Failed to create session (non-blocking):", sessionError);
      // Continue with login even if session creation fails
    }

    console.log("User logged in successfully:", user.email);

    // Set HTTP-only cookie with access token
    const response = NextResponse.json({
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
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
