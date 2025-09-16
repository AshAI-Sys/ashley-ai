'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  CheckCircle, 
  MessageCircle, 
  AlertCircle, 
  XCircle 
} from 'lucide-react'

interface ApprovalStatusProps {
  status: string
  size?: 'sm' | 'default' | 'lg'
  showIcon?: boolean
}

export function ApprovalStatus({ status, size = 'default', showIcon = true }: ApprovalStatusProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SENT':
        return {
          label: 'Awaiting Approval',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock
        }
      case 'APPROVED':
        return {
          label: 'Approved',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        }
      case 'CHANGES_REQUESTED':
        return {
          label: 'Changes Requested',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: MessageCircle
        }
      case 'EXPIRED':
        return {
          label: 'Expired',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertCircle
        }
      case 'REJECTED':
        return {
          label: 'Rejected',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle
        }
      default:
        return {
          label: status.replace('_', ' '),
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <Badge 
      variant="outline" 
      className={`${config.color} ${
        size === 'sm' ? 'text-xs px-2 py-1' : 
        size === 'lg' ? 'text-sm px-3 py-2' : 
        'text-sm px-2.5 py-1.5'
      }`}
    >
      {showIcon && <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />}
      {config.label}
    </Badge>
  )
}