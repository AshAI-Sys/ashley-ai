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
Object.defineProperty(exports, "__esModule", { value: true });
exports.toast = void 0;
exports.ToastProvider = ToastProvider;
exports.useToast = useToast;
exports.Toaster = Toaster;
exports.ToastItem = ToastItem;
const React = __importStar(require("react"));
const toastReducer = (state, action) => {
    switch (action.type) {
        case "ADD_TOAST":
            return {
                ...state,
                toasts: [...state.toasts, action.toast],
            };
        case "REMOVE_TOAST":
            return {
                ...state,
                toasts: state.toasts.filter(t => t.id !== action.id),
            };
        case "UPDATE_TOAST":
            return {
                ...state,
                toasts: state.toasts.map(t => t.id === action.id ? { ...t, ...action.toast } : t),
            };
        default:
            return state;
    }
};
const ToasterContext = React.createContext(undefined);
function ToastProvider({ children }) {
    const [state, dispatch] = React.useReducer(toastReducer, { toasts: [] });
    const toast = React.useCallback((props) => {
        const id = Math.random().toString(36).substr(2, 9);
        const duration = props.duration ?? 5000;
        dispatch({
            type: "ADD_TOAST",
            toast: { ...props, id },
        });
        if (duration > 0) {
            setTimeout(() => {
                dispatch({ type: "REMOVE_TOAST", id });
            }, duration);
        }
    }, []);
    const dismiss = React.useCallback((id) => {
        dispatch({ type: "REMOVE_TOAST", id });
    }, []);
    return (<ToasterContext.Provider value={{ toasts: state.toasts, toast, dismiss }}>
      {children}
      <Toaster />
    </ToasterContext.Provider>);
}
function useToast() {
    const context = React.useContext(ToasterContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}
function Toaster() {
    const { toasts, dismiss } = useToast();
    return (<div className="fixed bottom-4 right-4 z-50 flex max-w-md flex-col gap-2">
      {toasts.map(toast => (<ToastItem key={toast.id} toast={toast} onDismiss={dismiss}/>))}
    </div>);
}
function ToastItem({ toast, onDismiss, }) {
    const variantStyles = {
        default: "bg-white border-gray-200 text-gray-900",
        success: "bg-green-50 border-green-200 text-green-900",
        error: "bg-red-50 border-red-200 text-red-900",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
    };
    return (<div className={`relative flex items-start gap-3 rounded-lg border p-4 shadow-lg ${variantStyles[toast.variant || "default"]} animate-in slide-in-from-right-full`}>
      <div className="flex-1">
        {toast.title && (<div className="mb-1 text-sm font-semibold">{toast.title}</div>)}
        {toast.description && (<div className="text-sm opacity-90">{toast.description}</div>)}
      </div>
      <button onClick={() => onDismiss(toast.id)} className="flex-shrink-0 opacity-70 transition-opacity hover:opacity-100" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>);
}
// Helper function for common toast patterns
exports.toast = {
    success: (message) => {
        // This will be replaced by actual toast context
        console.log("Success:", message);
    },
    error: (message) => {
        console.error("Error:", message);
    },
    info: (message) => {
        console.log("Info:", message);
    },
    warning: (message) => {
        console.warn("Warning:", message);
    },
};
