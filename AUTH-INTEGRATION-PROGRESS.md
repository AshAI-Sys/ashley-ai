# Authentication Integration Progress

**Date**: October 31, 2025
**Status**: ⚡ **IN PROGRESS** - 40% Complete

---

## ✅ Completed Tasks

### 1. RBAC System Enhancement (100% Complete)

**Updated File**: `/services/ash-admin/src/lib/rbac.ts`

#### Added Inventory Permissions:
```typescript
| "inventory:read"      // View inventory data
| "inventory:scan"      // Scan QR codes (store clerk)
| "inventory:sell"      // Process sales (cashier)
| "inventory:receive"   // Receive deliveries (warehouse)
| "inventory:transfer"  // Transfer stock (warehouse)
| "inventory:adjust"    // Adjust inventory (warehouse)
| "inventory:report"    // View reports (admin)
```

#### Added New Roles:
- **store_clerk**: Can read and scan inventory
  - Permissions: `inventory:read`, `inventory:scan`

- **cashier**: Can read, scan, and sell inventory
  - Permissions: `inventory:read`, `inventory:scan`, `inventory:sell`

#### Updated Existing Roles:
- **admin**: Added all 7 inventory permissions
- **warehouse_staff**: Added 5 permissions (read, receive, transfer, adjust, report)

#### Added Navigation Permissions:
```typescript
inventory: ["inventory:read"],
"inventory-store": ["inventory:scan"],
"inventory-cashier": ["inventory:sell"],
"inventory-warehouse": ["inventory:receive", "inventory:transfer", "inventory:adjust"],
"inventory-admin": ["inventory:report"],
```

### 2. API Endpoint Authentication (1/6 Complete)

**Completed**:
- ✅ `/api/inventory/sales` - Updated with `requirePermission('inventory:sell')`
  - Uses `user.workspaceId` instead of hardcoded workspace_id
  - Uses `user.id` instead of hardcoded cashier_id
  - Validates workspace access
  - Logs actions with user email

---

## 🚧 Remaining Tasks

### 3. Update Remaining API Endpoints (5/6 TODO)

All endpoints need to be updated similarly to the sales endpoint:

#### ⏳ `/api/inventory/product/[id]/route.ts` (GET)
- Add: `requirePermission('inventory:read')`
- Use: `user.workspaceId` for workspace validation
- Validate: User has access to requested workspace

#### ⏳ `/api/inventory/delivery/route.ts` (POST)
- Add: `requirePermission('inventory:receive')`
- Use: `user.workspaceId`, `user.id` as received_by
- Remove: hardcoded workspace_id

#### ⏳ `/api/inventory/transfer/route.ts` (POST)
- Add: `requirePermission('inventory:transfer')`
- Use: `user.workspaceId`, `user.id` as performed_by
- Remove: hardcoded workspace_id

#### ⏳ `/api/inventory/adjust/route.ts` (POST)
- Add: `requirePermission('inventory:adjust')`
- Use: `user.workspaceId`, `user.id` as performed_by
- Remove: hardcoded workspace_id

#### ⏳ `/api/inventory/report/route.ts` (GET)
- Add: `requirePermission('inventory:report')`
- Use: `user.workspaceId` for filtering
- Remove: workspace_id from query params (get from auth)

### 4. Update Frontend Pages (4/4 TODO)

All pages need to send auth tokens and remove hardcoded IDs:

#### ⏳ `/inventory/store/page.tsx`
- Update: API calls to include auth headers
- Remove: No hardcoded IDs (already uses dynamic QR scan)
- Add: Error handling for 401/403 responses

#### ⏳ `/inventory/cashier/page.tsx`
- Update: API calls to include auth headers
- Remove: `workspace_id: 'demo-workspace-1'`, `cashier_id: 'cashier-001'`
- Add: Get these from auth context
- Add: Role-based access check (only cashiers/admins)

#### ⏳ `/inventory/warehouse/page.tsx`
- Update: API calls to include auth headers
- Remove: All hardcoded IDs (`workspace_id`, `user-001`)
- Add: Get from auth context
- Add: Role-based access check (only warehouse_staff/admins)

#### ⏳ `/inventory/admin/page.tsx`
- Update: API calls to include auth headers
- Remove: `workspace_id=demo-workspace-1` from query
- Add: Get from auth context
- Add: Role-based access check (only admins)

### 5. Add Sidebar Navigation (TODO)

Add Inventory section to main sidebar with role-based visibility:

**File**: `/services/ash-admin/src/components/sidebar.tsx`

