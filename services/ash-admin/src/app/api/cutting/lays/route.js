"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
// Mock data - In production, this would use Prisma to interact with the database
const mockCutLays = [];
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const order_id = searchParams.get('order_id');
        const status = searchParams.get('status');
        const start_date = searchParams.get('start_date');
        const end_date = searchParams.get('end_date');
        let filteredLays = [...mockCutLays];
        // Filter by order if specified
        if (order_id) {
            filteredLays = filteredLays.filter(lay => lay.order_id === order_id);
        }
        // Filter by status if specified
        if (status) {
            filteredLays = filteredLays.filter(lay => lay.status === status);
        }
        // Filter by date range
        if (start_date) {
            filteredLays = filteredLays.filter(lay => new Date(lay.created_at) >= new Date(start_date));
        }
        if (end_date) {
            filteredLays = filteredLays.filter(lay => new Date(lay.created_at) <= new Date(end_date));
        }
        // Sort by creation date (newest first)
        filteredLays.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return server_1.NextResponse.json({
            success: true,
            data: filteredLays,
            total: filteredLays.length
        });
    }
    catch (error) {
        console.error('Error fetching cut lays:', error);
        return server_1.NextResponse.json({
            success: false,
            error: 'Failed to fetch cut lays',
            data: []
        }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        // Validate required fields
        const requiredFields = ['order_id', 'lay_length_m', 'plies', 'gross_used', 'uom', 'outputs'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return server_1.NextResponse.json({
                    success: false,
                    error: `Missing required field: ${field}`
                }, { status: 400 });
            }
        }
        // Validate numeric fields
        const numericFields = {
            lay_length_m: 'Lay length',
            plies: 'Number of plies',
            gross_used: 'Gross fabric used'
        };
        for (const [field, label] of Object.entries(numericFields)) {
            if (body[field] <= 0) {
                return server_1.NextResponse.json({
                    success: false,
                    error: `${label} must be greater than 0`
                }, { status: 400 });
            }
        }
        // Validate UOM
        if (!['KG', 'M'].includes(body.uom)) {
            return server_1.NextResponse.json({
                success: false,
                error: 'Invalid UOM. Must be KG or M'
            }, { status: 400 });
        }
        // Validate outputs array
        if (!Array.isArray(body.outputs) || body.outputs.length === 0) {
            return server_1.NextResponse.json({
                success: false,
                error: 'At least one size output is required'
            }, { status: 400 });
        }
        // Validate each output
        for (let i = 0; i < body.outputs.length; i++) {
            const output = body.outputs[i];
            if (!output.size_code || !output.size_code.trim()) {
                return server_1.NextResponse.json({
                    success: false,
                    error: `Size code is required for output ${i + 1}`
                }, { status: 400 });
            }
            if (!output.qty || output.qty <= 0) {
                return server_1.NextResponse.json({
                    success: false,
                    error: `Quantity must be greater than 0 for size ${output.size_code}`
                }, { status: 400 });
            }
        }
        // Calculate Ashley AI metrics
        const ashleyAnalysis = calculateAshleyAnalysis(body);
        // Create new cut lay record
        const newCutLay = {
            id: `LAY-${Date.now()}`,
            workspace_id: 'ws_1', // Would come from auth context
            order_id: body.order_id,
            marker_name: body.marker_name || null,
            marker_width_cm: body.marker_width_cm || null,
            lay_length_m: parseFloat(body.lay_length_m),
            plies: parseInt(body.plies),
            gross_used: parseFloat(body.gross_used),
            offcuts: parseFloat(body.offcuts) || 0,
            defects: parseFloat(body.defects) || 0,
            uom: body.uom,
            created_by: body.created_by || 'current_user', // Would come from auth context
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'COMPLETED',
            // Related data that would be fetched in production
            order: {
                order_number: 'TCAS-2025-000001',
                brand: { name: 'Trendy Casual', code: 'TCAS' }
            },
            // Process outputs
            outputs: body.outputs.map((output) => ({
                id: `OUT-${Date.now()}-${output.size_code}`,
                cut_lay_id: `LAY-${Date.now()}`,
                size_code: output.size_code,
                qty: parseInt(output.qty),
                created_at: new Date().toISOString()
            })),
            // Ashley AI analysis
            ashley_analysis: ashleyAnalysis
        };
        // Add to mock data
        mockCutLays.push(newCutLay);
        // In production, you would also:
        // 1. Create CutLay record using Prisma
        // 2. Create CutOutput records for each size
        // 3. Update material consumption tracking
        // 4. Trigger bundle creation workflow if configured
        // 5. Generate efficiency reports
        return server_1.NextResponse.json({
            success: true,
            data: newCutLay,
            message: 'Cut lay created successfully',
            ashley_insights: ashleyAnalysis,
            next_steps: {
                create_bundles: true,
                bundle_url: `/cutting/${newCutLay.id}/bundles`,
                estimated_bundles: calculateEstimatedBundles(body.outputs)
            }
        });
    }
    catch (error) {
        console.error('Error creating cut lay:', error);
        return server_1.NextResponse.json({
            success: false,
            error: 'Failed to create cut lay'
        }, { status: 500 });
    }
}
function calculateAshleyAnalysis(layData) {
    const totalPieces = layData.outputs.reduce((sum, output) => sum + parseInt(output.qty), 0);
    const wasteAmount = (parseFloat(layData.offcuts) || 0) + (parseFloat(layData.defects) || 0);
    const netUsed = parseFloat(layData.gross_used) - wasteAmount;
    // Calculate efficiency metrics
    const materialEfficiency = Math.round((netUsed / parseFloat(layData.gross_used)) * 100 * 10) / 10;
    const wastePercentage = Math.round((wasteAmount / parseFloat(layData.gross_used)) * 100 * 10) / 10;
    // Estimate marker efficiency (simplified calculation)
    const markerArea = (layData.marker_width_cm || 160) * parseFloat(layData.lay_length_m) * 100; // cm²
    const estimatedPatternArea = totalPieces * 2500; // 2500 cm² per average garment
    const markerEfficiency = Math.min(100, Math.round((estimatedPatternArea / markerArea) * 100 * 10) / 10);
    // Calculate cutting speed (pieces per hour estimate)
    const estimatedCuttingTime = (totalPieces * 0.12) / 60; // 0.12 minutes per piece
    const cuttingSpeed = Math.round((totalPieces / Math.max(estimatedCuttingTime, 0.1)) * 10) / 10;
    // Generate recommendations
    const recommendations = [];
    const riskFactors = [];
    if (markerEfficiency < 75) {
        recommendations.push('Consider optimizing marker layout - efficiency below 75%');
        riskFactors.push('Low marker efficiency');
    }
    if (wastePercentage > 8) {
        recommendations.push('High waste detected - review cutting precision and fabric handling');
        riskFactors.push('High waste percentage');
    }
    if (materialEfficiency < 88) {
        recommendations.push('Material efficiency below target - check for process improvements');
        riskFactors.push('Low material efficiency');
    }
    if (layData.plies > 15) {
        recommendations.push('High ply count - monitor cutting accuracy and blade sharpness');
        riskFactors.push('High ply count');
    }
    if (recommendations.length === 0) {
        recommendations.push('Excellent cutting performance - all metrics within target ranges');
    }
    // Overall Ashley AI score
    const ashleyScore = Math.round((markerEfficiency * 0.4) +
        (materialEfficiency * 0.3) +
        (Math.min(100, cuttingSpeed * 3) * 0.2) +
        (Math.max(0, 100 - wastePercentage * 10) * 0.1));
    return {
        efficiency_metrics: {
            marker_efficiency: markerEfficiency,
            material_efficiency: materialEfficiency,
            waste_percentage: wastePercentage,
            cutting_speed: cuttingSpeed,
            total_pieces: totalPieces,
            ashley_score: Math.max(0, Math.min(100, ashleyScore))
        },
        recommendations,
        risk_factors: riskFactors,
        performance_level: ashleyScore >= 90 ? 'Excellent' :
            ashleyScore >= 80 ? 'Good' :
                ashleyScore >= 70 ? 'Average' : 'Needs Improvement',
        // Yield analysis
        yield_analysis: {
            expected_pieces: Math.floor((markerArea / 2500) * parseInt(layData.plies)),
            actual_pieces: totalPieces,
            yield_variance_percent: 0, // Would be calculated based on expected vs actual
            fabric_utilization: Math.round((totalPieces * 2500) / markerArea * 100 * 10) / 10
        },
        // Cost analysis (simplified)
        cost_analysis: {
            fabric_cost_per_piece: parseFloat(layData.gross_used) / totalPieces,
            waste_cost: wasteAmount * 15, // Assume $15 per unit waste cost
            efficiency_rating: materialEfficiency >= 92 ? 'Optimal' :
                materialEfficiency >= 88 ? 'Good' : 'Poor'
        }
    };
}
function calculateEstimatedBundles(outputs) {
    const totalPieces = outputs.reduce((sum, output) => sum + parseInt(output.qty), 0);
    const averageBundleSize = 20; // Default bundle size
    return Math.ceil(totalPieces / averageBundleSize);
}
