"use client";

import React from "react";
import toast, { Toaster, ToastBar } from "react-hot-toast";
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Enhanced Toast Provider with beautiful styled toasts
 * Supports: success, error, warning, info, loading variants
 */
export function ToastProvider() {
  const { effectiveTheme } = useTheme();

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: effectiveTheme === "dark" ? "#1f2937" : "#ffffff",
          color: effectiveTheme === "dark" ? "#f3f4f6" : "#111827",
          border: `1px solid ${effectiveTheme === "dark" ? "#374151" : "#e5e7eb"}`,
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          maxWidth: "500px",
        },
        success: {
          iconTheme: {
            primary: "#10b981",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#ffffff",
          },
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div className="flex w-full items-start gap-3">
              {/* Icon */}
              <div className="mt-0.5 flex-shrink-0">{icon}</div>

              {/* Message */}
              <div className="min-w-0 flex-1">{message}</div>

              {/* Dismiss Button */}
              {t.type !== "loading" && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}

/**
 * Enhanced toast notification functions
 */
export const showToast = {
  /**
   * Show success toast
   */
  success: (message: string, options?: { duration?: number }) => {
    return toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-fade-in" : "animate-fade-out"
          } flex max-w-md items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg`}
        >
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="mb-1 font-semibold text-foreground">Success</h4>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
      { duration: options?.duration || 4000 }
    );
  },

  /**
   * Show error toast
   */
  error: (message: string, options?: { duration?: number }) => {
    return toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-fade-in" : "animate-fade-out"
          } flex max-w-md items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg`}
        >
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="mb-1 font-semibold text-foreground">Error</h4>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
      { duration: options?.duration || 6000 }
    );
  },

  /**
   * Show warning toast
   */
  warning: (message: string, options?: { duration?: number }) => {
    return toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-fade-in" : "animate-fade-out"
          } flex max-w-md items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg`}
        >
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="mb-1 font-semibold text-foreground">Warning</h4>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
      { duration: options?.duration || 5000 }
    );
  },

  /**
   * Show info toast
   */
  info: (message: string, options?: { duration?: number }) => {
    return toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-fade-in" : "animate-fade-out"
          } flex max-w-md items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg`}
        >
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="mb-1 font-semibold text-foreground">Info</h4>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
      { duration: options?.duration || 4000 }
    );
  },

  /**
   * Show loading toast
   */
  loading: (message: string) => {
    return toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-fade-in" : "animate-fade-out"
          } flex max-w-md items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg`}
        >
          <div className="flex-shrink-0">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground">{message}</p>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  },

  /**
   * Show promise toast with loading, success, and error states
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: (data) =>
          typeof messages.success === "function"
            ? messages.success(data)
            : messages.success,
        error: (error) =>
          typeof messages.error === "function"
            ? messages.error(error)
            : messages.error,
      },
      {
        success: {
          duration: 4000,
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
        },
        error: {
          duration: 6000,
          icon: <XCircle className="h-5 w-5 text-red-600" />,
        },
        loading: {
          icon: <Loader2 className="h-5 w-5 animate-spin text-primary" />,
        },
      }
    );
  },

  /**
   * Dismiss toast by ID
   */
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.dismiss();
  },
};

/**
 * Hook to use toast notifications
 */
export function useToast() {
  return showToast;
}
