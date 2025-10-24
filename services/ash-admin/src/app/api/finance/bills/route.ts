/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const GET = requireAuth(async (request: NextRequest, _user) => {
  try {
    // Bills feature not yet implemented - return empty array
    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error) {
    console.error("Error fetching bills:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bills" },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    return NextResponse.json(
      { success: false, error: "Bills feature not yet implemented" },
      { status: 501 }
    );
  
  } catch (error) {
    console.error("Error creating bill:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create bill" },
      { status: 500 }
    );
  }
});

export const PUT = requireAuth(async (request: NextRequest, user) => {
  try {
    return NextResponse.json(
      { success: false, error: "Bills feature not yet implemented" },
      { status: 501 }
    );
  
  } catch (error) {
    console.error("Error updating bill:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update bill" },
      { status: 500 }
    );
  }
});
