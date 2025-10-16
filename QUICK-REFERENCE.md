# Ashley AI - Quick Reference Card

**Last Updated**: 2025-10-16
**Version**: Enterprise Production Ready

---

## 🚀 Quick Commands

### Start Server
```bash
cd "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"
pnpm dev
```
**Access**: http://localhost:3001

### Database
```bash
cd packages/database
npx prisma generate    # Regenerate Prisma client
npx prisma studio      # Open database GUI
```

---

## 📦 New Utilities (Use These!)

### 1. Loading Skeletons
```tsx
import { DataTableSkeleton } from '@/components/ui/loading-skeletons'

if (isLoading) return <DataTableSkeleton rows={10} />
```

**Available Skeletons:**
- `DashboardStatsSkeleton` - For dashboard cards
- `DataTableSkeleton` - For data tables
- `FormSkeleton` - For forms
- `ProductionDashboardSkeleton` - For production pages
- `PageLoader` - Full-page loader

### 2. Responsive Components
```tsx
import { ResponsiveGrid } from '@/components/ui/responsive-container'

<ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 4 }}>
  {items.map(item => <Card {...item} />)}
</ResponsiveGrid>
```

**Available Components:**
- `ResponsiveContainer` - Auto padding/width
- `ResponsiveGrid` - Auto columns
- `ResponsiveStack` - Vertical→Horizontal
- `MobileOnly` / `DesktopOnly` - Conditional rendering

### 3. Form Validation
```tsx
import { FormField } from '@/components/ui/form-validation'

<FormField
  label="Order Number"
  value={value}
  onChange={onChange}
  error={error}
  hint="Format: ORD-YYYY-XXXX"
  required
/>
```

**Available Components:**
- `FormField` - Input with validation
- `FormSelect` - Select with validation
- `FormTextarea` - Textarea with char count
- `FormValidationSummary` - Error list

### 4. Caching
```tsx
import { cached } from '@/lib/cache'

const data = await cached(
  'orders-list',
  () => fetchOrders(),
  { ttl: 300 } // 5 minutes
)

// Invalidate cache
import { invalidateCache } from '@/lib/cache'
await invalidateCache('orders-*')
```

### 5. Bulk Operations
```tsx
import { bulkUpdateOrderStatus } from '@/lib/bulk-operations'

const result = await bulkUpdateOrderStatus(
  ['order1', 'order2', 'order3'],
  'APPROVED',
  userId
)

console.log(`Updated ${result.processed}, Failed ${result.failed}`)
```

### 6. Export
```tsx
import { exportOrders } from '@/lib/export'

<Button onClick={() => exportOrders(orders, 'excel')}>
  Export to Excel
</Button>
```

---

## 🎯 Common Patterns

### Loading State Pattern
```tsx
export default function Page() {
  const { data, isLoading, error } = useQuery('data')

  if (isLoading) return <DataTableSkeleton />
  if (error) return <ErrorAlert error={error} />

  return <DataTable data={data} />
}
```

### Responsive Layout Pattern
```tsx
import { ResponsiveContainer, ResponsiveGrid } from '@/components/ui/responsive-container'

export default function Dashboard() {
  return (
    <ResponsiveContainer maxWidth="2xl" padding="md">
      <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 4 }} gap="md">
        <StatCard title="Orders" value={120} />
        <StatCard title="Revenue" value="$45K" />
        <StatCard title="Clients" value={35} />
        <StatCard title="Products" value={89} />
      </ResponsiveGrid>
    </ResponsiveContainer>
  )
}
```

### Form Validation Pattern
```tsx
import { FormField, FormValidationSummary } from '@/components/ui/form-validation'

export default function OrderForm() {
  const [errors, setErrors] = useState([])

  return (
    <form onSubmit={handleSubmit}>
      <FormValidationSummary errors={errors} />

      <FormField
        label="Order Number"
        value={orderNumber}
        onChange={(e) => setOrderNumber(e.target.value)}
        error={orderNumberError}
        required
      />

      <FormField
        label="Quantity"
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        error={quantityError}
        required
      />
    </form>
  )
}
```

