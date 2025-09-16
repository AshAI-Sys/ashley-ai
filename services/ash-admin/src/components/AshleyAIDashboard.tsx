import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Target,
  Clock,
  Shield,
  Wrench,
  Users,
  Lightbulb,
  Zap,
  Activity
} from 'lucide-react'

interface AIInsights {
  timestamp: string
  workspace_id: string
  insights: {
    capacity: {
      active_orders_count: number
      capacity_utilization: number
      recommendation: string
    }
    quality: {
      weekly_pass_rate: number
      trend: string
      recommendation: string
    }
    workforce: {
      type: string
      confidence: number
      recommendation: string
      data: {
        fatigue_alerts: Array<{
          employee: string
          department: string
          risk_level: string
          indicators: string[]
        }>
        department_analysis: Record<string, string>
        overall_health: string
      }
    }
    maintenance: {
      type: string
      confidence: number
      recommendation: string
      data: {
        immediate_attention: string[]
        maintenance_due: Array<{
          asset: string
          type: string
          urgency: string
          estimated_cost: number
        }>
        risk_assessment: {
          high_risk: string[]
          medium_risk: string[]
          low_risk: string[]
        }
      }
    }
  }
  summary: {
    high_priority_alerts: string[]
    recommended_actions: string[]
  }
}

interface PredictionResult {
  type: string
  confidence: number
  recommendation: string
  data: any
}

