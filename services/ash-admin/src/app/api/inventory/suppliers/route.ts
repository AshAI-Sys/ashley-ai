import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";
import { createErrorResponse } from "@/lib/error-sanitization";

// Force dynamic route
export const dynamic = "force-dynamic";

/**
 * GET /api/inventory/suppliers
 * Fetch all suppliers for the authenticated user's workspace
 *
 * SECURITY: Requires authentication - workspace isolation enforced
 */
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const workspace_id = user.workspaceId; // Use authenticated workspace ID
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    const where: any = { workspace_id };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { supplier_code: { contains: search } },
        { contact_person: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (status === "active") {
      where.is_active = true;
    } else if (status === "inactive") {
      where.is_active = false;
    }

    // Fetch suppliers with pagination
    const [suppliers, totalCount] = await Promise.all([
      prisma.supplier.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { purchase_orders: true },
          },
        },
      }),
      prisma.supplier.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      suppliers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    return createErrorResponse(error, 500, {
      userId: user.id,
      path: request.url,
    });
  }
});

/**
 * POST /api/inventory/suppliers
 * Create new supplier in the authenticated user's workspace
 *
 * SECURITY: Requires authentication - workspace isolation enforced
 */
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const workspace_id = user.workspaceId; // Use authenticated workspace ID
    const body = await request.json();

    const {
      supplier_code,
      name,
      contact_person,
      email,
      phone,
      address,
      city,
      country,
      payment_terms,
      currency,
      tax_id,
      notes,
    } = body;

    // Validation
    if (!supplier_code || !name) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: supplier_code, name",
        },
        { status: 400 }
      );
    }

    // Check if supplier_code already exists
    const existing = await prisma.supplier.findFirst({
      where: {
        workspace_id,
        supplier_code,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `Supplier with code "${supplier_code}" already exists`,
        },
        { status: 409 }
      );
    }

    // Create supplier
    const supplier = await prisma.supplier.create({
      data: {
        workspace_id,
        supplier_code,
        name,
        contact_person: contact_person || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        country: country || "Philippines",
        payment_terms: payment_terms || null,
        currency: currency || "PHP",
        tax_id: tax_id || null,
        notes: notes || null,
        is_active: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Supplier created successfully",
      supplier,
    });
  } catch (error) {
    return createErrorResponse(error, 500, {
      userId: user.id,
      path: request.url,
    });
  }
});
