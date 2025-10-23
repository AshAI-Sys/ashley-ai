/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

// TODO: Fix Prisma client model name issue for DesignComment
// Temporarily disabled all comment operations

export async function PUT(
  _request: NextRequest,
  { params: _params }: { params: { id: string } }
) {
  return NextResponse.json(
    {
      success: false,
      message: "Comment update temporarily disabled - Prisma model issue",
    },
    { status: 503 }
  );
}

export async function DELETE(
  _request: NextRequest,
  { params: _params }: { params: { id: string } }
) {
  return NextResponse.json(
    {
      success: false,
      message: "Comment deletion temporarily disabled - Prisma model issue",
    },
    { status: 503 }
  );
}
