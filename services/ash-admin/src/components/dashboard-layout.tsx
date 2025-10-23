"use client";

import Sidebar from "./sidebar";
import TopNavbar from "./top-navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * DashboardLayout - Main layout wrapper for authenticated dashboard pages
 * Includes sidebar navigation and top navbar
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-auto bg-gray-50 pt-16 lg:pt-0">
          {/* pt-16 on mobile to account for hamburger menu button */}
          {children}
        </main>
      </div>
    </div>
  );
}
