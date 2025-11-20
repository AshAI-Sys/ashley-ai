import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';

export const GET = requireAuth(async (request, user) => {
  try {
    const workspaceId = user.workspaceId;
    const capa_tasks: any[] = [];
    return NextResponse.json({ success: true, capa_tasks, pagination: { page: 1, limit: 50, total: 0, total_pages: 0 } });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch CAPA tasks" }, { status: 500 });
  }
});
