"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../lib/auth-context";
import { useRouter } from "next/navigation";
import { Bell, Settings, LogOut, ChevronDown, Menu, X } from "lucide-react";

export default function TopNavbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

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
    <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-3.5">
        {/* Empty left section */}
        <div></div>

        {/* Right Section - Notifications & Profile */}
        <div className="ml-6 flex items-center gap-4">
          {/* Notifications - Professional button */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-2.5 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </button>

            {/* Notifications Dropdown - Enhanced */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-4 py-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`cursor-pointer border-b border-gray-100 px-4 py-3.5 transition-colors last:border-0 hover:bg-gray-50 ${
                        notification.unread ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                            notification.unread ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        ></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {notification.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                            {notification.message}
                          </p>
                          <p className="mt-1.5 text-xs text-gray-500">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-center">
                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
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
              className="flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 transition-all hover:border-gray-200 hover:bg-gray-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-semibold text-white shadow-md">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500">{user?.role || "Admin"}</p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform ${
                  showProfileMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Menu Dropdown - Enhanced */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-4 py-4">
                  <p className="text-sm font-bold text-gray-900">
                    {user?.name || "User"}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600">
                    {user?.position || "Position"}
                  </p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      router.push("/settings");
                      setShowProfileMenu(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Settings</span>
                  </button>
                </div>
                <div className="border-t border-gray-200 bg-gray-50 py-2">
                  <button
                    onClick={handleLogout}
                    className="mx-1 flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
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
