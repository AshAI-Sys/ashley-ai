/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

export const GET = requireAuth(async (request: NextRequest, _user) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const method = searchParams.get("method") || "";

    // Demo designs data - formatted to match frontend DesignAsset interface
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
            files:
              '{"logo": "/designs/manila-classic-logo-v3.png", "specs": "/designs/manila-classic-specs-v3.pdf"}',
            created_at: "2024-09-20T00:00:00Z",
          },
        ],
        approvals: [
          {
            id: "approval-1",
            status: "APPROVED",
            created_at: "2024-09-20T00:00:00Z",
            client: {
              name: "Manila Shirts Co.",
            },
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
            id: "version-2",
            version: 1,
            files:
              '{"embroidery": "/designs/cebu-polo-embroidery-v1.dst", "preview": "/designs/cebu-polo-preview-v1.jpg"}',
            created_at: "2024-09-22T00:00:00Z",
          },
        ],
        approvals: [],
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
            id: "version-3",
            version: 2,
            files:
              '{"graphics": "/designs/davao-hoodie-graphics-v2.ai", "mockup": "/designs/davao-hoodie-mockup-v2.jpg"}',
            created_at: "2024-09-25T00:00:00Z",
          },
        ],
        approvals: [
          {
            id: "approval-3",
            status: "REVISION_REQUESTED",
            created_at: "2024-09-24T00:00:00Z",
            client: {
              name: "Davao Apparel Co.",
            },
          },
        ],
        _count: {
          versions: 2,
          approvals: 1,
          checks: 3,
        },
      },
    ];

    // Apply filters
    let filteredDesigns = demoDesigns.filter(design => {
      let matches = true;

      if (search) {
        matches =
          matches &&
          (design.name.toLowerCase().includes(search.toLowerCase()) ||
            design.brand.name.toLowerCase().includes(search.toLowerCase()) ||
            design.order.order_number
              .toLowerCase()
              .includes(search.toLowerCase()));
      }

      if (status) {
        matches = matches && design.status === status;
      }

      if (method) {
        matches = matches && design.method === method;
      }

      return matches;
    });

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedDesigns = filteredDesigns.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: {
        designs: paginatedDesigns,
        pagination: {
          page,
          limit,
          total: filteredDesigns.length,
          totalPages: Math.ceil(filteredDesigns.length / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching designs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch designs" },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();

    // Create demo design response
    const newDesign = {
      id: `design-${Date.now()}`,
      ...body,
      version: 1,
      status: "DRAFT",
      approvalStatus: "PENDING_REVIEW",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(
      {
        success: true,
        data: { design: newDesign },
        message: "Design created successfully",
      },
      { status: 201 }
    );
  
  } catch (error) {
    console.error("Error creating design:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create design" },
      { status: 500 }
    );
  }
});
