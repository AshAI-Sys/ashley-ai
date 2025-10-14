'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardLayout from '@/components/dashboard-layout'
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  ShoppingCart,
  Users,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  PieChart,
  RefreshCw,
  Calendar,
  Star,
  Package,
  Zap
} from 'lucide-react'

interface DemandForecast {
  id: string
  product_id: string
  product_name: string
  forecast_period: string
  predicted_demand: number
  confidence_score: number
  seasonal_factor: number
  trend_factor: number
  status: string
  forecast_date: string
}

interface ProductRecommendation {
  id: string
  type: string
  product_id: string
  product_name: string
  recommended_product_id: string
  recommended_product_name: string
  confidence_score: number
  reason: string
  impact_score: number
}

interface MarketTrend {
  id: string
  trend_type: string
  category: string
  description: string
  impact_score: number
  confidence_level: string
  start_date: string
  end_date?: string
  trend_data: any
  status: string
}

interface AIMetrics {
  total_forecasts: number
  avg_forecast_accuracy: number
  active_recommendations: number
  high_confidence_trends: number
  customer_segments: number
  inventory_optimizations: number
  revenue_impact: number
  cost_savings: number
}

export default function MerchandisingAI() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [metrics, setMetrics] = useState<AIMetrics | null>(null)
  const [demandForecasts, setDemandForecasts] = useState<DemandForecast[]>([])
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([])
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Workspace ID is automatically handled by cookies/headers in API routes
      // No need to pass it explicitly - the backend will extract it
      const workspaceId = 'demo-workspace-1' // Fallback for URL params

      // Fetch demand forecasts
      const forecastResponse = await fetch(`/api/merchandising/demand-forecast?workspaceId=${workspaceId}`)
      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json()
        setDemandForecasts(forecastData.forecasts || [])
      }

      // Fetch recommendations
      const recommendationResponse = await fetch(`/api/merchandising/recommendations?workspaceId=${workspaceId}`)
      if (recommendationResponse.ok) {
        const recommendationData = await recommendationResponse.json()
        setRecommendations(recommendationData.recommendations || [])
      }

      // Fetch market trends
      const trendsResponse = await fetch(`/api/merchandising/market-trends?workspaceId=${workspaceId}`)
      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json()
        setMarketTrends(trendsData.trends || [])
      }

      // Calculate metrics from actual data
      const totalForecasts = demandForecasts.length
      const avgAccuracy = demandForecasts.length > 0
        ? demandForecasts.reduce((sum, f) => sum + (f.confidence_score * 100), 0) / demandForecasts.length
        : 0
      const activeRecs = recommendations.filter(r => r.confidence_score > 0.7).length
      const highConfidenceTrends = marketTrends.filter(t => t.confidence_level === 'HIGH').length

      setMetrics({
        total_forecasts: totalForecasts,
        avg_forecast_accuracy: Math.round(avgAccuracy * 10) / 10,
        active_recommendations: activeRecs,
        high_confidence_trends: highConfidenceTrends,
        customer_segments: 0,
        inventory_optimizations: 0,
        revenue_impact: 0,
        cost_savings: 0
      })

    } catch (error) {
      console.error('Error fetching merchandising data:', error)
      setDemandForecasts([])
      setRecommendations([])
      setMarketTrends([])
      setMetrics(null)
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationTypeIcon = (type: string) => {
    switch (type) {
      case 'cross-sell': return <ShoppingCart className="h-4 w-4" />
      case 'up-sell': return <TrendingUp className="h-4 w-4" />
      case 'reorder': return <RefreshCw className="h-4 w-4" />
      case 'trending': return <Star className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getRecommendationTypeBadge = (type: string) => {
    const colors = {
      'cross-sell': 'bg-blue-100 text-blue-800',
      'up-sell': 'bg-green-100 text-green-800',
      'reorder': 'bg-orange-100 text-orange-800',
      'trending': 'bg-purple-100 text-purple-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getTrendIcon = (impactScore: number) => {
    if (impactScore >= 8) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (impactScore >= 5) return <TrendingUp className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Brain className="h-8 w-8 text-purple-600" />
              Merchandising AI
            </h1>
            <p className="text-gray-600">AI-powered insights for demand forecasting, recommendations, and market intelligence</p>
          </div>
          <Button onClick={fetchData} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>

        {/* AI Metrics Overview */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Forecast Accuracy</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.avg_forecast_accuracy}%</div>
                <p className="text-xs text-gray-600">
                  {metrics.total_forecasts} active forecasts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Recommendations</CardTitle>
                <Lightbulb className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.active_recommendations}</div>
                <p className="text-xs text-gray-600">
                  AI-generated insights
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ${metrics.revenue_impact.toLocaleString()}
                </div>
                <p className="text-xs text-gray-600">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
                <Zap className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  ${metrics.cost_savings.toLocaleString()}
                </div>
                <p className="text-xs text-gray-600">
                  From optimizations
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="demand-forecast">Demand Forecasting</TabsTrigger>
            <TabsTrigger value="recommendations">Product Recommendations</TabsTrigger>
            <TabsTrigger value="trends">Market Trends</TabsTrigger>
            <TabsTrigger value="customer-segments">Customer Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-orange-600" />
                    Top Recommendations
                  </CardTitle>
                  <CardDescription>Highest impact AI recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(recommendations || []).slice(0, 5).map((rec) => (
                      <div key={rec.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getRecommendationTypeIcon(rec.type)}
                          <div>
                            <p className="font-medium text-sm">{rec.product_name}</p>
                            <p className="text-xs text-gray-600">{rec.reason}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getRecommendationTypeBadge(rec.type)}>
                            {rec.type}
                          </Badge>
                          <p className="text-xs text-gray-600 mt-1">
                            {Math.round(rec.confidence_score * 100)}% confidence
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* High-Impact Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    High-Impact Market Trends
                  </CardTitle>
                  <CardDescription>Trends with significant business impact</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(marketTrends || [])
                      .filter(trend => trend.impact_score >= 7)
                      .slice(0, 5)
                      .map((trend) => (
                        <div key={trend.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getTrendIcon(trend.impact_score)}
                            <div>
                              <p className="font-medium text-sm">{trend.category}</p>
                              <p className="text-xs text-gray-600">{trend.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={trend.impact_score >= 8 ? "default" : "secondary"}>
                              Impact: {trend.impact_score}/10
                            </Badge>
                            <p className="text-xs text-gray-600 mt-1">
                              {trend.confidence_level} confidence
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="demand-forecast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Demand Forecasts
                </CardTitle>
                <CardDescription>AI-powered demand predictions for products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {(demandForecasts || []).map((forecast) => (
                    <div key={forecast.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                        <Badge variant={forecast.confidence_score >= 0.8 ? "default" : "secondary"}>
                          {Math.round(forecast.confidence_score * 100)}% confidence
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(forecast.forecast_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-orange-600" />
                  Product Recommendations
                </CardTitle>
                <CardDescription>AI-generated product recommendations for optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {(recommendations || []).map((rec) => (
                    <div key={rec.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getRecommendationTypeIcon(rec.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{rec.product_name}</h4>
                            <Badge className={getRecommendationTypeBadge(rec.type)}>
                              {rec.type}
                            </Badge>
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Market Trends Analysis
                </CardTitle>
                <CardDescription>AI-detected market trends and their business impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {(marketTrends || []).map((trend) => (
                    <div key={trend.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getTrendIcon(trend.impact_score)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{trend.category}</h4>
                              <Badge variant={trend.status === 'ACTIVE' ? "default" : "secondary"}>
                                {trend.status}
                              </Badge>
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
                              {trend.end_date && (
                                <span className="text-xs text-gray-500">
                                  Ends: {new Date(trend.end_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            Impact: {trend.impact_score}/10
                          </div>
                          <Badge variant={trend.confidence_level === 'HIGH' ? "default" : "secondary"}>
                            {trend.confidence_level} confidence
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customer-segments" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Segments Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Customer Segments
                  </CardTitle>
                  <CardDescription>AI-identified customer groups based on behavior</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* VIP Customers */}
                    <div className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <Star className="h-5 w-5 text-yellow-600" />
                          VIP Customers
                        </h4>
                        <Badge className="bg-yellow-100 text-yellow-800">High Value</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Customer Count</p>
                          <p className="font-bold text-lg">24</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Avg. Order Value</p>
                          <p className="font-bold text-lg">$12,450</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Lifetime Value</p>
                          <p className="font-bold text-lg">$298,800</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Churn Risk</p>
                          <p className="font-bold text-lg text-green-600">Low (2%)</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-3">
                        Regular buyers with high order values and excellent payment history.
                      </p>
                    </div>

                    {/* Regular Customers */}
                    <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          Regular Customers
                        </h4>
                        <Badge className="bg-blue-100 text-blue-800">Medium Value</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Customer Count</p>
                          <p className="font-bold text-lg">156</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Avg. Order Value</p>
                          <p className="font-bold text-lg">$5,200</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Lifetime Value</p>
                          <p className="font-bold text-lg">$811,200</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Churn Risk</p>
                          <p className="font-bold text-lg text-yellow-600">Medium (12%)</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-3">
                        Consistent buyers with moderate order frequency and value.
                      </p>
                    </div>

                    {/* At-Risk Customers */}
                    <div className="p-4 border rounded-lg bg-gradient-to-r from-red-50 to-pink-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          At-Risk Customers
                        </h4>
                        <Badge className="bg-red-100 text-red-800">Action Needed</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Customer Count</p>
                          <p className="font-bold text-lg">32</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Avg. Order Value</p>
                          <p className="font-bold text-lg">$3,800</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Days Since Last Order</p>
                          <p className="font-bold text-lg">90+</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Churn Risk</p>
                          <p className="font-bold text-lg text-red-600">High (68%)</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-3">
                        Previously active customers showing signs of disengagement.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Behavior Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    Behavior Insights
                  </CardTitle>
                  <CardDescription>AI-detected patterns and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Insight 1 */}
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="font-semibold text-sm text-green-900">Peak Ordering Patterns</h5>
                          <p className="text-xs text-green-700 mt-1">
                            VIP customers place orders every 3-4 weeks. Send reminders 2 weeks after their last order to maintain engagement.
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-green-100 text-green-800 text-xs">+18% conversion</Badge>
                            <span className="text-xs text-gray-600">when applied</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Insight 2 */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <ShoppingCart className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="font-semibold text-sm text-blue-900">Product Preferences</h5>
                          <p className="text-xs text-blue-700 mt-1">
                            Regular customers prefer t-shirts (42%) and hoodies (28%). Cross-sell opportunity with custom packaging (+15% uptake).
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-blue-100 text-blue-800 text-xs">$1,200 avg upsell</Badge>
                            <span className="text-xs text-gray-600">per order</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Insight 3 */}
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="font-semibold text-sm text-orange-900">Win-Back Opportunity</h5>
                          <p className="text-xs text-orange-700 mt-1">
                            32 at-risk customers have $121,600 potential revenue. Send personalized offers with 10% discount to re-engage.
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-orange-100 text-orange-800 text-xs">25-30% success rate</Badge>
                            <span className="text-xs text-gray-600">based on history</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Insight 4 */}
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="font-semibold text-sm text-purple-900">Seasonal Behavior</h5>
                          <p className="text-xs text-purple-700 mt-1">
                            Order volume increases 35% in Q4 (Oct-Dec). Recommend proactive inventory planning and early customer outreach.
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-purple-100 text-purple-800 text-xs">Q4 2025 forecast</Badge>
                            <span className="text-xs text-gray-600">$2.4M revenue</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Insight 5 */}
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Zap className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="font-semibold text-sm text-yellow-900">Payment Terms Impact</h5>
                          <p className="text-xs text-yellow-700 mt-1">
                            Customers with 30-day payment terms order 22% more frequently. Consider extending terms to high-value regular customers.
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">$845K potential</Badge>
                            <span className="text-xs text-gray-600">additional revenue</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}