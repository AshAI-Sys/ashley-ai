# 📡 ASH AI API Documentation

> Complete API reference for ASH AI ERP system

## 🔐 Authentication

All API endpoints require authentication using JWT tokens.

### Authentication Flow

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password",
  "workspace_id": "workspace-uuid"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "ADMIN",
    "workspace_id": "workspace-uuid"
  }
}
```

### Using Bearer Tokens

Include the access token in all requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📋 Stage 1: Client & Order Intake

### Create Client

```http
POST /api/v1/clients
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Clark Safari",
  "company": "Clark Safari & Adventure Park",
  "emails": ["ops@clarksafari.ph"],
  "phones": ["+63-9xx-xxx-xxxx"],
  "billing_address": {
    "street": "123 Adventure St",
    "city": "Angeles City",
    "province": "Pampanga",
    "postal_code": "2009",
    "country": "Philippines"
  }
}
```

**Response (201):**
```json
{
  "id": "client-uuid",
  "name": "Clark Safari",
  "company": "Clark Safari & Adventure Park",
  "created_at": "2025-01-15T08:00:00.000Z"
}
```

### Create Production Order

```http
POST /api/v1/orders
Content-Type: application/json
Authorization: Bearer {token}
Idempotency-Key: order-creation-uuid

{
  "brand_id": "brand-uuid",
  "client_id": "client-uuid",
  "product_type": "Hoodie",
  "method": "SILKSCREEN",
  "total_qty": 450,
  "size_curve": {"M": 180, "L": 180, "XL": 90},
  "variants": [
    {"color": "Black", "qty": 350},
    {"color": "White", "qty": 100}
  ],
  "addons": ["anti_migration"],
  "target_delivery_date": "2025-09-25",
  "commercials": {
    "unit_price": 499,
    "deposit_pct": 50,
    "terms": "50/50",
    "tax_mode": "VAT_INCLUSIVE",
    "currency": "PHP"
  },
  "attachments": [
    {"type": "brief", "file_url": "https://..."}
  ],
  "route_template_key": "SILK_OPTION_A"
}
```

**Response (201):**
```json
{
  "id": "order-uuid",
  "po_number": "REEF-2025-000123",
  "status": "INTAKE",
  "ashley_analysis": {
    "risk": "AMBER",
    "issues": [
      {
        "type": "CAPACITY",
        "workcenter": "PRINTING",
        "details": "+18% over capacity in week of Sep 15"
      }
    ],
    "advice": [
      "Split run: 300 pcs this week, 150 next",
      "Consider subcontracting printing for 2 days"
    ]
  }
}
```

### Apply Routing Template

```http
POST /api/v1/orders/{order_id}/routing/apply-template
Content-Type: application/json
Authorization: Bearer {token}

{
  "route_template_key": "SILK_OPTION_B"
}
```

**Response (200):**
```json
{
  "steps": [
    {
      "name": "Cutting",
      "workcenter": "CUTTING",
      "sequence": 10,
      "depends_on": []
    },
    {
      "name": "Sewing",
      "workcenter": "SEWING",
      "sequence": 20,
      "depends_on": ["Cutting"]
    }
  ]
}
```

## 🎨 Stage 2: Design & Approval

### Upload Design Version

```http
POST /api/v1/designs
Content-Type: application/json
Authorization: Bearer {token}

{
  "order_id": "order-uuid",
  "name": "Clark Safari Hoodie Design",
  "method": "SILKSCREEN",
  "files": {
    "mockup_url": "https://storage/mockup.png",
    "prod_url": "https://storage/production.ai",
    "separations": [
      "https://storage/black.png",
      "https://storage/white.png"
    ]
  },
  "placements": [
    {
      "area": "front",
      "width_cm": 25,
      "height_cm": 30,
      "offset_x": 0,
      "offset_y": 5
    }
  ],
  "palette": ["#000000", "#FFFFFF"],
  "meta": {
    "dpi": 300,
    "notes": "High resolution design"
  }
}
```

**Response (201):**
```json
{
  "asset_id": "design-uuid",
  "version": 1,
  "ashley_check": {
    "result": "PASS",
    "metrics": {
      "min_dpi": 300,
      "expected_ink_g": 125.5
    }
  }
}
```

### Send for Client Approval

```http
POST /api/v1/designs/{asset_id}/versions/{version}/send-approval
Content-Type: application/json
Authorization: Bearer {token}

