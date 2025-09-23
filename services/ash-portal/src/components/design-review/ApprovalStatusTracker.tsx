'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@ash-ai/ui/card'
import { Badge } from '@ash-ai/ui/badge'
import { Progress } from '@ash-ai/ui/progress'
import { 
  CheckCircle, 
  Clock, 
  MessageCircle, 
  AlertCircle, 
  Calendar,
  User,
  History,
  ArrowRight
} from 'lucide-react'

interface ApprovalStep {
  id: string
  title: string
  status: 'completed' | 'current' | 'pending'
  timestamp?: string
  description?: string
}

interface ApprovalStatusTrackerProps {
  currentStatus: string
  approvalDate?: string
  expiryDate?: string
  approverName?: string
  timeRemaining?: string
  steps?: ApprovalStep[]
  className?: string
}

const DEFAULT_STEPS: ApprovalStep[] = [
  {
    id: 'sent',
    title: 'Request Sent',
    status: 'completed',
    description: 'Approval request was sent to you'
  },
  {
    id: 'review',
    title: 'Under Review',
    status: 'current',
    description: 'Waiting for your feedback'
  },
  {
    id: 'decision',
    title: 'Decision Made',
    status: 'pending',
    description: 'Approval or changes requested'
  },
  {
    id: 'production',
    title: 'Ready for Production',
    status: 'pending',
    description: 'Design approved and ready'
  }
]

export function ApprovalStatusTracker({
  currentStatus,
  approvalDate,
  expiryDate,
  approverName,
  timeRemaining,
  steps = DEFAULT_STEPS,
  className = ''
}: ApprovalStatusTrackerProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SENT':
        return {
          label: 'Awaiting Your Review',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
          icon: Clock,
          progress: 25
        }
      case 'APPROVED':
        return {
          label: 'Approved - Thank You!',
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          icon: CheckCircle,
          progress: 100
        }
      case 'CHANGES_REQUESTED':
        return {
          label: 'Feedback Submitted',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 border-yellow-200',
          icon: MessageCircle,
          progress: 75
        }
      case 'EXPIRED':
        return {
          label: 'Request Expired',
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
          icon: AlertCircle,
          progress: 0
        }
      default:
        return {
          label: 'Pending Review',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
          icon: Clock,
          progress: 0
        }
    }
  }

  const config = getStatusConfig(currentStatus)
  const StatusIcon = config.icon

  const isExpiring = expiryDate && timeRemaining && !currentStatus.includes('APPROVED') && !currentStatus.includes('EXPIRED')
  const isExpired = currentStatus.toUpperCase() === 'EXPIRED'
  const isCompleted = ['APPROVED', 'CHANGES_REQUESTED'].includes(currentStatus.toUpperCase())

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Status Card */}
      <Card className={`border-2 ${config.bgColor}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center gap-2 ${config.color}`}>
              <StatusIcon className="w-5 h-5" />
              {config.label}
            </CardTitle>
            <Badge 
              variant="secondary" 
              className={`${config.color.replace('text-', 'bg-').replace('-600', '-100')} border-current`}
            >
              {currentStatus?.replace('_', ' ') || 'Unknown'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{config.progress}%</span>
            </div>
            <Progress value={config.progress} className="h-2" />
          </div>

          {/* Status Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {approvalDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Sent:</span>
                <span className="font-medium">
                  {new Date(approvalDate).toLocaleDateString()}
                </span>
              </div>
            )}
            
            {expiryDate && !isCompleted && (
              <div className={`flex items-center gap-2 ${isExpired ? 'text-red-600' : isExpiring ? 'text-yellow-600' : ''}`}>
                <Clock className="w-4 h-4" />
                <span>Expires:</span>
                <span className="font-medium">
                  {new Date(expiryDate).toLocaleDateString()}
                </span>
              </div>
            )}
            
            {approverName && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Reviewer:</span>
                <span className="font-medium">{approverName}</span>
              </div>
            )}
            
            {timeRemaining && !isCompleted && (
              <div className={`flex items-center gap-2 ${isExpiring ? 'text-yellow-600 font-medium' : ''}`}>
                <History className="w-4 h-4" />
                <span>Time remaining:</span>
                <span className="font-medium">{timeRemaining}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Process Steps */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Approval Process
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1
              const StepIcon = 
                step.status === 'completed' ? CheckCircle :
                step.status === 'current' ? Clock :
                AlertCircle

              return (
                <div key={step.id} className="relative">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2
                      ${step.status === 'completed' 
                        ? 'bg-green-100 border-green-500 text-green-600' 
                        : step.status === 'current'
                        ? 'bg-blue-100 border-blue-500 text-blue-600'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                      }
                    `}>
                      <StepIcon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-6">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${
                          step.status === 'completed' ? 'text-green-800' :
                          step.status === 'current' ? 'text-blue-800' :
                          'text-gray-500'
                        }`}>
                          {step.title}
                        </h4>
                        {step.timestamp && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(step.timestamp).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {step.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div className={`
                      absolute left-5 top-10 w-px h-6 
                      ${step.status === 'completed' ? 'bg-green-300' : 'bg-gray-300'}
                    `} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Warning */}
      {isExpiring && !isExpired && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Action Required</p>
                <p className="text-sm text-yellow-700">
                  This approval request expires in {timeRemaining}. 
                  Please review and provide your feedback as soon as possible.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expired Warning */}
      {isExpired && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Request Expired</p>
                <p className="text-sm text-red-700">
                  This approval request has expired. Please contact us if you still need to provide feedback.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {currentStatus.toUpperCase() === 'APPROVED' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Thank You!</p>
                <p className="text-sm text-green-700">
                  Your approval has been recorded. Your design will now proceed to production.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Submitted */}
      {currentStatus.toUpperCase() === 'CHANGES_REQUESTED' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Feedback Submitted</p>
                <p className="text-sm text-blue-700">
                  Thank you for your feedback! Our team will review your comments and get back to you with an updated design.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}