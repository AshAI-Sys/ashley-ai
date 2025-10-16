'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  Save, 
  Send, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  FileText,
  DollarSign,
  Loader2,
  ShieldCheck,
  TrendingUp
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ValidationIssue {
  field: string
  severity: 'error' | 'warning' | 'info'
  message: string
  suggestion?: string
}

interface AshleyValidation {
  overall: {
    score: number
    feasible: boolean
    confidence: number
    readinessLevel: 'ready' | 'needs_review' | 'incomplete'
  }
  sections: {
    [key: string]: {
      valid: boolean
      score: number
      issues: ValidationIssue[]
    }
  }
  recommendations: string[]
  businessInsights: {
    profitability: number
    riskLevel: 'low' | 'medium' | 'high'
    marketPosition: string
  }
}

interface SubmitSectionProps {
  formData: any
  onSubmit: (action: 'draft' | 'submit') => void
  isSubmitting: boolean
}

const VALIDATION_SECTIONS = [
  { id: 'client', name: 'Client & Brand', icon: FileText },
  { id: 'product', name: 'Product & Design', icon: FileText },
  { id: 'quantities', name: 'Quantities & Sizes', icon: TrendingUp },
  { id: 'variants', name: 'Variants & Add-ons', icon: FileText },
  { id: 'dates', name: 'Dates & SLAs', icon: Clock },
  { id: 'commercials', name: 'Commercials', icon: DollarSign },
  { id: 'production', name: 'Production Route', icon: TrendingUp },
  { id: 'files', name: 'Files & Notes', icon: FileText }
]