{
  "client_id": "client-uuid",
  "require_esign": true
}
```

**Response (200):**
```json
{
  "approval_id": "approval-uuid",
  "portal_link": "https://portal.ash-ai.com/approvals/{token}"
}
```

### Client Approve Design

```http
POST /api/v1/portal/approvals/{approval_id}/approve
Content-Type: application/json

{
  "approver_name": "John Doe",
  "approver_email": "john@clarksafari.ph"
}
```

**Response (200):**
```json
{
  "status": "APPROVED",
  "signed_at": "2025-01-15T10:30:00.000Z"
}
```

## ✂️ Stage 3: Cutting

### Issue Fabric to Cutting

```http
POST /api/v1/cutting/issues
Content-Type: application/json
Authorization: Bearer {token}

{
  "order_id": "order-uuid",
  "batch_id": "fabric-batch-uuid",
  "qty_issued": 28.5,
  "uom": "KG"
}
```

**Response (201):**
```json
{
  "id": "issue-uuid",
  "remaining_stock": 471.5
}
```

### Create Lay & Log Outputs

```http
POST /api/v1/cutting/lays
Content-Type: application/json
Authorization: Bearer {token}

{
  "order_id": "order-uuid",
  "marker_name": "Hoodie_Mixed_v2",
  "marker_width_cm": 150,
  "lay_length_m": 25.5,
  "plies": 8,
  "gross_used": 27.2,
  "offcuts": 0.8,
  "uom": "KG",
  "outputs": [
    {"size_code": "M", "qty": 88},
    {"size_code": "L", "qty": 88},
    {"size_code": "XL", "qty": 44}
  ]
}
```

**Response (201):**
```json
{
  "lay_id": "lay-uuid",
  "ashley_analysis": {
    "efficiency_pct": 85.2,
    "waste_pct": 2.9,
    "alerts": []
  }
}
```

### Create Bundles

```http
POST /api/v1/cutting/bundles
Content-Type: application/json
Authorization: Bearer {token}

{
  "order_id": "order-uuid",
  "from_lay_id": "lay-uuid",
  "bundle_size_per_size": {
    "M": 20,
    "L": 20,
    "XL": 20
  }
}
```

**Response (201):**
```json
{
  "bundles": [
    {
      "id": "bundle-uuid-1",
      "size_code": "M",
      "qty": 20,
      "qr_code": "ash://bundle/bundle-uuid-1"
    }
  ]
}
```

## 🖨️ Stage 4: Printing

### Create Print Run

```http
POST /api/v1/printing/runs
Content-Type: application/json
Authorization: Bearer {token}

{
  "order_id": "order-uuid",
  "routing_step_id": "step-uuid",
  "method": "SILKSCREEN",
  "workcenter": "PRINTING",
  "machine_id": "machine-uuid"
}
```

**Response (201):**
```json
{
  "run_id": "run-uuid"
}
```

### Log Print Materials

```http
POST /api/v1/printing/runs/{run_id}/materials
Content-Type: application/json
Authorization: Bearer {token}

{
  "item_id": "ink-item-uuid",
  "uom": "g",
  "qty": 125.5,
  "source_batch_id": "ink-batch-uuid"
}
```

### Record Print Output

```http
POST /api/v1/printing/runs/{run_id}/output
Content-Type: application/json
Authorization: Bearer {token}

{
  "bundle_id": "bundle-uuid",
  "qty_good": 19,
  "qty_reject": 1,
  "notes": "Minor misalignment on 1 piece"
}
```

### Complete Print Run

```http
POST /api/v1/printing/runs/{run_id}/complete
Content-Type: application/json
Authorization: Bearer {token}

{}
```

**Response (200):**
```json
{
  "status": "DONE",
  "routing_step_updated": true
}
```

## 🧵 Stage 5: Sewing

### Create Sewing Run

```http
POST /api/v1/sewing/runs
Content-Type: application/json
Authorization: Bearer {token}

{
  "order_id": "order-uuid",
  "routing_step_id": "step-uuid",
  "operation_name": "Join shoulders",
  "bundle_id": "bundle-uuid"
}
```

### Complete Sewing Operation

```http
POST /api/v1/sewing/runs/{run_id}/complete
Content-Type: application/json
Authorization: Bearer {token}

