import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

// Stub API for session management
// TODO: Implement real session tracking with Redis or database

// Force dynamic route (don't pre-render during build)
export const dynamic = "force-dynamic";

export const GET = requireAuth(async (request: NextRequest, user) => {
  return requireAuth(async (request: NextRequest, user) => {
    try {
      // Return mock sessions;
      const sessions = [
        {
          id: "1",
          device_type: "Desktop",
          device_name: "Windows PC",
          browser: "Chrome 120",
          os: "Windows 11",
          ip_address: "192.168.1.100",
          location: "Manila, Philippines",
          last_active: new Date().toISOString(),
          is_current: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "2",
          device_type: "Mobile",
          device_name: "iPhone 15",
          browser: "Safari Mobile",
          os: "iOS 17",
          ip_address: "192.168.1.101",
          location: "Quezon City, Philippines",
          last_active: new Date(Date.now() - 3600000).toISOString(),
          is_current: false,
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ];

      return NextResponse.json({ sessions });
    } catch (error) {
      console.error("Error fetching sessions:", error);
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500 }
      );
    }
});
