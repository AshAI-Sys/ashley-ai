/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-middleware";

const BundleConfigSchema = z.object({
  sizeCode: z.string().min(1, "Size code is required"),
  totalPieces: z.number().int().positive("Total pieces must be positive"),
  piecesPerBundle: z
    .number()
    .int()
    .positive("Pieces per bundle must be positive"),
      });

const CreateBundlesSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  cutLayId: z.string().min(1, "Cut lay ID is required"),
  bundleConfigs: z
    .array(BundleConfigSchema)
    .min(1, "At least one bundle configuration is required"),
      });

const UpdateBundleSchema = z.object({
  bundleId: z.string().min(1, "Bundle ID is required"),
  status: z.enum(["CREATED", "IN_SEWING", "DONE", "REJECTED"]),
  notes: z.string().optional(),
});

export const GET = requireAuth(async (request: NextRequest, _user) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const orderId = searchParams.get("orderId") || "";
    const cutLayId = searchParams.get("cutLayId") || "";
    const status = searchParams.get("status") || "";
    const sizeCode = searchParams.get("sizeCode") || "";

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        orderId ? { orderId } : {},
        cutLayId ? { cutLayId } : {},
        status ? { status } : {},
        sizeCode ? { sizeCode } : {},
      ],
    };

    const [bundles, total] = await Promise.all([
      prisma.bundle.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              order_number: true,
              client: {
                select: {
                  name: true,
                },
              },
              brand: {
                select: {
                  name: true,
                },
              },
            },
          },
          lay: {
            select: {
              id: true,
              marker_name: true,
              lay_length_m: true,
              plies: true,
            },
          },
          _count: {
            select: {
              sewing_runs: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.bundle.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        bundles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
  },
});
} catch (error) {
    console.error("Error fetching bundles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bundles" },
      { status: 500 }
    );
  }
})

export const POST = requireAuth(async (request: NextRequest, _user) => {
  try {
    const body = await request.json();
    const validatedData = CreateBundlesSchema.parse(body);

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: validatedData.orderId },
      });

    if (!order) {
      
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if cut lay exists
    const cutLay = await prisma.cutLay.findUnique({
      where: { id: validatedData.cutLayId },
      });

    if (!cutLay) {
      
      return NextResponse.json(
        { success: false, error: "Cut lay not found" },
        { status: 404 }
      );
    }
    const createdBundles: any[] = [];

    // Create bundles in a transaction
    await prisma.$transaction(async tx => {
      for (const config of validatedData.bundleConfigs) {
        const bundlesCount = Math.ceil(
          config.totalPieces / config.piecesPerBundle
        );

        for (let bundleNum = 1; bundleNum <= bundlesCount; bundleNum++) {
          const remainingPieces =
            config.totalPieces - (bundleNum - 1) * config.piecesPerBundle;
          const currentBundlePieces = Math.min(
            config.piecesPerBundle,
            remainingPieces
          );

          const qrCode = generateQRCode(
            validatedData.orderId,
            validatedData.cutLayId,
            config.sizeCode,
            bundleNum
          );
          const ____bundleNumber = `${config.sizeCode}-${String(bundleNum).padStart(3, "0")}`;

          const bundle = await tx.bundle.create({
            data: {
              workspace_id: order.workspace_id,
              order_id: validatedData.orderId,
              lay_id: validatedData.cutLayId,
              size_code: config.sizeCode,
              qty: currentBundlePieces,
              qr_code: qrCode,
              status: "CREATED",
            },
            include: {
              order: {
                select: {
                  id: true,
                  order_number: true,
                  client: {
                    select: {
                      name: true,
                    },
                  },
                  brand: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              lay: {
                select: {
                  id: true,
                  marker_name: true,
                  lay_length_m: true,
                  plies: true,
                },
              },
            },
          });

          createdBundles.push(bundle);
        }
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: createdBundles,
        message: `Successfully created ${createdBundles.length} bundles`,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating bundles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create bundles" },
      { status: 500 }
    );
  }
});

function generateQRCode(
  orderId: string,
  layId: string,
  sizeCode: string,
  bundleNumber: number
): string {
  const timestamp = new Date().getTime();
  return `ASH-${orderId}-${layId}-${sizeCode}-${String(bundleNumber).padStart(3, "0")}-${timestamp}`;
}

export const PUT = requireAuth(async (request: NextRequest, _user) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      
      return NextResponse.json(
        { success: false, error: "Bundle ID is required" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const validatedData = UpdateBundleSchema.parse(body);

    // Check if bundle exists
    const existingBundle = await prisma.bundle.findUnique({
      where: { id },
      });

    if (!existingBundle) {
      
      return NextResponse.json(
        { success: false, error: "Bundle not found" },
        { status: 404 }
      );
    }
    const bundle = await prisma.bundle.update({
      where: { id },
      data: {
        status: validatedData.status,
        // notes field doesn't exist in Bundle model - removed
      },
      include: {
        order: {
          select: {
            id: true,
            order_number: true,
            client: {
              select: {
                name: true,
              },
            },
            brand: {
              select: {
                name: true,
              },
            },
          },
        },
        lay: {
          select: {
            id: true,
            marker_name: true,
            lay_length_m: true,
            plies: true,
          },
        },
      },
    

    });

    return NextResponse.json({
      success: true,
      data: bundle,
      message: "Bundle updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating bundle:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update bundle" },
      { status: 500 }
    );
  }
});