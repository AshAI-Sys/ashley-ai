/**
 * Performance Dashboard
 * Real-time system performance monitoring
 */

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, TrendingDown, Activity, Database, Zap } from 'lucide-react'

interface PerformanceMetrics {
  queries: {
    total: number
    cacheHits: number
    cacheMisses: number
    cacheHitRate: number
    avgDuration: number
    avgCachedDuration: number
    avgUncachedDuration: number
    speedup: number
  }
  redis: {
    available: boolean
    cacheHitRate: number
    stats: any
  }
  health: {
    status: string
    message: string
  }
  grades: {
    queryCacheEfficiency: string
    querySpeed: string
    redisCacheEfficiency: string
  }
  recommendations: string[]
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/performance/metrics')
      const data = await response.json()
      if (data.success) {
        setMetrics(data.data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading performance metrics...</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          Failed to load performance metrics
        </div>
      </div>
    )
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-500'
    if (grade === 'B') return 'bg-blue-500'
    if (grade === 'C') return 'bg-yellow-500'
    if (grade === 'D') return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getHealthColor = (status: string) => {
    if (status === 'healthy') return 'bg-green-500'
    if (status === 'degraded') return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time system performance monitoring and optimization
          </p>
        </div>
        <Button onClick={fetchMetrics} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getHealthColor(metrics.health.status)}`} />
            <span className="font-semibold capitalize">{metrics.health.status}</span>
            <span className="text-muted-foreground">-</span>
            <span className="text-sm">{metrics.health.message}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>

      {/* Performance Grades */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Query Cache Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{metrics.queries.cacheHitRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">Cache Hit Rate</p>
              </div>
              <Badge className={`${getGradeColor(metrics.grades.queryCacheEfficiency)} text-white text-2xl px-4 py-2`}>
                {metrics.grades.queryCacheEfficiency}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Query Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{metrics.queries.avgDuration}ms</div>
                <p className="text-xs text-muted-foreground mt-1">Avg Duration</p>
              </div>
              <Badge className={`${getGradeColor(metrics.grades.querySpeed)} text-white text-2xl px-4 py-2`}>
                {metrics.grades.querySpeed}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Redis Cache</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {metrics.redis.available ? `${metrics.redis.cacheHitRate}%` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.redis.available ? 'Redis Hit Rate' : 'Unavailable'}
                </p>
              </div>
              <Badge className={`${getGradeColor(metrics.grades.redisCacheEfficiency)} text-white text-2xl px-4 py-2`}>
                {metrics.grades.redisCacheEfficiency}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Query Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Query Performance
          </CardTitle>
          <CardDescription>
            Performance metrics for database queries with caching
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Queries</p>
              <p className="text-2xl font-bold">{metrics.queries.total}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Cache Hits
              </p>
              <p className="text-2xl font-bold text-green-600">{metrics.queries.cacheHits}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingDown className="w-4 h-4 text-red-500" />
                Cache Misses
              </p>
              <p className="text-2xl font-bold text-red-600">{metrics.queries.cacheMisses}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Zap className="w-4 h-4 text-blue-500" />
                Speedup
              </p>
              <p className="text-2xl font-bold text-blue-600">{metrics.queries.speedup}x</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Avg Duration (All)</p>
                <p className="font-semibold">{metrics.queries.avgDuration}ms</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Duration (Cached)</p>
                <p className="font-semibold text-green-600">{metrics.queries.avgCachedDuration}ms</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Duration (Uncached)</p>
                <p className="font-semibold text-orange-600">{metrics.queries.avgUncachedDuration}ms</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Redis Stats */}
      {metrics.redis.available && metrics.redis.stats && (
        <Card>
          <CardHeader>
            <CardTitle>Redis Cache Statistics</CardTitle>
            <CardDescription>Detailed Redis server metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Connected Clients</p>
                <p className="font-semibold">{metrics.redis.stats.connected_clients}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Memory Used</p>
                <p className="font-semibold">{metrics.redis.stats.used_memory_human}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ops/sec</p>
                <p className="font-semibold">{metrics.redis.stats.instantaneous_ops_per_sec}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Uptime</p>
                <p className="font-semibold">{metrics.redis.stats.uptime_in_days} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Recommendations</CardTitle>
          <CardDescription>
            Actionable insights to improve system performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {metrics.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="text-sm">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
