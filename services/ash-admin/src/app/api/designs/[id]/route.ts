/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';

// Demo designs data with full details
const demoDesigns = [
  {
    id: "design-1",
    name: "Manila Shirts Classic Logo",
    method: "SILKSCREEN",
    status: "APPROVED",
    current_version: 3,
    is_best_seller: true,
    created_at: "2024-09-15T00:00:00Z",
    updated_at: "2024-09-20T00:00:00Z",
    created_by: "user-1",
    order: {
      id: "order-1",
      order_number: "ORD-2024-001",
      status: "APPROVED",
    },
    brand: {
      id: "brand-1",
      name: "Manila Classic",
      code: "MNLC",
    },
    versions: [
      {
        id: "version-1",
        version: 3,
        files: '{"logo": "/designs/manila-classic-logo-v3.png", "specs": "/designs/manila-classic-specs-v3.pdf"}',
        placements: '{"front": {"x": 150, "y": 200, "width": 100, "height": 100}}',
        palette: '{"primary": "#FF0000", "secondary": "#0000FF"}',
        meta: '{"resolution": "300dpi", "format": "PNG"}',
        created_by: "user-1",
        created_at: "2024-09-20T00:00:00Z",
      },
      {
        id: "version-2",
        version: 2,
        files: '{"logo": "/designs/manila-classic-logo-v2.png"}',
        placements: '{"front": {"x": 150, "y": 200, "width": 100, "height": 100}}',
        palette: '{"primary": "#FF0000"}',
        meta: '{"resolution": "300dpi"}',
        created_by: "user-1",
        created_at: "2024-09-18T00:00:00Z",
      },
      {
        id: "version-3",
        version: 1,
        files: '{"logo": "/designs/manila-classic-logo-v1.png"}',
        placements: '{"front": {"x": 150, "y": 200, "width": 80, "height": 80}}',
        palette: '{"primary": "#CC0000"}',
        meta: '{"resolution": "150dpi"}',
        created_by: "user-1",
        created_at: "2024-09-15T00:00:00Z",
      },
    ],
    approvals: [
      {
        id: "approval-1",
        status: "APPROVED",
        version: 3,
        comments: "Looks great! Approved for production.",
        approver_name: "John Doe",
        approver_email: "john@manilashirts.com",
        created_at: "2024-09-20T00:00:00Z",
        client: {
          name: "Manila Shirts Co.",
        },
      },
    ],
    checks: [
      {
        id: "check-1",
        version: 3,
        method: "COLOR_ACCURACY",
        result: "PASS",
        issues: "[]",
        metrics: '{"accuracy": 98.5, "deltaE": 1.2}',
        created_at: "2024-09-20T00:00:00Z",
      },
      {
        id: "check-2",
        version: 3,
        method: "RESOLUTION",
        result: "PASS",
        issues: "[]",
        metrics: '{"dpi": 300, "quality": "HIGH"}',
        created_at: "2024-09-20T00:00:00Z",
      },
    ],
    _count: {
      versions: 3,
      approvals: 1,
      checks: 2,
    },
  },
  {
    id: "design-2",
    name: "Cebu Fashion Polo Design",
    method: "EMBROIDERY",
    status: "PENDING_APPROVAL",
    current_version: 1,
    is_best_seller: false,
    created_at: "2024-09-22T00:00:00Z",
    updated_at: "2024-09-22T00:00:00Z",
    created_by: "user-2",
    order: {
      id: "order-2",
      order_number: "ORD-2024-002",
      status: "PENDING_APPROVAL",
    },
    brand: {
      id: "brand-2",
      name: "Cebu Fashion",
      code: "CBFS",
    },
    versions: [
      {
        id: "version-4",
        version: 1,
        files: '{"embroidery": "/designs/cebu-polo-embroidery-v1.dst", "preview": "/designs/cebu-polo-preview-v1.jpg"}',
        placements: '{"chest_left": {"x": 50, "y": 100, "width": 60, "height": 40}}',
        palette: '{"thread1": "#FFD700", "thread2": "#000000"}',
        meta: '{"stitch_count": 15000, "format": "DST"}',
        created_by: "user-2",
        created_at: "2024-09-22T00:00:00Z",
      },
    ],
    approvals: [],
    checks: [
      {
        id: "check-3",
        version: 1,
        method: "STITCH_DENSITY",
        result: "PASS",
        issues: "[]",
        metrics: '{"density": 4.5, "quality": "GOOD"}',
        created_at: "2024-09-22T00:00:00Z",
      },
    ],
    _count: {
      versions: 1,
      approvals: 0,
      checks: 1,
    },
  },
  {
    id: "design-3",
    name: "Davao Hoodie Graphics",
    method: "DTF",
    status: "DRAFT",
    current_version: 2,
    is_best_seller: false,
    created_at: "2024-09-18T00:00:00Z",
    updated_at: "2024-09-25T00:00:00Z",
    created_by: "user-1",
    order: {
      id: "order-3",
      order_number: "ORD-2024-003",
      status: "DRAFT",
    },
    brand: {
      id: "brand-3",
      name: "Davao Graphics",
      code: "DVGR",
    },
    versions: [
      {
        id: "version-5",
        version: 2,
        files: '{"graphics": "/designs/davao-hoodie-graphics-v2.ai", "mockup": "/designs/davao-hoodie-mockup-v2.jpg"}',
        placements: '{"front": {"x": 100, "y": 150, "width": 200, "height": 250}, "back": {"x": 100, "y": 100, "width": 180, "height": 200}}',
        palette: '{"primary": "#00FF00", "secondary": "#FFFF00", "accent": "#FF00FF"}',
        meta: '{"resolution": "600dpi", "format": "AI", "layers": 5}',
        created_by: "user-1",
        created_at: "2024-09-25T00:00:00Z",
      },
      {
        id: "version-6",
        version: 1,
        files: '{"graphics": "/designs/davao-hoodie-graphics-v1.ai"}',
        placements: '{"front": {"x": 100, "y": 150, "width": 180, "height": 230}}',
        palette: '{"primary": "#00FF00", "secondary": "#FFFF00"}',
        meta: '{"resolution": "300dpi", "format": "AI"}',
        created_by: "user-1",
        created_at: "2024-09-18T00:00:00Z",
      },
    ],
    approvals: [
      {
        id: "approval-2",
        status: "REVISION_REQUESTED",
        version: 1,
        comments: "Please adjust the color scheme and increase the size.",
        approver_name: "Jane Smith",
        approver_email: "jane@davaoapparel.com",
        created_at: "2024-09-24T00:00:00Z",
        client: {
          name: "Davao Apparel Co.",
        },
      },
    ],
    checks: [
      {
        id: "check-4",
        version: 2,
        method: "COLOR_ACCURACY",
        result: "PASS",
        issues: "[]",
        metrics: '{"accuracy": 95.2, "deltaE": 2.8}',
        created_at: "2024-09-25T00:00:00Z",
      },
      {
        id: "check-5",
        version: 2,
        method: "RESOLUTION",
        result: "PASS",
        issues: "[]",
        metrics: '{"dpi": 600, "quality": "EXCELLENT"}',
        created_at: "2024-09-25T00:00:00Z",
      },
      {
        id: "check-6",
        version: 1,
        method: "RESOLUTION",
        result: "WARNING",
        issues: '[{"type": "LOW_DPI", "message": "Resolution could be higher"}]',
        metrics: '{"dpi": 300, "quality": "MEDIUM"}',
        created_at: "2024-09-18T00:00:00Z",
      },
    ],
    _count: {
      versions: 2,
      approvals: 1,
      checks: 3,
    },
  },
];

