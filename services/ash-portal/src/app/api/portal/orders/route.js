"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const database_1 = require("@ash-ai/database");
const jsonwebtoken_1 = require("jsonwebtoken");
const prisma = database_1.db;
async function getClientFromToken(request) {
    try {
        const token = request.cookies.get('portal-token')?.value;
        if (!token) {
            return null;
        }
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
        const payload = (0, jsonwebtoken_1.verify)(token, jwtSecret);
        return payload;
    }
    catch (error) {
        return null;
    }
}
async function GET(request) {
    try {
        const client = await getClientFromToken(request);
        if (!client) {
            return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const skip = (page - 1) * limit;
        // Build where condition
        const where = {
            workspace_id: client.workspaceId,
            client_id: client.clientId,
        };
        if (status) {
            where.status = status;
        }
        // Get orders with related data
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    brand: true,
                    line_items: true,
                    design_assets: {
                        include: {
                            design_approvals: true,
                        }
                    },
                    production_schedules: true,
                    bundles: {
                        include: {
                            cutting_run: true,
                            print_runs: true,
                            sewing_runs: true,
                        }
                    },
                    quality_control_checks: {
                        include: {
                            inspections: true,
                        }
                    },
                    finishing_runs: {
                        include: {
                            finished_units: {
                                include: {
                                    cartons: true,
                                }
                            }
                        }
                    },
                    shipments: {
                        include: {
                            deliveries: {
                                include: {
                                    tracking_events: {
                                        orderBy: { created_at: 'desc' }
                                    }
                                }
                            }
                        }
                    },
                    invoices: {
                        where: { status: { not: 'draft' } },
                        include: {
                            payments: true,
                        }
                    }
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            prisma.order.count({ where })
        ]);
        // Log activity
        await prisma.clientActivity.create({
            data: {
                workspace_id: client.workspaceId,
                client_id: client.clientId,
                activity_type: 'VIEW_ORDERS',
                description: `Viewed orders list (page ${page})`,
                ip_address: request.headers.get('x-forwarded-for') || 'unknown',
                user_agent: request.headers.get('user-agent') || 'unknown',
            }
        });
        // Transform orders to include progress tracking
        const transformedOrders = orders.map(order => {
            // Calculate production progress
            const totalSteps = 7; // Design → Cutting → Printing → Sewing → QC → Finishing → Delivery
            let completedSteps = 0;
            let currentStage = 'Order Placed';
            // Check each stage
            if (order.design_assets.some(asset => asset.design_approvals.some(approval => approval.status === 'approved'))) {
                completedSteps++;
                currentStage = 'Design Approved';
            }
            if (order.bundles.some(bundle => bundle.cutting_run)) {
                completedSteps++;
                currentStage = 'Cutting Complete';
            }
            if (order.bundles.some(bundle => bundle.print_runs.length > 0)) {
                completedSteps++;
                currentStage = 'Printing Complete';
            }
            if (order.bundles.some(bundle => bundle.sewing_runs.length > 0)) {
                completedSteps++;
                currentStage = 'Sewing Complete';
            }
            if (order.quality_control_checks.some(qc => qc.inspections.some(insp => insp.status === 'passed'))) {
                completedSteps++;
                currentStage = 'Quality Control Passed';
            }
            if (order.finishing_runs.some(run => run.finished_units.length > 0)) {
                completedSteps++;
                currentStage = 'Finishing Complete';
            }
            if (order.shipments.some(shipment => shipment.deliveries.some(delivery => delivery.status === 'delivered'))) {
                completedSteps++;
                currentStage = 'Delivered';
            }
            const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
            // Calculate payment status
            const totalInvoiced = order.invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
            const totalPaid = order.invoices.reduce((sum, inv) => sum + inv.payments.reduce((paySum, pay) => paySum + pay.amount, 0), 0);
            const paymentStatus = totalPaid >= totalInvoiced ? 'paid' : totalPaid > 0 ? 'partial' : 'pending';
            return {
                id: order.id,
                order_number: order.order_number,
                status: order.status,
                total_amount: order.total_amount,
                currency: order.currency,
                delivery_date: order.delivery_date,
                created_at: order.created_at,
                updated_at: order.updated_at,
                brand: order.brand,
                line_items: order.line_items,
                progress: {
                    percentage: progressPercentage,
                    current_stage: currentStage,
                    completed_steps: completedSteps,
                    total_steps: totalSteps,
                },
                payment: {
                    status: paymentStatus,
                    total_invoiced: totalInvoiced,
                    total_paid: totalPaid,
                    outstanding: totalInvoiced - totalPaid,
                },
                latest_tracking: order.shipments[0]?.deliveries[0]?.tracking_events[0] || null,
                needs_approval: order.design_assets.some(asset => asset.design_approvals.some(approval => approval.status === 'pending')),
            };
        });
        return server_1.NextResponse.json({
            orders: transformedOrders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        });
    }
    catch (error) {
        console.error('Orders fetch error:', error);
        return server_1.NextResponse.json({
            error: 'Failed to fetch orders'
        }, { status: 500 });
    }
}
