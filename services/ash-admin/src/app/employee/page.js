"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EmployeeDashboardPage;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const button_1 = require("@/components/ui/button");
const tabs_1 = require("@/components/ui/tabs");
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
const skeleton_1 = require("@/components/ui/skeleton");
const empty_state_1 = require("@/components/ui/empty-state");
const lucide_react_1 = require("lucide-react");
const hydration_safe_icon_1 = __importDefault(require("@/components/hydration-safe-icon"));
function EmployeeDashboardPage() {
    const [employee, setEmployee] = (0, react_1.useState)(null);
    const [activeTab, setActiveTab] = (0, react_1.useState)("overview");
    // Get employee info from JWT token
    (0, react_1.useEffect)(() => {
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
            }
            catch (error) {
                console.error("Failed to parse token:", error);
            }
        }
    }, []);
    // Fetch employee production stats
    const { data: statsData, isLoading: statsLoading } = (0, react_query_1.useQuery)({
        queryKey: ["employee-stats", employee?.id],
        queryFn: async () => {
            if (!employee?.id)
                return null;
            const response = await fetch(`/api/employee/stats/${employee.id}`);
            const data = await response.json();
            return data.success ? data.data : null;
        },
        enabled: !!employee?.id,
        staleTime: 30000,
    });
    // Fetch employee tasks based on department
    const { data: tasksData, isLoading: tasksLoading, refetch: refetchTasks, } = (0, react_query_1.useQuery)({
        queryKey: ["employee-tasks", employee?.department, employee?.position],
        queryFn: async () => {
            if (!employee?.department)
                return [];
            const response = await fetch(`/api/employee/tasks?department=${employee.department}&position=${employee.position}`);
            const data = await response.json();
            return data.success ? data.data : [];
        },
        enabled: !!employee?.department,
        staleTime: 30000,
    });
    const stats = statsData || {
        total_pieces: 0,
        today_pieces: 0,
        week_pieces: 0,
        efficiency_rate: 0,
        quality_score: 0,
        tasks_completed: 0,
    };
    const tasks = tasksData || [];
    const getDepartmentIcon = (department) => {
        switch (department) {
            case "Cutting":
                return <hydration_safe_icon_1.default Icon={lucide_react_1.Scissors} className="h-5 w-5"/>;
            case "Printing":
                return <hydration_safe_icon_1.default Icon={lucide_react_1.Printer} className="h-5 w-5"/>;
            case "Sewing":
                return <hydration_safe_icon_1.default Icon={lucide_react_1.Shirt} className="h-5 w-5"/>;
            case "Quality Control":
                return <hydration_safe_icon_1.default Icon={lucide_react_1.Search} className="h-5 w-5"/>;
            case "Finishing":
                return <hydration_safe_icon_1.default Icon={lucide_react_1.Package} className="h-5 w-5"/>;
            default:
                return <hydration_safe_icon_1.default Icon={lucide_react_1.ClipboardList} className="h-5 w-5"/>;
        }
    };
    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };
    const getPriorityBadge = (priority) => {
        switch (priority) {
            case "HIGH":
                return <badge_1.Badge className="bg-red-100 text-red-800">High Priority</badge_1.Badge>;
            case "MEDIUM":
                return <badge_1.Badge className="bg-yellow-100 text-yellow-800">Medium</badge_1.Badge>;
            case "LOW":
                return <badge_1.Badge className="bg-green-100 text-green-800">Low</badge_1.Badge>;
            default:
                return <badge_1.Badge className="bg-gray-100 text-gray-800">{priority}</badge_1.Badge>;
        }
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case "PENDING":
                return <badge_1.Badge className="bg-yellow-100 text-yellow-800">Pending</badge_1.Badge>;
            case "IN_PROGRESS":
                return <badge_1.Badge className="bg-blue-100 text-blue-800">In Progress</badge_1.Badge>;
            case "COMPLETED":
                return <badge_1.Badge className="bg-green-100 text-green-800">Completed</badge_1.Badge>;
            case "BLOCKED":
                return <badge_1.Badge className="bg-red-100 text-red-800">Blocked</badge_1.Badge>;
            default:
                return <badge_1.Badge className="bg-gray-100 text-gray-800">{status}</badge_1.Badge>;
        }
    };
    if (!employee) {
        return (<dashboard_layout_1.default>
        <div className="p-8">
          <card_1.Card>
            <card_1.CardContent className="p-8 text-center">
              <lucide_react_1.AlertCircle className="mx-auto mb-4 h-12 w-12 text-yellow-600"/>
              <h2 className="mb-2 text-xl font-semibold">
                Employee Login Required
              </h2>
              <p className="mb-4 text-gray-600">
                Please login with your employee credentials to access your
                dashboard.
              </p>
              <button_1.Button onClick={() => (window.location.href = "/login")}>
                Go to Login
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </dashboard_layout_1.default>);
    }
    return (<dashboard_layout_1.default>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Employee Dashboard</h1>
            <p className="mt-1 text-gray-600">Welcome back, {employee.name}!</p>
          </div>
          <card_1.Card className="p-4">
            <div className="flex items-center gap-3">
              {getDepartmentIcon(employee.department)}
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-semibold">{employee.department}</p>
              </div>
            </div>
          </card_1.Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-gray-600">
                Today's Production
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.today_pieces}</p>
                  <p className="text-xs text-gray-500">pieces completed</p>
                </div>
                <hydration_safe_icon_1.default Icon={lucide_react_1.Target} className="h-8 w-8 text-blue-600"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-gray-600">
                Weekly Production
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.week_pieces}</p>
                  <p className="text-xs text-gray-500">pieces this week</p>
                </div>
                <hydration_safe_icon_1.default Icon={lucide_react_1.TrendingUp} className="h-8 w-8 text-green-600"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-gray-600">
                Efficiency Rate
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.efficiency_rate}%</p>
                  <p className="text-xs text-gray-500">vs target</p>
                </div>
                <hydration_safe_icon_1.default Icon={lucide_react_1.Award} className="h-8 w-8 text-purple-600"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-gray-600">
                Quality Score
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.quality_score}%</p>
                  <p className="text-xs text-gray-500">defect-free</p>
                </div>
                <hydration_safe_icon_1.default Icon={lucide_react_1.CheckCircle} className="h-8 w-8 text-green-600"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Main Content Tabs */}
        <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
          <tabs_1.TabsList>
            <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="tasks">My Tasks ({tasks.length})</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="attendance">Attendance</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="performance">Performance</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          {/* Overview Tab */}
          <tabs_1.TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Active Tasks */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Active Tasks</card_1.CardTitle>
                  <card_1.CardDescription>Tasks assigned to you</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  {tasksLoading ? (<skeleton_1.SkeletonTable />) : getTasksByStatus("IN_PROGRESS").length === 0 ? (<empty_state_1.EmptyState icon={lucide_react_1.ClipboardList} title="No active tasks" description="All caught up! No tasks in progress."/>) : (<div className="space-y-3">
                      {getTasksByStatus("IN_PROGRESS").map(task => (<div key={task.id} className="rounded-lg border p-3 hover:bg-gray-50">
                          <div className="mb-2 flex items-start justify-between">
                            <h4 className="font-medium">{task.title}</h4>
                            {getPriorityBadge(task.priority)}
                          </div>
                          <p className="mb-2 text-sm text-gray-600">
                            {task.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <lucide_react_1.Clock className="h-3 w-3"/>
                            {task.due_date
                    ? new Date(task.due_date).toLocaleDateString()
                    : "No deadline"}
                          </div>
                        </div>))}
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>

              {/* Employee Profile */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Your Profile</card_1.CardTitle>
                  <card_1.CardDescription>Employee information</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
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
                </card_1.CardContent>
              </card_1.Card>
            </div>
          </tabs_1.TabsContent>

          {/* Tasks Tab */}
          <tabs_1.TabsContent value="tasks" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <card_1.CardTitle>My Tasks</card_1.CardTitle>
                    <card_1.CardDescription>
                      Tasks filtered for {employee.department} -{" "}
                      {employee.position}
                    </card_1.CardDescription>
                  </div>
                  <button_1.Button size="sm" onClick={() => refetchTasks()}>
                    <lucide_react_1.Clock className="mr-2 h-4 w-4"/>
                    Refresh
                  </button_1.Button>
                </div>
              </card_1.CardHeader>
              <card_1.CardContent>
                {tasksLoading ? (<skeleton_1.SkeletonTable />) : tasks.length === 0 ? (<empty_state_1.EmptyState icon={lucide_react_1.ClipboardList} title="No tasks found" description={`No tasks assigned to ${employee.department} department yet.`}/>) : (<div className="space-y-4">
                    {tasks.map(task => (<div key={task.id} className="rounded-lg border p-4 hover:bg-gray-50">
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
                            <lucide_react_1.Clock className="h-4 w-4"/>
                            {task.due_date
                    ? new Date(task.due_date).toLocaleDateString()
                    : "No deadline"}
                          </div>
                          <div className="flex items-center gap-1">
                            <lucide_react_1.Calendar className="h-4 w-4"/>
                            Created{" "}
                            {new Date(task.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>))}
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Attendance Tab */}
          <tabs_1.TabsContent value="attendance">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Attendance Records</card_1.CardTitle>
                <card_1.CardDescription>
                  Your time-in and time-out history
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <empty_state_1.EmptyState icon={lucide_react_1.Clock} title="Coming Soon" description="Attendance tracking will be available here."/>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Performance Tab */}
          <tabs_1.TabsContent value="performance">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Performance Metrics</card_1.CardTitle>
                <card_1.CardDescription>
                  Your production and quality statistics
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <empty_state_1.EmptyState icon={lucide_react_1.TrendingUp} title="Coming Soon" description="Detailed performance analytics will be available here."/>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </div>
    </dashboard_layout_1.default>);
}
