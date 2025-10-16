# Ashley AI - Progressive Web App (PWA) Architecture

**Last Updated**: 2025-10-03
**Target Users**: Production floor workers, operators, quality inspectors
**Devices**: Mobile phones (iOS/Android), tablets (7-10 inch)

---

## 🎯 Core Features

### **1. QR/Barcode Scanner** 📷
**Purpose**: Scan bundles, cartons, assets, work orders
**Technology**: HTML5 getUserMedia API + ZXing library
**Supported Codes**:
- QR codes (bundles, cartons)
- Barcodes (EAN-13, UPC, Code 128)
- Data Matrix codes (small labels)

**Use Cases**:
- Scan bundle to see cutting lay details
- Scan carton to view contents
- Scan work order to start production
- Scan asset to view maintenance history
- Scan employee badge for attendance

### **2. Offline-First Architecture** 🔌
**Purpose**: Work without internet connection
**Technology**: IndexedDB + Service Worker + Background Sync
**Offline Capabilities**:
- View recent orders and bundles
- Scan and queue operations (cutting, sewing, QC)
- Record attendance logs
- Take QC inspection photos
- Auto-sync when connection returns

**Data Sync Strategy**:
```
1. Online: Direct API calls, cache responses
2. Offline: Store mutations in IndexedDB queue
3. Connection Returns: Background sync processes queue
4. Conflicts: Last-write-wins or user resolution
```

### **3. Touch-Optimized UI** 👆
**Purpose**: Easy to use with gloves on production floor
**Design Principles**:
- Large touch targets (minimum 44x44px)
- High contrast colors (readable in factory lighting)
- Simple, focused screens (one task per screen)
- Swipe gestures for navigation
- Minimal text entry (use scanning/selection)

**UI Components**:
- Large action buttons (50px+ height)
- Bottom navigation bar (thumb-friendly)
- Floating action button (primary action)
- Full-screen modals (focus on task)
- Toast notifications (quick feedback)

### **4. Production Operator Mode** 👷
**Purpose**: Simplified interface for production workers
**Features**:
- Quick actions dashboard
- My active tasks list
- Scan to start/complete tasks
- Real-time piece count tracker
- Performance metrics (efficiency, pieces/hour)
- Clock in/out with QR badge scan

**Screens**:
1. **Home**: Active tasks + quick actions
2. **Scan**: Camera view with instructions
3. **Task Detail**: Current task info + actions
4. **Performance**: Today's stats + weekly trend

### **5. Push Notifications** 🔔
**Purpose**: Real-time alerts for production events
**Notification Types**:
- New work order assigned
- QC inspection needed
- Bundle ready for next operation
- Urgent issue flagged
- Shift ending reminder
- Break time notification

**Implementation**:
- Web Push API (no app store needed)
- Notification permission on first login
- User preferences for notification types
- Do Not Disturb during breaks

---

## 📱 Screen Designs

### **Production Floor Mode Screens**

#### **1. Dashboard (Home)**
```
┌─────────────────────────────┐
│ 👤 John Doe      🔔 [3]     │ ← Header
├─────────────────────────────┤
│ ⏱️  On Shift: 3h 45m         │
│ 📊 Today: 145 pcs (92% eff) │ ← Stats
├─────────────────────────────┤
│ 🎯 MY ACTIVE TASKS          │
├─────────────────────────────┤
│ ┌───────────────────────┐   │
│ │ 📦 Bundle #B-1234     │   │
│ │ Sewing Operation      │   │
│ │ Due: 2h 30m           │   │ ← Task Card
│ │ [SCAN TO START] ─────►│   │
│ └───────────────────────┘   │
│                             │
│ ┌───────────────────────┐   │
│ │ ✅ QC Inspection      │   │
│ │ Order #ORD-5678       │   │
│ │ Waiting...            │   │
│ │ [VIEW DETAILS] ──────►│   │
│ └───────────────────────┘   │
├─────────────────────────────┤
│ [📷SCAN] [📊STATS] [⚙️MORE]│ ← Bottom Nav
└─────────────────────────────┘
```

#### **2. Scanner View**
```
┌─────────────────────────────┐
│ ← Back          [Flash] ⚡  │ ← Header
├─────────────────────────────┤
│                             │
│   ┌─────────────────┐       │
│   │                 │       │
│   │   [CAMERA]      │       │ ← Camera Feed
│   │   VIEWFINDER    │       │
│   │                 │       │
│   └─────────────────┘       │
│                             │
│  📷 Point camera at QR code │
│     or barcode              │ ← Instructions
│                             │
│  Recently Scanned:          │
│  • B-1234 (2 min ago)       │
│  • B-1233 (5 min ago)       │ ← History
│                             │
│ [ENTER CODE MANUALLY] ─────►│ ← Fallback
└─────────────────────────────┘
```

