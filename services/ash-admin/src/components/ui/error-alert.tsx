import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './alert'
import { Button } from './button'

interface ErrorAlertProps {
  title?: string
  message: string
  retry?: () => void
}

export function ErrorAlert({ title = 'Error', message, retry }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {retry && (
          <Button
            variant="outline"
            size="sm"
            onClick={retry}
            className="ml-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}