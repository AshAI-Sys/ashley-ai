"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "./button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
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
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to error reporting service (e.g., Sentry)
    // logErrorToService(error, errorInfo)
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  private copyErrorToClipboard = () => {
    const { error, errorInfo } = this.state;
    const errorText = `
Error: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      alert("Error details copied to clipboard");
    });
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="w-full max-w-2xl">
            <div className="rounded-lg border border-destructive/50 bg-card p-8 shadow-lg">
              {/* Error Icon */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-10 w-10 text-destructive" />
                </div>
              </div>

              {/* Error Title */}
              <h1 className="mb-4 text-center text-3xl font-bold text-foreground">
                Oops! Something went wrong
              </h1>

              {/* Error Description */}
              <p className="mb-6 text-center text-muted-foreground">
                We're sorry for the inconvenience. An unexpected error has
                occurred.
              </p>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="mb-6 rounded-lg border border-border bg-muted/50 p-4">
                  <div className="mb-2 flex items-start gap-2">
                    <Bug className="mt-1 h-4 w-4 flex-shrink-0 text-destructive" />
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-2 text-sm font-semibold text-foreground">
                        Error Details (Development Mode)
                      </h3>
                      <div className="overflow-x-auto rounded bg-background p-3">
                        <pre className="whitespace-pre-wrap break-all font-mono text-xs text-foreground">
                          {this.state.error.message}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {this.state.error.stack && (
                    <div className="mt-3">
                      <h4 className="mb-1 text-xs font-semibold text-muted-foreground">
                        Stack Trace:
                      </h4>
                      <div className="max-h-40 overflow-x-auto overflow-y-auto rounded bg-background p-3">
                        <pre className="whitespace-pre-wrap break-all font-mono text-xs text-muted-foreground">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  onClick={this.handleReset}
                  variant="default"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>

                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {/* Copy Error Button (Development) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
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
              <div className="mt-6 border-t border-border pt-6">
                <p className="text-center text-sm text-muted-foreground">
                  If this problem persists, please contact support at{" "}
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
      );
    }

    return this.props.children;
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
  error?: Error;
  resetError?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="mb-4 h-12 w-12 text-destructive" />
      <h3 className="mb-2 text-lg font-semibold">Something went wrong</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        {error?.message || "An unexpected error occurred"}
      </p>
      {resetError && (
        <Button onClick={resetError} size="sm" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  );
}

/**
 * Hook to create error boundary state manually
 * Useful for functional components that need error handling
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((err: Error) => {
    setError(err);
    console.error("Error handled:", err);
  }, []);

  return {
    error,
    resetError,
    handleError,
    hasError: error !== null,
  };
}
