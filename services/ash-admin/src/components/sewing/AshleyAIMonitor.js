"use client";
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
exports.default = AshleyAIMonitor;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const button_1 = require("@/components/ui/button");
const alert_1 = require("@/components/ui/alert");
const lucide_react_1 = require("lucide-react");
function AshleyAIMonitor({ scope = "global", scopeId, realTime = true, showPredictions = true, autoRefresh = true, className = "", }) {
    const [insights, setInsights] = (0, react_1.useState)([]);
    const [metrics, setMetrics] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [lastUpdated, setLastUpdated] = (0, react_1.useState)(null);
    const [notifications, setNotifications] = (0, react_1.useState)(0);
    const intervalRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        fetchAshleyData();
        if (autoRefresh && realTime) {
            intervalRef.current = setInterval(() => {
                fetchAshleyData();
            }, 60000); // Update every minute for real-time monitoring
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [scope, scopeId, autoRefresh, realTime]);
    const fetchAshleyData = async () => {
        try {
            let endpoint = "/api/sewing/ashley-ai";
            const params = new URLSearchParams();
            if (scope && scope !== "global")
                params.append("scope", scope);
            if (scopeId)
                params.append("scope_id", scopeId);
            if (params.toString()) {
                endpoint += `?${params.toString()}`;
            }
            const [insightsResponse, metricsResponse] = await Promise.all([
                fetch(`${endpoint}/insights`),
                fetch(`${endpoint}/metrics`),
            ]);
            if (insightsResponse.ok && metricsResponse.ok) {
                const [insightsData, metricsData] = await Promise.all([
                    insightsResponse.json(),
                    metricsResponse.json(),
                ]);
                setInsights(insightsData.insights);
                setMetrics(metricsData.metrics);
                // Count unacknowledged high/critical insights for notifications
                const unacknowledged = insightsData.insights.filter((insight) => !insight.acknowledged &&
                    (insight.priority === "high" || insight.priority === "critical")).length;
                setNotifications(unacknowledged);
            }
            else {
                // Mock data for demo
                const mockInsights = [
                    {
                        id: "1",
                        type: "efficiency",
                        priority: "high",
                        title: "Efficiency Drop Detected",
                        description: "Line efficiency has decreased by 12% in the last hour across multiple operators.",
                        recommendation: "Consider implementing a 15-minute break rotation and check for equipment issues.",
                        confidence_score: 0.89,
                        impact_score: 0.75,
                        created_at: new Date().toISOString(),
                        acknowledged: false,
                    },
                    {
                        id: "2",
                        type: "bottleneck",
                        priority: "medium",
                        title: "Bottleneck Identified",
                        description: 'The "Set sleeves" operation is causing a 20% delay in overall production flow.',
                        recommendation: "Allocate additional operator to parallel processing or provide skill training.",
                        confidence_score: 0.94,
                        impact_score: 0.68,
                        created_at: new Date(Date.now() - 1800000).toISOString(),
                        acknowledged: false,
                    },
                    {
                        id: "3",
                        type: "fatigue",
                        priority: "medium",
                        title: "Operator Fatigue Pattern",
                        description: "Maria Santos (EMP001) showing signs of fatigue after 2.5 hours of continuous work.",
                        recommendation: "Recommend a 10-minute break to maintain current 96% efficiency level.",
                        confidence_score: 0.72,
                        impact_score: 0.55,
                        created_at: new Date(Date.now() - 900000).toISOString(),
                        acknowledged: false,
                    },
                    {
                        id: "4",
                        type: "quality",
                        priority: "low",
                        title: "Quality Trend Analysis",
                        description: "Defect rate has decreased by 15% over the past week with current operator assignments.",
                        recommendation: "Maintain current operator-operation pairings for optimal quality outcomes.",
                        confidence_score: 0.85,
                        impact_score: 0.45,
                        created_at: new Date(Date.now() - 3600000).toISOString(),
                        acknowledged: true,
                    },
                ];
                const mockMetrics = [
                    {
                        metric_name: "Line Efficiency",
                        current_value: 88,
                        target_value: 85,
                        trend: "down",
                        prediction: 85,
                        risk_level: "medium",
                    },
                    {
                        metric_name: "Defect Rate",
                        current_value: 1.2,
                        target_value: 2.0,
                        trend: "stable",
                        prediction: 1.3,
                        risk_level: "low",
                    },
                    {
                        metric_name: "Throughput",
                        current_value: 45,
                        target_value: 50,
                        trend: "up",
                        prediction: 48,
                        risk_level: "medium",
                    },
                ];
                setInsights(mockInsights);
                setMetrics(mockMetrics);
                setNotifications(2); // 2 unacknowledged high/medium priority insights
            }
            setLastUpdated(new Date());
        }
        catch (error) {
            console.error("Failed to fetch Ashley AI data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAcknowledgeInsight = async (insightId) => {
        try {
            const response = await fetch(`/api/sewing/ashley-ai/insights/${insightId}/acknowledge`, {
                method: "POST",
            });
            if (response.ok) {
                setInsights(prev => prev.map(insight => insight.id === insightId
                    ? { ...insight, acknowledged: true }
                    : insight));
                setNotifications(prev => Math.max(0, prev - 1));
            }
        }
        catch (error) {
            console.error("Failed to acknowledge insight:", error);
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case "critical":
                return "bg-red-100 text-red-800 border-red-200";
            case "high":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "low":
                return "bg-blue-100 text-blue-800 border-blue-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };
    const getPriorityIcon = (priority) => {
        switch (priority) {
            case "critical":
                return <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-600"/>;
            case "high":
                return <lucide_react_1.AlertTriangle className="h-4 w-4 text-orange-600"/>;
            case "medium":
                return <lucide_react_1.Clock className="h-4 w-4 text-yellow-600"/>;
            case "low":
                return <lucide_react_1.CheckCircle className="h-4 w-4 text-blue-600"/>;
            default:
                return <lucide_react_1.Activity className="h-4 w-4 text-gray-600"/>;
        }
    };
    const getTypeIcon = (type) => {
        switch (type) {
            case "efficiency":
                return <lucide_react_1.TrendingUp className="h-4 w-4"/>;
            case "quality":
                return <lucide_react_1.Target className="h-4 w-4"/>;
            case "bottleneck":
                return <lucide_react_1.AlertTriangle className="h-4 w-4"/>;
            case "fatigue":
                return <lucide_react_1.Users className="h-4 w-4"/>;
            case "optimization":
                return <lucide_react_1.Zap className="h-4 w-4"/>;
            default:
                return <lucide_react_1.Activity className="h-4 w-4"/>;
        }
    };
    const getTrendIcon = (trend) => {
        switch (trend) {
            case "up":
                return <lucide_react_1.TrendingUp className="h-4 w-4 text-green-600"/>;
            case "down":
                return <lucide_react_1.TrendingDown className="h-4 w-4 text-red-600"/>;
            case "stable":
                return <lucide_react_1.Activity className="h-4 w-4 text-blue-600"/>;
            default:
                return <lucide_react_1.Activity className="h-4 w-4 text-gray-600"/>;
        }
    };
    const getRiskColor = (risk) => {
        switch (risk) {
            case "high":
                return "text-red-600";
            case "medium":
                return "text-yellow-600";
            case "low":
                return "text-green-600";
            default:
                return "text-gray-600";
        }
    };
    if (loading) {
        return (<card_1.Card className={className}>
        <card_1.CardContent className="py-6">
          <div className="flex items-center justify-center">
            <lucide_react_1.Brain className="mr-2 h-6 w-6 animate-pulse text-purple-600"/>
            <span>Ashley AI is analyzing...</span>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<div className={`space-y-4 ${className}`}>
      {/* Header Card */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <lucide_react_1.Brain className="h-6 w-6 text-purple-600"/>
              </div>
              <div>
                <card_1.CardTitle>Ashley AI Monitor</card_1.CardTitle>
                <card_1.CardDescription>
                  Intelligent production optimization and real-time insights
                </card_1.CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {notifications > 0 && (<badge_1.Badge className="border-red-200 bg-red-100 text-red-800">
                  <lucide_react_1.Bell className="mr-1 h-3 w-3"/>
                  {notifications} alerts
                </badge_1.Badge>)}
              <badge_1.Badge variant="outline" className="text-purple-600">
                {realTime ? "Live" : "Snapshot"}
              </badge_1.Badge>
              <button_1.Button size="sm" variant="outline" onClick={fetchAshleyData}>
                <lucide_react_1.RefreshCw className="h-4 w-4"/>
              </button_1.Button>
            </div>
          </div>
        </card_1.CardHeader>
      </card_1.Card>

      {/* Performance Metrics */}
      {showPredictions && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.BarChart3 className="h-5 w-5"/>
              Performance Predictions
            </card_1.CardTitle>
            <card_1.CardDescription>
              AI-powered forecasting and trend analysis
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {metrics.map((metric, index) => (<div key={index} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{metric.metric_name}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Current:
                      </span>
                      <span className="font-bold">{metric.current_value}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Target:
                      </span>
                      <span className="font-medium">
                        {metric.target_value}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Predicted:
                      </span>
                      <span className={`font-medium ${getRiskColor(metric.risk_level)}`}>
                        {metric.prediction}%
                      </span>
                    </div>
                    <badge_1.Badge variant="outline" className={`${getRiskColor(metric.risk_level)} border-current`}>
                      {metric.risk_level} risk
                    </badge_1.Badge>
                  </div>
                </div>))}
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* AI Insights */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Eye className="h-5 w-5"/>
            Active Insights
          </card_1.CardTitle>
          <card_1.CardDescription>
            Real-time recommendations and optimization suggestions
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            {insights.map(insight => (<div key={insight.id} className={`rounded-lg border p-4 ${insight.acknowledged ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      {getTypeIcon(insight.type)}
                      <h4 className="font-medium">{insight.title}</h4>
                      <badge_1.Badge className={getPriorityColor(insight.priority)}>
                        {getPriorityIcon(insight.priority)}
                        <span className="ml-1">{insight.priority}</span>
                      </badge_1.Badge>
                    </div>

                    <p className="mb-2 text-sm text-muted-foreground">
                      {insight.description}
                    </p>

                    <alert_1.Alert className="mt-3">
                      <lucide_react_1.Zap className="h-4 w-4"/>
                      <alert_1.AlertDescription>
                        <strong>Recommendation:</strong>{" "}
                        {insight.recommendation}
                      </alert_1.AlertDescription>
                    </alert_1.Alert>

                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Confidence: {Math.round(insight.confidence_score * 100)}
                        %
                      </span>
                      <span>
                        Impact: {Math.round(insight.impact_score * 100)}%
                      </span>
                      <span>
                        {new Date(insight.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {!insight.acknowledged && (<button_1.Button size="sm" variant="outline" onClick={() => handleAcknowledgeInsight(insight.id)}>
                        <lucide_react_1.CheckCircle className="mr-1 h-4 w-4"/>
                        Acknowledge
                      </button_1.Button>)}
                    {insight.acknowledged && (<badge_1.Badge className="bg-green-100 text-green-800">
                        Acknowledged
                      </badge_1.Badge>)}
                  </div>
                </div>
              </div>))}

            {insights.length === 0 && (<div className="py-8 text-center text-muted-foreground">
                <lucide_react_1.Brain className="mx-auto mb-4 h-12 w-12 opacity-50"/>
                <p>No active insights at the moment</p>
                <p className="text-sm">
                  Ashley AI is continuously monitoring for optimization
                  opportunities
                </p>
              </div>)}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* AI Status */}
      <card_1.Card>
        <card_1.CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
              <span className="text-sm">Ashley AI is actively monitoring</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {lastUpdated && (<span>Last updated: {lastUpdated.toLocaleTimeString()}</span>)}
              {realTime && autoRefresh && <span>Auto-refresh: 1 min</span>}
              <button_1.Button size="sm" variant="ghost">
                <lucide_react_1.Settings className="h-4 w-4"/>
              </button_1.Button>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