{
  "qty_good": 19,
  "qty_reject": 1,
  "reject_reason": "Seam puckering",
  "reject_photo_url": "https://storage/reject.jpg"
}
```

**Response (200):**
```json
{
  "status": "DONE",
  "earned_minutes": 38.0,
  "piece_rate_pay": 57.0,
  "efficiency_pct": 95.2
}
```

## ✅ Stage 6: Quality Control

### Create QC Inspection

```http
POST /api/v1/qc/inspections
Content-Type: application/json
Authorization: Bearer {token}

{
  "order_id": "order-uuid",
  "stage": "FINAL",
  "lot_size": 450,
  "aql": 2.5,
  "level": "GII",
  "checklist_id": "checklist-uuid"
}
```

**Response (201):**
```json
{
  "inspection_id": "inspection-uuid",
  "sample_size": 125,
  "acceptance": 7,
  "rejection": 8
}
```

### Log QC Defect

```http
POST /api/v1/qc/inspections/{id}/defect
Content-Type: application/json
Authorization: Bearer {token}

{
  "sample_id": "sample-uuid",
  "defect_code_id": "defect-code-uuid",
  "severity": "MAJOR",
  "qty": 1,
  "photo_url": "https://storage/defect.jpg",
  "notes": "Ink smudge on front print"
}
```

### Close QC Inspection

```http
POST /api/v1/qc/inspections/{id}/close
Content-Type: application/json
Authorization: Bearer {token}

{
  "disposition": "PASSED"
}
```

**Response (200):**
```json
{
  "status": "PASSED",
  "ashley_analysis": {
    "quality_trend": "IMPROVING",
    "recommendations": [
      "Monitor ink viscosity more closely",
      "Retrain operator on print registration"
    ]
  }
}
```

## 📊 Analytics & Reporting

### Get Dashboard Metrics

```http
GET /api/v1/analytics/dashboard?period=7d
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "orders": {
    "total": 156,
    "by_status": {
      "IN_PROGRESS": 45,
      "COMPLETED": 98,
      "ON_HOLD": 13
    }
  },
  "production": {
    "efficiency_pct": 87.5,
    "on_time_delivery_pct": 94.2,
    "quality_pass_rate": 98.7
  },
  "capacity": {
    "utilization_pct": 82.3,
    "bottlenecks": ["PRINTING"]
  }
}
```

### Ashley AI Recommendations

```http
GET /api/v1/ashley/recommendations?context=production
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "recommendations": [
    {
      "type": "CAPACITY",
      "priority": "HIGH",
      "title": "Printing Bottleneck Detected",
      "description": "Printing capacity at 105% for next week",
      "actions": [
        "Add overtime shift on Tuesday/Wednesday",
        "Consider outsourcing 2 jobs to Partner A"
      ],
      "estimated_impact": {
        "time_saved_hours": 16,
        "cost_impact_php": -12500
      }
    }
  ]
}
```

## 🚨 Error Handling

All API endpoints return standardized error responses:

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Size curve quantities must sum to total quantity",
    "details": {
      "field": "size_curve",
      "expected": 450,
      "actual": 445
    },
    "trace_id": "trace-uuid"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or expired token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## 📈 Rate Limits

- **General API**: 1000 requests per hour per workspace
- **File Upload**: 100 uploads per hour per workspace
- **Webhooks**: 10,000 events per hour per workspace

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 997
X-RateLimit-Reset: 1642694400
```

## 🔗 Webhooks

ASH AI can send webhooks for key events:

### Webhook Payload

```json
{
  "event": "order.status.changed",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "workspace_id": "workspace-uuid",
  "data": {
    "order_id": "order-uuid",
    "po_number": "REEF-2025-000123",
    "old_status": "IN_PROGRESS",
    "new_status": "QC",
    "changed_by": "user-uuid"
  }
}
```

### Available Events

- `order.created`
- `order.status.changed`
- `design.approved`
- `qc.failed`
- `delivery.completed`
- `ashley.alert.triggered`

---

## 📞 Support

For API questions and support:

- **Documentation**: https://docs.ash-ai.com/api
- **Support**: support@ash-ai.com
- **Status Page**: https://status.ash-ai.com