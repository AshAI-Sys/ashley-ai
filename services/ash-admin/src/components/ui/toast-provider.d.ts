import React from "react";
/**
 * Enhanced Toast Provider with beautiful styled toasts
 * Supports: success, error, warning, info, loading variants
 */
export declare function ToastProvider(): React.JSX.Element;
/**
 * Enhanced toast notification functions
 */
export declare const showToast: {
    /**
     * Show success toast
     */
    success: (message: string, options?: {
        duration?: number;
    }) => string;
    /**
     * Show error toast
     */
    error: (message: string, options?: {
        duration?: number;
    }) => string;
    /**
     * Show warning toast
     */
    warning: (message: string, options?: {
        duration?: number;
    }) => string;
    /**
     * Show info toast
     */
    info: (message: string, options?: {
        duration?: number;
    }) => string;
    /**
     * Show loading toast
     */
    loading: (message: string) => string;
    /**
     * Show promise toast with loading, success, and error states
     */
    promise: <T>(promise: Promise<T>, messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
    }) => Promise<T>;
    /**
     * Dismiss toast by ID
     */
    dismiss: (toastId?: string) => void;
    /**
     * Dismiss all toasts
     */
    dismissAll: () => void;
};
/**
 * Hook to use toast notifications
 */
export declare function useToast(): {
    /**
     * Show success toast
     */
    success: (message: string, options?: {
        duration?: number;
    }) => string;
    /**
     * Show error toast
     */
    error: (message: string, options?: {
        duration?: number;
    }) => string;
    /**
     * Show warning toast
     */
    warning: (message: string, options?: {
        duration?: number;
    }) => string;
    /**
     * Show info toast
     */
    info: (message: string, options?: {
        duration?: number;
    }) => string;
    /**
     * Show loading toast
     */
    loading: (message: string) => string;
    /**
     * Show promise toast with loading, success, and error states
     */
    promise: <T>(promise: Promise<T>, messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
    }) => Promise<T>;
    /**
     * Dismiss toast by ID
     */
    dismiss: (toastId?: string) => void;
    /**
     * Dismiss all toasts
     */
    dismissAll: () => void;
};
