'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MaintenancePage;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const button_1 = require("@/components/ui/button");
const tabs_1 = require("@/components/ui/tabs");
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
const lucide_react_1 = require("lucide-react");
function MaintenancePage() {
    const [stats, setStats] = (0, react_1.useState)(null);
    const [assets, setAssets] = (0, react_1.useState)([]);
    const [workOrders, setWorkOrders] = (0, react_1.useState)([]);
    const [schedules, setSchedules] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        fetchMaintenanceData();
    }, []);
    const fetchMaintenanceData = async () => {
        try {
            setLoading(true);
            // Fetch data from APIs
            const [statsRes, assetsRes, workOrdersRes, schedulesRes] = await Promise.all([
                fetch('/api/maintenance/stats'),
                fetch('/api/maintenance/assets'),
                fetch('/api/maintenance/work-orders'),
                fetch('/api/maintenance/schedules')
            ]);
            const statsData = await statsRes.json();
            const assetsData = await assetsRes.json();
            const workOrdersData = await workOrdersRes.json();
            const schedulesData = await schedulesRes.json();
            if (statsData.success)
                setStats(statsData.data);
            if (assetsData.success)
                setAssets(assetsData.data || []);
            else
                setAssets([]);
            if (workOrdersData.success)
                setWorkOrders(workOrdersData.data || []);
            else
                setWorkOrders([]);
            if (schedulesData.success)
                setSchedules(schedulesData.data || []);
            else
                setSchedules([]);
            setLoading(false);
        }
        catch (error) {
            console.error('Error fetching maintenance data:', error);
            setLoading(false);
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
            });
            setAssets([]);
            setWorkOrders([]);
            setSchedules([]);
        }
    };
    const getStatusBadge = (status) => {
        if (!status)
            return <badge_1.Badge className="bg-gray-100 text-gray-800">Unknown</badge_1.Badge>;
        switch (status.toLowerCase()) {
            case 'active':
                return <badge_1.Badge className="bg-green-100 text-green-800">Active</badge_1.Badge>;
            case 'inactive':
                return <badge_1.Badge className="bg-gray-100 text-gray-800">Inactive</badge_1.Badge>;
            case 'maintenance':
                return <badge_1.Badge className="bg-yellow-100 text-yellow-800">Maintenance</badge_1.Badge>;
            case 'open':
                return <badge_1.Badge className="bg-blue-100 text-blue-800">Open</badge_1.Badge>;
            case 'in_progress':
                return <badge_1.Badge className="bg-orange-100 text-orange-800">In Progress</badge_1.Badge>;
            case 'completed':
                return <badge_1.Badge className="bg-green-100 text-green-800">Completed</badge_1.Badge>;
            case 'overdue':
                return <badge_1.Badge className="bg-red-100 text-red-800">Overdue</badge_1.Badge>;
            case 'due_soon':
                return <badge_1.Badge className="bg-yellow-100 text-yellow-800">Due Soon</badge_1.Badge>;
            case 'scheduled':
                return <badge_1.Badge className="bg-blue-100 text-blue-800">Scheduled</badge_1.Badge>;
            default:
                return <badge_1.Badge className="bg-gray-100 text-gray-800">{status}</badge_1.Badge>;
        }
    };
    const getPriorityBadge = (priority) => {
        if (!priority)
            return <badge_1.Badge className="bg-gray-100 text-gray-800">Normal</badge_1.Badge>;
        switch (priority.toLowerCase()) {
            case 'critical':
                return <badge_1.Badge className="bg-red-500 text-white">Critical</badge_1.Badge>;
            case 'high':
                return <badge_1.Badge className="bg-red-100 text-red-800">High</badge_1.Badge>;
            case 'medium':
                return <badge_1.Badge className="bg-yellow-100 text-yellow-800">Medium</badge_1.Badge>;
            case 'low':
                return <badge_1.Badge className="bg-green-100 text-green-800">Low</badge_1.Badge>;
            default:
                return <badge_1.Badge className="bg-gray-100 text-gray-800">{priority}</badge_1.Badge>;
        }
    };
    const formatCurrency = (amount) => {
        return `₱${amount.toLocaleString()}`;
    };
    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString();
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };
    if (loading) {
        return (<dashboard_layout_1.default>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"/>
        </div>
      </dashboard_layout_1.default>);
    }
    return (<dashboard_layout_1.default>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Maintenance Management</h2>
          <div className="flex items-center space-x-2">
            <button_1.Button>
              <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
              New Work Order
            </button_1.Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Total Assets</card_1.CardTitle>
              <lucide_react_1.Settings className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{stats?.overview.total_assets || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.overview.asset_utilization || 0}% utilization rate
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Open Work Orders</card_1.CardTitle>
              <lucide_react_1.Wrench className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{stats?.overview.open_work_orders || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.overview.pending_work_orders || 0} unassigned
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Overdue Maintenance</card_1.CardTitle>
              <lucide_react_1.AlertTriangle className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats?.overview.overdue_maintenance || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                of {stats?.overview.total_schedules || 0} schedules
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Monthly Costs</card_1.CardTitle>
              <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.overview.maintenance_costs_this_month || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.overview.completion_rate || 0}% completion rate
              </p>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Alerts */}
        {stats && (stats.alerts.overdue_count > 0 || stats.alerts.high_priority_open > 0) && (<card_1.Card className="border-red-200 bg-red-50">
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center text-red-800">
                <lucide_react_1.AlertTriangle className="mr-2 h-5 w-5"/>
                Maintenance Alerts
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.alerts.overdue_count > 0 && (<div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.alerts.overdue_count}</div>
                    <div className="text-sm text-red-700">Overdue</div>
                  </div>)}
                {stats.alerts.high_priority_open > 0 && (<div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.alerts.high_priority_open}</div>
                    <div className="text-sm text-red-700">Critical Priority</div>
                  </div>)}
                {stats.alerts.unassigned_count > 0 && (<div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.alerts.unassigned_count}</div>
                    <div className="text-sm text-orange-700">Unassigned</div>
                  </div>)}
                {stats.alerts.inactive_assets > 0 && (<div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.alerts.inactive_assets}</div>
                    <div className="text-sm text-yellow-700">Inactive Assets</div>
                  </div>)}
              </div>
            </card_1.CardContent>
          </card_1.Card>)}

        <tabs_1.Tabs defaultValue="overview" className="space-y-4">
          <tabs_1.TabsList>
            <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="assets">Assets</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="work-orders">Work Orders</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="schedules">Schedules</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Upcoming Maintenance */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Upcoming Maintenance</card_1.CardTitle>
                  <card_1.CardDescription>Next 30 days</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  {stats?.upcoming_maintenance.length === 0 ? (<p className="text-muted-foreground">No upcoming maintenance scheduled</p>) : (<div className="space-y-2">
                      {(stats?.upcoming_maintenance || []).slice(0, 5).map((maintenance) => (<div key={maintenance.id} className="flex items-center justify-between p-2 border rounded">
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
                    : 'Overdue'}
                            </div>
                          </div>
                        </div>))}
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>

              {/* Recent Activity */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Recent Work Orders</card_1.CardTitle>
                  <card_1.CardDescription>Latest maintenance activities</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  {stats?.recent_activity.length === 0 ? (<p className="text-muted-foreground">No recent activity</p>) : (<div className="space-y-2">
                      {(stats?.recent_activity || []).map((activity) => (<div key={activity.id} className="flex items-center justify-between p-2 border rounded">
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
                        </div>))}
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>
            </div>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="assets" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Asset Management</h3>
              <div className="flex items-center space-x-2">
                <button_1.Button variant="outline">
                  <lucide_react_1.Filter className="mr-2 h-4 w-4"/>
                  Filter
                </button_1.Button>
                <button_1.Button>
                  <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
                  Add Asset
                </button_1.Button>
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
                    {(assets || []).slice(0, 10).map((asset) => (<tr key={asset.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{asset.name}</div>
                            <div className="text-sm text-muted-foreground">{asset.asset_number}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{asset.type}</div>
                          {asset.category && (<div className="text-xs text-muted-foreground">{asset.category}</div>)}
                        </td>
                        <td className="px-4 py-3 text-sm">{asset.location}</td>
                        <td className="px-4 py-3">
                          {getStatusBadge(asset.status)}
                          {asset.overdue_maintenance > 0 && (<badge_1.Badge className="ml-1 bg-red-100 text-red-800">
                              {asset.overdue_maintenance} overdue
                            </badge_1.Badge>)}
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
                : 'Not scheduled'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Eye className="h-4 w-4"/>
                            </button_1.Button>
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Edit className="h-4 w-4"/>
                            </button_1.Button>
                          </div>
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </div>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="work-orders" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Work Orders</h3>
              <div className="flex items-center space-x-2">
                <button_1.Button variant="outline">
                  <lucide_react_1.Filter className="mr-2 h-4 w-4"/>
                  Filter
                </button_1.Button>
                <button_1.Button>
                  <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
                  Create Work Order
                </button_1.Button>
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
                    {(workOrders || []).slice(0, 10).map((wo) => (<tr key={wo.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{wo.title}</div>
                            {wo.is_scheduled && (<badge_1.Badge className="mt-1 text-xs bg-blue-100 text-blue-800">Scheduled</badge_1.Badge>)}
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
                          {wo.days_overdue > 0 && (<div className="text-xs text-red-600 mt-1">
                              {wo.days_overdue} days overdue
                            </div>)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {wo.scheduled_date
                ? formatDate(wo.scheduled_date)
                : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Eye className="h-4 w-4"/>
                            </button_1.Button>
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Edit className="h-4 w-4"/>
                            </button_1.Button>
                          </div>
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </div>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="schedules" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Maintenance Schedules</h3>
              <div className="flex items-center space-x-2">
                <button_1.Button variant="outline">
                  <lucide_react_1.Filter className="mr-2 h-4 w-4"/>
                  Filter
                </button_1.Button>
                <button_1.Button>
                  <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
                  Create Schedule
                </button_1.Button>
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
                    {(schedules || []).slice(0, 10).map((schedule) => (<tr key={schedule.id} className="hover:bg-gray-50">
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
                : 'Overdue'}
                          </div>
                        </td>
                        <td className="px-4 py-3">{getPriorityBadge(schedule.priority)}</td>
                        <td className="px-4 py-3">{getStatusBadge(schedule.status_info.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Eye className="h-4 w-4"/>
                            </button_1.Button>
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Edit className="h-4 w-4"/>
                            </button_1.Button>
                          </div>
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </div>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </div>
    </dashboard_layout_1.default>);
}
