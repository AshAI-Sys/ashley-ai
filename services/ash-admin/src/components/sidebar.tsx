"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { getAccessibleNavigation, _hasAccess, User } from "../lib/permissions";
import HydrationSafeIcon from "./hydration-safe-icon";
import {
  Building2,
  ShoppingCart,
  Palette,
  Scissors,
  Printer,
  PocketKnife,
  CheckCircle,
  Package,
  Truck,
  DollarSign,
  Users,
  UserPlus,
  Wrench,
  Globe,
  Zap,
  Bot,
  BarChart3,
  Home,
  ChevronLeft,
  ChevronRight,
  Landmark,
  MessageSquare,
  Brain,
  PackageSearch,
  Settings,
  Activity,
  Menu,
  X,
} from "lucide-react";

const iconMap = {
  Home,
  Building2,
  ShoppingCart,
  Palette,
  Scissors,
  Printer,
  PocketKnife,
  CheckCircle,
  Package,
  Truck,
  DollarSign,
  Users,
  UserPlus,
  Wrench,
  Globe,
  Bot,
  Zap,
  BarChart3,
  Landmark,
  MessageSquare,
  Brain,
  PackageSearch,
  Settings,
  Activity,
  Menu,
  X,
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  // All navigation items
  const allNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: "Home", department: "*" },
    {
      name: "Clients",
      href: "/clients",
      icon: "Building2",
      department: "Management",
    },
    {
      name: "Orders",
      href: "/orders",
      icon: "ShoppingCart",
      department: "Management",
    },
    {
      name: "Design & Approval",
      href: "/designs",
      icon: "Palette",
      department: "Management",
    },
    {
      name: "Cutting Operations",
      href: "/cutting",
      icon: "Scissors",
      department: "Cutting",
    },
    {
      name: "Printing Operations",
      href: "/printing",
      icon: "Printer",
      department: "Printing",
    },
    {
      name: "Sewing Operations",
      href: "/sewing",
      icon: "PocketKnife",
      department: "Sewing",
    },
    {
      name: "Quality Control",
      href: "/quality-control",
      icon: "CheckCircle",
      department: "Quality",
    },
    {
      name: "Finishing & Packing",
      href: "/finishing-packing",
      icon: "Package",
      department: "Finishing",
    },
    {
      name: "Delivery Management",
      href: "/delivery",
      icon: "Truck",
      department: "Delivery",
    },
    {
      name: "Finance",
      href: "/finance",
      icon: "DollarSign",
      department: "Finance",
    },
    {
      name: "HR & Payroll",
      href: "/hr-payroll",
      icon: "Users",
      department: "HR",
    },
    {
      name: "Government Reports",
      href: "/government",
      icon: "Landmark",
      department: "Finance",
    },
    {
      name: "SMS Notifications",
      href: "/sms-notifications",
      icon: "MessageSquare",
      department: "Management",
    },
    {
      name: "Maintenance",
      href: "/maintenance",
      icon: "Wrench",
      department: "Maintenance",
    },
    {
      name: "User Management",
      href: "/admin/users",
      icon: "Users",
      department: "Administration",
    },
    {
      name: "Employee Onboarding",
      href: "/admin/onboarding",
      icon: "UserPlus",
      department: "Administration",
    },
    {
      name: "Merchandising AI",
      href: "/merchandising",
      icon: "Bot",
      department: "Management",
    },
    {
      name: "Automation Engine",
      href: "/automation",
      icon: "Zap",
      department: "Management",
    },
    {
      name: "Advanced Analytics",
      href: "/admin/analytics",
      icon: "BarChart3",
      department: "Management",
    },
    {
      name: "AI Features",
      href: "/ai-features",
      icon: "Brain",
      department: "Management",
    },
    {
      name: "Inventory",
      href: "/inventory",
      icon: "PackageSearch",
      department: "Inventory",
    },
    {
      name: "Performance",
      href: "/performance",
      icon: "Activity",
      department: "Administration",
    },
    {
      name: "Tenant Settings",
      href: "/admin/tenants",
      icon: "Settings",
      department: "Administration",
    },
  ];

  // Get filtered navigation based on user role and department
  const navigation = useMemo(() => {
    if (!user) {
      // Default navigation for non-authenticated users
      return [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: "Home",
          department: "*",
        },
      ];
    }

    // SIMPLE FIX: If user role contains "admin" (case-insensitive), show everything
    const userRole = (user.role || "").toLowerCase();
    if (userRole === "admin" || userRole === "administrator" || userRole.includes("admin")) {
      return allNavigation;
    }

    // For non-admin users, use the permissions system
    const roleMapping = {
      manager: "manager",
      Manager: "manager",
      CSR: "designer",
      Worker: "cutting_operator",
      Client: "warehouse_staff",
    } as const;

    const mappedRole =
      roleMapping[user.role as keyof typeof roleMapping] || "cutting_operator";

    const { getRoleBasedPermissions } = require("../lib/rbac");
    const userPermissions =
      user.permissions && user.permissions.length > 0
        ? user.permissions
        : getRoleBasedPermissions(user.role || mappedRole);

    const permUser: User = {
      id: user.id,
      email: user.email,
      name:
        user.name || `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      role: mappedRole,
      position: user.position || "",
      department: user.department || "Administration",
      permissions: userPermissions,
    };

    return getAccessibleNavigation(permUser);
  }, [user]);

  return (
    <>
      {/* Mobile Menu Button - Fixed top-left */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-corporate-blue p-3 text-white shadow-corporate transition-all hover:bg-blue-700 lg:hidden"
        aria-label="Toggle menu"
      >
        <HydrationSafeIcon Icon={mobileOpen ? X : Menu} className="h-7 w-7" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Modern Design */}
      <div
        className={`modern-sidebar text-white transition-all duration-300 w-64 /* Mobile styles */ fixed z-40 flex min-h-screen flex-col lg:relative lg:z-auto ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} `}
      >
        {/* Header - Improved spacing */}
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center justify-between">
            {/* Show full logo and text - always expanded */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 p-1.5 backdrop-blur-sm">
                <img
                  src="/ash-ai-logo.png"
                  alt="Ashley AI Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight text-white">
                  Ashley AI
                </h1>
                <p className="text-sm leading-tight text-white/90">
                  Apparel Smart Hub
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation - Professional spacing and hover effects */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
          {navigation.map(item => {
            const isActive = pathname === item.href;
            const Icon = iconMap[item.icon as keyof typeof iconMap] || Home;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`nav-item ${
                  isActive ? "nav-item-active" : "text-white hover:bg-white/10"
                } `}
              >
                <HydrationSafeIcon
                  Icon={Icon}
                  className="mr-3 h-6 w-6 flex-shrink-0"
                />
                <span className="text-base font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer - Professional user info */}
        <div className="space-y-3 border-t border-white/10 p-5">
          {user && (
            <div className="rounded-lg bg-white/10 p-4 text-white backdrop-blur-sm">
              <p className="mb-1 text-base font-semibold text-white">
                {user.name}
              </p>
              <p className="text-sm text-white/90">{user.position}</p>
              <p className="mt-1.5 text-xs text-white/70">
                {user.department} • {user.role}
              </p>
            </div>
          )}
          <div className="text-sm">
            <p className="text-sm font-semibold text-white">Ashley AI v1.0</p>
            <p className="text-sm text-white/70">Manufacturing ERP</p>
          </div>
        </div>
      </div>
    </>
  );
}