#### **3. Task Detail View**
```
┌─────────────────────────────┐
│ ← Back        Bundle #B-1234│ ← Header
├─────────────────────────────┤
│ 📦 Bundle Details           │
│                             │
│ Order: ORD-5678             │
│ Client: ABC Apparel         │
│ Product: Blue T-Shirt       │ ← Info
│ Quantity: 50 pieces         │
│ Size: M                     │
├─────────────────────────────┤
│ 🎯 Your Task                │
│                             │
│ Operation: Sewing           │
│ Station: Line A - Seat 12   │ ← Assignment
│ Target: 50 pcs in 2.5 hrs  │
│ Rate: $0.25 per piece       │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │   [START TASK] 🚀       │ │ ← Large Button
│ └─────────────────────────┘ │
│                             │
│ Already started?            │
│ [MARK COMPLETE] ✅          │ ← Secondary
└─────────────────────────────┘
```

#### **4. Active Task (In Progress)**
```
┌─────────────────────────────┐
│ Bundle #B-1234    ⏱️ 45:30  │ ← Header + Timer
├─────────────────────────────┤
│ 🏃 IN PROGRESS              │
│                             │
│ ┌─────────────────────────┐ │
│ │  Completed               │ │
│ │    [32] / 50             │ │ ← Progress
│ │  ████████░░░░░░░  64%   │ │
│ └─────────────────────────┘ │
│                             │
│ 📊 Performance              │
│ • Pieces/Hour: 42.2         │
│ • Efficiency: 85%           │ ← Metrics
│ • Est. Completion: 25 min   │
│                             │
│ ┌─────────────────────────┐ │
│ │     [+1] ADD PIECE      │ │ ← Increment
│ └─────────────────────────┘ │
│                             │
│ [PAUSE ⏸️] [COMPLETE ✅]    │ ← Actions
└─────────────────────────────┘
```

#### **5. QC Inspection**
```
┌─────────────────────────────┐
│ ← Back      QC Inspection   │ ← Header
├─────────────────────────────┤
│ Order: ORD-5678             │
│ Sample Size: 32 pieces      │ ← Info
│ (AQL 2.5, Level II)         │
├─────────────────────────────┤
│ 📸 Take Photos              │
│                             │
│ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │ 📷  │ │ 📷  │ │ [+] │    │ ← Photo Grid
│ │img1 │ │img2 │ │ Add │    │
│ └─────┘ └─────┘ └─────┘    │
│                             │
│ 🔍 Defects Found            │
│                             │
│ ┌───────────────────────┐   │
│ │ Loose Thread          │   │
│ │ Count: [2]  Minor ▼   │   │ ← Defect Entry
│ └───────────────────────┘   │
│                             │
│ [+ ADD DEFECT]              │
│                             │
│ Result: [PASS] ✅ [FAIL] ❌ │ ← Result
│                             │
│ ┌─────────────────────────┐ │
│ │   [SUBMIT INSPECTION]   │ │ ← Submit
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

---

## 🗂️ Offline Data Storage

### **IndexedDB Schema**

```typescript
// Store structure
const stores = {
  // Cached data (read-only while offline)
  'orders': { keyPath: 'id', indexes: ['status', 'client_id'] },
  'bundles': { keyPath: 'id', indexes: ['order_id', 'status'] },
  'tasks': { keyPath: 'id', indexes: ['employee_id', 'status'] },
  'employees': { keyPath: 'id', indexes: ['department'] },

  // Pending mutations (queue for sync)
  'pending_scans': { keyPath: 'id', autoIncrement: true },
  'pending_tasks': { keyPath: 'id', autoIncrement: true },
  'pending_qc': { keyPath: 'id', autoIncrement: true },
  'pending_attendance': { keyPath: 'id', autoIncrement: true },

  // Media files (photos)
  'photos': { keyPath: 'id', autoIncrement: true },
}
```

### **Sync Queue Example**

```typescript
// User scans bundle while offline
{
  id: 1,
  type: 'SCAN_BUNDLE',
  timestamp: '2025-10-03T14:30:00Z',
  data: {
    bundle_id: 'B-1234',
    action: 'START_SEWING',
    employee_id: 'EMP-001',
    location: { lat: 14.5995, lng: 120.9842 }
  },
  synced: false,
  attempts: 0
}

// When online, POST to /api/mobile/sync
```

---

## 📡 Background Sync API

### **Service Worker Sync Events**

```javascript
// Register sync when mutation queued
await registration.sync.register('sync-bundle-scan')

// Handle sync in service worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bundle-scan') {
    event.waitUntil(syncBundleScans())
  }
})

