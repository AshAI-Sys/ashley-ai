import { NextRequest, NextResponse } from "next/server";
import { db } from "@ash-ai/database";
import { sign } from "jsonwebtoken";

const prisma = db;

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Find and validate magic token
    const session = await prisma.clientSession.findUnique({
      where: {
        magic_token: token,
      },
      include: {
        client: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    if (session.is_used) {
      return NextResponse.json(
        { error: "Token has already been used" },
        { status: 400 }
      );
    }

    if (session.expires_at < new Date()) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    // Mark token as used
    await prisma.clientSession.update({
      where: { id: session.id },
      data: { is_used: true },
    });

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || "fallback-secret-key";
    const accessToken = sign(
      {
        clientId: session.client.id,
        workspaceId: session.workspace_id,
        email: session.client.email,
        name: session.client.name,
      },
      jwtSecret,
      { expiresIn: "7d" } // 7 days
    );

    // Log successful login
    await prisma.clientActivity.create({
      data: {
        workspace_id: session.workspace_id,
        client_id: session.client_id,
        activity_type: "LOGIN",
        description: `Successful login via magic link`,
        ip_address:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
      },
    });

    // Create notification for successful login
    await prisma.clientNotification.create({
      data: {
        workspace_id: session.workspace_id,
        client_id: session.client_id,
        type: "SECURITY_ALERT",
        title: "New Login",
        message: "You have successfully logged into your portal",
        priority: "LOW",
      },
    });

    const response = NextResponse.json({
      success: true,
      client: {
        id: session.client.id,
        name: session.client.name,
        email: session.client.email,
        workspace: {
          id: session.client.workspace.id,
          name: session.client.workspace.name,
          slug: session.client.workspace.slug,
        },
      },
    });

    // Set HTTP-only cookie
    response.cookies.set("portal-token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      {
        error: "Failed to verify token",
      },
      { status: 500 }
    );
  }
}
