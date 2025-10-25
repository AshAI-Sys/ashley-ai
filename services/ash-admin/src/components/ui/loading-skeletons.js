"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardStatsSkeleton = DashboardStatsSkeleton;
exports.DataTableSkeleton = DataTableSkeleton;
exports.FormSkeleton = FormSkeleton;
exports.DetailsPageSkeleton = DetailsPageSkeleton;
exports.ProductionDashboardSkeleton = ProductionDashboardSkeleton;
exports.ChartSkeleton = ChartSkeleton;
exports.TimelineSkeleton = TimelineSkeleton;
exports.MobileCardListSkeleton = MobileCardListSkeleton;
exports.PageLoader = PageLoader;
const react_1 = __importDefault(require("react"));
const utils_1 = require("@/lib/utils");
const skeleton_1 = require("./skeleton");
/**
 * Dashboard Statistics Grid Skeleton
 * Used for: Dashboard pages with metric cards
 */
function DashboardStatsSkeleton() {
    return (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (<div key={i} className="rounded-lg border bg-card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <skeleton_1.Skeleton className="h-4 w-24"/>
            <skeleton_1.Skeleton className="h-4 w-4 rounded-full"/>
          </div>
          <div className="space-y-2">
            <skeleton_1.Skeleton className="h-8 w-20"/>
            <skeleton_1.Skeleton className="h-3 w-32"/>
          </div>
        </div>))}
    </div>);
}
/**
 * Data Table Skeleton
 * Used for: Order lists, Client lists, Employee tables
 */
