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
exports.default = AshleyAIOptimization;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const progress_1 = require("@/components/ui/progress");
const alert_1 = require("@/components/ui/alert");
const tabs_1 = require("@/components/ui/tabs");
const lucide_react_1 = require("lucide-react");
function AshleyAIOptimization({ runId, printMethod, quantity, materials = [], machineId, orderData }) {
    const [optimizationData, setOptimizationData] = (0, react_1.useState)(null);
    const [monitoringData, setMonitoringData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [activeTab, setActiveTab] = (0, react_1.useState)('optimization');
    const [autoRefresh, setAutoRefresh] = (0, react_1.useState)(false);
    // Get initial optimization
    const getOptimization = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/printing/ai/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    print_method: printMethod,
                    order_id: runId,
                    quantity,
                    materials,
                    machine_id: machineId,
                    quality_requirements: orderData?.quality_requirements,
                    rush_order: orderData?.rush_order
                })
            });
            const result = await response.json();
            if (result.success) {
                setOptimizationData(result.data);
            }
        }
        catch (error) {
            console.error('Error getting optimization:', error);
        }
        finally {
            setLoading(false);
        }
    };
    // Get real-time monitoring
    const getMonitoring = async () => {
        try {
            const response = await fetch(`/api/printing/ai/monitor?run_id=${runId}&method=${printMethod}`);
            const result = await response.json();
            if (result.success) {
                setMonitoringData(result.data);
            }
        }
        catch (error) {
            console.error('Error getting monitoring data:', error);
        }
    };
    (0, react_1.useEffect)(() => {
        getOptimization();
    }, [runId, printMethod, quantity]);
    (0, react_1.useEffect)(() => {
        if (runId) {
            getMonitoring();
        }
    }, [runId]);
    // Auto-refresh monitoring data
    (0, react_1.useEffect)(() => {
        let interval;
        if (autoRefresh && runId) {
            interval = setInterval(getMonitoring, 30000); // Every 30 seconds
        }
        return () => {
            if (interval)
                clearInterval(interval);
        };
    }, [autoRefresh, runId]);
    const getPriorityColor = (priority) => {
        if (!priority)
            return 'outline';
        switch (priority.toLowerCase()) {
            case 'critical': return 'destructive';
            case 'high': return 'destructive';
            case 'medium': return 'secondary';
            case 'low': return 'outline';
            default: return 'outline';
        }
    };
    const getGradeColor = (grade) => {
        if (grade.startsWith('A'))
            return 'text-green-600';
        if (grade.startsWith('B'))
            return 'text-blue-600';
        if (grade.startsWith('C'))
            return 'text-yellow-600';
        return 'text-red-600';
    };
    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };
    if (loading && !optimizationData) {
        return (<card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Brain className="h-5 w-5 animate-spin"/>
            Ashley AI Analyzing...
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              Generating intelligent optimization recommendations...
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<div className="space-y-6">
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <lucide_react_1.Brain className="h-5 w-5 text-blue-600"/>
              Ashley AI Optimization
            </div>
            <div className="flex items-center gap-2">
              {monitoringData && (<badge_1.Badge className={`${getGradeColor(monitoringData.performance_score.grade)} font-bold`}>
                  Grade: {monitoringData.performance_score.grade}
                </badge_1.Badge>)}
              <button_1.Button variant="outline" size="sm" onClick={() => setAutoRefresh(!autoRefresh)} className={autoRefresh ? 'bg-green-50 text-green-700' : ''}>
                <lucide_react_1.Activity className="h-4 w-4 mr-1"/>
                {autoRefresh ? 'Live' : 'Manual'}
              </button_1.Button>
            </div>
          </card_1.CardTitle>
        </card_1.CardHeader>
        
        <card_1.CardContent>
          <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
            <tabs_1.TabsList className="grid w-full grid-cols-4">
              <tabs_1.TabsTrigger value="optimization">Optimization</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="monitoring">Real-time</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="insights">Insights</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="predictions">Predictions</tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            {/* Optimization Tab */}
            <tabs_1.TabsContent value="optimization" className="space-y-4">
              {optimizationData && (<>
                  {/* Confidence Score */}
                  <card_1.Card>
                    <card_1.CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">AI Confidence</span>
                        <span className="text-sm font-bold">
                          {Math.round(optimizationData.confidence_score * 100)}%
                        </span>
                      </div>
                      <progress_1.Progress value={optimizationData.confidence_score * 100}/>
                    </card_1.CardContent>
                  </card_1.Card>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <card_1.Card>
                      <card_1.CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-1">
                          <lucide_react_1.Clock className="h-4 w-4 text-blue-600"/>
                          <span className="text-xs font-medium text-muted-foreground">
                            Estimated Time
                          </span>
                        </div>
                        <div className="text-lg font-bold">
                          {formatTime(optimizationData.estimated_completion_time)}
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>

                    <card_1.Card>
                      <card_1.CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-1">
                          <lucide_react_1.DollarSign className="h-4 w-4 text-green-600"/>
                          <span className="text-xs font-medium text-muted-foreground">
                            Cost Prediction
                          </span>
                        </div>
                        <div className="text-lg font-bold">
                          {formatCurrency(optimizationData.cost_prediction)}
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>

                    <card_1.Card>
                      <card_1.CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-1">
                          <lucide_react_1.Target className="h-4 w-4 text-purple-600"/>
                          <span className="text-xs font-medium text-muted-foreground">
                            Quality Score
                          </span>
                        </div>
                        <div className="text-lg font-bold">
                          {Math.round(optimizationData.quality_prediction * 100)}%
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>

                    <card_1.Card>
                      <card_1.CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-1">
                          <lucide_react_1.Zap className="h-4 w-4 text-orange-600"/>
                          <span className="text-xs font-medium text-muted-foreground">
                            Material Efficiency
                          </span>
                        </div>
                        <div className="text-lg font-bold">
                          {Math.round(optimizationData.material_efficiency * 100)}%
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  </div>

                  {/* Recommendations */}
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle className="flex items-center gap-2">
                        <lucide_react_1.Lightbulb className="h-4 w-4"/>
                        AI Recommendations
                      </card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="space-y-3">
                        {optimizationData.recommendations.map((rec, index) => (<alert_1.Alert key={index}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <badge_1.Badge variant={getPriorityColor(rec.priority)}>
                                    {rec.priority}
                                  </badge_1.Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {rec.type}
                                  </span>
                                </div>
                                <alert_1.AlertDescription>{rec.message}</alert_1.AlertDescription>
                                {rec.action && (<div className="text-xs text-muted-foreground mt-1">
                                    Action: {rec.action}
                                  </div>)}
                              </div>
                            </div>
                          </alert_1.Alert>))}
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                </>)}
            </tabs_1.TabsContent>

            {/* Real-time Monitoring Tab */}
            <tabs_1.TabsContent value="monitoring" className="space-y-4">
              {monitoringData && (<>
                  {/* Performance Score */}
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle className="flex items-center gap-2">
                        <lucide_react_1.Gauge className="h-4 w-4"/>
                        Performance Score
                      </card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="text-center mb-4">
                        <div className={`text-4xl font-bold ${getGradeColor(monitoringData.performance_score.grade)}`}>
                          {monitoringData.performance_score.grade}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(monitoringData.performance_score.overall_score * 100)}% Overall
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(monitoringData.performance_score.component_scores).map(([key, score]) => (<div key={key}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm capitalize">{key}</span>
                              <span className="text-sm font-medium">
                                {Math.round(score * 100)}%
                              </span>
                            </div>
                            <progress_1.Progress value={score * 100} className="h-2"/>
                          </div>))}
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>

                  {/* Risk Factors */}
                  {monitoringData.insights.risk_factors.length > 0 && (<card_1.Card>
                      <card_1.CardHeader>
                        <card_1.CardTitle className="flex items-center gap-2">
                          <lucide_react_1.AlertTriangle className="h-4 w-4 text-orange-500"/>
                          Risk Factors
                        </card_1.CardTitle>
                      </card_1.CardHeader>
                      <card_1.CardContent>
                        <div className="space-y-3">
                          {monitoringData.insights.risk_factors.map((risk, index) => (<alert_1.Alert key={index} className={risk.level === 'HIGH' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <badge_1.Badge variant={risk.level === 'HIGH' ? 'destructive' : 'secondary'}>
                                      {risk.level}
                                    </badge_1.Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {risk.type}
                                    </span>
                                  </div>
                                  <alert_1.AlertDescription>{risk.description}</alert_1.AlertDescription>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {risk.recommendation}
                                  </div>
                                </div>
                              </div>
                            </alert_1.Alert>))}
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>)}

                  {/* Real-time Recommendations */}
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle className="flex items-center gap-2">
                        <lucide_react_1.Brain className="h-4 w-4"/>
                        Live Recommendations
                      </card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="space-y-3">
                        {monitoringData.recommendations.map((rec, index) => (<alert_1.Alert key={index}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <badge_1.Badge variant={getPriorityColor(rec.priority)}>
                                    {rec.priority}
                                  </badge_1.Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {rec.type}
                                  </span>
                                </div>
                                <alert_1.AlertDescription>{rec.message}</alert_1.AlertDescription>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Action: {rec.action}
                                </div>
                              </div>
                            </div>
                          </alert_1.Alert>))}
                        
                        {monitoringData.recommendations.length === 0 && (<div className="text-center py-4 text-muted-foreground">
                            <lucide_react_1.CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500"/>
                            No immediate recommendations. Process is running optimally.
                          </div>)}
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                </>)}
            </tabs_1.TabsContent>

            {/* Insights Tab */}
            <tabs_1.TabsContent value="insights" className="space-y-4">
              {monitoringData && (<>
                  {/* Efficiency Breakdown */}
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle className="flex items-center gap-2">
                        <lucide_react_1.TrendingUp className="h-4 w-4"/>
                        Efficiency Analysis
                      </card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Overall Efficiency</span>
                            <span className="text-sm font-bold">
                              {Math.round(monitoringData.insights.efficiency_score.score * 100)}%
                            </span>
                          </div>
                          <progress_1.Progress value={monitoringData.insights.efficiency_score.score * 100}/>
                        </div>
                        
                        {Object.entries(monitoringData.insights.efficiency_score.factors).map(([key, value]) => (<div key={key}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm capitalize">{key} Efficiency</span>
                              <span className="text-sm">
                                {Math.round(value * 100)}%
                              </span>
                            </div>
                            <progress_1.Progress value={value * 100} className="h-1.5"/>
                          </div>))}
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>

                  {/* Material Utilization */}
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle>Material Utilization</card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {Math.round(monitoringData.insights.material_utilization.utilization_rate * 100)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Utilization Rate</div>
                        </div>
                        
                        <div>
                          <div className="text-2xl font-bold text-red-600">
                            {monitoringData.insights.material_utilization.waste_percentage}%
                          </div>
                          <div className="text-xs text-muted-foreground">Waste Rate</div>
                        </div>
                        
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(monitoringData.insights.material_utilization.total_cost)}
                          </div>
                          <div className="text-xs text-muted-foreground">Material Cost</div>
                        </div>
                        
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(monitoringData.insights.material_utilization.cost_efficiency * 100)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Cost Efficiency</div>
                        </div>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>

                  {/* Quality Trend */}
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle>Quality Analysis</card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-2xl font-bold">
                            {Math.round(monitoringData.insights.quality_trend.score * 100)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Quality Score</div>
                        </div>
                        
                        <div>
                          <div className="text-2xl font-bold text-red-600">
                            {monitoringData.insights.quality_trend.defect_rate}%
                          </div>
                          <div className="text-xs text-muted-foreground">Defect Rate</div>
                        </div>
                        
                        <div>
                          <div className="text-2xl font-bold">
                            <badge_1.Badge variant="outline" className="capitalize">
                              {monitoringData.insights.quality_trend.trend}
                            </badge_1.Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">Trend</div>
                        </div>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                </>)}
            </tabs_1.TabsContent>

            {/* Predictions Tab */}
            <tabs_1.TabsContent value="predictions" className="space-y-4">
              {monitoringData && (<>
                  {/* Time Prediction */}
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle className="flex items-center gap-2">
                        <lucide_react_1.Clock className="h-4 w-4"/>
                        Completion Prediction
                      </card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-lg font-bold">
                            {formatTime(monitoringData.insights.time_prediction.remaining_minutes)}
                          </div>
                          <div className="text-xs text-muted-foreground">Remaining Time</div>
                        </div>
                        
                        <div>
                          <div className="text-lg font-bold">
                            {new Date(monitoringData.insights.time_prediction.estimated_completion).toLocaleTimeString()}
                          </div>
                          <div className="text-xs text-muted-foreground">Estimated Completion</div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Prediction Confidence</span>
                          <span className="text-sm font-medium">
                            {Math.round(monitoringData.insights.time_prediction.confidence * 100)}%
                          </span>
                        </div>
                        <progress_1.Progress value={monitoringData.insights.time_prediction.confidence * 100}/>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>

                  {/* Cost Analysis */}
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle className="flex items-center gap-2">
                        <lucide_react_1.BarChart3 className="h-4 w-4"/>
                        Cost Analysis
                      </card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Material Cost</span>
                          <span className="font-medium">
                            {formatCurrency(monitoringData.insights.cost_tracking.material_cost)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm">Labor Cost</span>
                          <span className="font-medium">
                            {formatCurrency(monitoringData.insights.cost_tracking.labor_cost)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm">Overhead</span>
                          <span className="font-medium">
                            {formatCurrency(monitoringData.insights.cost_tracking.overhead_cost)}
                          </span>
                        </div>
                        
                        <hr />
                        
                        <div className="flex justify-between font-bold">
                          <span>Total Cost</span>
                          <span>{formatCurrency(monitoringData.insights.cost_tracking.total_cost)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm">Estimated Revenue</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(monitoringData.insights.cost_tracking.estimated_revenue)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm">Profit Margin</span>
                          <span className={`font-medium ${monitoringData.insights.cost_tracking.profit_margin > 0.2
                ? 'text-green-600'
                : monitoringData.insights.cost_tracking.profit_margin > 0.1
                    ? 'text-yellow-600'
                    : 'text-red-600'}`}>
                            {Math.round(monitoringData.insights.cost_tracking.profit_margin * 100)}%
                          </span>
                        </div>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                </>)}
            </tabs_1.TabsContent>
          </tabs_1.Tabs>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
