"use client";

import { useAuth } from "../lib/auth-context";
import { hasAccess, User, Permission } from "../lib/permissions";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Transform user to permissions User interface
      const permUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as any,
        position: user.position || "",
        department: user.department || "Administration",
        permissions: user.permissions as Permission[] || undefined,
      };

      // Check if user has access to current route
      const routeAccess = hasAccess(permUser, pathname);

      if (!routeAccess) {
        // Redirect to dashboard if no access
        router.push("/dashboard");
        return;
      }
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-2 text-xl font-semibold text-gray-900">
            Access Denied
          </h1>
          <p className="mb-4 text-gray-600">
            Please log in to access this page
          </p>
          <button
            onClick={() => router.push("/login")}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