export function AshleyAIDashboard() {
  const [insights, setInsights] = useState<AIInsights | null>(null)
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInsights()
    
    // Refresh insights every 5 minutes
    const interval = setInterval(fetchInsights, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/ai/insights-dashboard')
      if (!response.ok) throw new Error('Failed to fetch AI insights')
      const result = await response.json()
      setInsights(result.data)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI insights')
      setLoading(false)
    }
  }

  const runAnalysis = async (analysisType: string) => {
    setAnalyzing(true)
    try {
      const response = await fetch(`/api/ai/analyze/${analysisType}`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Analysis failed')
      const result = await response.json()
      setPredictions(prev => [...prev.filter(p => p.type !== analysisType), result.data])
    } catch (err) {
      console.error('Analysis error:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return 'text-green-600 bg-green-50'
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getRiskColor = (risk: string): string => {
    const colors: Record<string, string> = {
      'high': 'text-red-600 bg-red-50 border-red-200',
      'medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'low': 'text-green-600 bg-green-50 border-green-200',
      'critical': 'text-red-800 bg-red-100 border-red-300'
    }
    return colors[risk] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  if (loading) return <div className="flex items-center justify-center h-64">Loading Ashley AI insights...</div>
  if (error) return <div className="text-red-600">Error: {error}</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Ashley AI Insights</h1>
            <p className="text-gray-600">AI-powered analytics and predictions for your production</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Activity className="w-4 h-4" />
          <span>Last updated: {insights?.timestamp ? new Date(insights.timestamp).toLocaleTimeString() : 'Never'}</span>
        </div>
      </div>

      {/* High Priority Alerts */}
      {insights?.summary.high_priority_alerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong>Critical Alerts:</strong>{' '}
            {insights.summary.high_priority_alerts.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Analysis Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span>Quick AI Analysis</span>
          </CardTitle>
          <CardDescription>Run instant AI analysis on different aspects of your production</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={() => runAnalysis('capacity')} 
              disabled={analyzing}
              className="flex items-center space-x-2"
            >
              <Target className="w-4 h-4" />
              <span>Capacity Analysis</span>
            </Button>
            <Button 
              onClick={() => runAnalysis('quality')} 
              disabled={analyzing}
              className="flex items-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span>Quality Prediction</span>
            </Button>
            <Button 
              onClick={() => runAnalysis('fatigue')} 
              disabled={analyzing}
              className="flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Workforce Health</span>
            </Button>
            <Button 
              onClick={() => runAnalysis('maintenance')} 
              disabled={analyzing}
              className="flex items-center space-x-2"
            >
              <Wrench className="w-4 h-4" />
              <span>Equipment Check</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="capacity">Capacity Intelligence</TabsTrigger>
          <TabsTrigger value="quality">Quality Intelligence</TabsTrigger>
          <TabsTrigger value="workforce">Workforce Analytics</TabsTrigger>
          <TabsTrigger value="maintenance">Equipment Intelligence</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Capacity Overview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Capacity Utilization</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {insights?.insights.capacity.capacity_utilization.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {insights?.insights.capacity.active_orders_count} active orders
                </p>
                <Progress value={insights?.insights.capacity.capacity_utilization || 0} className="mt-2" />
              </CardContent>
            </Card>

            {/* Quality Overview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quality Rate</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {insights?.insights.quality.weekly_pass_rate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Trend: {insights?.insights.quality.trend}
                </p>
                <div className="flex items-center mt-2">
                  {insights?.insights.quality.trend === 'excellent' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Workforce Health */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Workforce Health</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {insights?.insights.workforce.data.overall_health}
                </div>
                <p className="text-xs text-muted-foreground">
                  {insights?.insights.workforce.data.fatigue_alerts.length || 0} alerts
                </p>
                <Badge 
                  className={`mt-2 ${getRiskColor(insights?.insights.workforce.data.overall_health || 'good')}`}
                >
                  {insights?.insights.workforce.confidence}% confidence
                </Badge>
              </CardContent>
            </Card>

            {/* Equipment Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equipment Status</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {insights?.insights.maintenance.data.immediate_attention.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Need immediate attention
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  {insights?.insights.maintenance.data.maintenance_due.length || 0} maintenance due
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span>AI Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights?.summary.recommended_actions.map((action, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Capacity Intelligence</CardTitle>
              <CardDescription>AI analysis of production capacity and scheduling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Current Assessment</span>
                </div>
                <p className="text-sm text-gray-700">{insights?.insights.capacity.recommendation}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Utilization Metrics</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Current Capacity:</span>
                      <span>{insights?.insights.capacity.capacity_utilization.toFixed(1)}%</span>
                    </div>
                    <Progress value={insights?.insights.capacity.capacity_utilization || 0} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Order Load</h4>
                  <div className="text-2xl font-bold">{insights?.insights.capacity.active_orders_count}</div>
                  <div className="text-sm text-gray-600">Active orders in production</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Intelligence</CardTitle>
              <CardDescription>AI-powered quality analysis and predictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-lg ${getRiskColor(insights?.insights.quality.trend || 'good')}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Quality Assessment</span>
                </div>
                <p className="text-sm">{insights?.insights.quality.recommendation}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Weekly Performance</h4>
                  <div className="text-2xl font-bold">{insights?.insights.quality.weekly_pass_rate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Pass rate this week</div>
                  <Progress value={insights?.insights.quality.weekly_pass_rate || 0} />
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Trend Analysis</h4>
                  <div className="flex items-center space-x-2">
                    {insights?.insights.quality.trend === 'excellent' ? (
                      <>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <span className="text-green-600 font-medium">Excellent</span>
                      </>
                    ) : insights?.insights.quality.trend === 'good' ? (
                      <>
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        <span className="text-blue-600 font-medium">Good</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-5 h-5 text-red-500" />
                        <span className="text-red-600 font-medium">Needs Attention</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workforce" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workforce Analytics</CardTitle>
              <CardDescription>AI analysis of employee performance and wellbeing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-lg ${getRiskColor(insights?.insights.workforce.data.overall_health || 'good')}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Overall Health: {insights?.insights.workforce.data.overall_health}</span>
                  </div>
                  <Badge className={getConfidenceColor(insights?.insights.workforce.confidence || 0)}>
                    {insights?.insights.workforce.confidence}% confidence
                  </Badge>
                </div>
                <p className="text-sm mt-2">{insights?.insights.workforce.recommendation}</p>
              </div>
              
              {insights?.insights.workforce.data.fatigue_alerts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Fatigue Alerts</h4>
                  <div className="space-y-2">
                    {insights.insights.workforce.data.fatigue_alerts.map((alert, index) => (
                      <div key={index} className={`p-3 rounded-lg ${getRiskColor(alert.risk_level)}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">{alert.employee}</span>
                            <span className="text-sm text-gray-600 ml-2">({alert.department})</span>
                          </div>
                          <Badge variant="outline">{alert.risk_level} risk</Badge>
                        </div>
                        <div className="text-sm mt-1">
                          Indicators: {alert.indicators.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(insights?.insights.workforce.data.department_analysis || {}).map(([dept, status]) => (
                  <div key={dept} className="p-3 border rounded-lg">
                    <div className="font-medium capitalize">{dept}</div>
                    <div className={`text-sm ${status === 'good' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {status}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Intelligence</CardTitle>
              <CardDescription>AI-powered maintenance predictions and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Wrench className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">Maintenance Intelligence</span>
                  <Badge className={getConfidenceColor(insights?.insights.maintenance.confidence || 0)}>
                    {insights?.insights.maintenance.confidence}% confidence
                  </Badge>
                </div>
                <p className="text-sm text-gray-700">{insights?.insights.maintenance.recommendation}</p>
              </div>
              
              {insights?.insights.maintenance.data.immediate_attention.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <strong>Immediate Attention Required:</strong>{' '}
                    {insights.insights.maintenance.data.immediate_attention.join(', ')}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Risk Assessment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-medium text-red-700">High Risk</div>
                      <div className="text-sm text-red-600">
                        {insights?.insights.maintenance.data.risk_assessment.high_risk.length || 0} assets
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="font-medium text-yellow-700">Medium Risk</div>
                      <div className="text-sm text-yellow-600">
                        {insights?.insights.maintenance.data.risk_assessment.medium_risk.length || 0} assets
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="font-medium text-green-700">Low Risk</div>
                      <div className="text-sm text-green-600">
                        {insights?.insights.maintenance.data.risk_assessment.low_risk.length || 0} assets
                      </div>
                    </div>
                  </div>
                </div>
                
                {insights?.insights.maintenance.data.maintenance_due.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Scheduled Maintenance</h4>
                    <div className="space-y-2">
                      {insights.insights.maintenance.data.maintenance_due.map((maintenance, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">{maintenance.asset}</span>
                            <span className="text-sm text-gray-600 ml-2">({maintenance.type})</span>
                          </div>
                          <div className="text-right">
                            <Badge className={getRiskColor(maintenance.urgency)}>
                              {maintenance.urgency}
                            </Badge>
                            <div className="text-sm text-gray-600">
                              Est. ₱{maintenance.estimated_cost.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}