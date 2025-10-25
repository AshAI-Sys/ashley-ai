"use client";
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showToast = void 0;
exports.ToastProvider = ToastProvider;
exports.useToast = useToast;
const react_1 = __importDefault(require("react"));
const react_hot_toast_1 = __importStar(require("react-hot-toast"));
const lucide_react_1 = require("lucide-react");
const ThemeContext_1 = require("@/contexts/ThemeContext");
/**
 * Enhanced Toast Provider with beautiful styled toasts
 * Supports: success, error, warning, info, loading variants
 */
function ToastProvider() {
    const { effectiveTheme } = (0, ThemeContext_1.useTheme)();
    return (<react_hot_toast_1.Toaster position="top-right" toastOptions={{
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
        }}>
      {(t) => (<react_hot_toast_1.ToastBar toast={t}>
          {({ icon, message }) => (<div className="flex w-full items-start gap-3">
              {/* Icon */}
              <div className="mt-0.5 flex-shrink-0">{icon}</div>

              {/* Message */}
              <div className="min-w-0 flex-1">{message}</div>

              {/* Dismiss Button */}
              {t.type !== "loading" && (<button onClick={() => react_hot_toast_1.default.dismiss(t.id)} className="flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground" aria-label="Dismiss notification">
                  <lucide_react_1.X className="h-4 w-4"/>
                </button>)}
            </div>)}
        </react_hot_toast_1.ToastBar>)}
    </react_hot_toast_1.Toaster>);
}
/**
 * Enhanced toast notification functions
 */
exports.showToast = {
    /**
     * Show success toast
     */
    success: (message, options) => {
        return react_hot_toast_1.default.custom((t) => (<div className={`${t.visible ? "animate-fade-in" : "animate-fade-out"} flex max-w-md items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg`}>
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <lucide_react_1.CheckCircle2 className="h-5 w-5 text-green-600"/>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="mb-1 font-semibold text-foreground">Success</h4>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <button onClick={() => react_hot_toast_1.default.dismiss(t.id)} className="flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground" aria-label="Dismiss">
            <lucide_react_1.X className="h-4 w-4"/>
          </button>
        </div>), { duration: options?.duration || 4000 });
    },
    /**
     * Show error toast
     */
    error: (message, options) => {
        return react_hot_toast_1.default.custom((t) => (<div className={`${t.visible ? "animate-fade-in" : "animate-fade-out"} flex max-w-md items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg`}>
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
              <lucide_react_1.XCircle className="h-5 w-5 text-red-600"/>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="mb-1 font-semibold text-foreground">Error</h4>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <button onClick={() => react_hot_toast_1.default.dismiss(t.id)} className="flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground" aria-label="Dismiss">
            <lucide_react_1.X className="h-4 w-4"/>
          </button>
        </div>), { duration: options?.duration || 6000 });
    },
    /**
     * Show warning toast
     */
    warning: (message, options) => {
        return react_hot_toast_1.default.custom((t) => (<div className={`${t.visible ? "animate-fade-in" : "animate-fade-out"} flex max-w-md items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg`}>
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
              <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-600"/>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="mb-1 font-semibold text-foreground">Warning</h4>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <button onClick={() => react_hot_toast_1.default.dismiss(t.id)} className="flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground" aria-label="Dismiss">
            <lucide_react_1.X className="h-4 w-4"/>
          </button>
        </div>), { duration: options?.duration || 5000 });
    },
    /**
     * Show info toast
     */
    info: (message, options) => {
        return react_hot_toast_1.default.custom((t) => (<div className={`${t.visible ? "animate-fade-in" : "animate-fade-out"} flex max-w-md items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg`}>
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <lucide_react_1.Info className="h-5 w-5 text-blue-600"/>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="mb-1 font-semibold text-foreground">Info</h4>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <button onClick={() => react_hot_toast_1.default.dismiss(t.id)} className="flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground" aria-label="Dismiss">
            <lucide_react_1.X className="h-4 w-4"/>
          </button>
        </div>), { duration: options?.duration || 4000 });
    },
    /**
     * Show loading toast
     */
    loading: (message) => {
        return react_hot_toast_1.default.custom((t) => (<div className={`${t.visible ? "animate-fade-in" : "animate-fade-out"} flex max-w-md items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg`}>
          <div className="flex-shrink-0">
            <lucide_react_1.Loader2 className="h-5 w-5 animate-spin text-primary"/>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground">{message}</p>
          </div>
        </div>), { duration: Infinity });
    },
    /**
     * Show promise toast with loading, success, and error states
     */
    promise: (promise, messages) => {
        return react_hot_toast_1.default.promise(promise, {
            loading: messages.loading,
            success: (data) => typeof messages.success === "function"
                ? messages.success(data)
                : messages.success,
            error: (error) => typeof messages.error === "function"
                ? messages.error(error)
                : messages.error,
        }, {
            success: {
                duration: 4000,
                icon: <lucide_react_1.CheckCircle2 className="h-5 w-5 text-green-600"/>,
            },
            error: {
                duration: 6000,
                icon: <lucide_react_1.XCircle className="h-5 w-5 text-red-600"/>,
            },
            loading: {
                icon: <lucide_react_1.Loader2 className="h-5 w-5 animate-spin text-primary"/>,
            },
        });
    },
    /**
     * Dismiss toast by ID
     */
    dismiss: (toastId) => {
        react_hot_toast_1.default.dismiss(toastId);
    },
    /**
     * Dismiss all toasts
     */
    dismissAll: () => {
        react_hot_toast_1.default.dismiss();
    },
};
/**
 * Hook to use toast notifications
 */
function useToast() {
    return exports.showToast;
}
