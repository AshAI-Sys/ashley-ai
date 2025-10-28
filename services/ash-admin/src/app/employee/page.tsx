"use client";

// Force dynamic rendering (don't pre-render during build)
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard-layout";
import { SkeletonTable } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorAlert } from "@/components/ui/error-alert";
import {
  Clock,
  ClipboardList,
  CheckCircle,
  Package,
  Scissors,
  Printer,
  Shirt,
  Search as SearchIcon,
  AlertCircle,
  TrendingUp,
  Calendar,
  Target,
  Award, DollarSign,
} from "lucide-react";
import HydrationSafeIcon from "@/components/hydration-safe-icon";

interface EmployeeProfile {
  id: string;
  employee_number: string;
  name: string;
  email: string;
  role: string;
  position: string;
  department: string;
  salary_type: string;
}

interface Task {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
}

interface ProductionStats {
  total_pieces: number;
  today_pieces: number;
  week_pieces: number;
  efficiency_rate: number;
  quality_score: number;
  tasks_completed: number;
}

export default function EmployeeDashboardPage() {
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Get employee info from JWT token
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.type === "employee") {
          setEmployee({
            id: payload.id,
            employee_number: payload.employee_number,
            name: payload.name || `${payload.first_name} ${payload.last_name}`,
            email: payload.email,
            role: payload.role,
            position: payload.position,
            department: payload.department,
            salary_type: payload.salary_type || "DAILY",
          });
        }
      } catch (error) {
        console.error("Failed to parse token:", error);
      }
    }
  }, []);

  // Fetch employee production stats
  const { data: statsData, isLoading: _statsLoading } = useQuery({
    queryKey: ["employee-stats", employee?.id],
    queryFn: async () => {
      if (!employee?.id) return null;
      const response = await fetch(`/api/employee/stats/${employee.id}`);
      const data = await response.json();
      return data.success ? data.data : null;
    },
    enabled: !!employee?.id,
    staleTime: 30000,
  });

  // Fetch employee tasks based on department
  const {
    data: tasksData,
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useQuery({
    queryKey: ["employee-tasks", employee?.department, employee?.position],
    queryFn: async () => {
      if (!employee?.department) return [];
      const response = await fetch(
        `/api/employee/tasks?department=${employee.department}&position=${employee.position}`
      );
      const data = await response.json();
      return data.success ? data.data : [];
    },
    enabled: !!employee?.department,
    staleTime: 30000,
  });

  const stats: ProductionStats = statsData || {
    total_pieces: 0,
    today_pieces: 0,
    week_pieces: 0,
    efficiency_rate: 0,
    quality_score: 0,
    tasks_completed: 0,
  };

  const tasks: Task[] = tasksData || [];

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case "Cutting":
        return <HydrationSafeIcon Icon={Scissors} className="h-5 w-5" />;
      case "Printing":
        return <HydrationSafeIcon Icon={Printer} className="h-5 w-5" />;
      case "Sewing":
        return <HydrationSafeIcon Icon={Shirt} className="h-5 w-5" />;
      case "Quality Control":
        return <HydrationSafeIcon Icon={SearchIcon} className="h-5 w-5" />;
      case "Finishing":
        return <HydrationSafeIcon Icon={Package} className="h-5 w-5" />;
      default:
        return <HydrationSafeIcon Icon={ClipboardList} className="h-5 w-5" />;
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case "MEDIUM":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "LOW":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "BLOCKED":
        return <Badge className="bg-red-100 text-red-800">Blocked</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-yellow-600" />
              <h2 className="mb-2 text-xl font-semibold">
                Employee Login Required
              </h2>
              <p className="mb-4 text-gray-600">
                Please login with your employee credentials to access your
                dashboard.
              </p>
              <Button onClick={() => (window.location.href = "/login")}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Employee Dashboard</h1>
            <p className="mt-1 text-gray-600">Welcome back, {employee.name}!</p>
          </div>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              {getDepartmentIcon(employee.department)}
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-semibold">{employee.department}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Today's Production
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.today_pieces}</p>
                  <p className="text-xs text-gray-500">pieces completed</p>
                </div>
                <HydrationSafeIcon Icon={Target} className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Weekly Production
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.week_pieces}</p>
                  <p className="text-xs text-gray-500">pieces this week</p>
                </div>
                <HydrationSafeIcon Icon={TrendingUp} className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Efficiency Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.efficiency_rate}%</p>
                  <p className="text-xs text-gray-500">vs target</p>
                </div>
                <HydrationSafeIcon Icon={Award} className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Quality Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.quality_score}%</p>
                  <p className="text-xs text-gray-500">defect-free</p>
                </div>
                <HydrationSafeIcon Icon={CheckCircle} className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">My Tasks ({tasks.length})</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Active Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Tasks</CardTitle>
                  <CardDescription>Tasks assigned to you</CardDescription>
                </CardHeader>
                <CardContent>
                  {tasksLoading ? (
                    <SkeletonTable />
                  ) : getTasksByStatus("IN_PROGRESS").length === 0 ? (
                    <EmptyState
                      icon={ClipboardList}
                      title="No active tasks"
                      description="All caught up! No tasks in progress."
                    />
                  ) : (
                    <div className="space-y-3">
                      {getTasksByStatus("IN_PROGRESS").map(task => (
                        <div
                          key={task.id}
                          className="rounded-lg border p-3 hover:bg-gray-50"
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <h4 className="font-medium">{task.title}</h4>
                            {getPriorityBadge(task.priority)}
                          </div>
                          <p className="mb-2 text-sm text-gray-600">
                            {task.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {task.due_date
                              ? new Date(task.due_date).toLocaleDateString()
                              : "No deadline"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Employee Profile */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>Employee information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Employee Number</p>
                      <p className="font-semibold">
                        {employee.employee_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Position</p>
                      <p className="font-semibold">{employee.position}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-semibold">{employee.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Salary Type</p>
                      <p className="font-semibold">{employee.salary_type}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{employee.email}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="mb-3 font-medium">Performance Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Total Production
                        </span>
                        <span className="font-semibold">
                          {stats.total_pieces} pieces
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Tasks Completed
                        </span>
                        <span className="font-semibold">
                          {stats.tasks_completed}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Efficiency
                        </span>
                        <span className="font-semibold">
                          {stats.efficiency_rate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Tasks</CardTitle>
                    <CardDescription>
                      Tasks filtered for {employee.department} -{" "}
                      {employee.position}
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => refetchTasks()}>
                    <Clock className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <SkeletonTable />
                ) : tasks.length === 0 ? (
                  <EmptyState
                    icon={ClipboardList}
                    title="No tasks found"
                    description={`No tasks assigned to ${employee.department} department yet.`}
                  />
                ) : (
                  <div className="space-y-4">
                    {tasks.map(task => (
                      <div
                        key={task.id}
                        className="rounded-lg border p-4 hover:bg-gray-50"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <h3 className="font-semibold">{task.title}</h3>
                              {getStatusBadge(task.status)}
                              {getPriorityBadge(task.priority)}
                            </div>
                            <p className="text-sm text-gray-600">
                              {task.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {task.due_date
                              ? new Date(task.due_date).toLocaleDateString()
                              : "No deadline"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Created{" "}
                            {new Date(task.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>
                  Your time-in and time-out history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={Clock}
                  title="Coming Soon"
                  description="Attendance tracking will be available here."
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Your production and quality statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={TrendingUp}
                  title="Coming Soon"
                  description="Detailed performance analytics will be available here."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
