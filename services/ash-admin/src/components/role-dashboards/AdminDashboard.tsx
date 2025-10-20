'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Animated, StaggeredAnimation } from '@/components/ui/animated'
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
  BadgeCheck
} from 'lucide-react'
import Link from 'next/link'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="corporate-card p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
        <div className="corporate-card p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-base font-medium text-gray-700 mb-4">Failed to load dashboard data</p>
            <Button onClick={() => refetch()} className="corporate-button">Retry</Button>
          </div>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => `₱${amount.toLocaleString()}`

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
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
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
              <p className="text-sm font-medium text-green-600 mt-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1.5" />
                {stats?.totalOrders || 0} orders
              </p>
            </div>
            <div className="bg-green-50 p-3.5 rounded-xl">
              <DollarSign className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>

        <div className="stats-card group hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-1.5">Active Orders</p>
              <p className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{stats?.totalOrders || 0}</p>
              <p className="text-sm font-medium text-blue-600 mt-2 flex items-center">
                <Package className="w-4 h-4 mr-1.5" />
                {stats?.ordersInProduction || 0} in production
              </p>
            </div>
            <div className="bg-blue-50 p-3.5 rounded-xl">
              <Package className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="stats-card group hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-1.5">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{stats?.totalClients || 0}</p>
              <p className="text-sm font-medium text-purple-600 mt-2 flex items-center">
                <Building2 className="w-4 h-4 mr-1.5" />
                Active partnerships
              </p>
            </div>
            <div className="bg-purple-50 p-3.5 rounded-xl">
              <Building2 className="w-7 h-7 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="stats-card group hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-1.5">Employees</p>
              <p className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{stats?.activeEmployees || 0}</p>
              <p className="text-sm font-medium text-orange-600 mt-2 flex items-center">
                <Users className="w-4 h-4 mr-1.5" />
                Active workforce
              </p>
            </div>
            <div className="bg-orange-50 p-3.5 rounded-xl">
              <Users className="w-7 h-7 text-orange-600" />
            </div>
          </div>
        </div>
      </StaggeredAnimation>

      {/* Alert Cards - Professional Design */}
      <Animated animation="slide-in-from-bottom" delay={400}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="corporate-card border-l-4 border-yellow-500 p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-1.5">Pending Approvals</p>
                <p className="text-4xl font-bold text-yellow-600" style={{ letterSpacing: '-0.02em' }}>{stats?.pendingApprovals || 0}</p>
                <p className="text-sm font-medium text-gray-600 mt-2.5">Orders awaiting approval</p>
              </div>
              <AlertCircle className="w-9 h-9 text-yellow-500" />
            </div>
          </div>

          <div className="corporate-card border-l-4 border-purple-500 p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-1.5">In Production</p>
                <p className="text-4xl font-bold text-purple-600" style={{ letterSpacing: '-0.02em' }}>{stats?.ordersInProduction || 0}</p>
                <p className="text-sm font-medium text-gray-600 mt-2.5">Active production runs</p>
              </div>
              <Clock className="w-9 h-9 text-purple-500" />
            </div>
          </div>

          <div className="corporate-card border-l-4 border-green-500 p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-1.5">Completed</p>
                <p className="text-4xl font-bold text-green-600" style={{ letterSpacing: '-0.02em' }}>{stats?.completedThisMonth || 0}</p>
                <p className="text-sm font-medium text-gray-600 mt-2.5">Orders this month</p>
              </div>
              <CheckCircle className="w-9 h-9 text-green-500" />
            </div>
          </div>
        </div>
      </Animated>

      {/* Charts Section - Professional Cards */}
      <Animated animation="fade-in" delay={600}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="corporate-card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Orders by Status</h3>
            <p className="text-sm font-medium text-gray-600 mt-1">Current order distribution across all stages</p>
          </div>
          <div className="p-6">
            {stats?.ordersByStatus && stats.ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.ordersByStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="status" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fill: '#9CA3AF' }} />
                  <Tooltip
                    formatter={(value: any, name: string) => {
                      if (name === 'count') return [value, 'Orders']
                      if (name === 'amount') return [formatCurrency(value), 'Revenue']
                      return [value, name]
                    }}
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }}
                  />
                  <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                  <Bar dataKey="count" fill="#3B82F6" name="Orders" />
                  <Bar dataKey="amount" fill="#10B981" name="Revenue (₱)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 font-medium">
                No order data available
              </div>
            )}
          </div>
        </div>

        {/* Employees by Department */}
        <div className="corporate-card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Workforce Distribution</h3>
            <p className="text-sm font-medium text-gray-600 mt-1">Employees across all departments</p>
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
                    {stats.employeesByDepartment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={Object.values(STATUS_COLORS)[index % Object.values(STATUS_COLORS).length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 font-medium">
                No employee data available
              </div>
            )}
          </div>
        </div>
        </div>
      </Animated>

      {/* Quick Actions - Professional Grid */}
      <Animated animation="slide-in-from-bottom" delay={800}>
        <div className="corporate-card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
            <p className="text-sm font-medium text-gray-600 mt-1">Navigate to key sections of the system</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/orders">
                <button className="w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-700 hover:border-corporate-blue hover:bg-blue-50 hover:text-corporate-blue transition-all font-semibold">
                  <Package className="w-6 h-6" />
                  <span className="text-sm">View Orders</span>
                </button>
              </Link>
              <Link href="/clients">
                <button className="w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-700 hover:border-corporate-blue hover:bg-blue-50 hover:text-corporate-blue transition-all font-semibold">
                  <Building2 className="w-6 h-6" />
                  <span className="text-sm">Manage Clients</span>
                </button>
              </Link>
              <Link href="/hr-payroll">
                <button className="w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-700 hover:border-corporate-blue hover:bg-blue-50 hover:text-corporate-blue transition-all font-semibold">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">HR & Payroll</span>
                </button>
              </Link>
              <Link href="/finance">
                <button className="w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-700 hover:border-corporate-blue hover:bg-blue-50 hover:text-corporate-blue transition-all font-semibold">
                  <DollarSign className="w-6 h-6" />
                  <span className="text-sm">Finance</span>
                </button>
              </Link>
              <Link href="/cutting">
                <button className="w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-700 hover:border-corporate-blue hover:bg-blue-50 hover:text-corporate-blue transition-all font-semibold">
                  <Scissors className="w-6 h-6" />
                  <span className="text-sm">Cutting</span>
                </button>
              </Link>
              <Link href="/printing">
                <button className="w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-700 hover:border-corporate-blue hover:bg-blue-50 hover:text-corporate-blue transition-all font-semibold">
                  <Printer className="w-6 h-6" />
                  <span className="text-sm">Printing</span>
                </button>
              </Link>
              <Link href="/quality-control">
                <button className="w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-700 hover:border-corporate-blue hover:bg-blue-50 hover:text-corporate-blue transition-all font-semibold">
                  <BadgeCheck className="w-6 h-6" />
                  <span className="text-sm">Quality Control</span>
                </button>
              </Link>
              <Link href="/analytics">
                <button className="w-full h-24 flex flex-col items-center justify-center gap-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-700 hover:border-corporate-blue hover:bg-blue-50 hover:text-corporate-blue transition-all font-semibold">
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-sm">Analytics</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </Animated>

      {/* Manufacturing Stages Overview - Professional Grid */}
      <div className="corporate-card">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Manufacturing Stages</h3>
          <p className="text-sm font-medium text-gray-600 mt-1">Quick access to all production stages</p>
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
                <div className="p-5 border-2 border-gray-200 rounded-lg hover:border-corporate-blue hover:bg-blue-50 cursor-pointer transition-all group">
                  <stage.icon className="w-7 h-7 mb-3 text-gray-600 group-hover:text-corporate-blue transition-colors" style={{ color: stage.color }} />
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{stage.name}</h4>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-corporate-blue group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}