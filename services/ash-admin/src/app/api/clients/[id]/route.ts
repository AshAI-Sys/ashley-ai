import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";
import { withAudit } from "@/lib/audit-middleware";
import { createErrorResponse } from '@/lib/error-sanitization';

const prisma = db;

// GET /api/clients/[id] - Get single client
export const GET = requireAuth(async (
  request: NextRequest,
  user,
  context?: { params: { id: string } }
) => {
  try {
    const workspaceId = user.workspaceId;
    const clientId = context?.params?.id;
    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "Client ID is required" },
        { status: 400 }
      );
    }

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        workspace_id: workspaceId,
      },
      include: {
        brands: {
          select: {
            id: true,
            name: true,
            code: true,
            is_active: true,
            created_at: true,
          },
          orderBy: { created_at: "desc" },
        },
        orders: {
          select: {
            id: true,
            order_number: true,
            status: true,
            total_amount: true,
            currency: true,
            delivery_date: true,
            created_at: true,
          },
          orderBy: { created_at: "desc" },
          take: 10,
        },
        _count: {
          select: {
            orders: true,
            brands: true,
          },
        },
      },
    });

    if (!client) {
      
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: client,
    });
  } catch (error) {
    return createErrorResponse(error, 500, {
      userId: user.id,
      path: request.url,
    });
  }
});

// PUT /api/clients/[id] - Update client
export const PUT = requireAuth(
  withAudit(
    async (request: NextRequest, user, context?: { params: { id: string } }) => {
      try {
        const clientId = context?.params?.id;
        if (!clientId) {
          return NextResponse.json(
            { success: false, error: "Client ID is required" },
            { status: 400 }
          );
        }

        const body = await request.json();

        // Convert address object to JSON string if it's an object
        const addressData =
          body.address && typeof body.address === "object"
            ? JSON.stringify(body.address)
            : body.address;

        const client = await prisma.client.update({
          where: { id: clientId },
          data: {
            name: body.name,
            contact_person: body.contact_person,
            email: body.email,
            phone: body.phone,
            address: addressData,
            tax_id: body.tax_id,
            payment_terms: body.payment_terms ? parseInt(body.payment_terms) : null,
            credit_limit: body.credit_limit ? parseFloat(body.credit_limit) : null,
            is_active: body.is_active !== undefined ? body.is_active : true,
          },
          include: {
            _count: {
              select: {
                orders: true,
                brands: true,
              },
            },
          },
        });

        return NextResponse.json({
          success: true,
          data: client,
          message: "Client updated successfully",
        });
      } catch (error) {
        return createErrorResponse(error, 500, {
          userId: user.id,
          path: request.url,
        });
      }
    },
    { resource: "client", action: "UPDATE" }
  )
);

// DELETE /api/clients/[id] - Delete client
export const DELETE = requireAuth(
  withAudit(
    async (request: NextRequest, user, context?: { params: { id: string } }) => {
      try {
        const clientId = context?.params?.id;
        if (!clientId) {
          return NextResponse.json(
            { success: false, error: "Client ID is required" },
            { status: 400 }
          );
        }

        await prisma.client.delete({
          where: { id: clientId },
        });

        return NextResponse.json({
          success: true,
          message: "Client deleted successfully",
        });
      } catch (error) {
        return createErrorResponse(error, 500, {
          userId: user.id,
          path: request.url,
        });
      }
    },
    { resource: "client", action: "DELETE" }
  )
);