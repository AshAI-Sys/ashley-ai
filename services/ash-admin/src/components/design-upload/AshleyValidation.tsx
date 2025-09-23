'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Clock,
  TrendingUp,
  Eye,
  Palette,
  Ruler,
  DollarSign
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ValidationIssue {
  code: string
  message: string
  severity: 'CRITICAL' | 'WARNING' | 'INFO'
  placement_ref?: string
  suggestion?: string
}

interface ValidationMetrics {
  min_dpi?: number
  expected_ink_g?: number
  stitch_count?: number
  aop_area_cm2?: number
  color_count?: number
  complexity_score?: number
  estimated_cost?: number
  production_time?: number
}

interface ValidationResult {
  status: 'PASS' | 'WARN' | 'FAIL'
  issues: ValidationIssue[]
  metrics: ValidationMetrics
  confidence: number
  analysis_time: number
  recommendations?: string[]
}

interface AshleyValidationProps {
  designId?: string
  version?: number
  method: string
  files: any
  placements: any[]
  palette: string[]
  onValidationComplete?: (result: ValidationResult) => void
  className?: string
}

export default function AshleyValidation({
  designId,
  version,
  method,
  files,
  placements,
  palette,
  onValidationComplete,
  className = ''
}: AshleyValidationProps) {
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [progress, setProgress] = useState(0)

  const runValidation = async () => {
    if (!method) {
      toast.error('Please select a print method first')
      return
    }

    const hasFiles = Object.values(files).some((file: any) => file && file.length > 0)
    if (!hasFiles) {
      toast.error('Please upload at least one file first')
      return
    }

    setValidating(true)
    setProgress(0)
    setValidationResult(null)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 10
      })
    }, 200)

    try {
      const response = await fetch('/api/ashley/validate-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_id: designId,
          version: version,
          method: method,
          files: files,
          placements: placements,
          palette: palette,
          color_count: palette.length || 1
        })
      })

      const result = await response.json()
      
      clearInterval(progressInterval)
      setProgress(100)
      
      if (response.ok) {
        setValidationResult(result)
        onValidationComplete?.(result)
        
        if (result.status === 'PASS') {
          toast.success('Design validation passed! ✨')
        } else if (result.status === 'WARN') {
          toast.warning(`Validation passed with ${result.issues?.length || 0} warnings`)
        } else {
          toast.error(`Validation failed with ${result.issues?.length || 0} critical issues`)
        }
      } else {
        throw new Error(result.message || 'Validation failed')
      }
    } catch (error) {
      clearInterval(progressInterval)
      console.error('Validation failed:', error)
      toast.error('Ashley AI validation failed')
    } finally {
      setTimeout(() => {
        setValidating(false)
        setProgress(0)
      }, 500)
    }
  }

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200'
    switch (status.toUpperCase()) {
      case 'PASS': return 'bg-green-100 text-green-800 border-green-200'
      case 'WARN': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'FAIL': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    if (!status) return <Clock className="w-5 h-5 text-gray-600" />
    switch (status.toUpperCase()) {
      case 'PASS': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'WARN': return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'FAIL': return <XCircle className="w-5 h-5 text-red-600" />
      default: return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    if (!severity) return 'bg-gray-100 text-gray-800'
    switch (severity.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      case 'WARNING': return 'bg-yellow-100 text-yellow-800'
      case 'INFO': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Ashley AI Validation</h3>
          {validationResult && (
            <Badge className={getStatusColor(validationResult.status)}>
              {validationResult.status}
            </Badge>
          )}
        </div>
        
        <Button
          onClick={runValidation}
          disabled={validating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Zap className="w-4 h-4 mr-2" />
          {validating ? 'Analyzing...' : 'Run Validation'}
        </Button>
      </div>

      {/* Progress */}
      {validating && (
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="font-medium">Ashley AI is analyzing your design...</span>
                </div>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${progress > 20 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                  <span>File analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${progress > 40 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                  <span>Color validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${progress > 60 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                  <span>Placement check</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${progress > 80 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                  <span>Final analysis</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {validationResult && !validating && (
        <div className="space-y-4">
          {/* Overall Status */}
          <Card className={`border-2 ${getStatusColor(validationResult.status)}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(validationResult.status)}
                  <div>
                    <CardTitle>
                      Validation {validationResult.status === 'PASS' ? 'Passed' : 
                                  validationResult.status === 'WARN' ? 'Passed with Warnings' : 'Failed'}
                    </CardTitle>
                    <CardDescription>
                      Analysis completed in {validationResult.analysis_time?.toFixed(1) || 0}s with {(validationResult.confidence * 100).toFixed(0)}% confidence
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {validationResult.issues?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Issues Found
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Issues */}
          {validationResult.issues && validationResult.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Issues Found ({validationResult.issues.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {validationResult.issues.map((issue, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(issue.severity)} variant="outline">
                          {issue.severity}
                        </Badge>
                        {issue.placement_ref && (
                          <Badge variant="outline">{issue.placement_ref}</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{issue.code}</span>
                    </div>
                    <p className="text-sm mb-2">{issue.message}</p>
                    {issue.suggestion && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-xs text-blue-800">
                          <strong>Suggestion:</strong> {issue.suggestion}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Metrics */}
          {validationResult.metrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Analysis Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {validationResult.metrics.min_dpi && (
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <Eye className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                      <div className="text-2xl font-bold">{validationResult.metrics.min_dpi}</div>
                      <div className="text-xs text-muted-foreground">Min DPI</div>
                    </div>
                  )}
                  
                  {validationResult.metrics.color_count && (
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <Palette className="w-6 h-6 mx-auto text-purple-600 mb-1" />
                      <div className="text-2xl font-bold">{validationResult.metrics.color_count}</div>
                      <div className="text-xs text-muted-foreground">Colors</div>
                    </div>
                  )}
                  
                  {validationResult.metrics.complexity_score && (
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <Ruler className="w-6 h-6 mx-auto text-green-600 mb-1" />
                      <div className="text-2xl font-bold">{validationResult.metrics.complexity_score.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">Complexity</div>
                    </div>
                  )}
                  
                  {validationResult.metrics.estimated_cost && (
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <DollarSign className="w-6 h-6 mx-auto text-amber-600 mb-1" />
                      <div className="text-2xl font-bold">₱{validationResult.metrics.estimated_cost.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Est. Cost</div>
                    </div>
                  )}
                  
                  {validationResult.metrics.expected_ink_g && (
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold">{validationResult.metrics.expected_ink_g.toFixed(1)}g</div>
                      <div className="text-xs text-muted-foreground">Ink Usage</div>
                    </div>
                  )}
                  
                  {validationResult.metrics.stitch_count && (
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold">{validationResult.metrics.stitch_count.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Stitches</div>
                    </div>
                  )}
                  
                  {validationResult.metrics.production_time && (
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold">{validationResult.metrics.production_time.toFixed(1)}h</div>
                      <div className="text-xs text-muted-foreground">Prod. Time</div>
                    </div>
                  )}
                  
                  {validationResult.metrics.aop_area_cm2 && (
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold">{validationResult.metrics.aop_area_cm2.toFixed(0)}</div>
                      <div className="text-xs text-muted-foreground">Area cm²</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {validationResult.recommendations && validationResult.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Ashley's Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validationResult.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-blue-900">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Information Card */}
      {!validationResult && !validating && (
        <Card>
          <CardHeader>
            <CardTitle>About Ashley AI Validation</CardTitle>
            <CardDescription>
              Get instant feedback on your design's printability and optimization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">What Ashley Analyzes:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• File quality and resolution</li>
                  <li>• Color separation accuracy</li>
                  <li>• Placement feasibility</li>
                  <li>• Production cost estimation</li>
                  <li>• Print method compatibility</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Validation Results:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <span className="text-green-600">PASS</span> - Ready for production</li>
                  <li>• <span className="text-yellow-600">WARN</span> - Minor issues found</li>
                  <li>• <span className="text-red-600">FAIL</span> - Requires attention</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}