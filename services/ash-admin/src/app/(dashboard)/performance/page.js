/**
 * Performance Dashboard
 * Real-time system performance monitoring
 */
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PerformancePage;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
function PerformancePage() {
    const [metrics, setMetrics] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [lastUpdated, setLastUpdated] = (0, react_1.useState)(new Date());
    const fetchMetrics = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/performance/metrics");
            const data = await response.json();
            if (data.success) {
                setMetrics(data.data);
                setLastUpdated(new Date());
            }
        }
        catch (error) {
            console.error("Failed to fetch performance metrics:", error);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        fetchMetrics();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchMetrics, 30000);
        return () => clearInterval(interval);
    }, []);
    if (loading && !metrics) {
        return (<div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <lucide_react_1.Activity className="mx-auto mb-4 h-12 w-12 animate-spin text-primary"/>
          <p>Loading performance metrics...</p>
        </div>
      </div>);
    }
    if (!metrics) {
        return (<div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          Failed to load performance metrics
        </div>
      </div>);
    }
    const getGradeColor = (grade) => {
        if (grade.startsWith("A"))
            return "bg-green-500";
        if (grade === "B")
            return "bg-blue-500";
        if (grade === "C")
            return "bg-yellow-500";
        if (grade === "D")
            return "bg-orange-500";
        return "bg-red-500";
    };
    const getHealthColor = (status) => {
        if (status === "healthy")
            return "bg-green-500";
        if (status === "degraded")
            return "bg-yellow-500";
        return "bg-red-500";
    };
    return (<div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Real-time system performance monitoring and optimization
          </p>
        </div>
        <button_1.Button onClick={fetchMetrics} disabled={loading}>
          <lucide_react_1.RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}/>
          Refresh
        </button_1.Button>
      </div>

      {/* System Health */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Activity className="h-5 w-5"/>
            System Health
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${getHealthColor(metrics.health.status)}`}/>
            <span className="font-semibold capitalize">
              {metrics.health.status}
            </span>
            <span className="text-muted-foreground">-</span>
            <span className="text-sm">{metrics.health.message}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </card_1.CardContent>
      </card_1.Card>

      {/* Performance Grades */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-sm">Query Cache Efficiency</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {metrics.queries.cacheHitRate}%
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Cache Hit Rate
                </p>
              </div>
              <badge_1.Badge className={`${getGradeColor(metrics.grades.queryCacheEfficiency)} px-4 py-2 text-2xl text-white`}>
                {metrics.grades.queryCacheEfficiency}
              </badge_1.Badge>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-sm">Query Speed</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {metrics.queries.avgDuration}ms
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Avg Duration
                </p>
              </div>
              <badge_1.Badge className={`${getGradeColor(metrics.grades.querySpeed)} px-4 py-2 text-2xl text-white`}>
                {metrics.grades.querySpeed}
              </badge_1.Badge>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-sm">Redis Cache</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {metrics.redis.available
            ? `${metrics.redis.cacheHitRate}%`
            : "N/A"}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {metrics.redis.available ? "Redis Hit Rate" : "Unavailable"}
                </p>
              </div>
              <badge_1.Badge className={`${getGradeColor(metrics.grades.redisCacheEfficiency)} px-4 py-2 text-2xl text-white`}>
                {metrics.grades.redisCacheEfficiency}
              </badge_1.Badge>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Query Metrics */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Database className="h-5 w-5"/>
            Database Query Performance
          </card_1.CardTitle>
          <card_1.CardDescription>
            Performance metrics for database queries with caching
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Queries</p>
              <p className="text-2xl font-bold">{metrics.queries.total}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <lucide_react_1.TrendingUp className="h-4 w-4 text-green-500"/>
                Cache Hits
              </p>
              <p className="text-2xl font-bold text-green-600">
                {metrics.queries.cacheHits}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <lucide_react_1.TrendingDown className="h-4 w-4 text-red-500"/>
                Cache Misses
              </p>
              <p className="text-2xl font-bold text-red-600">
                {metrics.queries.cacheMisses}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <lucide_react_1.Zap className="h-4 w-4 text-blue-500"/>
                Speedup
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {metrics.queries.speedup}x
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-muted p-4">
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Avg Duration (All)</p>
                <p className="font-semibold">{metrics.queries.avgDuration}ms</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Duration (Cached)</p>
                <p className="font-semibold text-green-600">
                  {metrics.queries.avgCachedDuration}ms
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Duration (Uncached)</p>
                <p className="font-semibold text-orange-600">
                  {metrics.queries.avgUncachedDuration}ms
                </p>
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Redis Stats */}
      {metrics.redis.available && metrics.redis.stats && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Redis Cache Statistics</card_1.CardTitle>
            <card_1.CardDescription>Detailed Redis server metrics</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <p className="text-muted-foreground">Connected Clients</p>
                <p className="font-semibold">
                  {metrics.redis.stats.connected_clients}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Memory Used</p>
                <p className="font-semibold">
                  {metrics.redis.stats.used_memory_human}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Ops/sec</p>
                <p className="font-semibold">
                  {metrics.redis.stats.instantaneous_ops_per_sec}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Uptime</p>
                <p className="font-semibold">
                  {metrics.redis.stats.uptime_in_days} days
                </p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Recommendations */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Performance Recommendations</card_1.CardTitle>
          <card_1.CardDescription>
            Actionable insights to improve system performance
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <ul className="space-y-2">
            {metrics.recommendations.map((recommendation, index) => (<li key={index} className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                <span className="text-sm">{recommendation}</span>
              </li>))}
          </ul>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