// GET /api/designs/[id] - Get single design by ID
export const GET = requireAuth(async (request: NextRequest, _user, context) => {
  try {
    const id = context?.params?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Design ID is required" },
        { status: 400 }
      );
    }

    // Find the design by ID
    const design = demoDesigns.find(d => d.id === id);

    if (!design) {
      return NextResponse.json(
        { success: false, error: "Design not found" },
        { status: 404 }
      );
    }

    // Parse include query parameter
    const { searchParams } = new URL(request.url);
    const includeParam = searchParams.get("include") || "";
    const includes = includeParam.split(",").map(i => i.trim());

    // Build response with requested includes
    const response: any = {
      id: design.id,
      name: design.name,
      method: design.method,
      status: design.status,
      current_version: design.current_version,
      is_best_seller: design.is_best_seller,
      created_at: design.created_at,
      updated_at: design.updated_at,
      created_by: design.created_by,
      _count: design._count,
    };

    // Add relationships if requested
    if (includes.includes("order") || includeParam === "") {
      response.order = design.order;
    }

    if (includes.includes("brand") || includeParam === "") {
      response.brand = design.brand;
    }

    if (includes.includes("versions") || includeParam === "") {
      response.versions = design.versions;
    }

    if (includes.includes("approvals") || includeParam === "") {
      response.approvals = design.approvals;
    }

    if (includes.includes("checks") || includeParam === "") {
      response.checks = design.checks;
    }

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching design:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch design" },
      { status: 500 }
    );
  }
});

// PUT /api/designs/[id] - Update design
export const PUT = requireAuth(async (request: NextRequest, _user, context) => {
  try {
    const id = context?.params?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Design ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Find the design by ID
    const design = demoDesigns.find(d => d.id === id);

    if (!design) {
      return NextResponse.json(
        { success: false, error: "Design not found" },
        { status: 404 }
      );
    }

    // Return success response (in production, this would update the database)
    return NextResponse.json({
      success: true,
      data: {
        ...design,
        ...body,
        updated_at: new Date().toISOString(),
      },
      message: "Design updated successfully",
    });
  } catch (error) {
    console.error("Error updating design:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update design" },
      { status: 500 }
    );
  }
});

// DELETE /api/designs/[id] - Delete design
export const DELETE = requireAuth(async (request: NextRequest, _user, context) => {
  try {
    const id = context?.params?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Design ID is required" },
        { status: 400 }
      );
    }

    // Find the design by ID
    const design = demoDesigns.find(d => d.id === id);

    if (!design) {
      return NextResponse.json(
        { success: false, error: "Design not found" },
        { status: 404 }
      );
    }

    // Return success response (in production, this would delete from database)
    return NextResponse.json({
      success: true,
      message: "Design deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting design:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete design" },
      { status: 500 }
    );
  }
});