async function syncBundleScans() {
  const db = await openDB()
  const pending = await db.getAll('pending_scans')

  for (const scan of pending) {
    try {
      const response = await fetch('/api/mobile/scan', {
        method: 'POST',
        body: JSON.stringify(scan.data)
      })

      if (response.ok) {
        await db.delete('pending_scans', scan.id)
      }
    } catch (error) {
      // Retry later
    }
  }
}
```

---

## 🔔 Push Notifications

### **Notification Flow**

```
1. User grants permission
2. Service worker registers for push
3. Server stores subscription
4. Event triggers notification:
   - New task assigned
   - QC needed
   - Urgent issue
5. Service worker shows notification
6. User taps → Opens relevant screen
```

### **Implementation**

```typescript
// Request permission
const permission = await Notification.requestPermission()

if (permission === 'granted') {
  // Subscribe to push
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY
  })

  // Send subscription to server
  await fetch('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription)
  })
}

// Service worker handles push
self.addEventListener('push', (event) => {
  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [200, 100, 200],
      data: { url: data.url }
    })
  )
})
```

---

## 📐 Responsive Design

### **Breakpoints**

```css
/* Mobile (portrait) */
@media (max-width: 767px) {
  /* Single column, bottom nav */
}

/* Tablet (portrait) */
@media (min-width: 768px) and (max-width: 1023px) {
  /* 2 columns, side nav option */
}

/* Tablet (landscape) */
@media (min-width: 1024px) and (orientation: landscape) {
  /* 3 columns, persistent side nav */
}
```

### **Touch Target Sizes**

```css
/* Minimum touch target: 44x44px (Apple HIG) */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}

/* Large action buttons */
.action-button {
  height: 56px;
  font-size: 18px;
  font-weight: 600;
}

/* Bottom navigation */
.bottom-nav-item {
  min-height: 56px;
  min-width: 64px;
}
```

---

## 🎨 Production Floor Theme

### **Color Palette**

```css
/* High contrast for factory lighting */
:root {
  --production-primary: #2563eb;    /* Blue (actions) */
  --production-success: #16a34a;    /* Green (complete) */
  --production-warning: #ea580c;    /* Orange (alert) */
  --production-danger: #dc2626;     /* Red (error) */
  --production-bg: #f9fafb;         /* Light gray bg */
  --production-surface: #ffffff;    /* White cards */
  --production-text: #111827;       /* Dark text */
  --production-text-light: #6b7280; /* Gray text */
}

/* Dark mode for low-light environments */
.dark {
  --production-bg: #111827;
  --production-surface: #1f2937;
  --production-text: #f9fafb;
  --production-text-light: #9ca3af;
}
```

---

## 🚀 Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **First Contentful Paint** | <1.5s | TBD | ⏳ |
| **Time to Interactive** | <3.0s | TBD | ⏳ |
| **Lighthouse Score** | >90 | TBD | ⏳ |
| **Offline Load Time** | <1.0s | TBD | ⏳ |
| **Camera Open Time** | <500ms | TBD | ⏳ |
| **Scan Success Rate** | >95% | TBD | ⏳ |

---

## ✅ Implementation Checklist

### **Phase 1: Core PWA Setup**
- [ ] Update manifest.json (enhanced)
- [ ] Improve service worker (offline strategies)
- [ ] Add install prompt
- [ ] Create app icons (all sizes)
- [ ] Test iOS Safari + Android Chrome

### **Phase 2: QR/Barcode Scanner**
- [ ] Install ZXing library (@zxing/browser)
- [ ] Create scanner component
- [ ] Add camera permissions handling
- [ ] Implement torch/flash control
- [ ] Add manual code entry fallback
- [ ] Test various code types

### **Phase 3: Offline Architecture**
- [ ] Set up IndexedDB wrapper
- [ ] Create sync queue system
- [ ] Implement background sync
- [ ] Add conflict resolution
- [ ] Build offline indicator UI
- [ ] Test offline→online transitions

### **Phase 4: Touch-Optimized UI**
- [ ] Create production floor layout
- [ ] Build large button components
- [ ] Add swipe gestures
- [ ] Implement bottom navigation
- [ ] Create FAB (floating action button)
- [ ] Test on actual devices

### **Phase 5: Production Operator Mode**
- [ ] Build operator dashboard
- [ ] Create task list view
- [ ] Implement scan-to-start flow
- [ ] Add piece count tracker
- [ ] Build performance metrics
- [ ] Add clock in/out

### **Phase 6: Push Notifications**
- [ ] Set up VAPID keys
- [ ] Create subscription endpoint
- [ ] Implement notification service
- [ ] Build notification preferences
- [ ] Test notification delivery
- [ ] Handle notification clicks

---

**Ready to implement! Let's start building the PWA features.** 🚀
