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
      })

      // Set up auth headers for API calls
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-jwt-token-12345'
      }

      // Required workspace parameter for API calls
      const workspaceId = 'demo-workspace-1'

      // Fetch demand forecasts
      const forecastResponse = await fetch(`/api/merchandising/demand-forecast?workspaceId=${workspaceId}`, { headers })
      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json()
        setDemandForecasts(forecastData.forecasts || [])
      }

      // Fetch recommendations
      const recommendationResponse = await fetch(`/api/merchandising/recommendations?workspaceId=${workspaceId}`, { headers })
      if (recommendationResponse.ok) {
        const recommendationData = await recommendationResponse.json()
        setRecommendations(recommendationData.recommendations || [])
      }

      // Fetch market trends
      const trendsResponse = await fetch(`/api/merchandising/market-trends?workspaceId=${workspaceId}`, { headers })
      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json()
        setMarketTrends(trendsData.trends || [])
      }

    } catch (error) {
      console.error('Error fetching merchandising data:', error)
      setDemandForecasts([])
      setRecommendations([])
      setMarketTrends([])
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Customer Segments & Insights
                </CardTitle>
                <CardDescription>AI-powered customer behavior analysis and segmentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Insights Coming Soon</h3>
                  <p className="text-gray-600 mb-4">
                    AI-powered customer segmentation and behavior analysis will be available here.
                  </p>
                  <Button variant="outline">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Request Early Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}