### Cached API Route Pattern
```tsx
import { NextRequest, NextResponse } from 'next/server'
import { cached, invalidateCache } from '@/lib/cache'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const orders = await cached(
    'orders-list',
    async () => {
      return await prisma.order.findMany({
        take: 100,
        include: { client: true, brand: true }
      })
    },
    { ttl: 300 } // Cache for 5 minutes
  )

  return NextResponse.json(orders)
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  const order = await prisma.order.create({ data })

  // Invalidate cache
  await invalidateCache('orders-*')

  return NextResponse.json(order)
}
```

---

## 🔧 Database Query Best Practices

### ✅ DO: Always use pagination
```tsx
const orders = await prisma.order.findMany({
  take: 100,  // ALWAYS add limit
  skip: (page - 1) * 100,
  where: { status: 'PENDING' }
})
```

### ❌ DON'T: Query without limits
```tsx
const orders = await prisma.order.findMany({
  where: { status: 'PENDING' }  // Missing take/limit
})
```

### ✅ DO: Use indexes
```tsx
// Already indexed: workspace_id, status, created_at, client_id
const orders = await prisma.order.findMany({
  where: {
    workspace_id: workspaceId,  // Indexed
    status: 'PENDING'            // Indexed
  }
})
```

---

## 🎨 UI Component Shortcuts

### Buttons
```tsx
<Button variant="default">Save</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Edit</Button>
```

### Cards
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Alerts
```tsx
<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>
```

---

## 📊 Performance Tips

1. **Use Loading Skeletons** - Better UX than spinners
2. **Cache Expensive Queries** - 60-80% performance gain
3. **Always Paginate** - Avoid memory issues
4. **Batch Operations** - Don't loop API calls
5. **Use Indexes** - Already have 538 in place

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port is in use
netstat -ano | findstr :3001

# Kill process
taskkill /PID [PID] /F

# Delete cache and restart
rm -rf .next
pnpm dev
```

### Database errors
```bash
# Regenerate Prisma client
cd packages/database
npx prisma generate

# Check database
npx prisma studio
```

### TypeScript errors
```bash
# Check for errors
npx tsc --noEmit

# Restart TypeScript server in VSCode
Ctrl+Shift+P → "Restart TypeScript Server"
```

---

## 📚 Documentation

- **Full Guide**: [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md)
- **Project Overview**: [CLAUDE.md](./CLAUDE.md)
- **API Routes**: `services/ash-admin/src/app/api/`
- **Components**: `services/ash-admin/src/components/`
- **Utilities**: `services/ash-admin/src/lib/`

---

## 🎯 Key Features

### System Status
- ✅ 15/15 Manufacturing Stages Complete
- ✅ 538 Database Indexes
- ✅ Zero Pagination Warnings
- ✅ Redis Caching Ready
- ✅ Bulk Operations Support
- ✅ CSV/Excel Export
- ✅ Mobile Responsive
- ✅ Professional Loading States

### URLs
- **Admin**: http://localhost:3001
- **Client Portal**: http://localhost:3003
- **Login**: admin@ashleyai.com / password123

---

## 💡 Pro Tips

1. **Always import from `@/components/ui/`** - Not from relative paths
2. **Use TypeScript types** - Full type safety everywhere
3. **Check IMPLEMENTATION-GUIDE.md** - Has all the examples
4. **Cache expensive queries** - Especially dashboard stats
5. **Use bulk operations** - Don't loop for multiple updates
6. **Export functionality** - Users love Excel downloads
7. **Mobile-first** - Always test responsive components

---

**Need Help?** Check [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md) for detailed examples!

**Version**: Enterprise Production Ready (2025-10-16)
**Status**: ✅ All systems operational
