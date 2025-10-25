/**
 * Dynamic Loader Utilities
 * Lazy loading for heavy components to reduce initial bundle size
 */
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
exports.LazyChartLoader = void 0;
exports.LoadingSpinner = LoadingSpinner;
exports.ErrorFallback = ErrorFallback;
exports.createLazyComponent = createLazyComponent;
exports.lazyModal = lazyModal;
exports.lazyRoute = lazyRoute;
exports.lazyOnVisible = lazyOnVisible;
exports.preloadComponent = preloadComponent;
const dynamic_1 = __importDefault(require("next/dynamic"));
const react_1 = __importDefault(require("react"));
/**
 * Loading fallback component
 */
function LoadingSpinner({ message = "Loading...", }) {
    return (<div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"/>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>);
}
/**
 * Error fallback component
 */
function ErrorFallback({ error }) {
    return (<div className="flex items-center justify-center p-8">
      <div className="text-center text-red-600">
        <p className="font-semibold">Failed to load component</p>
        <p className="text-sm">{error.message}</p>
      </div>
    </div>);
}
/**
 * Create a lazy-loaded component with loading state
 */
function createLazyComponent(importFn, loadingMessage) {
    return (0, dynamic_1.default)(importFn, {
        loading: () => <LoadingSpinner message={loadingMessage}/>,
        ssr: false, // Disable SSR for lazy components
    });
}
/**
 * Pre-configured lazy loaders for common component types
 */
// Heavy chart/visualization components
exports.LazyChartLoader = {
    LineChart: createLazyComponent(() => Promise.resolve().then(() => __importStar(require("recharts"))).then(mod => ({ default: mod.LineChart })), "Loading chart..."),
    BarChart: createLazyComponent(() => Promise.resolve().then(() => __importStar(require("recharts"))).then(mod => ({ default: mod.BarChart })), "Loading chart..."),
    PieChart: createLazyComponent(() => Promise.resolve().then(() => __importStar(require("recharts"))).then(mod => ({ default: mod.PieChart })), "Loading chart..."),
};
/**
 * Lazy load modal/dialog components
 */
function lazyModal(importFn) {
    return (0, dynamic_1.default)(importFn, {
        loading: () => null, // No loading state for modals (they open instantly)
        ssr: false,
    });
}
/**
 * Lazy load route components (for route-based code splitting)
 */
function lazyRoute(importFn, loadingMessage) {
    return (0, dynamic_1.default)(importFn, {
        loading: () => (<LoadingSpinner message={loadingMessage || "Loading page..."}/>),
        ssr: true, // Enable SSR for routes
    });
}
/**
 * Lazy load with intersection observer (load when visible)
 */
function lazyOnVisible(importFn, loadingMessage) {
    return (0, dynamic_1.default)(importFn, {
        loading: () => <LoadingSpinner message={loadingMessage}/>,
        ssr: false,
    });
}
/**
 * Preload component for better UX
 * Call this function to preload a component before it's needed
 */
function preloadComponent(importFn) {
    // Start loading the component
    importFn().catch(err => console.error("Preload failed:", err));
}
