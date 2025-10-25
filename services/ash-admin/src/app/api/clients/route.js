"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const database_1 = require("@/lib/database");
const zod_1 = require("zod");
const auth_middleware_1 = require("@/lib/auth-middleware");
const prisma = database_1.db;
const CreateClientSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Client name is required"),
    company: zod_1.z.string().optional(), // Accept company field from form
    contact_person: zod_1.z.string().optional(),
    email: zod_1.z
        .string()
        .email("Valid email is required")
        .optional()
        .or(zod_1.z.literal("")),
    phone: zod_1.z.string().optional(),
    address: zod_1.z
        .union([
        zod_1.z.string(),
        zod_1.z.object({
            street: zod_1.z.string().optional(),
            city: zod_1.z.string().optional(),
            state: zod_1.z.string().optional(),
            postal_code: zod_1.z.string().optional(),
            country: zod_1.z.string().optional(),
        }),
    ])
        .optional(),
    tax_id: zod_1.z.string().optional(),
    payment_terms: zod_1.z.number().optional(),
    credit_limit: zod_1.z.number().optional(),
    is_active: zod_1.z.boolean().default(true),
});
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const workspaceId = user.workspaceId;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search") || "";
        const is_active = searchParams.get("is_active");
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {
            workspace_id: workspaceId,
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { contact_person: { contains: search, mode: "insensitive" } },
            ];
        }
        if (is_active !== null && is_active !== undefined) {
            where.is_active = is_active === "true";
        }
        // Fetch clients with related data
        const [clients, total] = await Promise.all([
            prisma.client.findMany({
                where,
                skip,
                take: limit,
                include: {
                    brands: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    orders: {
                        select: {
                            id: true,
                            status: true,
                            total_amount: true,
                            created_at: true,
                        },
                        orderBy: { created_at: "desc" },
                        take: 5,
                    },
                    _count: {
                        select: {
                            orders: true,
                            brands: true,
                        },
                    },
                },
                orderBy: { created_at: "desc" },
            }),
            prisma.client.count({ where }),
        ]);
        return server_1.NextResponse.json({
            success: true,
            data: {
                clients,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    }
    catch (error) {
        console.error("Error fetching clients:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch clients" }, { status: 500 });
    }
});
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const workspaceId = user.workspaceId;
        const body = await request.json();
        const validatedData = CreateClientSchema.parse(body);
        // Ensure workspace exists (create if needed for demo mode)
        try {
            const workspaceExists = await prisma.workspace.findUnique({
                where: { id: workspaceId },
            });
            if (!workspaceExists) {
                console.log("Creating workspace:", workspaceId);
                await prisma.workspace.create({
                    data: {
                        id: workspaceId,
                        name: "Demo Workspace",
                        slug: workspaceId,
                    },
                });
                console.log("Workspace created successfully");
            }
        }
        catch (error) {
            console.error("Error with workspace:", error.message);
            return server_1.NextResponse.json({
                success: false,
                error: "Failed to setup workspace: " + error.message,
            }, { status: 500 });
        }
        // Convert address object to JSON string if it's an object
        const addressData = typeof validatedData.address === "object"
            ? JSON.stringify(validatedData.address)
            : validatedData.address;
        // Store company in portal_settings as metadata since there's no company field in schema
        const portalSettings = validatedData.company
            ? JSON.stringify({ company: validatedData.company })
            : null;
        // Create new client
        const newClient = await prisma.client.create({
            data: {
                workspace_id: workspaceId,
                name: validatedData.name,
                contact_person: validatedData.contact_person || "",
                email: validatedData.email || "",
                phone: validatedData.phone || "",
                address: addressData,
                tax_id: validatedData.tax_id || "",
                payment_terms: validatedData.payment_terms || null,
                credit_limit: validatedData.credit_limit || null,
                is_active: validatedData.is_active,
                portal_settings: portalSettings,
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
        return server_1.NextResponse.json({
            success: true,
            data: newClient,
            message: "Client created successfully",
        }, { status: 201 });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({
                success: false,
                error: "Validation failed",
                details: error.errors,
            }, { status: 400 });
        }
        console.error("Error creating client:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to create client" }, { status: 500 });
    }
});
