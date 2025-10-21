"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Animated, StaggeredAnimation } from "@/components/ui/animated";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  Building2,
  Scissors,
  Printer,
  BadgeCheck,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { api } from "@/lib/api";

interface DashboardStats {
  totalClients: number;
  totalOrders: number;
  totalRevenue: number;
  activeEmployees: number;
  ordersInProduction: number;
  pendingApprovals: number;
  completedThisMonth: number;
  ordersByStatus: { status: string; count: number; amount: number }[];
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  employeesByDepartment: { department: string; count: number }[];
  recentActivity: { type: string; message: string; timestamp: string }[];
}

const STATUS_COLORS = {
  draft: "#9CA3AF",
  pending_approval: "#F59E0B",
  confirmed: "#3B82F6",
  in_production: "#8B5CF6",
  completed: "#10B981",
  cancelled: "#EF4444",
};

export default function AdminDashboard() {
  // Fetch dashboard stats
  const {
    data: stats,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const [clientsData, ordersData, employeesData] = await Promise.all([
        api.getClients({ limit: 1 }),
        api.getOrders({ limit: 100 }),
        fetch("/api/hr/employees?limit=100", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ash_token")}`,
          },
        })
          .then(res => res.json())
          .catch(() => ({ success: false, data: [] })),
      ]);

      const orders = ordersData.data?.orders || [];
      const employees = employeesData.success ? employeesData.data || [] : [];

      // Calculate order statistics by status
      const ordersByStatus = orders.reduce((acc: any, order: any) => {
        const status = order.status || "draft";
        if (!acc[status]) {
          acc[status] = { status, count: 0, amount: 0 };
        }
        acc[status].count++;
        acc[status].amount += order.total_amount || 0;
        return acc;
      }, {});

      // Calculate employees by department
      const employeesByDept = employees.reduce((acc: any, emp: any) => {
        const dept = emp.department || "Other";
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {});

      // Calculate total revenue
      const totalRevenue = orders.reduce(
        (sum: number, order: any) => sum + (order.total_amount || 0),
        0
      );

      // Orders in production
      const ordersInProduction = orders.filter(
        (o: any) => o.status === "in_production"
      ).length;

      // Pending approvals
      const pendingApprovals = orders.filter(
        (o: any) => o.status === "pending_approval"
      ).length;

      // Completed this month
      const thisMonth = new Date().getMonth();
      const completedThisMonth = orders.filter((o: any) => {
        return (
          o.status === "completed" &&
          new Date(o.created_at).getMonth() === thisMonth
        );
      }).length;

      return {
        totalClients: clientsData.data?.pagination?.total || 0,
        totalOrders: orders.length,
        totalRevenue,
        activeEmployees: employees.filter(
          (e: any) => e.status === "ACTIVE" || e.is_active
        ).length,
        ordersInProduction,
        pendingApprovals,
        completedThisMonth,
        ordersByStatus: Object.values(ordersByStatus),
        employeesByDepartment: Object.entries(employeesByDept).map(
          ([department, count]) => ({ department, count })
        ),
        revenueByMonth: [], // Would need historical data
        recentActivity: [],
      } as DashboardStats;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="responsive-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stats-card">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-8 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="modern-card p-6 fade-in">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <p className="mb-4 text-base font-medium">
              Failed to load dashboard data
            </p>
            <Button onClick={() => refetch()} className="modern-button">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `₱${amount.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Professional Header with Refresh */}
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2
            className="text-3xl font-bold text-gray-900"
            style={{ letterSpacing: "-0.02em" }}
          >
            Admin Dashboard
          </h2>
          <p className="mt-1 text-base font-medium text-gray-600">
            Complete system overview and analytics
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-lg border-2 border-gray-300 px-4 py-2.5 font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Key Metrics - Professional Stats Cards */}
      <StaggeredAnimation
        staggerDelay={100}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <div className="stats-card group hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-semibold text-gray-600">
                Total Revenue
              </p>
              <p
                className="text-3xl font-bold text-gray-900"
                style={{ letterSpacing: "-0.02em" }}
              >
                {formatCurrency(stats?.totalRevenue || 0)}
              </p>
              <p className="mt-2 flex items-center text-sm font-medium text-green-600">
                <TrendingUp className="mr-1.5 h-4 w-4" />
                {stats?.totalOrders || 0} orders
              </p>
            </div>
            <div className="rounded-xl bg-green-50 p-3.5">
              <DollarSign className="h-7 w-7 text-green-600" />
            </div>
          </div>
        </div>

        <div className="stats-card group hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-semibold text-gray-600">
                Active Orders
              </p>
              <p
                className="text-3xl font-bold text-gray-900"
                style={{ letterSpacing: "-0.02em" }}
              >
                {stats?.totalOrders || 0}
              </p>
              <p className="mt-2 flex items-center text-sm font-medium text-blue-600">
                <Package className="mr-1.5 h-4 w-4" />
                {stats?.ordersInProduction || 0} in production
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3.5">
              <Package className="h-7 w-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="stats-card group hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-semibold text-gray-600">
                Total Clients
              </p>
              <p
                className="text-3xl font-bold text-gray-900"
                style={{ letterSpacing: "-0.02em" }}
              >
                {stats?.totalClients || 0}
              </p>
              <p className="mt-2 flex items-center text-sm font-medium text-purple-600">
                <Building2 className="mr-1.5 h-4 w-4" />
                Active partnerships
              </p>
            </div>
            <div className="rounded-xl bg-purple-50 p-3.5">
              <Building2 className="h-7 w-7 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="stats-card group hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-semibold text-gray-600">
                Employees
              </p>
              <p
                className="text-3xl font-bold text-gray-900"
                style={{ letterSpacing: "-0.02em" }}
              >
                {stats?.activeEmployees || 0}
              </p>
              <p className="mt-2 flex items-center text-sm font-medium text-orange-600">
                <Users className="mr-1.5 h-4 w-4" />
                Active workforce
              </p>
            </div>
            <div className="rounded-xl bg-orange-50 p-3.5">
              <Users className="h-7 w-7 text-orange-600" />
            </div>
          </div>
        </div>
      </StaggeredAnimation>

      {/* Alert Cards - Modern Design */}
      <Animated animation="slide-in-from-bottom" delay={400}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="modern-card glow border-l-4 border-yellow-500 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="mb-1.5 text-sm font-semibold">
                  Pending Approvals
                </p>
                <p
                  className="text-4xl font-bold text-yellow-600 dark:text-yellow-400"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {stats?.pendingApprovals || 0}
                </p>
                <p className="mt-2.5 text-sm font-medium text-muted-foreground">
                  Orders awaiting approval
                </p>
              </div>
              <AlertCircle className="h-9 w-9 text-yellow-500" />
            </div>
          </div>

          <div className="modern-card glow border-l-4 border-purple-500 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="mb-1.5 text-sm font-semibold">In Production</p>
                <p
                  className="text-4xl font-bold text-purple-600 dark:text-purple-400"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {stats?.ordersInProduction || 0}
                </p>
                <p className="mt-2.5 text-sm font-medium text-muted-foreground">
                  Active production runs
                </p>
              </div>
              <Clock className="h-9 w-9 text-purple-500" />
            </div>
          </div>

          <div className="modern-card glow border-l-4 border-green-500 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="mb-1.5 text-sm font-semibold">Completed</p>
                <p
                  className="text-4xl font-bold text-green-600 dark:text-green-400"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {stats?.completedThisMonth || 0}
                </p>
                <p className="mt-2.5 text-sm font-medium text-muted-foreground">
                  Orders this month
                </p>
              </div>
              <CheckCircle className="h-9 w-9 text-green-500" />
            </div>
          </div>
        </div>
      </Animated>

      {/* Charts Section - Professional Cards */}
      <Animated animation="fade-in" delay={600}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Orders by Status */}
          <div className="modern-card fade-in">
            <div className="border-b border-border p-6 dark:border-gray-700">
              <h3 className="text-lg font-bold text-foreground dark:text-white">
                Orders by Status
              </h3>
              <p className="text-sm font-medium text-muted-foreground">
                Current order distribution across all stages
              </p>
            </div>
            <div className="p-6">
              {stats?.ordersByStatus && stats.ordersByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.ordersByStatus}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-gray-200 dark:stroke-gray-700"
                    />
                    <XAxis
                      dataKey="status"
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      formatter={(value: any, name: string) => {
                        if (name === "count") return [value, "Orders"];
                        if (name === "amount")
                          return [formatCurrency(value), "Revenue"];
                        return [value, name];
                      }}
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.5rem",
                      }}
                      labelStyle={{ color: "var(--foreground)" }}
                    />
                    <Legend />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      name="Orders"
                    />
                    <Bar
                      dataKey="amount"
                      fill="hsl(var(--accent))"
                      name="Revenue (₱)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No order data available
                </div>
              )}
            </div>
          </div>

          {/* Employees by Department */}
          <div className="modern-card fade-in">
            <div className="border-b border-border p-6 dark:border-gray-700">
              <h3 className="text-lg font-bold text-foreground dark:text-white">
                Workforce Distribution
              </h3>
              <p className="text-sm font-medium text-muted-foreground">
                Employees across all departments
              </p>
            </div>
            <div className="p-6">
              {stats?.employeesByDepartment &&
              stats.employeesByDepartment.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.employeesByDepartment}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={entry => `${entry.department}: ${entry.count}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.employeesByDepartment.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            Object.values(STATUS_COLORS)[
                              index % Object.values(STATUS_COLORS).length
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.5rem",
                        color: "var(--foreground)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No employee data available
                </div>
              )}
            </div>
          </div>
        </div>
      </Animated>

      {/* Quick Actions - Professional Grid */}
      <Animated animation="slide-in-from-bottom" delay={800}>
        <div className="modern-card fade-in">
          <div className="border-b border-border p-6 dark:border-gray-700">
            <h3 className="text-lg font-bold text-foreground dark:text-white">
              Quick Actions
            </h3>
            <p className="text-sm font-medium text-muted-foreground">
              Navigate to key sections of the system
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Link href="/orders">
                <button className="modern-button flex h-24 w-full flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-border bg-card font-semibold text-foreground transition-all hover:border-primary hover:bg-blue-50 hover:text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-blue-900/20">
                  <Package className="h-6 w-6" />
                  <span className="text-sm">View Orders</span>
                </button>
              </Link>
              <Link href="/clients">
                <button className="modern-button flex h-24 w-full flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-border bg-card font-semibold text-foreground transition-all hover:border-primary hover:bg-blue-50 hover:text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-blue-900/20">
                  <Building2 className="h-6 w-6" />
                  <span className="text-sm">Manage Clients</span>
                </button>
              </Link>
              <Link href="/hr-payroll">
                <button className="modern-button flex h-24 w-full flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-border bg-card font-semibold text-foreground transition-all hover:border-primary hover:bg-blue-50 hover:text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-blue-900/20">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">HR & Payroll</span>
                </button>
              </Link>
              <Link href="/finance">
                <button className="modern-button flex h-24 w-full flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-border bg-card font-semibold text-foreground transition-all hover:border-primary hover:bg-blue-50 hover:text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-blue-900/20">
                  <DollarSign className="h-6 w-6" />
                  <span className="text-sm">Finance</span>
                </button>
              </Link>
              <Link href="/cutting">
                <button className="modern-button flex h-24 w-full flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-border bg-card font-semibold text-foreground transition-all hover:border-primary hover:bg-blue-50 hover:text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-blue-900/20">
                  <Scissors className="h-6 w-6" />
                  <span className="text-sm">Cutting</span>
                </button>
              </Link>
              <Link href="/printing">
                <button className="modern-button flex h-24 w-full flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-border bg-card font-semibold text-foreground transition-all hover:border-primary hover:bg-blue-50 hover:text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-blue-900/20">
                  <Printer className="h-6 w-6" />
                  <span className="text-sm">Printing</span>
                </button>
              </Link>
              <Link href="/quality-control">
                <button className="modern-button flex h-24 w-full flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-border bg-card font-semibold text-foreground transition-all hover:border-primary hover:bg-blue-50 hover:text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-blue-900/20">
                  <BadgeCheck className="h-6 w-6" />
                  <span className="text-sm">Quality Control</span>
                </button>
              </Link>
              <Link href="/analytics">
                <button className="modern-button flex h-24 w-full flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-border bg-card font-semibold text-foreground transition-all hover:border-primary hover:bg-blue-50 hover:text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-blue-900/20">
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-sm">Analytics</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </Animated>

      {/* Manufacturing Stages Overview - Professional Grid */}
      <div className="modern-card fade-in">
        <div className="border-b border-border p-6 dark:border-gray-700">
          <h3 className="text-lg font-bold text-foreground dark:text-white">
            Manufacturing Stages
          </h3>
          <p className="text-sm font-medium text-muted-foreground">
            Quick access to all production stages
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Order Intake",
                icon: Package,
                href: "/orders",
                color: "#2563EB",
              },
              {
                name: "Design & Approval",
                icon: AlertCircle,
                href: "/designs",
                color: "#9333EA",
              },
              {
                name: "Cutting",
                icon: Scissors,
                href: "/cutting",
                color: "#EA580C",
              },
              {
                name: "Printing",
                icon: Printer,
                href: "/printing",
                color: "#16A34A",
              },
              {
                name: "Sewing",
                icon: Users,
                href: "/sewing",
                color: "#CA8A04",
              },
              {
                name: "Quality Control",
                icon: BadgeCheck,
                href: "/quality-control",
                color: "#DC2626",
              },
              {
                name: "Finishing & Packing",
                icon: Package,
                href: "/finishing-packing",
                color: "#6366F1",
              },
              {
                name: "Delivery",
                icon: Clock,
                href: "/delivery",
                color: "#DB2777",
              },
            ].map(stage => (
              <Link key={stage.name} href={stage.href}>
                <div className="glow group cursor-pointer rounded-lg border-2 border-border bg-card p-5 transition-all hover:border-primary hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-blue-900/20">
                  <stage.icon
                    className="mb-3 h-7 w-7 text-muted-foreground transition-colors group-hover:text-primary"
                    style={{ color: stage.color }}
                  />
                  <h4 className="mb-1 text-sm font-semibold text-foreground dark:text-white">
                    {stage.name}
                  </h4>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
