'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminDashboard;
const react_query_1 = require("@tanstack/react-query");
const button_1 = require("@/components/ui/button");
const animated_1 = require("@/components/ui/animated");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const hydration_safe_icon_1 = __importDefault(require("@/components/hydration-safe-icon"));
const recharts_1 = require("recharts");
const api_1 = require("@/lib/api");
const STATUS_COLORS = {
    draft: '#9CA3AF',
    pending_approval: '#F59E0B',
    confirmed: '#3B82F6',
    in_production: '#8B5CF6',
    completed: '#10B981',
    cancelled: '#EF4444'
};
function AdminDashboard() {
    // Fetch dashboard stats
    const { data: stats, isLoading, error, refetch, isFetching } = (0, react_query_1.useQuery)({
        queryKey: ['admin-dashboard'],
        queryFn: async () => {
            const [clientsData, ordersData, employeesData] = await Promise.all([
                api_1.api.getClients({ limit: 1 }),
                api_1.api.getOrders({ limit: 100 }),
                fetch('/api/hr/employees?limit=100', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('ash_token')}`
                    }
                }).then(res => res.json()).catch(() => ({ success: false, data: [] }))
            ]);
            const orders = ordersData.data?.orders || [];
            const employees = employeesData.success ? (employeesData.data || []) : [];
            // Calculate order statistics by status
            const ordersByStatus = orders.reduce((acc, order) => {
                const status = order.status || 'draft';
                if (!acc[status]) {
                    acc[status] = { status, count: 0, amount: 0 };
                }
                acc[status].count++;
                acc[status].amount += order.total_amount || 0;
                return acc;
            }, {});
            // Calculate employees by department
            const employeesByDept = employees.reduce((acc, emp) => {
                const dept = emp.department || 'Other';
                acc[dept] = (acc[dept] || 0) + 1;
                return acc;
            }, {});
            // Calculate total revenue
            const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
            // Orders in production
            const ordersInProduction = orders.filter((o) => o.status === 'in_production').length;
            // Pending approvals
            const pendingApprovals = orders.filter((o) => o.status === 'pending_approval').length;
            // Completed this month
            const thisMonth = new Date().getMonth();
            const completedThisMonth = orders.filter((o) => {
                return o.status === 'completed' && new Date(o.created_at).getMonth() === thisMonth;
            }).length;
            return {
                totalClients: clientsData.data?.pagination?.total || 0,
                totalOrders: orders.length,
                totalRevenue,
                activeEmployees: employees.filter((e) => e.status === 'ACTIVE' || e.is_active).length,
                ordersInProduction,
                pendingApprovals,
                completedThisMonth,
                ordersByStatus: Object.values(ordersByStatus),
                employeesByDepartment: Object.entries(employeesByDept).map(([department, count]) => ({ department, count })),
                revenueByMonth: [], // Would need historical data
                recentActivity: []
            };
        },
        staleTime: 30000,
        refetchInterval: 60000,
    });
    if (isLoading) {
        return (<div className="space-y-6">
        <div className="responsive-grid">
          {[...Array(4)].map((_, i) => (<div key={i} className="stats-card">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>))}
        </div>
      </div>);
    }
    if (error) {
        return (<div>
        <div className="modern-card p-6 fade-in">
          <div className="text-center">
            <hydration_safe_icon_1.default Icon={lucide_react_1.AlertCircle} className="w-12 h-12 text-red-500 mx-auto mb-4"/>
            <p className="text-base font-medium mb-4">Failed to load dashboard data</p>
            <button_1.Button onClick={() => refetch()} className="modern-button">Retry</button_1.Button>
          </div>
        </div>
      </div>);
    }
    const formatCurrency = (amount) => `₱${amount.toLocaleString()}`;
    return (<div className="space-y-6">
      {/* Professional Header with Refresh */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Admin Dashboard</h2>
          <p className="text-base font-medium text-gray-600 mt-1">Complete system overview and analytics</p>
        </div>
        <button_1.Button variant="outline" onClick={() => refetch()} disabled={isFetching} className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold px-4 py-2.5 rounded-lg transition-all">
          <hydration_safe_icon_1.default Icon={lucide_react_1.RefreshCw} className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`}/>
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </button_1.Button>
      </div>

      {/* Key Metrics - Professional Stats Cards */}
      <animated_1.StaggeredAnimation staggerDelay={100} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stats-card group hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-1.5">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{formatCurrency(stats?.totalRevenue || 0)}</p>
              <p className="text-sm font-medium text-green-600 mt-2 flex items-center">
                <hydration_safe_icon_1.default Icon={lucide_react_1.TrendingUp} className="w-4 h-4 mr-1.5"/>
                {stats?.totalOrders || 0} orders
              </p>
            </div>
            <div className="bg-green-50 p-3.5 rounded-xl">
              <hydration_safe_icon_1.default Icon={lucide_react_1.DollarSign} className="w-7 h-7 text-green-600"/>
            </div>
          </div>
        </div>

        <div className="stats-card group hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-1.5">Active Orders</p>
              <p className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{stats?.totalOrders || 0}</p>
              <p className="text-sm font-medium text-blue-600 mt-2 flex items-center">
                <hydration_safe_icon_1.default Icon={lucide_react_1.Package} className="w-4 h-4 mr-1.5"/>
                {stats?.ordersInProduction || 0} in production
              </p>
            </div>
            <div className="bg-blue-50 p-3.5 rounded-xl">
              <hydration_safe_icon_1.default Icon={lucide_react_1.Package} className="w-7 h-7 text-blue-600"/>
            </div>
          </div>
        </div>

        <div className="stats-card group hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-1.5">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{stats?.totalClients || 0}</p>
              <p className="text-sm font-medium text-purple-600 mt-2 flex items-center">
                <hydration_safe_icon_1.default Icon={lucide_react_1.Building2} className="w-4 h-4 mr-1.5"/>
                Active partnerships
              </p>
            </div>
            <div className="bg-purple-50 p-3.5 rounded-xl">
              <hydration_safe_icon_1.default Icon={lucide_react_1.Building2} className="w-7 h-7 text-purple-600"/>
            </div>
          </div>
        </div>

        <div className="stats-card group hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-1.5">Employees</p>
              <p className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{stats?.activeEmployees || 0}</p>
              <p className="text-sm font-medium text-orange-600 mt-2 flex items-center">
                <hydration_safe_icon_1.default Icon={lucide_react_1.Users} className="w-4 h-4 mr-1.5"/>
                Active workforce
              </p>
            </div>
            <div className="bg-orange-50 p-3.5 rounded-xl">
              <hydration_safe_icon_1.default Icon={lucide_react_1.Users} className="w-7 h-7 text-orange-600"/>
            </div>
          </div>
        </div>
      </animated_1.StaggeredAnimation>

      {/* Alert Cards - Modern Design */}
      <animated_1.Animated animation="slide-in-from-bottom" delay={400}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="modern-card border-l-4 border-yellow-500 p-6 glow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1.5">Pending Approvals</p>
                <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400" style={{ letterSpacing: '-0.02em' }}>{stats?.pendingApprovals || 0}</p>
                <p className="text-sm font-medium text-muted-foreground mt-2.5">Orders awaiting approval</p>
              </div>
              <hydration_safe_icon_1.default Icon={lucide_react_1.AlertCircle} className="w-9 h-9 text-yellow-500"/>
            </div>
          </div>

          <div className="modern-card border-l-4 border-purple-500 p-6 glow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1.5">In Production</p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400" style={{ letterSpacing: '-0.02em' }}>{stats?.ordersInProduction || 0}</p>
                <p className="text-sm font-medium text-muted-foreground mt-2.5">Active production runs</p>
              </div>
              <hydration_safe_icon_1.default Icon={lucide_react_1.Clock} className="w-9 h-9 text-purple-500"/>
            </div>
          </div>

          <div className="modern-card border-l-4 border-green-500 p-6 glow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1.5">Completed</p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400" style={{ letterSpacing: '-0.02em' }}>{stats?.completedThisMonth || 0}</p>
                <p className="text-sm font-medium text-muted-foreground mt-2.5">Orders this month</p>
              </div>
              <hydration_safe_icon_1.default Icon={lucide_react_1.CheckCircle} className="w-9 h-9 text-green-500"/>
            </div>
          </div>
        </div>
      </animated_1.Animated>

      {/* Charts Section - Professional Cards */}
      <animated_1.Animated animation="fade-in" delay={600}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="modern-card fade-in">
          <div className="p-6 border-b border-border dark:border-gray-700">
            <h3 className="text-lg font-bold text-foreground dark:text-white">Orders by Status</h3>
            <p className="text-sm font-medium text-muted-foreground">Current order distribution across all stages</p>
          </div>
          <div className="p-6">
            {stats?.ordersByStatus && stats.ordersByStatus.length > 0 ? (<recharts_1.ResponsiveContainer width="100%" height={300}>
                <recharts_1.BarChart data={stats.ordersByStatus}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700"/>
                  <recharts_1.XAxis dataKey="status" tick={{ fontSize: 12 }} className="text-muted-foreground"/>
                  <recharts_1.YAxis tick={{ fontSize: 12 }} className="text-muted-foreground"/>
                  <recharts_1.Tooltip formatter={(value, name) => {
                if (name === 'count')
                    return [value, 'Orders'];
                if (name === 'amount')
                    return [formatCurrency(value), 'Revenue'];
                return [value, name];
            }} contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem'
            }} labelStyle={{ color: 'var(--foreground)' }}/>
                  <recharts_1.Legend />
                  <recharts_1.Bar dataKey="count" fill="hsl(var(--primary))" name="Orders"/>
                  <recharts_1.Bar dataKey="amount" fill="hsl(var(--accent))" name="Revenue (₱)"/>
                </recharts_1.BarChart>
              </recharts_1.ResponsiveContainer>) : (<div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No order data available
              </div>)}
          </div>
        </div>

        {/* Employees by Department */}
        <div className="modern-card fade-in">
          <div className="p-6 border-b border-border dark:border-gray-700">
            <h3 className="text-lg font-bold text-foreground dark:text-white">Workforce Distribution</h3>
            <p className="text-sm font-medium text-muted-foreground">Employees across all departments</p>
          </div>
          <div className="p-6">
            {stats?.employeesByDepartment && stats.employeesByDepartment.length > 0 ? (<recharts_1.ResponsiveContainer width="100%" height={300}>
                <recharts_1.PieChart>
                  <recharts_1.Pie data={stats.employeesByDepartment} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.department}: ${entry.count}`} outerRadius={100} fill="#8884d8" dataKey="count">
                    {stats.employeesByDepartment.map((entry, index) => (<recharts_1.Cell key={`cell-${index}`} fill={Object.values(STATUS_COLORS)[index % Object.values(STATUS_COLORS).length]}/>))}
                  </recharts_1.Pie>
                  <recharts_1.Tooltip contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                color: 'var(--foreground)'
            }}/>
                </recharts_1.PieChart>
              </recharts_1.ResponsiveContainer>) : (<div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No employee data available
              </div>)}
          </div>
        </div>
        </div>
      </animated_1.Animated>

      {/* Quick Actions - Professional Grid */}
      <animated_1.Animated animation="slide-in-from-bottom" delay={800}>
        <div className="modern-card fade-in">
          <div className="p-6 border-b border-border dark:border-gray-700">
            <h3 className="text-lg font-bold text-foreground dark:text-white">Quick Actions</h3>
            <p className="text-sm font-medium text-muted-foreground">Navigate to key sections of the system</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <link_1.default href="/orders">
                <button className="modern-button w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-primary text-white border-2 border-primary rounded-lg hover:bg-primary/90 hover:border-primary/90 hover:shadow-lg transition-all font-semibold">
                  <hydration_safe_icon_1.default Icon={lucide_react_1.Package} className="w-6 h-6"/>
                  <span className="text-sm">View Orders</span>
                </button>
              </link_1.default>
              <link_1.default href="/clients">
                <button className="modern-button w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-primary text-white border-2 border-primary rounded-lg hover:bg-primary/90 hover:border-primary/90 hover:shadow-lg transition-all font-semibold">
                  <hydration_safe_icon_1.default Icon={lucide_react_1.Building2} className="w-6 h-6"/>
                  <span className="text-sm">Manage Clients</span>
                </button>
              </link_1.default>
              <link_1.default href="/hr-payroll">
                <button className="modern-button w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-primary text-white border-2 border-primary rounded-lg hover:bg-primary/90 hover:border-primary/90 hover:shadow-lg transition-all font-semibold">
                  <hydration_safe_icon_1.default Icon={lucide_react_1.Users} className="w-6 h-6"/>
                  <span className="text-sm">HR & Payroll</span>
                </button>
              </link_1.default>
              <link_1.default href="/finance">
                <button className="modern-button w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-primary text-white border-2 border-primary rounded-lg hover:bg-primary/90 hover:border-primary/90 hover:shadow-lg transition-all font-semibold">
                  <hydration_safe_icon_1.default Icon={lucide_react_1.DollarSign} className="w-6 h-6"/>
                  <span className="text-sm">Finance</span>
                </button>
              </link_1.default>
              <link_1.default href="/cutting">
                <button className="modern-button w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-primary text-white border-2 border-primary rounded-lg hover:bg-primary/90 hover:border-primary/90 hover:shadow-lg transition-all font-semibold">
                  <hydration_safe_icon_1.default Icon={lucide_react_1.Scissors} className="w-6 h-6"/>
                  <span className="text-sm">Cutting</span>
                </button>
              </link_1.default>
              <link_1.default href="/printing">
                <button className="modern-button w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-primary text-white border-2 border-primary rounded-lg hover:bg-primary/90 hover:border-primary/90 hover:shadow-lg transition-all font-semibold">
                  <hydration_safe_icon_1.default Icon={lucide_react_1.Printer} className="w-6 h-6"/>
                  <span className="text-sm">Printing</span>
                </button>
              </link_1.default>
              <link_1.default href="/quality-control">
                <button className="modern-button w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-primary text-white border-2 border-primary rounded-lg hover:bg-primary/90 hover:border-primary/90 hover:shadow-lg transition-all font-semibold">
                  <hydration_safe_icon_1.default Icon={lucide_react_1.BadgeCheck} className="w-6 h-6"/>
                  <span className="text-sm">Quality Control</span>
                </button>
              </link_1.default>
              <link_1.default href="/analytics">
                <button className="modern-button w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-primary text-white border-2 border-primary rounded-lg hover:bg-primary/90 hover:border-primary/90 hover:shadow-lg transition-all font-semibold">
                  <hydration_safe_icon_1.default Icon={lucide_react_1.TrendingUp} className="w-6 h-6"/>
                  <span className="text-sm">Analytics</span>
                </button>
              </link_1.default>
            </div>
          </div>
        </div>
      </animated_1.Animated>

      {/* Manufacturing Stages Overview - Professional Grid */}
      <div className="modern-card fade-in">
        <div className="p-6 border-b border-border dark:border-gray-700">
          <h3 className="text-lg font-bold text-foreground dark:text-white">Manufacturing Stages</h3>
          <p className="text-sm font-medium text-muted-foreground">Quick access to all production stages</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
            { name: 'Order Intake', icon: lucide_react_1.Package, href: '/orders', color: '#2563EB' },
            { name: 'Design & Approval', icon: lucide_react_1.AlertCircle, href: '/designs', color: '#9333EA' },
            { name: 'Cutting', icon: lucide_react_1.Scissors, href: '/cutting', color: '#EA580C' },
            { name: 'Printing', icon: lucide_react_1.Printer, href: '/printing', color: '#16A34A' },
            { name: 'Sewing', icon: lucide_react_1.Users, href: '/sewing', color: '#CA8A04' },
            { name: 'Quality Control', icon: lucide_react_1.BadgeCheck, href: '/quality-control', color: '#DC2626' },
            { name: 'Finishing & Packing', icon: lucide_react_1.Package, href: '/finishing-packing', color: '#6366F1' },
            { name: 'Delivery', icon: lucide_react_1.Clock, href: '/delivery', color: '#DB2777' },
        ].map((stage) => (<link_1.default key={stage.name} href={stage.href}>
                <div className="p-5 border-2 border-border dark:border-gray-700 rounded-lg bg-card dark:bg-gray-800 hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all group glow">
                  <hydration_safe_icon_1.default Icon={stage.icon} className="w-7 h-7 mb-3 text-muted-foreground group-hover:text-primary transition-colors" style={{ color: stage.color }}/>
                  <h4 className="font-semibold text-foreground dark:text-white text-sm mb-1">{stage.name}</h4>
                  <hydration_safe_icon_1.default Icon={lucide_react_1.ArrowRight} className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"/>
                </div>
              </link_1.default>))}
          </div>
        </div>
      </div>
    </div>);
}
