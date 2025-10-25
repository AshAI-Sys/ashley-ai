import React, { Component, ErrorInfo, ReactNode } from "react";
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
export declare class ErrorBoundary extends Component<Props, State> {
    state: State;
    static getDerivedStateFromError(error: Error): State;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    private handleReset;
    private handleReload;
    private handleGoHome;
    private copyErrorToClipboard;
    render(): string | number | bigint | boolean | Iterable<React.ReactNode> | Promise<React.AwaitedReactNode> | React.JSX.Element;
}
/**
 * Simple Error Fallback Component
 * Can be used as a custom fallback for ErrorBoundary
 */
export declare function SimpleErrorFallback({ error, resetError, }: {
    error?: Error;
    resetError?: () => void;
}): React.JSX.Element;
/**
 * Hook to create error boundary state manually
 * Useful for functional components that need error handling
 */
export declare function useErrorHandler(): {
    error: Error;
    resetError: () => void;
    handleError: (err: Error) => void;
    hasError: boolean;
};
export {};
