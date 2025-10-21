import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

// Stub API for audit logs
// TODO: Implement real audit log tracking

// Force dynamic route (don't pre-render during build)
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return requireAuth(async (request: NextRequest, user) => {
    try {
      // Return mock audit logs
      const logs = [
        {
          id: "1",
          user_email: "admin@ashleyai.com",
          user_name: "Admin User",
          action: "Login Successful",
          category: "authentication",
          resource_type: "user",
          resource_id: user.id,
          ip_address: "192.168.1.100",
          user_agent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
          status: "success" as const,
          details: { method: "email_password" },
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          user_email: "admin@ashleyai.com",
          user_name: "Admin User",
          action: "Password Changed",
          category: "security",
          resource_type: "user",
          resource_id: user.id,
          ip_address: "192.168.1.100",
          user_agent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
          status: "success" as const,
          details: {},
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "3",
          user_email: "admin@ashleyai.com",
          user_name: "Admin User",
          action: "Failed Login Attempt",
          category: "authentication",
          resource_type: "user",
          resource_id: user.id,
          ip_address: "192.168.1.101",
          user_agent: "Mozilla/5.0 (iPhone; iOS 17) Safari/17.0",
          status: "failure" as const,
          details: { reason: "invalid_password" },
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: "4",
          user_email: "admin@ashleyai.com",
          user_name: "Admin User",
          action: "Account Settings Updated",
          category: "account",
          resource_type: "user",
          resource_id: user.id,
          ip_address: "192.168.1.100",
          user_agent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
          status: "success" as const,
          details: { fields: ["name", "phone"] },
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ];

      return NextResponse.json({ logs });
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return NextResponse.json(
        { error: "Failed to fetch logs" },
        { status: 500 }
      );
    }
  });
}
