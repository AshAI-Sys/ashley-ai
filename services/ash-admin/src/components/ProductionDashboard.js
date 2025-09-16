"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionDashboard = ProductionDashboard;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const progress_1 = require("@/components/ui/progress");
const alert_1 = require("@/components/ui/alert");
const tabs_1 = require("@/components/ui/tabs");
const lucide_react_1 = require("lucide-react");
function ProductionDashboard() {
    const [dashboardData, setDashboardData] = (0, react_1.useState)(null);
    const [floorStatus, setFloorStatus] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        fetchDashboardData();
        fetchFloorStatus();
        // Set up real-time updates every 30 seconds
        const interval = setInterval(() => {
            fetchDashboardData();
            fetchFloorStatus();
        }, 30000);
        return () => clearInterval(interval);
    }, []);
    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/dashboard/overview');
            if (!response.ok)
                throw new Error('Failed to fetch dashboard data');
            const result = await response.json();
            setDashboardData(result.data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        }
    };
    const fetchFloorStatus = async () => {
        try {
            const response = await fetch('/api/dashboard/floor-status');
            if (!response.ok)
                throw new Error('Failed to fetch floor status');
            const result = await response.json();
            setFloorStatus(result.data);
            setLoading(false);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load floor status');
            setLoading(false);
        }
    };
    const getStatusColor = (status) => {
        const colors = {
            'completed': 'bg-green-500',
            'in_progress': 'bg-blue-500',
            'pending': 'bg-yellow-500',
            'cancelled': 'bg-red-500',
            'on_hold': 'bg-orange-500'
        };
        return colors[status] || 'bg-gray-500';
    };
    const getPriorityColor = (priority) => {
        const colors = {
            'high': 'text-red-600 bg-red-50',
            'medium': 'text-yellow-600 bg-yellow-50',
            'low': 'text-green-600 bg-green-50'
        };
        return colors[priority] || 'text-gray-600 bg-gray-50';
    };
    if (loading)
        return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
    if (error)
        return <div className="text-red-600">Error: {error}</div>;
    return (<div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Production Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <lucide_react_1.Activity className="w-4 h-4"/>
          <span>Live Updates</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Active Orders</card_1.CardTitle>
            <lucide_react_1.Package className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.overview.active_orders.reduce((sum, item) => sum + item._count.id, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.overview.active_orders.find(item => item.status === 'in_progress')?._count.id || 0} in progress
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Quality Rate</card_1.CardTitle>
            <lucide_react_1.CheckCircle className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.quality.pass_rate.total > 0
            ? Math.round((dashboardData.quality.pass_rate.passed / dashboardData.quality.pass_rate.total) * 100)
            : 100}%
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.quality.pass_rate.passed || 0} / {dashboardData?.quality.pass_rate.total || 0} passed
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Active Workers</card_1.CardTitle>
            <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {floorStatus?.employees.filter(emp => emp.status === 'working').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {floorStatus?.employees.filter(emp => emp.status === 'available').length || 0} available
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Urgent Alerts</card_1.CardTitle>
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboardData?.alerts.upcoming_deadlines.filter(alert => alert.days_remaining <= 2).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Deadlines within 2 days
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Urgent Alerts */}
      {dashboardData?.alerts.upcoming_deadlines.length > 0 && (<alert_1.Alert className="border-red-200 bg-red-50">
          <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-600"/>
          <alert_1.AlertDescription>
            <strong>Upcoming Deadlines:</strong>{' '}
            {dashboardData.alerts.upcoming_deadlines.slice(0, 3).map((alert, index) => (<span key={alert.order_number}>
                {index > 0 && ', '}
                {alert.order_number} ({alert.days_remaining}d remaining)
              </span>))}
          </alert_1.AlertDescription>
        </alert_1.Alert>)}

      <tabs_1.Tabs defaultValue="floor" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="floor">Production Floor</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="orders">Order Status</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="quality">Quality Control</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="machines">Equipment</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="floor" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Bundles */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Production Bundles</card_1.CardTitle>
                <card_1.CardDescription>Real-time bundle tracking on production floor</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {floorStatus?.bundles.slice(0, 10).map((bundle) => (<div key={bundle.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{bundle.qr_code}</span>
                        <badge_1.Badge className={getStatusColor(bundle.status)}>
                          {bundle.status}
                        </badge_1.Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {bundle.order_number} • {bundle.client}
                      </div>
                      <div className="text-sm text-blue-600">
                        {bundle.current_stage} • {bundle.department}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div>Cut: {bundle.progress.cutting}%</div>
                        <div>Print: {bundle.progress.printing}%</div>
                        <div>Sew: {bundle.progress.sewing}%</div>
                      </div>
                      <progress_1.Progress value={(bundle.progress.cutting + bundle.progress.printing + bundle.progress.sewing) / 3} className="w-24 mt-1"/>
                    </div>
                  </div>))}
              </card_1.CardContent>
            </card_1.Card>

            {/* Employee Status */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Workforce Status</card_1.CardTitle>
                <card_1.CardDescription>Current employee activity</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {Object.entries(floorStatus?.employees.reduce((acc, emp) => {
            if (!acc[emp.department])
                acc[emp.department] = [];
            acc[emp.department].push(emp);
            return acc;
        }, {}) || {}).map(([department, employees]) => (<div key={department} className="space-y-2">
                    <h4 className="font-medium capitalize">{department} Department</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {employees.slice(0, 5).map((emp, index) => (<div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{emp.name}</span>
                            <span className="text-sm text-gray-600 ml-2">({emp.position})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <badge_1.Badge variant={emp.status === 'working' ? 'default' : 'secondary'}>
                              {emp.status}
                            </badge_1.Badge>
                            {emp.current_task && (<span className="text-xs text-blue-600">{emp.current_task}</span>)}
                          </div>
                        </div>))}
                    </div>
                  </div>))}
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="orders" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Order Status Overview</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dashboardData?.overview.active_orders.map((orderGroup) => (<div key={orderGroup.status} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{orderGroup._count.id}</div>
                    <div className="text-sm capitalize text-gray-600">{orderGroup.status}</div>
                    <div className={`w-full h-2 mt-2 rounded ${getStatusColor(orderGroup.status)}`}/>
                  </div>))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="quality" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Quality Control Metrics</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Quality by Stage</h4>
                  {Object.entries(dashboardData?.quality.metrics.reduce((acc, metric) => {
            if (!acc[metric.stage])
                acc[metric.stage] = { passed: 0, total: 0 };
            if (metric.status === 'approved')
                acc[metric.stage].passed += metric._count.id;
            acc[metric.stage].total += metric._count.id;
            return acc;
        }, {}) || {}).map(([stage, stats]) => (<div key={stage} className="flex items-center justify-between">
                      <span className="capitalize">{stage}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {stats.passed}/{stats.total}
                        </span>
                        <div className="w-20">
                          <progress_1.Progress value={stats.total > 0 ? (stats.passed / stats.total) * 100 : 0}/>
                        </div>
                        <span className="text-sm font-medium">
                          {stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}%
                        </span>
                      </div>
                    </div>))}
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="machines" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Equipment Status</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData?.overview.machine_utilization.map((machine) => (<div key={machine.asset_name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{machine.asset_name}</span>
                      <badge_1.Badge variant={machine.status === 'operational' ? 'default' : 'destructive'}>
                        {machine.status}
                      </badge_1.Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Utilization: {machine.utilization} jobs
                    </div>
                  </div>))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