function DataTableSkeleton({ rows = 10 }) {
    return (<div className="space-y-4">
      {/* Search and filters */}
      <div className="flex items-center justify-between gap-4">
        <skeleton_1.Skeleton className="h-10 w-full max-w-sm"/>
        <div className="flex gap-2">
          <skeleton_1.Skeleton className="h-10 w-32"/>
          <skeleton_1.Skeleton className="h-10 w-32"/>
        </div>
      </div>

      {/* Table header */}
      <div className="rounded-md border">
        <div className="border-b bg-muted/50 p-4">
          <div className="flex items-center gap-4">
            <skeleton_1.Skeleton className="h-4 w-4"/>
            <skeleton_1.Skeleton className="h-4 w-32"/>
            <skeleton_1.Skeleton className="h-4 w-24"/>
            <skeleton_1.Skeleton className="h-4 w-40"/>
            <skeleton_1.Skeleton className="h-4 w-20"/>
            <skeleton_1.Skeleton className="h-4 w-16"/>
          </div>
        </div>

        {/* Table rows */}
        {[...Array(rows)].map((_, i) => (<div key={i} className="border-b p-4 last:border-0">
            <div className="flex items-center gap-4">
              <skeleton_1.Skeleton className="h-4 w-4"/>
              <skeleton_1.Skeleton className="h-4 w-32"/>
              <skeleton_1.Skeleton className="h-4 w-24"/>
              <skeleton_1.Skeleton className="h-4 w-40"/>
              <skeleton_1.Skeleton className="h-4 w-20"/>
              <skeleton_1.Skeleton className="h-4 w-16"/>
            </div>
          </div>))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <skeleton_1.Skeleton className="h-4 w-40"/>
        <div className="flex gap-2">
          <skeleton_1.Skeleton className="h-9 w-24"/>
          <skeleton_1.Skeleton className="h-9 w-24"/>
        </div>
      </div>
    </div>);
}
/**
 * Form Skeleton
 * Used for: Create/Edit pages
 */
function FormSkeleton({ fields = 6 }) {
    return (<div className="space-y-6">
      <div className="space-y-2">
        <skeleton_1.Skeleton className="h-8 w-48"/>
        <skeleton_1.Skeleton className="h-4 w-full max-w-md"/>
      </div>

      <div className="space-y-4">
        {[...Array(fields)].map((_, i) => (<div key={i} className="space-y-2">
            <skeleton_1.Skeleton className="h-4 w-32"/>
            <skeleton_1.Skeleton className="h-10 w-full"/>
          </div>))}
      </div>

      <div className="flex gap-3">
        <skeleton_1.Skeleton className="h-10 w-24"/>
        <skeleton_1.Skeleton className="h-10 w-24"/>
      </div>
    </div>);
}
/**
 * Details Page Skeleton
 * Used for: Order details, Client details, etc.
 */
function DetailsPageSkeleton() {
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <skeleton_1.Skeleton className="h-8 w-64"/>
          <div className="flex items-center gap-2">
            <skeleton_1.Skeleton className="h-5 w-20"/>
            <skeleton_1.Skeleton className="h-5 w-32"/>
          </div>
        </div>
        <div className="flex gap-2">
          <skeleton_1.Skeleton className="h-9 w-24"/>
          <skeleton_1.Skeleton className="h-9 w-24"/>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          <skeleton_1.Skeleton className="h-10 w-24"/>
          <skeleton_1.Skeleton className="h-10 w-24"/>
          <skeleton_1.Skeleton className="h-10 w-24"/>
        </div>
      </div>

      {/* Content cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (<div key={i} className="space-y-3 rounded-lg border p-4">
            <skeleton_1.Skeleton className="h-4 w-24"/>
            <skeleton_1.Skeleton className="h-6 w-32"/>
            <skeleton_1.Skeleton className="h-3 w-full"/>
          </div>))}
      </div>
    </div>);
}
/**
 * Production Dashboard Skeleton
 * Used for: Printing, Sewing, Cutting dashboards
 */
function ProductionDashboardSkeleton() {
    return (<div className="space-y-6">
      {/* Stats */}
      <DashboardStatsSkeleton />

      {/* Active runs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <skeleton_1.Skeleton className="h-6 w-32"/>
          <skeleton_1.Skeleton className="h-9 w-32"/>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (<div key={i} className="space-y-4 rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <skeleton_1.Skeleton className="h-5 w-24"/>
                  <skeleton_1.Skeleton className="h-4 w-40"/>
                </div>
                <skeleton_1.Skeleton className="h-8 w-8 rounded-full"/>
              </div>
              <div className="space-y-2">
                <skeleton_1.Skeleton className="h-2 w-full"/>
                <div className="flex justify-between">
                  <skeleton_1.Skeleton className="h-3 w-20"/>
                  <skeleton_1.Skeleton className="h-3 w-16"/>
                </div>
              </div>
              <div className="flex gap-2">
                <skeleton_1.Skeleton className="h-8 w-20"/>
                <skeleton_1.Skeleton className="h-8 w-20"/>
              </div>
            </div>))}
        </div>
      </div>
    </div>);
}
/**
 * Chart Skeleton
 * Used for: Analytics pages with charts
 */
function ChartSkeleton({ height = "h-80" }) {
    return (<div className="space-y-4 rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <skeleton_1.Skeleton className="h-5 w-32"/>
        <skeleton_1.Skeleton className="h-8 w-32"/>
      </div>
      <skeleton_1.Skeleton className={(0, utils_1.cn)("w-full rounded", height)}/>
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <skeleton_1.Skeleton className="h-3 w-3 rounded-full"/>
          <skeleton_1.Skeleton className="h-3 w-16"/>
        </div>
        <div className="flex items-center gap-2">
          <skeleton_1.Skeleton className="h-3 w-3 rounded-full"/>
          <skeleton_1.Skeleton className="h-3 w-16"/>
        </div>
      </div>
    </div>);
}
/**
 * Timeline Skeleton
 * Used for: Activity logs, Order history
 */
function TimelineSkeleton({ items = 5 }) {
    return (<div className="space-y-6">
      {[...Array(items)].map((_, i) => (<div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <skeleton_1.Skeleton className="h-8 w-8 rounded-full"/>
            {i < items - 1 && <skeleton_1.Skeleton className="my-2 h-full w-0.5"/>}
          </div>
          <div className="flex-1 space-y-2 pb-8">
            <skeleton_1.Skeleton className="h-4 w-48"/>
            <skeleton_1.Skeleton className="h-3 w-32"/>
            <skeleton_1.Skeleton className="h-3 w-full max-w-md"/>
          </div>
        </div>))}
    </div>);
}
/**
 * Mobile Card List Skeleton
 * Used for: Mobile-optimized list views
 */
function MobileCardListSkeleton({ items = 5 }) {
    return (<div className="space-y-3">
      {[...Array(items)].map((_, i) => (<div key={i} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-1">
              <skeleton_1.Skeleton className="h-5 w-3/4"/>
              <skeleton_1.Skeleton className="h-4 w-1/2"/>
            </div>
            <skeleton_1.Skeleton className="h-6 w-16 rounded-full"/>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <skeleton_1.Skeleton className="h-8 w-full"/>
            <skeleton_1.Skeleton className="h-8 w-full"/>
          </div>
        </div>))}
    </div>);
}
/**
 * Page Loading Component
 * Full-page loading state with brand styling
 */
function PageLoader({ message = "Loading..." }) {
    return (<div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-primary/20"/>
        <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-primary"/>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>);
}
