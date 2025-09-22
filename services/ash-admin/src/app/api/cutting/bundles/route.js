"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
const server_1 = require("next/server");
// Mock data - In production, this would use Prisma to interact with the database
const mockBundles = [];
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const order_id = searchParams.get('order_id');
        const lay_id = searchParams.get('lay_id');
        const status = searchParams.get('status');
        const size_code = searchParams.get('size_code');
        let filteredBundles = [...mockBundles];
        // Filter by order if specified
        if (order_id) {
            filteredBundles = filteredBundles.filter(bundle => bundle.order_id === order_id);
        }
        // Filter by lay if specified
        if (lay_id) {
            filteredBundles = filteredBundles.filter(bundle => bundle.lay_id === lay_id);
        }
        // Filter by status if specified
        if (status) {
            filteredBundles = filteredBundles.filter(bundle => bundle.status === status);
        }
        // Filter by size if specified
        if (size_code) {
            filteredBundles = filteredBundles.filter(bundle => bundle.size_code === size_code);
        }
        // Sort by creation date (newest first)
        filteredBundles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        // Calculate summary statistics
        const summary = {
            total_bundles: filteredBundles.length,
            total_pieces: filteredBundles.reduce((sum, bundle) => sum + bundle.qty, 0),
            status_breakdown: filteredBundles.reduce((acc, bundle) => {
                acc[bundle.status] = (acc[bundle.status] || 0) + 1;
                return acc;
            }, {}),
            size_breakdown: filteredBundles.reduce((acc, bundle) => {
                acc[bundle.size_code] = (acc[bundle.size_code] || 0) + bundle.qty;
                return acc;
            }, {})
        };
        return server_1.NextResponse.json({
            success: true,
            data: filteredBundles,
            summary,
            total: filteredBundles.length
        });
    }
    catch (error) {
        console.error('Error fetching bundles:', error);
        return server_1.NextResponse.json({
            success: false,
            error: 'Failed to fetch bundles',
            data: []
        }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        // Validate required fields for batch bundle creation
        const requiredFields = ['order_id', 'lay_id', 'bundle_configs'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return server_1.NextResponse.json({
                    success: false,
                    error: `Missing required field: ${field}`
                }, { status: 400 });
            }
        }
        // Validate bundle configs array
        if (!Array.isArray(body.bundle_configs) || body.bundle_configs.length === 0) {
            return server_1.NextResponse.json({
                success: false,
                error: 'At least one bundle configuration is required'
            }, { status: 400 });
        }
        const createdBundles = [];
        const bundleAnalysis = {
            total_bundles_created: 0,
            total_pieces: 0,
            size_distribution: {},
            ashley_insights: {
                optimal_bundle_sizes: true,
                tracking_efficiency: 95,
                sewing_workflow_ready: true,
                recommendations: []
            }
        };
        // Process each size configuration
        for (const config of body.bundle_configs) {
            // Validate individual config
            if (!config.size_code || !config.total_pieces || !config.pieces_per_bundle) {
                return server_1.NextResponse.json({
                    success: false,
                    error: `Invalid bundle configuration for size: ${config.size_code || 'Unknown'}`
                }, { status: 400 });
            }
            const sizeCode = config.size_code;
            const totalPieces = parseInt(config.total_pieces);
            const piecesPerBundle = parseInt(config.pieces_per_bundle);
            const bundlesCount = Math.ceil(totalPieces / piecesPerBundle);
            // Create bundles for this size
            for (let bundleNum = 1; bundleNum <= bundlesCount; bundleNum++) {
                const remainingPieces = totalPieces - ((bundleNum - 1) * piecesPerBundle);
                const currentBundlePieces = Math.min(piecesPerBundle, remainingPieces);
                const qrCode = generateQRCode(body.order_id, body.lay_id, sizeCode, bundleNum);
                const bundle = {
                    id: `BUN-${Date.now()}-${bundleNum}`,
                    workspace_id: 'ws_1', // Would come from auth context
                    order_id: body.order_id,
                    lay_id: body.lay_id,
                    size_code: sizeCode,
                    qty: currentBundlePieces,
                    qr_code: qrCode,
                    status: 'CREATED',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    // Metadata
                    bundle_number: bundleNum,
                    total_bundles_for_size: bundlesCount,
                    // Related data that would be fetched in production
                    order: {
                        order_number: 'TCAS-2025-000001',
                        brand: { name: 'Trendy Casual', code: 'TCAS' }
                    },
                    lay: {
                        marker_name: 'Hoodie Marker V2',
                        created_at: new Date().toISOString()
                    }
                };
                createdBundles.push(bundle);
                mockBundles.push(bundle);
            }
            // Update analysis
            bundleAnalysis.total_bundles_created += bundlesCount;
            bundleAnalysis.total_pieces += totalPieces;
            bundleAnalysis.size_distribution[sizeCode] = bundlesCount;
        }
        // Generate Ashley AI recommendations
        const avgBundleSize = bundleAnalysis.total_pieces / bundleAnalysis.total_bundles_created;
        if (avgBundleSize < 15) {
            bundleAnalysis.ashley_insights.recommendations.push('Small bundle sizes may reduce sewing line efficiency');
        }
        else if (avgBundleSize > 25) {
            bundleAnalysis.ashley_insights.recommendations.push('Large bundle sizes may cause workflow bottlenecks');
        }
        else {
            bundleAnalysis.ashley_insights.recommendations.push('Optimal bundle sizes for efficient sewing workflow');
        }
        if (bundleAnalysis.total_bundles_created > 50) {
            bundleAnalysis.ashley_insights.recommendations.push('Large number of bundles - consider batch processing in sewing');
        }
        bundleAnalysis.ashley_insights.recommendations.push(`${bundleAnalysis.total_bundles_created} QR codes generated for full traceability`);
        bundleAnalysis.ashley_insights.recommendations.push('Bundles ready for dispatch to sewing floor');
        // In production, you would also:
        // 1. Create Bundle records using Prisma
        // 2. Generate physical QR code images
        // 3. Create bundle labels for printing
        // 4. Update production workflow status
        // 5. Trigger notifications to sewing department
        return server_1.NextResponse.json({
            success: true,
            data: createdBundles,
            analysis: bundleAnalysis,
            message: `Successfully created ${bundleAnalysis.total_bundles_created} bundles with ${bundleAnalysis.total_pieces} total pieces`,
            next_steps: {
                print_labels: true,
                send_to_sewing: true,
                track_progress: true
            }
        });
    }
    catch (error) {
        console.error('Error creating bundles:', error);
        return server_1.NextResponse.json({
            success: false,
            error: 'Failed to create bundles'
        }, { status: 500 });
    }
}
function generateQRCode(orderId, layId, sizeCode, bundleNumber) {
    const timestamp = new Date().getTime();
    return `ASH-${orderId}-${layId}-${sizeCode}-${String(bundleNumber).padStart(3, '0')}-${timestamp}`;
}
// PUT endpoint for updating bundle status
async function PUT(request) {
    try {
        const body = await request.json();
        if (!body.bundle_id || !body.status) {
            return server_1.NextResponse.json({
                success: false,
                error: 'Bundle ID and status are required'
            }, { status: 400 });
        }
        // Validate status
        const validStatuses = ['CREATED', 'IN_SEWING', 'DONE', 'REJECTED'];
        if (!validStatuses.includes(body.status)) {
            return server_1.NextResponse.json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            }, { status: 400 });
        }
        // Find and update bundle in mock data
        const bundleIndex = mockBundles.findIndex(bundle => bundle.id === body.bundle_id);
        if (bundleIndex === -1) {
            return server_1.NextResponse.json({
                success: false,
                error: 'Bundle not found'
            }, { status: 404 });
        }
        const oldStatus = mockBundles[bundleIndex].status;
        mockBundles[bundleIndex].status = body.status;
        mockBundles[bundleIndex].updated_at = new Date().toISOString();
        if (body.notes) {
            mockBundles[bundleIndex].notes = body.notes;
        }
        // Add status history
        if (!mockBundles[bundleIndex].status_history) {
            mockBundles[bundleIndex].status_history = [];
        }
        mockBundles[bundleIndex].status_history.push({
            from_status: oldStatus,
            to_status: body.status,
            changed_by: 'current_user', // Would come from auth context
            changed_at: new Date().toISOString(),
            notes: body.notes
        });
        return server_1.NextResponse.json({
            success: true,
            data: mockBundles[bundleIndex],
            message: `Bundle status updated from ${oldStatus} to ${body.status}`
        });
    }
    catch (error) {
        console.error('Error updating bundle:', error);
        return server_1.NextResponse.json({
            success: false,
            error: 'Failed to update bundle'
        }, { status: 500 });
    }
}