export function SubmitSection({
  formData,
  onSubmit,
  isSubmitting
}: SubmitSectionProps) {
  const [validating, setValidating] = useState(false)
  const [validationProgress, setValidationProgress] = useState(0)
  const [ashleyValidation, setAshleyValidation] = useState<AshleyValidation | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const runAshleyValidation = async () => {
    setValidating(true)
    setValidationProgress(0)
    
    try {
      // Simulate comprehensive Ashley AI validation
      const steps = VALIDATION_SECTIONS.length
      
      for (let i = 0; i < steps; i++) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setValidationProgress(((i + 1) / steps) * 100)
      }
      
      // Generate mock validation results
      const mockValidation: AshleyValidation = {
        overall: {
          score: Math.floor(Math.random() * 30) + 70, // 70-100
          feasible: Math.random() > 0.1, // 90% chance feasible
          confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
          readinessLevel: Math.random() > 0.3 ? 'ready' : 'needs_review'
        },
        sections: {},
        recommendations: [
          'Order specifications are well-defined and production-ready',
          'Timeline is achievable with current production capacity',
          'Pricing is competitive and maintains healthy margins',
          'Consider bulk discount opportunities for future orders'
        ].slice(0, Math.floor(Math.random() * 3) + 2),
        businessInsights: {
          profitability: Math.floor(Math.random() * 30) + 40, // 40-70%
          riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
          marketPosition: 'Competitive pricing with standard quality expectations'
        }
      }
      
      // Generate section validations
      VALIDATION_SECTIONS.forEach(section => {
        const hasIssues = Math.random() > 0.7 // 30% chance of issues
        const issues: ValidationIssue[] = []
        
        if (hasIssues) {
          issues.push({
            field: section.name,
            severity: Math.random() > 0.5 ? 'warning' : 'info',
            message: `Minor optimization opportunity in ${section.name.toLowerCase()}`,
            suggestion: 'Consider reviewing for potential improvements'
          })
        }
        
        mockValidation.sections[section.id] = {
          valid: !hasIssues || issues.every(i => i.severity !== 'error'),
          score: Math.floor(Math.random() * 20) + 80, // 80-100
          issues
        }
      })
      
      setAshleyValidation(mockValidation)
      
      if (mockValidation.overall.feasible) {
        toast.success('Ashley AI validation completed successfully')
      } else {
        toast.error('Ashley AI found critical issues that need attention')
      }
      
    } catch (error) {
      console.error('Validation error:', error)
      toast.error('Ashley AI validation failed')
    } finally {
      setValidating(false)
    }
  }

  const getOverallValidationColor = () => {
    if (!ashleyValidation) return 'gray'
    
    if (ashleyValidation.overall.readinessLevel === 'ready') return 'green'
    if (ashleyValidation.overall.readinessLevel === 'needs_review') return 'amber'
    return 'red'
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-300 bg-gray-50 border-gray-200'
    }
  }

  const canSubmitOrder = () => {
    return ashleyValidation?.overall.feasible && 
           ashleyValidation?.overall.readinessLevel !== 'incomplete'
  }

  useEffect(() => {
    // Auto-run validation when component mounts if form has data
    if (formData && Object.keys(formData).length > 0) {
      runAshleyValidation()
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          I. Submit Order
          <Badge variant="secondary">Final Step</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ashley AI Validation */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-900">Ashley AI Final Validation</h3>
            </div>
            <Button
              variant="outline"
              onClick={runAshleyValidation}
              disabled={validating}
              size="sm"
            >
              {validating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  {ashleyValidation ? 'Re-validate' : 'Validate Order'}
                </>
              )}
            </Button>
          </div>

          {validating && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Running comprehensive validation...</span>
                <span>{Math.round(validationProgress)}%</span>
              </div>
              <Progress value={validationProgress} className="h-2" />
              <div className="text-sm text-purple-600">
                Ashley AI is analyzing all aspects of your order for feasibility, timeline, and optimization opportunities.
              </div>
            </div>
          )}

          {ashleyValidation && (
            <div className="space-y-4">
              {/* Overall Score */}
              <div className={`border rounded-lg p-4 ${
                getOverallValidationColor() === 'green' ? 'bg-green-50 border-green-200' :
                getOverallValidationColor() === 'amber' ? 'bg-amber-50 border-amber-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {ashleyValidation.overall.feasible ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-semibold">
                      Overall Assessment: {ashleyValidation.overall.readinessLevel.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(ashleyValidation.overall.score)}`}>
                      {ashleyValidation.overall.score}/100
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ashleyValidation.overall.confidence}% confidence
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Feasibility:</span>
                    <div className={ashleyValidation.overall.feasible ? 'text-green-700' : 'text-red-700'}>
                      {ashleyValidation.overall.feasible ? 'Production Ready' : 'Needs Revision'}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Profitability:</span>
                    <div className={getScoreColor(ashleyValidation.businessInsights.profitability)}>
                      {ashleyValidation.businessInsights.profitability}% margin
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Risk Level:</span>
                    <div className={`inline-block px-2 py-1 rounded text-xs ${getRiskColor(ashleyValidation.businessInsights.riskLevel)}`}>
                      {ashleyValidation.businessInsights.riskLevel.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Section Validation Breakdown</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? 'Hide' : 'Show'} Details
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {VALIDATION_SECTIONS.map(section => {
                    const sectionData = ashleyValidation.sections[section.id]
                    const IconComponent = section.icon
                    
                    return (
                      <div
                        key={section.id}
                        className={`border rounded-lg p-3 text-center ${
                          sectionData?.valid ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 mx-auto mb-1" />
                        <div className="text-xs font-medium">{section.name}</div>
                        <div className={`text-sm ${getScoreColor(sectionData?.score || 0)}`}>
                          {sectionData?.score || 0}/100
                        </div>
                      </div>
                    )
                  })}
                </div>

                {showDetails && (
                  <div className="space-y-3">
                    {VALIDATION_SECTIONS.map(section => {
                      const sectionData = ashleyValidation.sections[section.id]
                      if (!sectionData?.issues.length) return null
                      
                      return (
                        <div key={section.id} className="border rounded p-3">
                          <h5 className="font-medium mb-2">{section.name}</h5>
                          <div className="space-y-1">
                            {sectionData.issues.map((issue, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm">
                                {issue.severity === 'error' ? (
                                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                                ) : issue.severity === 'warning' ? (
                                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                                )}
                                <div>
                                  <div className={
                                    issue.severity === 'error' ? 'text-red-700' :
                                    issue.severity === 'warning' ? 'text-amber-700' :
                                    'text-blue-700'
                                  }>
                                    {issue.message}
                                  </div>
                                  {issue.suggestion && (
                                    <div className="text-muted-foreground text-xs mt-1">
                                      Suggestion: {issue.suggestion}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {ashleyValidation.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">Ashley AI Recommendations</h4>
                  <ul className="space-y-2">
                    {ashleyValidation.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Business Insights */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Business Insights</h4>
                <div className="text-sm text-white">
                  <p><strong>Market Position:</strong> {ashleyValidation.businessInsights.marketPosition}</p>
                  <p className="mt-1">
                    <strong>Profitability:</strong> {ashleyValidation.businessInsights.profitability}% estimated margin with {ashleyValidation.businessInsights.riskLevel} risk level
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => onSubmit('draft')}
            disabled={isSubmitting}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            Save as Draft
          </Button>
          
          <Button
            onClick={() => onSubmit('submit')}
            disabled={isSubmitting || !canSubmitOrder()}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit for Production
              </>
            )}
          </Button>
        </div>

        {/* Submission Guidelines */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
          <h4 className="font-medium text-yellow-900 mb-2">Before Submitting:</h4>
          <ul className="space-y-1 text-yellow-800">
            <li>• Ensure all required fields are completed accurately</li>
            <li>• Verify client details and delivery requirements</li>
            <li>• Confirm pricing and payment terms are acceptable</li>
            <li>• Check that design files are high-quality and production-ready</li>
            <li>• Review Ashley AI recommendations for optimization opportunities</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}