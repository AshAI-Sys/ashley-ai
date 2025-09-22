'use client';
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
exports.default = AutomationPage;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
function AutomationPage() {
    const [stats, setStats] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [timeRange, setTimeRange] = (0, react_1.useState)('7d');
    const [activeTab, setActiveTab] = (0, react_1.useState)('overview');
    (0, react_1.useEffect)(() => {
        fetchStats();
    }, [timeRange]);
    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/automation/stats?time_range=${timeRange}`);
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        }
        catch (error) {
            console.error('Error fetching automation stats:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => (<div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-semibold text-${color}-600`}>{value}</p>
          {subtitle && (<p className="text-sm text-gray-500 mt-1">{subtitle}</p>)}
        </div>
        <div className={`p-3 bg-${color}-50 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-600`}/>
        </div>
      </div>
      {trend && (<div className="mt-4">
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <lucide_react_1.TrendingUp className="h-4 w-4 mr-1"/>
            {Math.abs(trend)}% from last period
          </div>
        </div>)}
    </div>);
    const ActivityItem = ({ activity }) => {
        const getStatusColor = (status) => {
            switch (status) {
                case 'SUCCESS':
                case 'SENT':
                case 'RESOLVED': return 'text-green-600 bg-green-50';
                case 'FAILED':
                case 'OPEN': return 'text-red-600 bg-red-50';
                case 'PENDING':
                case 'ACKNOWLEDGED': return 'text-yellow-600 bg-yellow-50';
                default: return 'text-gray-600 bg-gray-50';
            }
        };
        const getTypeIcon = (type) => {
            switch (type) {
                case 'EXECUTION': return <lucide_react_1.Zap className="h-4 w-4"/>;
                case 'ALERT': return <lucide_react_1.AlertTriangle className="h-4 w-4"/>;
                case 'NOTIFICATION': return <lucide_react_1.Bell className="h-4 w-4"/>;
                default: return <lucide_react_1.Activity className="h-4 w-4"/>;
            }
        };
        return (<div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            {getTypeIcon(activity.type)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
            <p className="text-xs text-gray-500">
              {new Date(activity.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
          {activity.status}
        </span>
      </div>);
    };
    if (loading) {
        return (<div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (<div key={i} className="h-32 bg-gray-200 rounded-lg"></div>))}
          </div>
        </div>
      </div>);
    }
    return (<div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation & Reminders</h1>
          <p className="text-gray-600">Manage workflows, notifications, and system integrations</p>
        </div>

        <div className="flex items-center space-x-4">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
            Create Rule
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: lucide_react_1.Activity },
            { id: 'rules', name: 'Automation Rules', icon: lucide_react_1.Zap },
            { id: 'notifications', name: 'Notifications', icon: lucide_react_1.Bell },
            { id: 'alerts', name: 'Alerts', icon: lucide_react_1.AlertTriangle },
            { id: 'integrations', name: 'Integrations', icon: lucide_react_1.Link },
        ].map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              <tab.icon className="h-4 w-4"/>
              <span>{tab.name}</span>
            </button>))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (<div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Active Rules" value={stats.summary.automation_rules.active} subtitle={`${stats.summary.automation_rules.recent_executions} recent executions`} icon={lucide_react_1.Zap} color="green"/>

            <StatCard title="Notifications" value={stats.summary.notifications.total} subtitle={`${stats.summary.notifications.success_rate}% success rate`} icon={lucide_react_1.Bell} color="blue"/>

            <StatCard title="Active Alerts" value={stats.summary.alerts.unresolved} subtitle={`${stats.summary.alerts.resolution_rate}% resolved`} icon={lucide_react_1.AlertTriangle} color="red"/>

            <StatCard title="Integrations" value={stats.summary.integrations.connected} subtitle={`${stats.summary.integrations.connection_rate}% connected`} icon={lucide_react_1.Link} color="purple"/>
          </div>

          {/* Execution Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Execution Performance</h3>
                <div className="flex items-center space-x-2">
                  <lucide_react_1.CheckCircle className="h-5 w-5 text-green-500"/>
                  <span className="text-sm text-gray-600">
                    {stats.summary.executions.success_rate}% Success Rate
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Successful</span>
                  <span className="text-sm font-medium text-green-600">
                    {stats.summary.executions.successful}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{
                width: `${(stats.summary.executions.successful / stats.summary.executions.total) * 100}%`
            }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Failed</span>
                  <span className="text-sm font-medium text-red-600">
                    {stats.summary.executions.failed}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{
                width: `${(stats.summary.executions.failed / stats.summary.executions.total) * 100}%`
            }}></div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <lucide_react_1.Clock className="h-5 w-5 text-gray-400"/>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stats.recent_activity.length > 0 ? (stats.recent_activity.map((activity, index) => (<ActivityItem key={index} activity={activity}/>))) : (<p className="text-sm text-gray-500 text-center py-4">
                    No recent activity
                  </p>)}
              </div>
            </div>
          </div>
        </div>)}

      {/* Rules Tab */}
      {activeTab === 'rules' && (<div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <lucide_react_1.Zap className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Automation Rules</h3>
            <p className="text-gray-600 mb-6">
              Configure automated workflows and business rules
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create First Rule
            </button>
          </div>
        </div>)}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (<div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <lucide_react_1.Bell className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Center</h3>
            <p className="text-gray-600 mb-6">
              Manage notification templates and delivery channels
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create Template
            </button>
          </div>
        </div>)}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (<div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <lucide_react_1.AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Alert Management</h3>
            <p className="text-gray-600 mb-6">
              Monitor system alerts and manage escalations
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              View All Alerts
            </button>
          </div>
        </div>)}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (<div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <lucide_react_1.Link className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">System Integrations</h3>
            <p className="text-gray-600 mb-6">
              Connect with external services and APIs
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Add Integration
            </button>
          </div>
        </div>)}
    </div>);
}
