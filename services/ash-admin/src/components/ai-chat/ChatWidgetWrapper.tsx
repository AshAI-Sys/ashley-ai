"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "./ChatWidget";

// Pages where ChatWidget should NOT appear
const EXCLUDED_PATHS = [
  "/login",
  "/register",
  "/setup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/",  // Homepage if not logged in
];

export function ChatWidgetWrapper() {
  const pathname = usePathname();

  // Don't show ChatWidget on public pages
  const isExcludedPage = EXCLUDED_PATHS.some(path => pathname === path || pathname.startsWith(path + "/"));

  if (isExcludedPage) {
    return null;
  }

  return <ChatWidget />;
}
