"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Analytics;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const button_1 = require("@/components/ui/button");
const tabs_1 = require("@/components/ui/tabs");
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
const lucide_react_1 = require("lucide-react");
function Analytics() {
    const [activeTab, setActiveTab] = (0, react_1.useState)("overview");
    const [metrics, setMetrics] = (0, react_1.useState)(null);
    const [productionMetrics, setProductionMetrics] = (0, react_1.useState)(null);
    const [financialMetrics, setFinancialMetrics] = (0, react_1.useState)(null);
    const [operationalMetrics, setOperationalMetrics] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [timeRange, setTimeRange] = (0, react_1.useState)("30d");
    (0, react_1.useEffect)(() => {
        fetchAnalytics();
    }, [timeRange]);
    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            // Mock analytics data since we don't have real analytics APIs yet
            setMetrics({
                production_efficiency: 87.3,
                quality_score: 94.2,
                on_time_delivery: 92.8,
                customer_satisfaction: 96.1,
                revenue_growth: 15.7,
                cost_reduction: 8.3,
                orders_completed: 156,
                orders_in_progress: 23,
                total_production_runs: 289,
                avg_cycle_time: 4.2,
            });
            setProductionMetrics({
                cutting_efficiency: 89.5,
                printing_efficiency: 91.2,
                sewing_efficiency: 85.7,
                finishing_efficiency: 88.9,
                qc_pass_rate: 94.2,
                defect_rate: 2.8,
                rework_rate: 1.5,
                throughput: 1450,
            });
            setFinancialMetrics({
                total_revenue: 2845600,
                total_cost: 1923400,
                gross_margin: 32.4,
                operating_margin: 18.7,
                cost_per_unit: 125.8,
                revenue_per_order: 18250,
                payment_collection_rate: 94.6,
                outstanding_receivables: 156800,
            });
            setOperationalMetrics({
                machine_utilization: 78.9,
                workforce_productivity: 112.5,
                inventory_turnover: 8.2,
                space_utilization: 85.3,
                energy_efficiency: 87.1,
                maintenance_compliance: 96.8,
                safety_incidents: 0,
                training_completion: 89.2,
            });
        }
        catch (error) {
            console.error("Error fetching analytics:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const getScoreColor = (score, threshold) => {
        if (score >= threshold.good)
            return "text-green-600";
        if (score >= threshold.warning)
            return "text-yellow-600";
        return "text-red-600";
    };
    const getScoreBadge = (score, threshold) => {
        if (score >= threshold.good)
            return "bg-green-100 text-green-800";
        if (score >= threshold.warning)
            return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };
    const formatPercentage = (value) => {
        return `${value.toFixed(1)}%`;
    };
    if (loading) {
        return (<dashboard_layout_1.default>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </dashboard_layout_1.default>);
    }
    return (<dashboard_layout_1.default>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
              <lucide_react_1.BarChart3 className="h-8 w-8 text-blue-600"/>
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Comprehensive business intelligence and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <button_1.Button onClick={fetchAnalytics} className="flex items-center gap-2">
              <lucide_react_1.RefreshCw className="h-4 w-4"/>
              Refresh
            </button_1.Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        {metrics && (<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Production Efficiency
                </card_1.CardTitle>
                <lucide_react_1.Activity className="h-4 w-4 text-blue-600"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(metrics.production_efficiency, { good: 85, warning: 75 })}`}>
                  {formatPercentage(metrics.production_efficiency)}
                </div>
                <p className="text-xs text-gray-600">
                  {metrics.total_production_runs} runs completed
                </p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Quality Score
                </card_1.CardTitle>
                <lucide_react_1.Target className="h-4 w-4 text-green-600"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(metrics.quality_score, { good: 90, warning: 80 })}`}>
                  {formatPercentage(metrics.quality_score)}
                </div>
                <p className="text-xs text-gray-600">QC performance</p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  On-Time Delivery
                </card_1.CardTitle>
                <lucide_react_1.Clock className="h-4 w-4 text-orange-600"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(metrics.on_time_delivery, { good: 90, warning: 80 })}`}>
                  {formatPercentage(metrics.on_time_delivery)}
                </div>
                <p className="text-xs text-gray-600">
                  {metrics.orders_completed} orders delivered
                </p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Revenue Growth
                </card_1.CardTitle>
                <lucide_react_1.TrendingUp className="h-4 w-4 text-purple-600"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(metrics.revenue_growth, { good: 10, warning: 5 })}`}>
                  +{formatPercentage(metrics.revenue_growth)}
                </div>
                <p className="text-xs text-gray-600">vs. previous period</p>
              </card_1.CardContent>
            </card_1.Card>
          </div>)}

        <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <tabs_1.TabsList>
            <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="production">Production</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="financial">Financial</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="operational">Operational</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="quality">Quality & Performance</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Performance Overview */}
              {metrics && (<card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="flex items-center gap-2">
                      <lucide_react_1.Activity className="h-5 w-5 text-blue-600"/>
                      Performance Overview
                    </card_1.CardTitle>
                    <card_1.CardDescription>
                      Key business performance indicators
                    </card_1.CardDescription>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Customer Satisfaction
                        </span>
                        <badge_1.Badge className={getScoreBadge(metrics.customer_satisfaction, { good: 90, warning: 80 })}>
                          {formatPercentage(metrics.customer_satisfaction)}
                        </badge_1.Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Average Cycle Time
                        </span>
                        <span className="text-sm font-bold">
                          {metrics.avg_cycle_time} days
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Cost Reduction
                        </span>
                        <span className="text-sm font-bold text-green-600">
                          -{formatPercentage(metrics.cost_reduction)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Orders in Progress
                        </span>
                        <span className="text-sm font-bold">
                          {metrics.orders_in_progress}
                        </span>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>)}

              {/* Quick Actions */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.Settings className="h-5 w-5 text-gray-600"/>
                    Quick Actions
                  </card_1.CardTitle>
                  <card_1.CardDescription>Common analytics tasks</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <button_1.Button variant="outline" className="flex items-center gap-2">
                      <lucide_react_1.Download className="h-4 w-4"/>
                      Export Data
                    </button_1.Button>
                    <button_1.Button variant="outline" className="flex items-center gap-2">
                      <lucide_react_1.Filter className="h-4 w-4"/>
                      Custom Filter
                    </button_1.Button>
                    <button_1.Button variant="outline" className="flex items-center gap-2">
                      <lucide_react_1.Calendar className="h-4 w-4"/>
                      Schedule Report
                    </button_1.Button>
                    <button_1.Button variant="outline" className="flex items-center gap-2">
                      <lucide_react_1.AlertTriangle className="h-4 w-4"/>
                      Set Alerts
                    </button_1.Button>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </div>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="production" className="space-y-4">
            {productionMetrics && (<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <card_1.Card>
                  <card_1.CardHeader className="pb-2">
                    <card_1.CardTitle className="text-sm font-medium">
                      Cutting Efficiency
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(productionMetrics.cutting_efficiency, { good: 85, warning: 75 })}`}>
                      {formatPercentage(productionMetrics.cutting_efficiency)}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardHeader className="pb-2">
                    <card_1.CardTitle className="text-sm font-medium">
                      Printing Efficiency
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(productionMetrics.printing_efficiency, { good: 85, warning: 75 })}`}>
                      {formatPercentage(productionMetrics.printing_efficiency)}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardHeader className="pb-2">
                    <card_1.CardTitle className="text-sm font-medium">
                      Sewing Efficiency
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(productionMetrics.sewing_efficiency, { good: 85, warning: 75 })}`}>
                      {formatPercentage(productionMetrics.sewing_efficiency)}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardHeader className="pb-2">
                    <card_1.CardTitle className="text-sm font-medium">
                      Overall Throughput
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {productionMetrics.throughput}
                    </div>
                    <p className="text-xs text-gray-600">units/day</p>
                  </card_1.CardContent>
                </card_1.Card>
              </div>)}
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="financial" className="space-y-4">
            {financialMetrics && (<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <card_1.Card>
                  <card_1.CardHeader className="pb-2">
                    <card_1.CardTitle className="text-sm font-medium">
                      Total Revenue
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(financialMetrics.total_revenue)}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardHeader className="pb-2">
                    <card_1.CardTitle className="text-sm font-medium">
                      Gross Margin
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(financialMetrics.gross_margin, { good: 30, warning: 20 })}`}>
                      {formatPercentage(financialMetrics.gross_margin)}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardHeader className="pb-2">
                    <card_1.CardTitle className="text-sm font-medium">
                      Cost Per Unit
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(financialMetrics.cost_per_unit)}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardHeader className="pb-2">
                    <card_1.CardTitle className="text-sm font-medium">
                      Collection Rate
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(financialMetrics.payment_collection_rate, { good: 90, warning: 80 })}`}>
                      {formatPercentage(financialMetrics.payment_collection_rate)}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              </div>)}
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="operational" className="space-y-4">
            {operationalMetrics && (<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <card_1.Card>
                  <card_1.CardHeader className="pb-2">
                    <card_1.CardTitle className="text-sm font-medium">
                      Machine Utilization
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(operationalMetrics.machine_utilization, { good: 80, warning: 70 })}`}>
                      {formatPercentage(operationalMetrics.machine_utilization)}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardHeader className="pb-2">
                    <card_1.CardTitle className="text-sm font-medium">
                      Workforce Productivity
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(operationalMetrics.workforce_productivity, { good: 100, warning: 90 })}`}>
                      {formatPercentage(operationalMetrics.workforce_productivity)}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardHeader className="pb-2">
                    <card_1.CardTitle className="text-sm font-medium">
                      Safety Incidents
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className={`text-2xl font-bold ${operationalMetrics.safety_incidents === 0 ? "text-green-600" : "text-red-600"}`}>
                      {operationalMetrics.safety_incidents}
                    </div>
                    <p className="text-xs text-gray-600">this period</p>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardHeader className="pb-2">
                    <card_1.CardTitle className="text-sm font-medium">
                      Training Completion
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(operationalMetrics.training_completion, { good: 85, warning: 75 })}`}>
                      {formatPercentage(operationalMetrics.training_completion)}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              </div>)}
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="quality" className="space-y-4">
            {productionMetrics && (<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="flex items-center gap-2">
                      <lucide_react_1.CheckCircle className="h-5 w-5 text-green-600"/>
                      QC Pass Rate
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className={`text-3xl font-bold ${getScoreColor(productionMetrics.qc_pass_rate, { good: 90, warning: 80 })}`}>
                      {formatPercentage(productionMetrics.qc_pass_rate)}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Quality control performance
                    </p>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="flex items-center gap-2">
                      <lucide_react_1.AlertTriangle className="h-5 w-5 text-red-600"/>
                      Defect Rate
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className={`text-3xl font-bold ${productionMetrics.defect_rate <= 3 ? "text-green-600" : "text-red-600"}`}>
                      {formatPercentage(productionMetrics.defect_rate)}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Production defects
                    </p>
                  </card_1.CardContent>
                </card_1.Card>

                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="flex items-center gap-2">
                      <lucide_react_1.RefreshCw className="h-5 w-5 text-orange-600"/>
                      Rework Rate
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className={`text-3xl font-bold ${productionMetrics.rework_rate <= 2 ? "text-green-600" : "text-red-600"}`}>
                      {formatPercentage(productionMetrics.rework_rate)}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Items requiring rework
                    </p>
                  </card_1.CardContent>
                </card_1.Card>
              </div>)}
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </div>
    </dashboard_layout_1.default>);
}
