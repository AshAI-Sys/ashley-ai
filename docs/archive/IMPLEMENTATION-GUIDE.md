# Ashley AI - Implementation Guide for New Features

**Date**: 2025-10-16
**Status**: Production Ready
**New Features**: 6 utility libraries, 2,013 lines of code

---

## Table of Contents

1. [Loading Skeletons](#loading-skeletons)
2. [Responsive Components](#responsive-components)
3. [Form Validation](#form-validation)
4. [Redis Caching](#redis-caching)
5. [Bulk Operations](#bulk-operations)
6. [Export Functionality](#export-functionality)

---

## 1. Loading Skeletons

**File**: `services/ash-admin/src/components/ui/loading-skeletons.tsx`

### Usage Examples

#### Dashboard with Statistics

```tsx
import { DashboardStatsSkeleton } from "@/components/ui/loading-skeletons";

export default function DashboardPage() {
  const { data, isLoading } = useQuery("dashboard-stats");

  if (isLoading) return <DashboardStatsSkeleton />;

  return <DashboardStats data={data} />;
}
```

#### Data Table with Pagination

```tsx
import { DataTableSkeleton } from "@/components/ui/loading-skeletons";

export default function OrdersPage() {
  const { data, isLoading } = useQuery("orders");

  if (isLoading) return <DataTableSkeleton rows={10} />;

  return <OrdersTable data={data} />;
}
```

#### Form Loading

```tsx
import { FormSkeleton } from "@/components/ui/loading-skeletons";

export default function CreateOrderPage() {
  const { data, isLoading } = useQuery("form-data");

  if (isLoading) return <FormSkeleton fields={8} />;

  return <OrderForm initialData={data} />;
}
```

#### Full Page Loader

```tsx
import { PageLoader } from "@/components/ui/loading-skeletons";

export default function LoadingPage() {
  return <PageLoader message="Loading orders..." />;
}
```

### Available Skeletons

- `DashboardStatsSkeleton` - 4 metric cards
- `DataTableSkeleton` - Table with search/filters (customizable rows)
- `FormSkeleton` - Multi-field form (customizable fields)
- `DetailsPageSkeleton` - Detail view with tabs
- `ProductionDashboardSkeleton` - Production stats + runs
- `ChartSkeleton` - Analytics chart with legend
- `TimelineSkeleton` - Activity timeline (customizable items)
- `MobileCardListSkeleton` - Mobile card list (customizable items)
- `PageLoader` - Full-page spinner with message

---

## 2. Responsive Components

**File**: `services/ash-admin/src/components/ui/responsive-container.tsx`

### Usage Examples

#### Responsive Container

```tsx
import { ResponsiveContainer } from "@/components/ui/responsive-container";

export default function Page() {
  return (
    <ResponsiveContainer padding="md" maxWidth="2xl">
      <h1>My Page</h1>
      {/* Content with automatic padding and max-width */}
    </ResponsiveContainer>
  );
}
```

#### Responsive Grid

```tsx
import { ResponsiveGrid } from "@/components/ui/responsive-container";

export default function Dashboard() {
  return (
    <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 4 }} gap="md">
      <StatCard title="Orders" value={120} />
      <StatCard title="Revenue" value="$45,000" />
      <StatCard title="Clients" value={35} />
      <StatCard title="Products" value={89} />
    </ResponsiveGrid>
  );
}
```

#### Mobile/Desktop Conditional Rendering

```tsx
import { MobileOnly, DesktopOnly } from "@/components/ui/responsive-container";

export default function Navigation() {
  return (
    <>
      <MobileOnly>
        <MobileMenu />
      </MobileOnly>

      <DesktopOnly>
        <DesktopSidebar />
      </DesktopOnly>
    </>
  );
}
```

#### Responsive Stack

```tsx
import { ResponsiveStack } from "@/components/ui/responsive-container";

export default function Header() {
  return (
    <ResponsiveStack direction="row" justify="between" align="center" gap="md">
      <h1>Orders</h1>
      <div className="flex gap-2">
        <Button>Export</Button>
        <Button>Create</Button>
      </div>
    </ResponsiveStack>
  );
}
```

### Available Components

- `ResponsiveContainer` - Auto padding/max-width
- `ResponsiveGrid` - Auto columns (1/2/3/4)
- `ResponsiveStack` - Vertical → Horizontal
- `MobileOnly` - Show on mobile only
- `DesktopOnly` - Show on desktop only
- `ResponsiveCard` - Optimized card padding
- `ResponsiveTable` - Scrollable on mobile
- `ResponsiveButtonGroup` - Stack on mobile

---

## 3. Form Validation

**File**: `services/ash-admin/src/components/ui/form-validation.tsx`

### Usage Examples

#### Form Field with Validation

```tsx
import { FormField } from "@/components/ui/form-validation";

export default function OrderForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");

  return (
    <FormField
      label="Order Number"
      value={orderNumber}
      onChange={e => setOrderNumber(e.target.value)}
      error={error}
      hint="Format: ORD-YYYY-XXXX"
      required
      showIcons
    />
  );
}
```

#### Form Select

```tsx
import { FormSelect } from "@/components/ui/form-validation";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function StatusSelect() {
  return (
    <FormSelect
      label="Order Status"
      options={statusOptions}
      value={status}
      onChange={e => setStatus(e.target.value)}
      error={statusError}
      required
    />
  );
}
```

#### Form Textarea with Character Count

```tsx
import { FormTextarea } from "@/components/ui/form-validation";

export default function NotesField() {
  const [notes, setNotes] = useState("");

  return (
    <FormTextarea
      label="Notes"
      value={notes}
      onChange={e => setNotes(e.target.value)}
      maxLength={500}
      showCharCount
      hint="Add any special instructions"
    />
  );
}
```

#### Validation Summary

```tsx
import { FormValidationSummary } from "@/components/ui/form-validation";

export default function OrderForm() {
  const errors = [
    { field: "Order Number", message: "Required field" },
    { field: "Quantity", message: "Must be greater than 0" },
  ];

  return (
    <form>
      <FormValidationSummary errors={errors} />
      {/* Form fields */}
    </form>
  );
}
```

#### Multi-Step Form Progress

```tsx
import { FormProgress } from "@/components/ui/form-validation";

export default function MultiStepForm() {
  const steps = [
    { label: "Details", completed: true },
    { label: "Design", completed: true },
    { label: "Review", completed: false },
  ];

  return <FormProgress currentStep={3} totalSteps={3} steps={steps} />;
}
```

### Available Components

- `FormField` - Input with icons/validation
- `FormSelect` - Select with validation
- `FormTextarea` - Textarea with char count
- `FormValidationSummary` - Error summary
- `ValidationMessage` - Inline message
- `FormProgress` - Multi-step progress

---

## 4. Redis Caching

**File**: `services/ash-admin/src/lib/cache.ts`

### Usage Examples

#### Basic Caching

```tsx
import { cached } from "@/lib/cache";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const orders = await cached(
    "orders-list",
    async () => {
      return await prisma.order.findMany({
        include: { client: true, brand: true },
      });
    },
    { ttl: 300 } // 5 minutes
  );

  return NextResponse.json(orders);
}
```

#### Stale-While-Revalidate (SWR)

```tsx
import { cached } from "@/lib/cache";

export async function GET() {
  const stats = await cached(
    "dashboard-stats",
    async () => calculateDashboardStats(),
    {
      ttl: 300, // 5 minutes
      swr: true, // Enable SWR
      staleTime: 60, // Revalidate after 1 minute
    }
  );

  return NextResponse.json(stats);
}
```

#### User-Specific Caching

```tsx
import { cachedForUser } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const userId = getUserId(request);

  const userOrders = await cachedForUser(userId, "my-orders", async () => {
    return await prisma.order.findMany({
      where: { created_by: userId },
    });
  });

  return NextResponse.json(userOrders);
}
```

#### Cache Invalidation

```tsx
import { invalidateCache, invalidateUserCache } from "@/lib/cache";

export async function POST(request: NextRequest) {
  const order = await createOrder(data);

  // Invalidate specific cache
  await invalidateCache("orders-list");

  // Invalidate pattern (all order caches)
  await invalidateCache("orders-*");

  // Invalidate all user cache
  await invalidateUserCache(userId);

  return NextResponse.json(order);
}
```

#### Batch Operations

```tsx
import { batchGet, batchSet } from "@/lib/cache";

// Batch get
const cache = await batchGet<Order>(["order-1", "order-2", "order-3"]);

// Batch set
await batchSet([
  { key: "order-1", value: order1, ttl: 300 },
  { key: "order-2", value: order2, ttl: 300 },
]);
```

### Available Functions

- `cached()` - Generic caching with TTL/SWR
- `cachedPaginated()` - Paginated results
- `cachedForUser()` - User-specific cache
- `cachedForWorkspace()` - Workspace cache
- `invalidateCache()` - Pattern invalidation
- `batchGet()` - Bulk read
- `batchSet()` - Bulk write
- `warmCache()` - Pre-populate cache
- `getCacheStats()` - Monitoring

---

## 5. Bulk Operations

**File**: `services/ash-admin/src/lib/bulk-operations.ts`

### Usage Examples

#### Bulk Update Order Status

```tsx
import { bulkUpdateOrderStatus } from "@/lib/bulk-operations";

export async function POST(request: NextRequest) {
  const { orderIds, status } = await request.json();

  const result = await bulkUpdateOrderStatus(orderIds, status, userId);

  return NextResponse.json({
    success: result.success,
    processed: result.processed,
    failed: result.failed,
    errors: result.errors,
  });
}
```

#### Bulk Create Invoices

```tsx
import { bulkCreateInvoices } from "@/lib/bulk-operations";

export async function POST(request: NextRequest) {
  const { orderIds } = await request.json();

  const result = await bulkCreateInvoices(orderIds, workspaceId);

  if (result.success) {
    console.log(`Created ${result.processed} invoices`);
    result.results?.forEach(r => {
      console.log(`Order ${r.orderId} → Invoice ${r.invoiceId}`);
    });
  }

  return NextResponse.json(result);
}
```

#### Bulk Import Orders from CSV

```tsx
import { bulkImportOrders } from "@/lib/bulk-operations";

export async function POST(request: NextRequest) {
  const csvData = await parseCsvFile(request);

  const orders = csvData.map(row => ({
    client_name: row.client,
    order_number: row.order_num,
    quantity: parseInt(row.qty),
    total_amount: parseFloat(row.amount),
    delivery_date: row.delivery,
  }));

  const result = await bulkImportOrders(orders, workspaceId);

  return NextResponse.json({
    imported: result.processed,
    failed: result.failed,
    errors: result.errors,
  });
}
```

#### Frontend Usage

```tsx
"use client";

export default function BulkActionsBar({
  selectedIds,
}: {
  selectedIds: string[];
}) {
  const handleBulkApprove = async () => {
    const response = await fetch("/api/orders/bulk-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderIds: selectedIds,
        status: "APPROVED",
      }),
    });

    const result = await response.json();

    if (result.success) {
      toast.success(`Updated ${result.processed} orders`);
    } else {
      toast.error(`Failed to update ${result.failed} orders`);
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleBulkApprove}>
        Approve Selected ({selectedIds.length})
      </Button>
    </div>
  );
}
```

### Available Functions

- `bulkUpdateOrderStatus()` - Update order statuses
- `bulkDeleteOrders()` - Soft delete orders
- `bulkCreateInvoices()` - Generate invoices
- `bulkUpdateInvoiceStatus()` - Update invoices
- `bulkImportOrders()` - Import from CSV/Excel
- `bulkAssignToProduction()` - Assign to runs

---

## 6. Export Functionality

**File**: `services/ash-admin/src/lib/export.ts`

### Usage Examples

#### Export Orders

```tsx
"use client";
import { exportOrders } from "@/lib/export";

export default function OrdersPage() {
  const { data: orders } = useQuery("orders");

  const handleExport = () => {
    exportOrders(orders, "csv"); // or 'excel'
  };

  return <Button onClick={handleExport}>Export Orders to CSV</Button>;
}
```

#### Export Invoices

```tsx
"use client";
import { exportInvoices } from "@/lib/export";

export default function InvoicesPage() {
  const { data: invoices } = useQuery("invoices");

  return (
    <Button onClick={() => exportInvoices(invoices, "excel")}>
      Export to Excel
    </Button>
  );
}
```

#### Custom Export

```tsx
"use client";
import { exportData, ExportColumn } from "@/lib/export";

export default function CustomExport() {
  const columns: ExportColumn[] = [
    { header: "ID", key: "id", width: 10 },
    { header: "Name", key: "name", width: 30 },
    { header: "Total", key: "total", format: v => `₱${v.toLocaleString()}` },
    {
      header: "Date",
      key: "date",
      format: v => new Date(v).toLocaleDateString(),
    },
  ];

  const handleExport = () => {
    exportData(data, columns, "custom-report", "csv");
  };

  return <Button onClick={handleExport}>Export</Button>;
}
```

#### Export with Filters

```tsx
"use client";
import { exportOrders } from "@/lib/export";

export default function FilteredExport() {
  const { data: allOrders } = useQuery("orders");

  const handleExportPending = () => {
    const pendingOrders = allOrders.filter(o => o.status === "PENDING");
    exportOrders(pendingOrders, "excel");
  };

  const handleExportThisMonth = () => {
    const thisMonth = allOrders.filter(o => {
      const orderDate = new Date(o.created_at);
      const now = new Date();
      return orderDate.getMonth() === now.getMonth();
    });
    exportOrders(thisMonth, "csv");
  };

  return (
    <>
      <Button onClick={handleExportPending}>Export Pending</Button>
      <Button onClick={handleExportThisMonth}>Export This Month</Button>
    </>
  );
}
```

### Available Export Functions

- `exportToCSV()` - Generic CSV export
- `exportToExcel()` - Excel export (CSV-based)
- `exportOrders()` - Pre-configured orders export
- `exportInvoices()` - Pre-configured invoices export
- `exportEmployees()` - Pre-configured employees export
- `exportProductionRuns()` - Export cutting/printing/sewing
- `exportFinancialReport()` - Export revenue/expenses
- `exportQualityControl()` - Export QC inspections
- `exportData()` - Generic export with custom columns

---

## Best Practices

### 1. Loading States

✅ **DO**: Use loading skeletons for better UX

```tsx
if (isLoading) return <DataTableSkeleton />;
```

❌ **DON'T**: Use generic spinners everywhere

```tsx
if (isLoading) return <Spinner />;
```

### 2. Responsive Design

✅ **DO**: Use responsive components

```tsx
<ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 4 }}>
```

❌ **DON'T**: Hardcode breakpoints

```tsx
<div className="grid grid-cols-4">
```

### 3. Form Validation

✅ **DO**: Show inline validation

```tsx
<FormField error={error} hint="Format: XXX-YYY" />
```

❌ **DON'T**: Only show errors on submit

```tsx
<input /> {/* errors shown only after submit */}
```

### 4. Caching

✅ **DO**: Cache expensive queries

```tsx
const stats = await cached("stats", fetchStats, { ttl: 300 });
```

❌ **DON'T**: Re-fetch on every request

```tsx
const stats = await fetchStats(); // No caching
```

### 5. Bulk Operations

✅ **DO**: Handle errors gracefully

```tsx
const result = await bulkUpdate(ids, status);
if (result.failed > 0) {
  showErrors(result.errors);
}
```

❌ **DON'T**: Assume all will succeed

```tsx
await bulkUpdate(ids, status);
toast.success("All updated!"); // May not be true
```

### 6. Exports

✅ **DO**: Filter data before export

```tsx
const filtered = data.filter(...)
exportOrders(filtered, 'csv')
```

❌ **DON'T**: Export everything blindly

```tsx
exportOrders(allData, "csv"); // May be too large
```

---

## Performance Tips

1. **Use Pagination with Caching**

```tsx
const orders = await cachedPaginated(
  "orders",
  page,
  limit,
  () => fetchOrders(page, limit),
  { ttl: 60 }
);
```

2. **Batch Cache Invalidation**

```tsx
// Instead of multiple invalidations
await invalidateCache("orders-*"); // Pattern match
```

3. **Pre-warm Critical Caches**

```tsx
await warmCache([
  { key: "dashboard-stats", fn: fetchDashboardStats },
  { key: "recent-orders", fn: fetchRecentOrders },
]);
```

4. **Use SWR for Frequently Accessed Data**

```tsx
const stats = await cached("stats", fetchStats, {
  ttl: 300,
  swr: true,
  staleTime: 60,
});
```

---

## Migration Guide

### Converting Existing Pages

#### Before:

```tsx
export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders().then(data => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return <OrdersTable data={orders} />;
}
```

#### After:

```tsx
import { DataTableSkeleton } from "@/components/ui/loading-skeletons";
import { ResponsiveContainer } from "@/components/ui/responsive-container";

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery("orders");

  if (isLoading) return <DataTableSkeleton rows={10} />;

  return (
    <ResponsiveContainer maxWidth="2xl">
      <OrdersTable data={orders} />
    </ResponsiveContainer>
  );
}
```

---

## Next Steps

1. ✅ Review this guide
2. ✅ Test loading skeletons on 3-5 pages
3. ✅ Add responsive containers to main layouts
4. ✅ Implement caching on expensive API routes
5. ✅ Add bulk actions to tables
6. ✅ Add export buttons to list pages

For questions or issues, check the source files or consult the development team.

**Happy Coding! 🚀**
