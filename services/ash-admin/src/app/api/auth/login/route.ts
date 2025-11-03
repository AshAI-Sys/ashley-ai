import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "Login works!" }, { status: 200 });
}
