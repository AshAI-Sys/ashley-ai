'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Animated, StaggeredAnimation } from '@/components/ui/animated'
import {
  TrendingUp, TrendingDown,
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
  BadgeCheck
} from 'lucide-react'
import Link from 'next/link'
import HydrationSafeIcon from '@/components/hydration-safe-icon'
import {
  BarChart,
  Bar,
  PieChart,
  Pie, LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { api } from '@/lib/api'

interface DashboardStats {
  totalClients: number
  totalOrders: number
  totalRevenue: number
  activeEmployees: number
  ordersInProduction: number
  pendingApprovals: number
  completedThisMonth: number
  ordersByStatus: { status: string, count: number, amount: number }[]
  revenueByMonth: { month: string, revenue: number, orders: number }[]
  employeesByDepartment: { department: string, count: number }[]
  recentActivity: { type: string, message: string, timestamp: string }[]
}

const STATUS_COLORS = {
  draft: '#9CA3AF',
  pending_approval: '#F59E0B',
  confirmed: '#3B82F6',
  in_production: '#8B5CF6',
  completed: '#10B981',
  cancelled: '#EF4444'
}

export default function AdminDashboard() {
  // Fetch dashboard stats
  const { data: stats, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const [clientsData, ordersData, employeesData] = await Promise.all([
        api.getClients({ limit: 1 }),
        api.getOrders({ limit: 100 }),
        fetch('/api/hr/employees?limit=100', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('ash_token')}`
          }
        }).then(res => res.json()).catch(() => ({ success: false, data: [] }))
      ])

      const orders = ordersData.data?.orders || []
      const employees = employeesData.success ? (employeesData.data || []) : []

      // Calculate order statistics by status
      const ordersByStatus = orders.reduce((acc: any, order: any) => {
        const status = order.status || 'draft'
        if (!acc[status]) {
          acc[status] = { status, count: 0, amount: 0 }
        }
        acc[status].count++
        acc[status].amount += order.total_amount || 0
        return acc
      }, {})

      // Calculate employees by department
      const employeesByDept = employees.reduce((acc: any, emp: any) => {
        const dept = emp.department || 'Other'
        acc[dept] = (acc[dept] || 0) + 1
        return acc
      }, {})

      // Calculate total revenue
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0)

      // Orders in production
      const ordersInProduction = orders.filter((o: any) => o.status === 'in_production').length

      // Pending approvals
      const pendingApprovals = orders.filter((o: any) => o.status === 'pending_approval').length

      // Completed this month
      const thisMonth = new Date().getMonth()
      const completedThisMonth = orders.filter((o: any) => {
        return o.status === 'completed' && new Date(o.created_at).getMonth() === thisMonth
      }).length

      return {
        totalClients: clientsData.data?.pagination?.total || 0,
        totalOrders: orders.length,
        totalRevenue,
        activeEmployees: employees.filter((e: any) => e.status === 'ACTIVE' || e.is_active).length,
        ordersInProduction,
        pendingApprovals,
        completedThisMonth,
        ordersByStatus: Object.values(ordersByStatus),
        employeesByDepartment: Object.entries(employeesByDept).map(([department, count]) => ({ department, count })),
        revenueByMonth: [], // Would need historical data
        recentActivity: []
      } as DashboardStats
    },
    staleTime: 30000,
    refetchInterval: 60000,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="responsive-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stats-card">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="modern-card p-6 fade-in">
          <div className="text-center">
            <HydrationSafeIcon Icon={AlertCircle} className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-base font-medium mb-4">Failed to load dashboard data</p>
            <Button onClick={() => refetch()} className="modern-button">Retry</Button>
          </div>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => `â‚±${amount.toLocaleString()}`

  return (
    <div className="space-y-6">
      {/* Professional Header with Refresh */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Admin Dashboard</h2>
          <p className="text-base font-medium text-gray-600 mt-1">Complete system overview and analytics</p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold px-4 py-2.5 rounded-lg transition-all"
        >
          <HydrationSafeIcon Icon={RefreshCw} className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Key Metrics - Professional Stats Cards */}
      <StaggeredAnimation staggerDelay={100} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stats-card group hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-1.5">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{formatCurrency(stats?.totalRevenue || 0)}</p>
              <div className="text-sm font-medium text-green-600 mt-2 flex items-center">
                <HydrationSafeIcon Icon={TrendingUp} className="w-4 h-4 mr-1.5" />
                {stats?.totalOrders || 0} orders
              </div>
            </div>
            <div className="bg-green-50 p-3.5 rounded-xl">
              <HydrationSafeIcon Icon={DollarSign} className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>

        <div className="stats-card group hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-1.5">Active Orders</p>
              <p className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{stats?.totalOrders || 0}</p>
              <div className="text-sm font-medium text-blue-600 mt-2 flex items-center">
                <HydrationSafeIcon Icon={Package} className="w-4 h-4 mr-1.5" />
                {stats?.ordersInProduction || 0} in production
              </div>
            </div>
            <div className="bg-blue-50 p-3.5 rounded-xl">
              <HydrationSafeIcon Icon={Package} className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="stats-card group hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-1.5">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{stats?.totalClients || 0}</p>
              <div className="text-sm font-medium text-purple-600 mt-2 flex items-center">
                <HydrationSafeIcon Icon={Building2} className="w-4 h-4 mr-1.5" />
                Active partnerships
              </div>
            </div>
            <div className="bg-purple-50 p-3.5 rounded-xl">
              <HydrationSafeIcon Icon={Building2} className="w-7 h-7 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="stats-card group hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-1.5">Employees</p>
              <p className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{stats?.activeEmployees || 0}</p>
              <div className="text-sm font-medium text-orange-600 mt-2 flex items-center">
                <HydrationSafeIcon Icon={Users} className="w-4 h-4 mr-1.5" />
                Active workforce
              </div>
            </div>
            <div className="bg-orange-50 p-3.5 rounded-xl">
              <HydrationSafeIcon Icon={Users} className="w-7 h-7 text-orange-600" />
            </div>
          </div>
        </div>
      </StaggeredAnimation>

      {/* Alert Cards - Modern Design */}
      <Animated animation="slide-in-from-bottom" delay={400}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="modern-card border-l-4 border-yellow-500 p-6 glow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1.5">Pending Approvals</p>
                <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400" style={{ letterSpacing: '-0.02em' }}>{stats?.pendingApprovals || 0}</p>
                <p className="text-sm font-medium text-muted-foreground mt-2.5">Orders awaiting approval</p>
              </div>
              <HydrationSafeIcon Icon={AlertCircle} className="w-9 h-9 text-yellow-500" />
            </div>
          </div>

          <div className="modern-card border-l-4 border-purple-500 p-6 glow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1.5">In Production</p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400" style={{ letterSpacing: '-0.02em' }}>{stats?.ordersInProduction || 0}</p>
                <p className="text-sm font-medium text-muted-foreground mt-2.5">Active production runs</p>
              </div>
              <HydrationSafeIcon Icon={Clock} className="w-9 h-9 text-purple-500" />
            </div>
          </div>

          <div className="modern-card border-l-4 border-green-500 p-6 glow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1.5">Completed</p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400" style={{ letterSpacing: '-0.02em' }}>{stats?.completedThisMonth || 0}</p>
                <p className="text-sm font-medium text-muted-foreground mt-2.5">Orders this month</p>
              </div>
              <HydrationSafeIcon Icon={CheckCircle} className="w-9 h-9 text-green-500" />
            </div>
          </div>
        </div>
      </Animated>

      {/* Charts Section - Professional Cards */}
      <Animated animation="fade-in" delay={600}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="modern-card fade-in">
          <div className="p-6 border-b border-border dark:border-gray-700">
            <h3 className="text-lg font-bold text-foreground dark:text-white">Orders by Status</h3>
            <p className="text-sm font-medium text-muted-foreground">Current order distribution across all stages</p>
          </div>
          <div className="p-6">
            {stats?.ordersByStatus && stats.ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.ordersByStatus}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip
                    formatter={(value: any, name: string) => {
                      if (name === 'count') return [value, 'Orders']
                      if (name === 'amount') return [formatCurrency(value), 'Revenue']
                      return [value, name]
                    }}
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem'
                    }}
                    labelStyle={{ color: 'var(--foreground)' }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Orders" />
                  <Bar dataKey="amount" fill="hsl(var(--accent))" name="Revenue (â‚±)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No order data available
              </div>
            )}
          </div>
        </div>

        {/* Employees by Department */}
        <div className="modern-card fade-in">
          <div className="p-6 border-b border-border dark:border-gray-700">
            <h3 className="text-lg font-bold text-foreground dark:text-white">Workforce Distribution</h3>
            <p className="text-sm font-medium text-muted-foreground">Employees across all departments</p>
          </div>
          <div className="p-6">
            {stats?.employeesByDepartment && stats.employeesByDepartment.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.employeesByDepartment}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.department}: ${entry.count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.employeesByDepartment.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={Object.values(STATUS_COLORS)[index % Object.values(STATUS_COLORS).length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      color: 'var(--foreground)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
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
          <div className="p-6 border-b border-border dark:border-gray-700">
            <h3 className="text-lg font-bold text-foreground dark:text-white">Quick Actions</h3>
            <p className="text-sm font-medium text-muted-foreground">Navigate to key sections of the system</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/orders">
                <button className="modern-button w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-primary text-white border-2 border-primary rounded-lg hover:bg-primary/90 hover:border-primary/90 hover:shadow-lg transition-all font-semibold">
                  <HydrationSafeIcon Icon={Package} className="w-6 h-6" />
                  <span className="text-sm">View Orders</span>
                </button>
              </Link>
              <Link href="/clients">
                <button className="modern-button w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-primary text-white border-2 border-primary rounded-lg hover:bg-primary/90 hover:border-primary/90 hover:shadow-lg transition-all font-semibold">
                  <HydrationSafeIcon Icon={Building2} className="w-6 h-6" />
                  <span className="text-sm">Manage Clients</span>
                </button>
              </Link>
              <Link href="/hr-payroll">
                <button className="modern-button w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-primary text-white border-2 border-primary rounded-lg hover:bg-primary/90 hover:border-primary/90 hover:shadow-lg transition-all font-semibold">
                  <HydrationSafeIcon Icon={Users} className="w-6 h-6" />
                  <span className="text-sm">HR & Payroll</span>
                </button>
              </Link>
              <Link href="/finance">
                <button className="modern-button w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-primary text-white border-2 border-primary rounded-lg hover:bg-primary/90 hover:border-primary/90 hover:shadow-lg transition-all font-semibold">
                  <HydrationSafeIcon Icon={DollarSign} className="w-6 h-6" />
                  <span className="text-sm">Finance</span>
                </button>
              </Link>
              <Link href="/cutting">
                <button className="modern-button w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-primary text-white border-2 border-primary rounded-lg hover:bg-primary/90 hover:border-primary/90 hover:shadow-lg transition-all font-semibold">
                  <HydrationSafeIcon Icon={Scissors} className="w-6 h-6" />
                  <span className="text-sm">Cutting</span>
                </button>
              </Link>
              <Link href="/printing">
                <button className="modern-button w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-primary text-white border-2 border-primary rounded-lg hover:bg-primary/90 hover:border-primary/90 hover:shadow-lg transition-all font-semibold">
                  <HydrationSafeIcon Icon={Printer} className="w-6 h-6" />
                  <span className="text-sm">Printing</span>
                </button>
              </Link>
              <Link href="/quality-control">
                <button className="modern-button w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-primary text-white border-2 border-primary rounded-lg hover:bg-primary/90 hover:border-primary/90 hover:shadow-lg transition-all font-semibold">
                  <HydrationSafeIcon Icon={BadgeCheck} className="w-6 h-6" />
                  <span className="text-sm">Quality Control</span>
                </button>
              </Link>
              <Link href="/analytics">
                <button className="modern-button w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-primary text-white border-2 border-primary rounded-lg hover:bg-primary/90 hover:border-primary/90 hover:shadow-lg transition-all font-semibold">
                  <HydrationSafeIcon Icon={TrendingUp} className="w-6 h-6" />
                  <span className="text-sm">Analytics</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </Animated>

      {/* Manufacturing Stages Overview - Professional Grid */}
      <div className="modern-card fade-in">
        <div className="p-6 border-b border-border dark:border-gray-700">
          <h3 className="text-lg font-bold text-foreground dark:text-white">Manufacturing Stages</h3>
          <p className="text-sm font-medium text-muted-foreground">Quick access to all production stages</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Order Intake', icon: Package, href: '/orders', color: '#2563EB' },
              { name: 'Design & Approval', icon: AlertCircle, href: '/designs', color: '#9333EA' },
              { name: 'Cutting', icon: Scissors, href: '/cutting', color: '#EA580C' },
              { name: 'Printing', icon: Printer, href: '/printing', color: '#16A34A' },
              { name: 'Sewing', icon: Users, href: '/sewing', color: '#CA8A04' },
              { name: 'Quality Control', icon: BadgeCheck, href: '/quality-control', color: '#DC2626' },
              { name: 'Finishing & Packing', icon: Package, href: '/finishing-packing', color: '#6366F1' },
              { name: 'Delivery', icon: Clock, href: '/delivery', color: '#DB2777' },
            ].map((stage) => (
              <Link key={stage.name} href={stage.href}>
                <div className="p-5 border-2 border-border dark:border-gray-700 rounded-lg bg-card dark:bg-gray-800 hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all group glow">
                  <HydrationSafeIcon Icon={stage.icon} className="w-7 h-7 mb-3 text-muted-foreground group-hover:text-primary transition-colors" style={{ color: stage.color }} />
                  <h4 className="font-semibold text-foreground dark:text-white text-sm mb-1">{stage.name}</h4>
                  <HydrationSafeIcon Icon={ArrowRight} className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
