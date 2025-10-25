"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RealTimeMetrics;
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
const useWebSocket_1 = require("@/hooks/useWebSocket");
const react_1 = require("react");
function MetricCard({ title, value, change, icon: Icon, color, suffix = "", isLive, }) {
    const [displayValue, setDisplayValue] = (0, react_1.useState)(value);
    const [isAnimating, setIsAnimating] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (value !== displayValue) {
            setIsAnimating(true);
            const timeout = setTimeout(() => {
                setDisplayValue(value);
                setIsAnimating(false);
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [value, displayValue]);
    return (<card_1.Card className={`relative overflow-hidden transition-all dark:border-gray-700 dark:bg-gray-800 ${isAnimating ? "scale-105" : ""}`}>
      {isLive && (<div className="absolute right-2 top-2">
          <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-1 dark:bg-green-900/30">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"/>
            <span className="text-xs font-medium text-green-700 dark:text-green-400">
              LIVE
            </span>
          </div>
        </div>)}
      <card_1.CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="mb-1 text-sm text-gray-600 dark:text-gray-500">
              {title}
            </p>
            <p className={`text-3xl font-bold text-gray-900 transition-all dark:text-white ${isAnimating ? "blur-sm" : ""}`}>
              {displayValue}
              {suffix}
            </p>
            {change !== undefined && (<p className={`mt-2 flex items-center gap-1 text-sm ${change >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"}`}>
                <lucide_react_1.TrendingUp className={`h-4 w-4 ${change < 0 ? "rotate-180" : ""}`}/>
                {Math.abs(change)}% from yesterday
              </p>)}
          </div>
          <div className={`${color} rounded-full p-3`}>
            <Icon className="h-8 w-8 text-white"/>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
function RealTimeMetrics() {
    const [metrics, setMetrics] = (0, react_1.useState)({
        totalOrders: 0,
        ordersInProduction: 0,
        completedToday: 0,
        efficiency: 0,
    });
    const { data, connectionStatus } = (0, useWebSocket_1.useDashboardWebSocket)(update => {
        setMetrics(prev => ({
            ...prev,
            ...update,
        }));
    });
    (0, react_1.useEffect)(() => {
        // Initialize with some data
        setMetrics({
            totalOrders: 87,
            ordersInProduction: 24,
            completedToday: 12,
            efficiency: 92,
        });
    }, []);
    const isConnected = connectionStatus === "connected";
    return (<div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <lucide_react_1.Activity className="h-5 w-5 text-blue-500"/>
          Real-Time Metrics
        </h2>
        <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${isConnected
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
          <div className={`h-2 w-2 rounded-full ${isConnected ? "animate-pulse bg-green-500" : "bg-red-500"}`}/>
          {isConnected ? "Connected" : "Disconnected"}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Orders" value={metrics.totalOrders} change={8.2} icon={lucide_react_1.Package} color="bg-blue-500" isLive={isConnected}/>
        <MetricCard title="In Production" value={metrics.ordersInProduction} change={-3.1} icon={lucide_react_1.Zap} color="bg-purple-500" isLive={isConnected}/>
        <MetricCard title="Completed Today" value={metrics.completedToday} change={15.4} icon={lucide_react_1.TrendingUp} color="bg-green-500" isLive={isConnected}/>
        <MetricCard title="Efficiency" value={metrics.efficiency} change={2.3} icon={lucide_react_1.Activity} color="bg-orange-500" suffix="%" isLive={isConnected}/>
      </div>

      {/* Live Activity Feed */}
      <card_1.Card className="dark:border-gray-700 dark:bg-gray-800">
        <card_1.CardHeader>
          <card_1.CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
            Live Activity
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-3">
            {[
            {
                action: "Order #1234 moved to Printing",
                time: "Just now",
                icon: lucide_react_1.Package,
                color: "text-blue-500",
            },
            {
                action: "Cutting run completed - 250 units",
                time: "2 minutes ago",
                icon: lucide_react_1.TrendingUp,
                color: "text-green-500",
            },
            {
                action: "New order created by John Doe",
                time: "5 minutes ago",
                icon: lucide_react_1.Users,
                color: "text-purple-500",
            },
        ].map((activity, index) => (<div key={index} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                <div className={`${activity.color} mt-0.5`}>
                  <activity.icon className="h-4 w-4"/>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {activity.action}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
                    {activity.time}
                  </p>
                </div>
              </div>))}
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
