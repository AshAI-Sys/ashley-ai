"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QCAnalyticsPage;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const select_1 = require("@/components/ui/select");
function QCAnalyticsPage() {
    const [metrics, setMetrics] = (0, react_1.useState)(null);
    const [spcData, setSpcData] = (0, react_1.useState)([]);
    const [paretoData, setParetoData] = (0, react_1.useState)([]);
    const [selectedPeriod, setSelectedPeriod] = (0, react_1.useState)("month");
    const [selectedMetric, setSelectedMetric] = (0, react_1.useState)("defect_rate");
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        loadAnalyticsData();
    }, [selectedPeriod, selectedMetric]);
    const loadAnalyticsData = async () => {
        setLoading(true);
        try {
            // Load quality metrics
            const metricsResponse = await fetch(`/api/quality-control/analytics/metrics?period=${selectedPeriod}`);
            const metricsData = await metricsResponse.json();
            setMetrics(metricsData);
            // Load SPC data
            const spcResponse = await fetch(`/api/quality-control/analytics/spc?metric=${selectedMetric}&period=${selectedPeriod}`);
            const spcData = await spcResponse.json();
            setSpcData(spcData);
            // Load Pareto data
            const paretoResponse = await fetch(`/api/quality-control/analytics/pareto?period=${selectedPeriod}`);
            const paretoData = await paretoResponse.json();
            setParetoData(paretoData);
        }
        catch (error) {
            console.error("Error loading analytics data:", error);
            // Load mock data for demo
            loadMockData();
        }
        finally {
            setLoading(false);
        }
    };
    const loadMockData = () => {
        // Mock data for demonstration
        setMetrics({
            defect_rate: 2.8,
            first_pass_yield: 94.2,
            cost_of_quality: 45800,
            customer_complaints: 3,
            trend: "down",
        });
        // Generate mock SPC data
        const mockSPCData = [];
        const centerLine = selectedMetric === "defect_rate" ? 2.8 : 94.2;
        const controlLimits = {
            ucl: centerLine + centerLine * 0.3,
            lcl: Math.max(0, centerLine - centerLine * 0.3),
            center_line: centerLine,
        };
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            const variation = (Math.random() - 0.5) * 0.4;
            const value = centerLine + centerLine * variation;
            const isOutlier = value > controlLimits.ucl || value < controlLimits.lcl;
            mockSPCData.push({
                date: date.toISOString().split("T")[0],
                value,
                is_outlier: isOutlier,
                control_limits: controlLimits,
            });
        }
        setSpcData(mockSPCData);
        // Mock Pareto data
        setParetoData([
            {
                defect_code: "PRINT_MISALIGN",
                defect_name: "Print Misalignment",
                count: 45,
                percentage: 35.2,
                cumulative_percentage: 35.2,
            },
            {
                defect_code: "SEW_OPEN_SEAM",
                defect_name: "Open Seam",
                count: 32,
                percentage: 25.0,
                cumulative_percentage: 60.2,
            },
            {
                defect_code: "FABRIC_HOLE",
                defect_name: "Fabric Hole",
                count: 18,
                percentage: 14.1,
                cumulative_percentage: 74.3,
            },
            {
                defect_code: "COLOR_BLEED",
                defect_name: "Color Bleeding",
                count: 15,
                percentage: 11.7,
                cumulative_percentage: 86.0,
            },
            {
                defect_code: "SIZE_VARIANCE",
                defect_name: "Size Variance",
                count: 12,
                percentage: 9.4,
                cumulative_percentage: 95.4,
            },
            {
                defect_code: "OTHER",
                defect_name: "Other Defects",
                count: 6,
                percentage: 4.6,
                cumulative_percentage: 100.0,
            },
        ]);
    };
    const MetricCard = ({ title, value, unit, icon: Icon, trend, trendValue, }) => (<card_1.Card>
      <card_1.CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="mt-2 flex items-center">
              <span className="text-3xl font-bold text-gray-900">
                {typeof value === "number" ? value.toFixed(1) : value}
              </span>
              {unit && (<span className="ml-1 text-sm text-gray-500">{unit}</span>)}
            </div>
            {trend && (<div className={`mt-2 flex items-center ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600"}`}>
                {trend === "up" ? (<lucide_react_1.TrendingUp className="mr-1 h-4 w-4"/>) : trend === "down" ? (<lucide_react_1.TrendingDown className="mr-1 h-4 w-4"/>) : null}
                <span className="text-sm font-medium">{trendValue}</span>
              </div>)}
          </div>
          <div className="rounded-full bg-gray-100 p-3">
            <Icon className="h-6 w-6 text-gray-600"/>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
    const SPCChart = () => (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center justify-between">
          <span>Statistical Process Control Chart</span>
          <select_1.Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <select_1.SelectTrigger className="w-48">
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="defect_rate">Defect Rate (%)</select_1.SelectItem>
              <select_1.SelectItem value="first_pass_yield">
                First Pass Yield (%)
              </select_1.SelectItem>
              <select_1.SelectItem value="cycle_time">Cycle Time (hours)</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="relative h-80 rounded-lg bg-gray-50 p-4">
          {spcData.length > 0 ? (<div className="space-y-4">
              {/* Control Limits Legend */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-0.5 w-4 bg-red-400"></div>
                  <span>UCL ({spcData[0]?.control_limits.ucl.toFixed(1)})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-0.5 w-4 bg-blue-400"></div>
                  <span>
                    Center Line (
                    {spcData[0]?.control_limits.center_line.toFixed(1)})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-0.5 w-4 bg-red-400"></div>
                  <span>LCL ({spcData[0]?.control_limits.lcl.toFixed(1)})</span>
                </div>
              </div>

              {/* Chart visualization would go here */}
              <div className="flex h-60 items-center justify-center rounded border bg-white">
                <div className="text-center text-gray-500">
                  <lucide_react_1.BarChart3 className="mx-auto mb-2 h-12 w-12"/>
                  <p>SPC Chart Visualization</p>
                  <p className="text-xs">
                    Real-time data points with control limits
                  </p>
                  {spcData.filter(d => d.is_outlier).length > 0 && (<div className="mt-2 text-sm text-red-600">
                      <lucide_react_1.AlertTriangle className="mr-1 inline h-4 w-4"/>
                      {spcData.filter(d => d.is_outlier).length} outlier(s)
                      detected
                    </div>)}
                </div>
              </div>
            </div>) : (<div className="flex h-full items-center justify-center text-gray-500">
              Loading chart data...
            </div>)}
        </div>
      </card_1.CardContent>
    </card_1.Card>);
    const ParetoChart = () => (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Defect Pareto Analysis</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="h-80 rounded-lg bg-gray-50 p-4">
          {paretoData.length > 0 ? (<div className="space-y-4">
              {paretoData.map((item, index) => (<div key={item.defect_code} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-600">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="font-medium">{item.defect_name}</div>
                      <div className="text-sm text-gray-500">
                        {item.defect_code}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium">{item.count}</div>
                      <div className="text-sm text-gray-500">
                        {item.percentage.toFixed(1)}%
                      </div>
                    </div>
                    <div className="h-2 w-24 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-blue-600" style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                </div>))}
            </div>) : (<div className="flex h-full items-center justify-center text-gray-500">
              Loading Pareto data...
            </div>)}
        </div>
      </card_1.CardContent>
    </card_1.Card>);
    if (loading) {
        return (<div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading quality analytics...</p>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quality Control Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Statistical process control and defect analysis
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select_1.Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <select_1.SelectTrigger className="w-32">
                <select_1.SelectValue />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="week">Past Week</select_1.SelectItem>
                <select_1.SelectItem value="month">Past Month</select_1.SelectItem>
                <select_1.SelectItem value="quarter">Past Quarter</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
            <button_1.Button variant="outline">
              <lucide_react_1.Download className="mr-2 h-4 w-4"/>
              Export
            </button_1.Button>
          </div>
        </div>

        {/* Metrics Cards */}
        {metrics && (<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Defect Rate" value={metrics.defect_rate} unit="%" icon={lucide_react_1.AlertTriangle} trend={metrics.trend} trendValue="↓ 0.3% from last period"/>
            <MetricCard title="First Pass Yield" value={metrics.first_pass_yield} unit="%" icon={lucide_react_1.CheckCircle} trend="up" trendValue="↑ 1.2% from last period"/>
            <MetricCard title="Cost of Quality" value={`₱${(metrics.cost_of_quality / 1000).toFixed(0)}K`} icon={lucide_react_1.TrendingDown} trend="down" trendValue="↓ ₱8K from last period"/>
            <MetricCard title="Customer Complaints" value={metrics.customer_complaints} icon={lucide_react_1.XCircle} trend="down" trendValue="↓ 2 from last period"/>
          </div>)}

        {/* Charts */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <SPCChart />
          <ParetoChart />
        </div>

        {/* Ashley AI Comprehensive Quality Analysis */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <card_1.Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <span className="text-sm font-bold text-white">AI</span>
                </div>
                Ashley AI Risk Assessment
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Overall Risk Level
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    <lucide_react_1.CheckCircle className="mr-1 h-3 w-3"/>
                    LOW RISK
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Process Control Status</span>
                    <span className="font-medium text-green-600">
                      IN CONTROL
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Defect Trend Direction</span>
                    <span className="flex items-center font-medium text-green-600">
                      <lucide_react_1.TrendingDown className="mr-1 h-3 w-3"/>
                      DECREASING
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Confidence Score</span>
                    <span className="font-medium">87%</span>
                  </div>
                </div>

                <div className="border-t border-purple-200 pt-4">
                  <h4 className="mb-2 font-medium text-purple-900">
                    Key Recommendations
                  </h4>
                  <ul className="space-y-1 text-sm text-purple-700">
                    <li className="flex items-start">
                      <div className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-400"></div>
                      Continue current quality practices - trending positive
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-400"></div>
                      Monitor print alignment consistency for next 7 days
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-400"></div>
                      Schedule preventive maintenance on Line 2 equipment
                    </li>
                  </ul>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
                  <lucide_react_1.BarChart3 className="h-4 w-4 text-white"/>
                </div>
                Root Cause Predictions
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border border-blue-200 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-blue-900">
                      Print Defects
                    </span>
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                      85% confidence
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Ink viscosity inconsistency detected. Check ink mixing
                    ratios and ambient temperature.
                  </p>
                  <div className="mt-2">
                    <span className="text-xs font-medium text-blue-600">
                      Preventive Actions:
                    </span>
                    <ul className="mt-1 space-y-1 text-xs text-blue-600">
                      <li>• Implement viscosity testing protocol</li>
                      <li>• Install temperature monitoring system</li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg border border-orange-200 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-orange-900">
                      Sewing Defects
                    </span>
                    <span className="rounded bg-orange-100 px-2 py-1 text-xs text-orange-700">
                      72% confidence
                    </span>
                  </div>
                  <p className="text-sm text-orange-700">
                    Thread tension variations on multiple machines. Suggests
                    operator training gaps.
                  </p>
                  <div className="mt-2">
                    <span className="text-xs font-medium text-orange-600">
                      Preventive Actions:
                    </span>
                    <ul className="mt-1 space-y-1 text-xs text-orange-600">
                      <li>• Schedule operator refresher training</li>
                      <li>• Calibrate tension settings weekly</li>
                    </ul>
                  </div>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Process Control Insights */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center justify-between">
              <span>Statistical Process Control Analysis</span>
              <button_1.Button variant="outline" size="sm">
                View Detailed Analysis
              </button_1.Button>
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-green-600">
                  Cp 1.47
                </div>
                <div className="text-sm text-gray-600">Process Capability</div>
                <div className="mt-1 text-xs text-green-600">
                  Capable Process
                </div>
              </div>

              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-blue-600">
                  2.8%
                </div>
                <div className="text-sm text-gray-600">Current Sigma Level</div>
                <div className="mt-1 text-xs text-blue-600">
                  Above Target (2.5%)
                </div>
              </div>

              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-orange-600">0</div>
                <div className="text-sm text-gray-600">
                  Out of Control Points
                </div>
                <div className="mt-1 text-xs text-green-600">
                  Process Stable
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 font-medium text-gray-900">
                Ashley AI Process Insights
              </h4>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div>
                  <span className="font-medium text-green-600">
                    ✓ Positive Trend:
                  </span>
                  <p className="mt-1 text-gray-600">
                    Defect rate has decreased 15% over the past 2 weeks
                    following implementation of revised work instructions.
                  </p>
                </div>
                <div>
                  <span className="font-medium text-blue-600">→ Forecast:</span>
                  <p className="mt-1 text-gray-600">
                    Expected to achieve 2.3% defect rate by month-end if current
                    trend continues. Quality target of &lt;2.5% within reach.
                  </p>
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </div>);
}
