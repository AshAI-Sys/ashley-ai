'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from './button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree and displays a fallback UI
 *
 * @example
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * @example
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomErrorPage />}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Log to error reporting service (e.g., Sentry)
    // logErrorToService(error, errorInfo)
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  private copyErrorToClipboard = () => {
    const { error, errorInfo } = this.state
    const errorText = `
Error: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
    `.trim()

    navigator.clipboard.writeText(errorText).then(() => {
      alert('Error details copied to clipboard')
    })
  }

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-card border border-destructive/50 rounded-lg p-8 shadow-lg">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-destructive" />
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-3xl font-bold text-center mb-4 text-foreground">
                Oops! Something went wrong
              </h1>

              {/* Error Description */}
              <p className="text-center text-muted-foreground mb-6">
                We're sorry for the inconvenience. An unexpected error has occurred.
              </p>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-start gap-2 mb-2">
                    <Bug className="w-4 h-4 text-destructive mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-2 text-foreground">
                        Error Details (Development Mode)
                      </h3>
                      <div className="bg-background rounded p-3 overflow-x-auto">
                        <pre className="text-xs text-foreground font-mono whitespace-pre-wrap break-all">
                          {this.state.error.message}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {this.state.error.stack && (
                    <div className="mt-3">
                      <h4 className="text-xs font-semibold mb-1 text-muted-foreground">
                        Stack Trace:
                      </h4>
                      <div className="bg-background rounded p-3 overflow-x-auto max-h-40 overflow-y-auto">
                        <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-all">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  variant="default"
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>

                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </div>

              {/* Copy Error Button (Development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={this.copyErrorToClipboard}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    Copy Error Details
                  </Button>
                </div>
              )}

              {/* Support Message */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-center text-sm text-muted-foreground">
                  If this problem persists, please contact support at{' '}
                  <a
                    href="mailto:support@ashleyai.com"
                    className="text-primary hover:underline"
                  >
                    support@ashleyai.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Simple Error Fallback Component
 * Can be used as a custom fallback for ErrorBoundary
 */
export function SimpleErrorFallback({
  error,
  resetError,
}: {
  error?: Error
  resetError?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {error?.message || 'An unexpected error occurred'}
      </p>
      {resetError && (
        <Button onClick={resetError} size="sm" variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try again
        </Button>
      )}
    </div>
  )
}

/**
 * Hook to create error boundary state manually
 * Useful for functional components that need error handling
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((err: Error) => {
    setError(err)
    console.error('Error handled:', err)
  }, [])

  return {
    error,
    resetError,
    handleError,
    hasError: error !== null,
  }
}
