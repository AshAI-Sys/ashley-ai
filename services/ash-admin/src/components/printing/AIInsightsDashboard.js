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
exports.default = AIInsightsDashboard;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const progress_1 = require("@/components/ui/progress");
const alert_1 = require("@/components/ui/alert");
const lucide_react_1 = require("lucide-react");
function AIInsightsDashboard() {
    const [aiData, setAiData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        fetchAIInsights();
        const interval = setInterval(fetchAIInsights, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);
    const fetchAIInsights = async () => {
        try {
            const response = await fetch("/api/printing/ai/dashboard-insights");
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setAiData(result.data);
                }
            }
        }
        catch (error) {
            console.error("Error fetching AI insights:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const getGradeColor = (grade) => {
        if (grade.startsWith("A"))
            return "text-green-600";
        if (grade.startsWith("B"))
            return "text-blue-600";
        if (grade.startsWith("C"))
            return "text-yellow-600";
        return "text-red-600";
    };
    const getTrendIcon = (trend, change) => {
        if (trend === "up")
            return <lucide_react_1.TrendingUp className="h-4 w-4 text-green-500"/>;
        if (trend === "down")
            return <lucide_react_1.TrendingDown className="h-4 w-4 text-red-500"/>;
        return <lucide_react_1.Activity className="h-4 w-4 text-gray-500"/>;
    };
    const getPriorityColor = (priority) => {
        if (!priority)
            return "outline";
        switch (priority.toLowerCase()) {
            case "critical":
                return "destructive";
            case "high":
                return "destructive";
            case "medium":
                return "secondary";
            case "low":
                return "outline";
            default:
                return "outline";
        }
    };
    if (loading) {
        return (<card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Brain className="h-5 w-5 animate-pulse"/>
            Ashley AI Insights
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="py-8 text-center">
            <div className="text-muted-foreground">Loading AI insights...</div>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (!aiData) {
        return (<card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Brain className="h-5 w-5"/>
            Ashley AI Insights
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <lucide_react_1.AlertTriangle className="mx-auto mb-2 h-8 w-8"/>
            <p>Unable to load AI insights</p>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<div className="space-y-6">
      {/* Overall Performance */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <lucide_react_1.Brain className="h-5 w-5 text-blue-600"/>
              Ashley AI Performance Overview
            </div>
            <badge_1.Badge className={`${getGradeColor(aiData.overall_performance_grade)} font-bold`}>
              Grade: {aiData.overall_performance_grade}
            </badge_1.Badge>
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(aiData.overall_performance_score * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Overall Score</div>
              <progress_1.Progress value={aiData.overall_performance_score * 100} className="mt-1"/>
            </div>

            <div>
              <div className="text-2xl font-bold text-green-600">
                {aiData.active_runs_insights.total_active}
              </div>
              <div className="text-xs text-muted-foreground">Active Runs</div>
              <div className="mt-1 text-xs text-blue-600">
                {Math.round(aiData.active_runs_insights.avg_efficiency * 100)}%
                avg efficiency
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-orange-600">
                {aiData.active_runs_insights.high_risk_runs}
              </div>
              <div className="text-xs text-muted-foreground">High Risk</div>
              <div className="mt-1 text-xs text-green-600">
                {aiData.active_runs_insights.optimization_opportunities}{" "}
                optimizable
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-purple-600">
                {aiData.recommendations.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Active Recommendations
              </div>
              <div className="mt-1 text-xs text-red-600">
                {aiData.recommendations.filter(r => r.priority === "HIGH" || r.priority === "CRITICAL").length}{" "}
                urgent
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Performance Trends */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.BarChart3 className="h-4 w-4"/>
            Performance Trends
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center justify-between rounded border p-3">
              <div>
                <div className="text-sm font-medium">Efficiency</div>
                <div className="text-xs text-muted-foreground">
                  {aiData.performance_trends.efficiency_change > 0 ? "+" : ""}
                  {Math.round(aiData.performance_trends.efficiency_change * 100)}
                  %
                </div>
              </div>
              {getTrendIcon(aiData.performance_trends.efficiency_trend, aiData.performance_trends.efficiency_change)}
            </div>

            <div className="flex items-center justify-between rounded border p-3">
              <div>
                <div className="text-sm font-medium">Quality</div>
                <div className="text-xs text-muted-foreground">
                  {aiData.performance_trends.quality_change > 0 ? "+" : ""}
                  {Math.round(aiData.performance_trends.quality_change * 100)}%
                </div>
              </div>
              {getTrendIcon(aiData.performance_trends.quality_trend, aiData.performance_trends.quality_change)}
            </div>

            <div className="flex items-center justify-between rounded border p-3">
              <div>
                <div className="text-sm font-medium">Cost</div>
                <div className="text-xs text-muted-foreground">
                  {aiData.performance_trends.cost_change > 0 ? "+" : ""}
                  {Math.round(aiData.performance_trends.cost_change * 100)}%
                </div>
              </div>
              {getTrendIcon(aiData.performance_trends.cost_trend, aiData.performance_trends.cost_change)}
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Method Performance Breakdown */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Target className="h-4 w-4"/>
            Method Performance
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-3">
            {Object.entries(aiData.method_performance).map(([method, data]) => (<div key={method} className="flex items-center justify-between rounded border p-3">
                <div>
                  <div className="font-medium">{method}</div>
                  <div className="text-xs text-muted-foreground">
                    {data.runs_count} active runs
                    {data.top_issue && ` • Top issue: ${data.top_issue}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">
                    {Math.round(data.score * 100)}%
                  </div>
                  <progress_1.Progress value={data.score * 100} className="mt-1 w-20"/>
                </div>
              </div>))}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Active Recommendations */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.AlertTriangle className="h-4 w-4"/>
            Active Recommendations
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-3">
            {aiData.recommendations.slice(0, 5).map((rec, index) => (<alert_1.Alert key={index}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <badge_1.Badge variant={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </badge_1.Badge>
                      <span className="text-xs text-muted-foreground">
                        {rec.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({rec.runs_affected} runs affected)
                      </span>
                    </div>
                    <alert_1.AlertDescription>{rec.message}</alert_1.AlertDescription>
                  </div>
                </div>
              </alert_1.Alert>))}

            {aiData.recommendations.length === 0 && (<div className="py-4 text-center text-muted-foreground">
                <lucide_react_1.CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500"/>
                No immediate recommendations. All systems are running optimally.
              </div>)}

            {aiData.recommendations.length > 5 && (<div className="text-center text-sm text-muted-foreground">
                +{aiData.recommendations.length - 5} more recommendations
                available
              </div>)}
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
