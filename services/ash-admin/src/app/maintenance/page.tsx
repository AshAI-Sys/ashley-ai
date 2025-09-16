'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardLayout from '@/components/dashboard-layout'
import {
  Settings,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  Users,
  Activity,
  BarChart3
} from 'lucide-react'

interface MaintenanceStats {
  overview: {
    total_assets: number
    active_assets: number
    asset_utilization: number
    total_work_orders: number
    open_work_orders: number
    completed_this_month: number
    pending_work_orders: number
    completion_rate: number
    overdue_maintenance: number
    total_schedules: number
    maintenance_costs_this_month: number
  }
  distributions: {
    work_orders_by_type: Array<{ type: string; count: number; percentage: number }>
    work_orders_by_priority: Array<{ priority: string; count: number; percentage: number }>
    assets_by_type: Array<{ type: string; count: number; percentage: number }>
  }
  upcoming_maintenance: Array<{
    id: string
    schedule_name: string
    asset_name: string
    asset_number: string
    due_date: string
    maintenance_type: string
    priority: string
    days_until_due: number
  }>
  recent_activity: Array<{
    id: string
    title: string
    asset_name: string
    asset_number: string
    type: string
    status: string
    priority: string
    assignee: string
    created_at: string
  }>
  alerts: {
    overdue_count: number
    high_priority_open: number
    unassigned_count: number
    inactive_assets: number
  }
}

interface Asset {
  id: string
  name: string
  asset_number: string
  type: string
  category: string
  location: string
  purchase_date: string
  purchase_cost: number
  status: string
  active_work_orders: number
  total_work_orders: number
  maintenance_schedules: number
  overdue_maintenance: number
  next_maintenance: string | null
  created_at: string
  updated_at: string
}

interface WorkOrder {
  id: string
  title: string
  description: string
  type: string
  priority: string
  status: string
  scheduled_date: string | null
  started_at: string | null
  completed_at: string | null
  cost: number | null
  labor_hours: number | null
  asset: {
    name: string
    asset_number: string
  }
  assignee: {
    name: string
    employee_number: string
  } | null
  is_scheduled: boolean
  days_overdue: number
  created_at: string
}

interface MaintenanceSchedule {
  id: string
  schedule_name: string
  description: string
  maintenance_type: string
  frequency_type: string
  frequency_value: number
  next_due_date: string
  last_completed: string | null
  estimated_duration: number | null
  priority: string
  is_active: boolean
  asset: {
    name: string
    asset_number: string
  }
  work_orders_count: number
  status_info: {
    is_overdue: boolean
    is_due_soon: boolean
    days_until_due: number
    status: string
  }
  created_at: string
}

