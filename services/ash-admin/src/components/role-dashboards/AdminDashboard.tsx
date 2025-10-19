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
      const [clientsRes, ordersRes, employeesRes] = await Promise.all([
        fetch('/api/clients?limit=1'),
        fetch('/api/orders?limit=100'),
        fetch('/api/hr/employees?limit=100').catch(() => null)
      ])

      const clientsData = await clientsRes.json()
      const ordersData = await ordersRes.json()
      const employeesData = employeesRes ? await employeesRes.json() : { success: false, data: [] }

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
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load dashboard data</p>
              <Button onClick={() => refetch()} className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatCurrency = (amount: number) => `₱${amount.toLocaleString()}`

  return (
    <div className="space-y-6 p-6">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Complete system overview and analytics</p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Key Metrics with Smooth Staggered Animation */}
      <StaggeredAnimation staggerDelay={100} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats?.totalRevenue || 0)}</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  {stats?.totalOrders || 0} orders
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalOrders || 0}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  <Package className="w-4 h-4 inline mr-1" />
                  {stats?.ordersInProduction || 0} in production
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalClients || 0}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Active partnerships
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Employees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activeEmployees || 0}</p>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  <Users className="w-4 h-4 inline mr-1" />
                  Active workforce
                </p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </StaggeredAnimation>

      {/* Alerts & Quick Stats with Slide Animation */}
      <Animated animation="slide-in-from-bottom" delay={400}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-yellow-500 dark:bg-gray-800 dark:border-gray-700 dark:border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Approvals</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats?.pendingApprovals || 0}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Orders awaiting approval</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Production</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats?.ordersInProduction || 0}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Active production runs</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500 dark:bg-gray-800 dark:border-gray-700 dark:border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats?.completedThisMonth || 0}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Orders this month</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        </div>
      </Animated>

      {/* Charts Section with Fade In Animation */}
      <Animated animation="fade-in" delay={600}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Orders by Status</CardTitle>
            <CardDescription className="dark:text-gray-400">Current order distribution across all stages</CardDescription>
          </CardHeader>
          <CardContent>
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
              <div className="h-[300px] flex items-center justify-center text-gray-400 dark:text-gray-500">
                No order data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employees by Department */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Workforce Distribution</CardTitle>
            <CardDescription className="dark:text-gray-400">Employees across all departments</CardDescription>
          </CardHeader>
          <CardContent>
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
              <div className="h-[300px] flex items-center justify-center text-gray-400 dark:text-gray-500">
                No employee data available
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </Animated>

      {/* Quick Actions with Slide Animation */}
      <Animated animation="slide-in-from-bottom" delay={800}>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Quick Actions</CardTitle>
          <CardDescription className="dark:text-gray-400">Navigate to key sections of the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/orders">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                <Package className="w-6 h-6" />
                <span>View Orders</span>
              </Button>
            </Link>
            <Link href="/clients">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                <Building2 className="w-6 h-6" />
                <span>Manage Clients</span>
              </Button>
            </Link>
            <Link href="/hr-payroll">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                <Users className="w-6 h-6" />
                <span>HR & Payroll</span>
              </Button>
            </Link>
            <Link href="/finance">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                <DollarSign className="w-6 h-6" />
                <span>Finance</span>
              </Button>
            </Link>
            <Link href="/cutting">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                <Scissors className="w-6 h-6" />
                <span>Cutting</span>
              </Button>
            </Link>
            <Link href="/printing">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                <Printer className="w-6 h-6" />
                <span>Printing</span>
              </Button>
            </Link>
            <Link href="/quality-control">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                <BadgeCheck className="w-6 h-6" />
                <span>Quality Control</span>
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                <TrendingUp className="w-6 h-6" />
                <span>Analytics</span>
              </Button>
            </Link>
          </div>
        </CardContent>
        </Card>
      </Animated>

      {/* Manufacturing Stages Overview */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Manufacturing Stages</CardTitle>
          <CardDescription className="dark:text-gray-400">Quick access to all 14 production stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Order Intake', icon: Package, href: '/orders', color: 'blue' },
              { name: 'Design & Approval', icon: AlertCircle, href: '/designs', color: 'purple' },
              { name: 'Cutting', icon: Scissors, href: '/cutting', color: 'orange' },
              { name: 'Printing', icon: Printer, href: '/printing', color: 'green' },
              { name: 'Sewing', icon: Users, href: '/sewing', color: 'yellow' },
              { name: 'Quality Control', icon: BadgeCheck, href: '/quality-control', color: 'red' },
              { name: 'Finishing & Packing', icon: Package, href: '/finishing-packing', color: 'indigo' },
              { name: 'Delivery', icon: Clock, href: '/delivery', color: 'pink' },
            ].map((stage) => (
              <Link key={stage.name} href={stage.href}>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-750 cursor-pointer transition-colors">
                  <stage.icon className={`w-6 h-6 text-${stage.color}-600 dark:text-${stage.color}-400 mb-2`} />
                  <h3 className="font-medium text-gray-900 dark:text-white">{stage.name}</h3>
                  <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-2" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}