```typescript
{
  name: "Inventory",
  icon: Package,
  subItems: [
    {
      name: "Store Scanner",
      href: "/inventory/store",
      permission: "inventory:scan",
    },
    {
      name: "Cashier POS",
      href: "/inventory/cashier",
      permission: "inventory:sell",
    },
    {
      name: "Warehouse",
      href: "/inventory/warehouse",
      permission: "inventory:receive",
    },
    {
      name: "Admin Dashboard",
      href: "/inventory/admin",
      permission: "inventory:report",
    },
  ],
}
```

### 6. Create Auth Context Hook (TODO)

Create a reusable hook for frontend to access user data:

**File**: `/services/ash-admin/src/hooks/useAuth.ts`

```typescript
export function useAuth() {
  const { user, isLoading } = useAuthContext();

  return {
    user,
    workspaceId: user?.workspaceId,
    userId: user?.id,
    email: user?.email,
    role: user?.role,
    permissions: user?.permissions,
    isLoading,
    hasPermission: (permission: Permission) =>
      user?.permissions?.includes(permission),
  };
}
```

### 7. Update Cashier Page (TODO)

Remove hardcoded values from `/inventory/cashier/page.tsx`:

**Current Code**:
```typescript
const saleData = {
  workspace_id: 'demo-workspace-1',  // ❌ Remove
  location_id: 'store-001',
  cashier_id: 'cashier-001',         // ❌ Remove
  items,
  payment_method,
  amount_paid,
};
```

**Updated Code**:
```typescript
const { workspaceId, userId } = useAuth();

const saleData = {
  // workspace_id automatically from auth token
  location_id: selectedLocation || 'store-001',
  // cashier_id automatically from auth token
  items,
  payment_method,
  amount_paid,
};
```

### 8. Update Warehouse Page (TODO)

Similar updates to `/inventory/warehouse/page.tsx` for all three tabs (delivery, transfer, adjust).

### 9. Mobile App Authentication (TODO)

This connects to Option 2 (Mobile App Development):

#### Mobile Auth Flow:
1. **Login Screen** - Already created
2. **Token Storage** - Use `expo-secure-store`
3. **API Client** - Update to include auth headers
4. **Auth Context** - Create for React Native
5. **Inventory Screens** - Connect to authenticated APIs

---

## Implementation Priority

### Phase 1: Complete Web App Auth (High Priority)
1. Update remaining 5 API endpoints (2 hours)
2. Create useAuth hook (30 min)
3. Update frontend pages to use auth (2 hours)
4. Add sidebar navigation (30 min)
5. **Total**: ~5 hours

### Phase 2: Mobile App Development (Medium Priority)
1. Complete mobile auth flow (3 hours)
2. Build inventory screens (4 hours)
3. Connect to APIs (2 hours)
4. **Total**: ~9 hours

### Phase 3: Testing & Polish (Low Priority)
1. Test all permission combinations (2 hours)
2. Test workspace isolation (1 hour)
3. Add error boundaries (1 hour)
4. **Total**: ~4 hours

---

## Example: Before vs After

### Before (Hardcoded):
```typescript
// Frontend
const saleData = {
  workspace_id: 'demo-workspace-1',  // Hardcoded
  cashier_id: 'cashier-001',         // Hardcoded
  items,
};

fetch('/api/inventory/sales', {
  method: 'POST',
  body: JSON.stringify(saleData),
});
```

### After (Authenticated):
```typescript
// Frontend
const { workspaceId, userId } = useAuth();

const saleData = {
  // workspace_id from token
  // cashier_id from token
  items,
};

fetch('/api/inventory/sales', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`,
  },
  body: JSON.stringify(saleData),
});
```

### Backend:
```typescript
// Before
export async function POST(request: NextRequest) {
  const { workspace_id, cashier_id } = await request.json();
  // Use values directly
}

// After
export const POST = requirePermission('inventory:sell')(
  async (request: NextRequest, user) => {
    const workspace_id = user.workspaceId;  // From token
    const cashier_id = user.id;              // From token
    // Validated by middleware
  }
);
```

---

## Benefits After Completion

### Security ✅
- No hardcoded credentials
- Workspace isolation enforced
- Permission-based access control
- Audit trail with user tracking

### User Experience ✅
- Automatic user identification
- Role-based navigation
- No manual ID entry
- Seamless multi-user support

### Scalability ✅
- Multi-workspace ready
- Role system extensible
- Permission granularity
- Future-proof architecture

---

## Next Steps

**Recommendation**: Complete Phase 1 (Web App Auth) first, then proceed to Phase 2 (Mobile App).

**Quick Start**:
```bash
# 1. Update remaining API endpoints
# 2. Create useAuth hook
# 3. Update frontend pages
# 4. Add sidebar navigation
# 5. Test everything
```

Would you like me to continue with updating the remaining API endpoints?