export default function MaintenancePage() {
  const [stats, setStats] = useState<MaintenanceStats | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMaintenanceData()
  }, [])

  const fetchMaintenanceData = async () => {
    try {
      setLoading(true)

      // Fetch data from APIs
      const [statsRes, assetsRes, workOrdersRes, schedulesRes] = await Promise.all([
        fetch('/api/maintenance/stats'),
        fetch('/api/maintenance/assets'),
        fetch('/api/maintenance/work-orders'),
        fetch('/api/maintenance/schedules')
      ])

      const statsData = await statsRes.json()
      const assetsData = await assetsRes.json()
      const workOrdersData = await workOrdersRes.json()
      const schedulesData = await schedulesRes.json()

      if (statsData.success) setStats(statsData.data)
      if (assetsData.success) setAssets(assetsData.data)
      if (workOrdersData.success) setWorkOrders(workOrdersData.data)
      if (schedulesData.success) setSchedules(schedulesData.data)

      setLoading(false)
    } catch (error) {
      console.error('Error fetching maintenance data:', error)
      setLoading(false)
      // Set empty fallback data
      setStats({
        overview: {
          total_assets: 0,
          active_assets: 0,
          asset_utilization: 0,
          total_work_orders: 0,
          open_work_orders: 0,
          completed_this_month: 0,
          pending_work_orders: 0,
          completion_rate: 0,
          overdue_maintenance: 0,
          total_schedules: 0,
          maintenance_costs_this_month: 0
        },
        distributions: {
          work_orders_by_type: [],
          work_orders_by_priority: [],
          assets_by_type: []
        },
        upcoming_maintenance: [],
        recent_activity: [],
        alerts: {
          overdue_count: 0,
          high_priority_open: 0,
          unassigned_count: 0,
          inactive_assets: 0
        }
      })
      setAssets([])
      setWorkOrders([])
      setSchedules([])
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800">Open</Badge>
      case 'in_progress':
        return <Badge className="bg-orange-100 text-orange-800">In Progress</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      case 'due_soon':
        return <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return <Badge className="bg-red-500 text-white">Critical</Badge>
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Maintenance Management</h2>
          <div className="flex items-center space-x-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Work Order
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.overview.total_assets || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.overview.asset_utilization || 0}% utilization rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Work Orders</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.overview.open_work_orders || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.overview.pending_work_orders || 0} unassigned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Maintenance</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats?.overview.overdue_maintenance || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                of {stats?.overview.total_schedules || 0} schedules
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Costs</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.overview.maintenance_costs_this_month || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.overview.completion_rate || 0}% completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {stats && (stats.alerts.overdue_count > 0 || stats.alerts.high_priority_open > 0) && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-800">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Maintenance Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.alerts.overdue_count > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.alerts.overdue_count}</div>
                    <div className="text-sm text-red-700">Overdue</div>
                  </div>
                )}
                {stats.alerts.high_priority_open > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.alerts.high_priority_open}</div>
                    <div className="text-sm text-red-700">Critical Priority</div>
                  </div>
                )}
                {stats.alerts.unassigned_count > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.alerts.unassigned_count}</div>
                    <div className="text-sm text-orange-700">Unassigned</div>
                  </div>
                )}
                {stats.alerts.inactive_assets > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.alerts.inactive_assets}</div>
                    <div className="text-sm text-yellow-700">Inactive Assets</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Upcoming Maintenance */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Maintenance</CardTitle>
                  <CardDescription>Next 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.upcoming_maintenance.length === 0 ? (
                    <p className="text-muted-foreground">No upcoming maintenance scheduled</p>
                  ) : (
                    <div className="space-y-2">
                      {stats?.upcoming_maintenance.slice(0, 5).map((maintenance) => (
                        <div key={maintenance.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <div className="font-medium">{maintenance.schedule_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {maintenance.asset_name} ({maintenance.asset_number})
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">{formatDate(maintenance.due_date)}</div>
                            <div className="text-xs text-muted-foreground">
                              {maintenance.days_until_due > 0
                                ? `${maintenance.days_until_due} days`
                                : 'Overdue'
                              }
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Work Orders</CardTitle>
                  <CardDescription>Latest maintenance activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.recent_activity.length === 0 ? (
                    <p className="text-muted-foreground">No recent activity</p>
                  ) : (
                    <div className="space-y-2">
                      {stats?.recent_activity.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <div className="font-medium">{activity.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {activity.asset_name} • {activity.assignee}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(activity.status)}
                            {getPriorityBadge(activity.priority)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Asset Management</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Asset
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Asset</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Work Orders</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Next Maintenance</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {assets.slice(0, 10).map((asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{asset.name}</div>
                            <div className="text-sm text-muted-foreground">{asset.asset_number}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{asset.type}</div>
                          {asset.category && (
                            <div className="text-xs text-muted-foreground">{asset.category}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">{asset.location}</td>
                        <td className="px-4 py-3">
                          {getStatusBadge(asset.status)}
                          {asset.overdue_maintenance > 0 && (
                            <Badge className="ml-1 bg-red-100 text-red-800">
                              {asset.overdue_maintenance} overdue
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>{asset.active_work_orders} active</div>
                          <div className="text-xs text-muted-foreground">
                            {asset.total_work_orders} total
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {asset.next_maintenance
                            ? formatDate(asset.next_maintenance)
                            : 'Not scheduled'
                          }
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="work-orders" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Work Orders</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Work Order
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Work Order</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Asset</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Priority</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Assignee</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Due Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {workOrders.slice(0, 10).map((wo) => (
                      <tr key={wo.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{wo.title}</div>
                            {wo.is_scheduled && (
                              <Badge className="mt-1 text-xs bg-blue-100 text-blue-800">Scheduled</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{wo.asset.name}</div>
                          <div className="text-xs text-muted-foreground">{wo.asset.asset_number}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">{wo.type}</td>
                        <td className="px-4 py-3">{getPriorityBadge(wo.priority)}</td>
                        <td className="px-4 py-3 text-sm">
                          {wo.assignee?.name || 'Unassigned'}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(wo.status)}
                          {wo.days_overdue > 0 && (
                            <div className="text-xs text-red-600 mt-1">
                              {wo.days_overdue} days overdue
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {wo.scheduled_date
                            ? formatDate(wo.scheduled_date)
                            : '-'
                          }
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Maintenance Schedules</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Schedule
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Schedule</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Asset</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Frequency</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Next Due</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Priority</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {schedules.slice(0, 10).map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium">{schedule.schedule_name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{schedule.asset.name}</div>
                          <div className="text-xs text-muted-foreground">{schedule.asset.asset_number}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">{schedule.maintenance_type}</td>
                        <td className="px-4 py-3 text-sm">
                          Every {schedule.frequency_value} {schedule.frequency_type.toLowerCase()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{formatDate(schedule.next_due_date)}</div>
                          <div className="text-xs text-muted-foreground">
                            {schedule.status_info.days_until_due > 0
                              ? `${schedule.status_info.days_until_due} days`
                              : 'Overdue'
                            }
                          </div>
                        </td>
                        <td className="px-4 py-3">{getPriorityBadge(schedule.priority)}</td>
                        <td className="px-4 py-3">{getStatusBadge(schedule.status_info.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}