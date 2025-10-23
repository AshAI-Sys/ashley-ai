"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../lib/auth-context";
import { useRouter } from "next/navigation";
import { Bell, Settings, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function TopNavbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch - only render icons after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: "New Order #1234",
      message: "Order received from ABC Corp",
      time: "5m ago",
      unread: true,
    },
    {
      id: 2,
      title: "Design Approved",
      message: "Design #5678 has been approved",
      time: "1h ago",
      unread: true,
    },
    {
      id: 3,
      title: "Payment Received",
      message: "Payment of ₱50,000 received",
      time: "2h ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-700 bg-slate-800 shadow-sm backdrop-blur-md transition-all">
      <div className="flex items-center justify-between px-6 py-3.5">
        {/* Left Section - Logo/Brand */}
        <div className="flex items-center gap-4">
          <h1 className="hidden text-lg font-bold text-white md:block">
            Ashley AI
          </h1>
        </div>

        {/* Right Section - Theme Toggle, Notifications & Profile */}
        <div className="ml-6 flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications - Professional button */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
            >
              {/* Show static placeholder during SSR to prevent hydration mismatch */}
              {!mounted ? (
                <div className="h-5 w-5" />
              ) : (
                <HydrationSafeIcon Icon={Bell} className="h-5 w-5" />
              )}
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </button>

            {/* Notifications Dropdown - Enhanced */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                <div className="border-b border-border bg-accent/5 px-4 py-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`cursor-pointer border-b border-border px-4 py-3.5 transition-colors last:border-0 hover:bg-accent/5 ${
                        notification.unread ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                            notification.unread ? "bg-primary" : "bg-muted-foreground/30"
                          }`}
                        ></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">
                            {notification.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="mt-1.5 text-xs text-muted-foreground/70">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border bg-muted/30 px-4 py-3 text-center">
                  <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown - Professional */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 transition-all hover:border-border hover:bg-accent/5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-sm font-semibold text-primary-foreground shadow-md">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-foreground">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground">{user?.role || "Admin"}</p>
              </div>
              {/* Show static placeholder during SSR to prevent hydration mismatch */}
              {!mounted ? (
                <div className="h-4 w-4" />
              ) : (
                <HydrationSafeIcon
                  Icon={ChevronDown}
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            {/* Profile Menu Dropdown - Enhanced */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                <div className="border-b border-border bg-accent/5 px-4 py-4">
                  <p className="text-sm font-bold text-foreground">
                    {user?.name || "User"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {user?.position || "Position"}
                  </p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      router.push("/settings");
                      setShowProfileMenu(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent/5"
                  >
                    <HydrationSafeIcon Icon={Settings} className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Settings</span>
                  </button>
                </div>
                <div className="border-t border-border bg-muted/30 py-2">
                  <button
                    onClick={handleLogout}
                    className="mx-1 flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <HydrationSafeIcon Icon={LogOut} className="h-4 w-4" />
                    <span className="font-semibold">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
