"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const database_1 = require("@ash/database");
const shared_1 = require("@ash/shared");
async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    try {
        const { orderNumber, clientId } = req.query;
        if (!orderNumber || !clientId) {
            return res.status(400).json({ success: false, error: 'Order number and client ID required' });
        }
        // Get order with complete tracking information - cast to any to handle complex Prisma types
        const order = await database_1.prisma.order.findFirst({
            where: {
                order_number: orderNumber,
                client_id: clientId
            },
            include: {
                client: { select: { name: true } },
                brand: { select: { name: true } },
                line_items: true,
                bundles: {
                    include: {
                        cut_outputs: true,
                        print_outputs: true,
                        sewing_runs: {
                            orderBy: { created_at: 'asc' }
                        },
                        qc_inspections: {
                            orderBy: { created_at: 'desc' }
                        }
                    }
                },
                design_assets: {
                    where: { is_approved: true },
                    orderBy: { version: 'desc' }
                }
            }
        });
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        // Calculate overall progress - handle undefined bundles
        const bundles = order.bundles || [];
        const totalSteps = bundles.reduce((sum, bundle) => sum + (bundle.sewing_runs?.length || 0), 0);
        const completedSteps = bundles.reduce((sum, bundle) => sum + (bundle.sewing_runs?.filter((step) => step.status === 'completed')?.length || 0), 0);
        const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
        // Build timeline with real-time status
        const timeline = [];
        // Order confirmation
        timeline.push({
            stage: 'Order Confirmed',
            status: 'completed',
            timestamp: new Date(order.created_at).toISOString(),
            description: `Order ${order.order_number} confirmed for ${order.total_amount.toLocaleString()} pieces`,
            icon: '📋'
        });
        // Design approval - handle undefined design_assets
        const designAssets = order.design_assets || [];
        if (designAssets.length > 0) {
            timeline.push({
                stage: 'Design Approved',
                status: 'completed',
                timestamp: new Date(designAssets[0].approved_at || order.created_at).toISOString(),
                description: `${designAssets.length} design(s) approved and ready for production`,
                icon: '🎨'
            });
        }
        // Production stages for each bundle - handle undefined bundles
        bundles.forEach((bundle, bundleIndex) => {
            const bundlePrefix = bundles.length > 1 ? `Bundle ${bundleIndex + 1}: ` : '';
            // Cutting stage - handle cut_outputs
            const cutOutputs = bundle.cut_outputs || [];
            if (cutOutputs.length > 0) {
                const latestCut = cutOutputs[cutOutputs.length - 1];
                timeline.push({
                    stage: `${bundlePrefix}Cutting`,
                    status: 'completed', // Cut outputs only exist when cutting is done
                    timestamp: new Date(latestCut.created_at).toISOString(),
                    description: `${latestCut.pieces_cut} pieces cut successfully`,
                    icon: '✂️',
                    details: {
                        pieces_cut: latestCut.pieces_cut,
                        wastage: latestCut.wastage ? `${latestCut.wastage}%` : null,
                        notes: latestCut.notes
                    }
                });
            }
            // Printing stages - handle print_outputs
            const printOutputs = bundle.print_outputs || [];
            printOutputs.forEach((printOutput) => {
                timeline.push({
                    stage: `${bundlePrefix}Printing`,
                    status: 'completed', // Print outputs only exist when printing is done
                    timestamp: new Date(printOutput.created_at).toISOString(),
                    description: `${printOutput.pieces_printed || 'Unknown'} pieces printed`,
                    icon: '🖨️',
                    details: {
                        pieces_printed: printOutput.pieces_printed,
                        quality_score: printOutput.quality_score,
                        notes: printOutput.notes
                    }
                });
            });
            // Sewing and finishing stages - handle sewing_runs
            const sewingRuns = bundle.sewing_runs || [];
            sewingRuns.forEach((sewingRun) => {
                timeline.push({
                    stage: `${bundlePrefix}Sewing`,
                    status: sewingRun.status || 'completed',
                    timestamp: new Date(sewingRun.completed_at || sewingRun.started_at || sewingRun.created_at).toISOString(),
                    description: sewingRun.status === 'completed'
                        ? `Sewing completed - ${sewingRun.pieces_completed || 0} pieces finished`
                        : `Sewing in progress - ${sewingRun.pieces_completed || 0} pieces completed`,
                    icon: '🪡',
                    details: {
                        pieces_completed: sewingRun.pieces_completed,
                        efficiency: sewingRun.efficiency,
                        operator: sewingRun.assigned_operator,
                        machine: sewingRun.machine_id
                    }
                });
            });
            // Quality checks - handle qc_inspections
            const qcInspections = bundle.qc_inspections || [];
            qcInspections.forEach((qc) => {
                timeline.push({
                    stage: `${bundlePrefix}Quality Check`,
                    status: qc.status === 'passed' ? 'completed' : 'failed',
                    timestamp: new Date(qc.created_at).toISOString(),
                    description: qc.status === 'passed'
                        ? `Quality check passed - ${qc.inspection_type} inspection approved`
                        : `Quality issue detected in ${qc.inspection_type} inspection: ${qc.notes}`,
                    icon: qc.status === 'passed' ? '✅' : '❌',
                    details: {
                        inspection_type: qc.inspection_type,
                        notes: qc.notes,
                        inspector: qc.inspector_id,
                        defects_found: qc.defects_found
                    }
                });
            });
        });
        // Sort timeline by timestamp
        timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        // Estimate completion date
        const estimatedCompletion = calculateEstimatedCompletion(order);
        // Get real-time updates (recent activity)
        const recentUpdates = timeline
            .filter(item => {
            const hoursSinceUpdate = (Date.now() - new Date(item.timestamp).getTime()) / (1000 * 60 * 60);
            return hoursSinceUpdate <= 24; // Last 24 hours
        })
            .slice(-5); // Last 5 updates
        const response = {
            order: {
                order_number: order.order_number || '',
                client: order.client || { name: '' },
                brand: order.brand?.name || '',
                status: order.status || '',
                total_amount: order.total_amount || 0,
                delivery_date: order.delivery_date || new Date().toISOString(),
                created_at: order.created_at ? new Date(order.created_at).toISOString() : new Date().toISOString(),
                line_items: (order.line_items || []).map((item) => ({
                    description: item.description || '',
                    quantity: item.quantity || 0,
                    garment_type: item.garment_type || '',
                    printing_method: item.printing_method || '',
                    size_breakdown: item.size_breakdown ? JSON.parse(item.size_breakdown) : null
                }))
            },
            timeline,
            current_status: getCurrentStatus(timeline),
            progress_percentage: progressPercentage,
            estimated_completion: estimatedCompletion,
            real_time_updates: recentUpdates
        };
        res.json({ success: true, data: response });
    }
    catch (error) {
        shared_1.logger.error('Order tracking error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch order tracking information' });
    }
}
function getCurrentStatus(timeline) {
    const inProgress = timeline.find(item => item.status === 'in_progress');
    if (inProgress)
        return `Currently: ${inProgress.stage}`;
    const completed = timeline.filter(item => item.status === 'completed');
    if (completed.length === timeline.length)
        return 'Order Completed';
    const lastCompleted = completed[completed.length - 1];
    return lastCompleted ? `Last completed: ${lastCompleted.stage}` : 'Order Processing';
}
function calculateEstimatedCompletion(order) {
    try {
        // Simple estimation based on remaining steps and average completion time
        const bundles = order.bundles || [];
        const totalSteps = bundles.reduce((sum, bundle) => sum + (bundle.sewing_runs?.length || 0), 0);
        const completedSteps = bundles.reduce((sum, bundle) => sum + (bundle.sewing_runs?.filter((step) => step.status === 'completed')?.length || 0), 0);
        const remainingSteps = totalSteps - completedSteps;
        if (remainingSteps === 0)
            return new Date().toISOString();
        // Average 1 day per step (simplified)
        const estimatedDays = remainingSteps * 1;
        const completionDate = new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000);
        return completionDate.toISOString();
    }
    catch (error) {
        // Fallback to delivery date
        return order.delivery_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }
}
