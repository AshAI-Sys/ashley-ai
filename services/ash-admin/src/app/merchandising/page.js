'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MerchandisingAI;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const button_1 = require("@/components/ui/button");
const tabs_1 = require("@/components/ui/tabs");
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
const lucide_react_1 = require("lucide-react");
function MerchandisingAI() {
    const [activeTab, setActiveTab] = (0, react_1.useState)('dashboard');
    const [metrics, setMetrics] = (0, react_1.useState)(null);
    const [demandForecasts, setDemandForecasts] = (0, react_1.useState)([]);
    const [recommendations, setRecommendations] = (0, react_1.useState)([]);
    const [marketTrends, setMarketTrends] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch AI metrics - mock data since endpoint doesn't exist yet
            setMetrics({
                total_forecasts: 156,
                avg_forecast_accuracy: 87.3,
                active_recommendations: 42,
                high_confidence_trends: 8,
                customer_segments: 12,
                inventory_optimizations: 23,
                revenue_impact: 125400,
                cost_savings: 67800
            });
            // Fetch demand forecasts
            const forecastResponse = await fetch('/api/merchandising/demand-forecast');
            if (forecastResponse.ok) {
                const forecastData = await forecastResponse.json();
                setDemandForecasts(forecastData.forecasts || []);
            }
            // Fetch recommendations
            const recommendationResponse = await fetch('/api/merchandising/recommendations');
            if (recommendationResponse.ok) {
                const recommendationData = await recommendationResponse.json();
                setRecommendations(recommendationData.recommendations || []);
            }
            // Fetch market trends
            const trendsResponse = await fetch('/api/merchandising/market-trends');
            if (trendsResponse.ok) {
                const trendsData = await trendsResponse.json();
                setMarketTrends(trendsData.trends || []);
            }
        }
        catch (error) {
            console.error('Error fetching merchandising data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const getRecommendationTypeIcon = (type) => {
        switch (type) {
            case 'cross-sell': return <lucide_react_1.ShoppingCart className="h-4 w-4"/>;
            case 'up-sell': return <lucide_react_1.TrendingUp className="h-4 w-4"/>;
            case 'reorder': return <lucide_react_1.RefreshCw className="h-4 w-4"/>;
            case 'trending': return <lucide_react_1.Star className="h-4 w-4"/>;
            default: return <lucide_react_1.Package className="h-4 w-4"/>;
        }
    };
    const getRecommendationTypeBadge = (type) => {
        const colors = {
            'cross-sell': 'bg-blue-100 text-blue-800',
            'up-sell': 'bg-green-100 text-green-800',
            'reorder': 'bg-orange-100 text-orange-800',
            'trending': 'bg-purple-100 text-purple-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };
    const getTrendIcon = (impactScore) => {
        if (impactScore >= 8)
            return <lucide_react_1.TrendingUp className="h-4 w-4 text-green-600"/>;
        if (impactScore >= 5)
            return <lucide_react_1.TrendingUp className="h-4 w-4 text-yellow-600"/>;
        return <lucide_react_1.TrendingDown className="h-4 w-4 text-red-600"/>;
    };
    if (loading) {
        return (<dashboard_layout_1.default>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </dashboard_layout_1.default>);
    }
    return (<dashboard_layout_1.default>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <lucide_react_1.Brain className="h-8 w-8 text-purple-600"/>
              Merchandising AI
            </h1>
            <p className="text-gray-600">AI-powered insights for demand forecasting, recommendations, and market intelligence</p>
          </div>
          <button_1.Button onClick={fetchData} className="flex items-center gap-2">
            <lucide_react_1.RefreshCw className="h-4 w-4"/>
            Refresh Data
          </button_1.Button>
        </div>

        {/* AI Metrics Overview */}
        {metrics && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">Forecast Accuracy</card_1.CardTitle>
                <lucide_react_1.Target className="h-4 w-4 text-green-600"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.avg_forecast_accuracy}%</div>
                <p className="text-xs text-gray-600">
                  {metrics.total_forecasts} active forecasts
                </p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">Active Recommendations</card_1.CardTitle>
                <lucide_react_1.Lightbulb className="h-4 w-4 text-orange-600"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">{metrics.active_recommendations}</div>
                <p className="text-xs text-gray-600">
                  AI-generated insights
                </p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">Revenue Impact</card_1.CardTitle>
                <lucide_react_1.TrendingUp className="h-4 w-4 text-blue-600"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ${metrics.revenue_impact.toLocaleString()}
                </div>
                <p className="text-xs text-gray-600">
                  This month
                </p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">Cost Savings</card_1.CardTitle>
                <lucide_react_1.Zap className="h-4 w-4 text-purple-600"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  ${metrics.cost_savings.toLocaleString()}
                </div>
                <p className="text-xs text-gray-600">
                  From optimizations
                </p>
              </card_1.CardContent>
            </card_1.Card>
          </div>)}

        <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <tabs_1.TabsList>
            <tabs_1.TabsTrigger value="dashboard">Dashboard</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="demand-forecast">Demand Forecasting</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="recommendations">Product Recommendations</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="trends">Market Trends</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="customer-segments">Customer Insights</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Recommendations */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.Lightbulb className="h-5 w-5 text-orange-600"/>
                    Top Recommendations
                  </card_1.CardTitle>
                  <card_1.CardDescription>Highest impact AI recommendations</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-3">
                    {recommendations.slice(0, 5).map((rec) => (<div key={rec.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getRecommendationTypeIcon(rec.type)}
                          <div>
                            <p className="font-medium text-sm">{rec.product_name}</p>
                            <p className="text-xs text-gray-600">{rec.reason}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <badge_1.Badge className={getRecommendationTypeBadge(rec.type)}>
                            {rec.type}
                          </badge_1.Badge>
                          <p className="text-xs text-gray-600 mt-1">
                            {Math.round(rec.confidence_score * 100)}% confidence
                          </p>
                        </div>
                      </div>))}
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* High-Impact Trends */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.BarChart3 className="h-5 w-5 text-blue-600"/>
                    High-Impact Market Trends
                  </card_1.CardTitle>
                  <card_1.CardDescription>Trends with significant business impact</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-3">
                    {marketTrends
            .filter(trend => trend.impact_score >= 7)
            .slice(0, 5)
            .map((trend) => (<div key={trend.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getTrendIcon(trend.impact_score)}
                            <div>
                              <p className="font-medium text-sm">{trend.category}</p>
                              <p className="text-xs text-gray-600">{trend.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <badge_1.Badge variant={trend.impact_score >= 8 ? "default" : "secondary"}>
                              Impact: {trend.impact_score}/10
                            </badge_1.Badge>
                            <p className="text-xs text-gray-600 mt-1">
                              {trend.confidence_level} confidence
                            </p>
                          </div>
                        </div>))}
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </div>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="demand-forecast" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Target className="h-5 w-5 text-green-600"/>
                  Demand Forecasts
                </card_1.CardTitle>
                <card_1.CardDescription>AI-powered demand predictions for products</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="grid gap-4">
                  {demandForecasts.map((forecast) => (<div key={forecast.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{forecast.product_name}</h4>
                        <p className="text-sm text-gray-600">
                          Period: {forecast.forecast_period}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            Seasonal Factor: {forecast.seasonal_factor}x
                          </span>
                          <span className="text-xs text-gray-500">
                            Trend Factor: {forecast.trend_factor}x
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {forecast.predicted_demand} units
                        </div>
                        <badge_1.Badge variant={forecast.confidence_score >= 0.8 ? "default" : "secondary"}>
                          {Math.round(forecast.confidence_score * 100)}% confidence
                        </badge_1.Badge>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(forecast.forecast_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="recommendations" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Lightbulb className="h-5 w-5 text-orange-600"/>
                  Product Recommendations
                </card_1.CardTitle>
                <card_1.CardDescription>AI-generated product recommendations for optimization</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="grid gap-4">
                  {recommendations.map((rec) => (<div key={rec.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getRecommendationTypeIcon(rec.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{rec.product_name}</h4>
                            <badge_1.Badge className={getRecommendationTypeBadge(rec.type)}>
                              {rec.type}
                            </badge_1.Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Recommended: {rec.recommended_product_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {rec.reason}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          Impact: {rec.impact_score}/10
                        </div>
                        <p className="text-xs text-gray-600">
                          {Math.round(rec.confidence_score * 100)}% confidence
                        </p>
                      </div>
                    </div>))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="trends" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.BarChart3 className="h-5 w-5 text-blue-600"/>
                  Market Trends Analysis
                </card_1.CardTitle>
                <card_1.CardDescription>AI-detected market trends and their business impact</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="grid gap-4">
                  {marketTrends.map((trend) => (<div key={trend.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getTrendIcon(trend.impact_score)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{trend.category}</h4>
                              <badge_1.Badge variant={trend.status === 'ACTIVE' ? "default" : "secondary"}>
                                {trend.status}
                              </badge_1.Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {trend.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500">
                                Type: {trend.trend_type}
                              </span>
                              <span className="text-xs text-gray-500">
                                Started: {new Date(trend.start_date).toLocaleDateString()}
                              </span>
                              {trend.end_date && (<span className="text-xs text-gray-500">
                                  Ends: {new Date(trend.end_date).toLocaleDateString()}
                                </span>)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            Impact: {trend.impact_score}/10
                          </div>
                          <badge_1.Badge variant={trend.confidence_level === 'HIGH' ? "default" : "secondary"}>
                            {trend.confidence_level} confidence
                          </badge_1.Badge>
                        </div>
                      </div>
                    </div>))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="customer-segments" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Users className="h-5 w-5 text-purple-600"/>
                  Customer Segments & Insights
                </card_1.CardTitle>
                <card_1.CardDescription>AI-powered customer behavior analysis and segmentation</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-center py-8">
                  <lucide_react_1.Users className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Insights Coming Soon</h3>
                  <p className="text-gray-600 mb-4">
                    AI-powered customer segmentation and behavior analysis will be available here.
                  </p>
                  <button_1.Button variant="outline">
                    <lucide_react_1.AlertTriangle className="h-4 w-4 mr-2"/>
                    Request Early Access
                  </button_1.Button>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </div>
    </dashboard_layout_1.default>);
}
