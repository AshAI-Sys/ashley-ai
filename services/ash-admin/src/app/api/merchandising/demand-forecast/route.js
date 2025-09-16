"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspaceId');
        const clientId = searchParams.get('clientId');
        const brandId = searchParams.get('brandId');
        const period = searchParams.get('period') || 'MONTHLY';
        const limit = parseInt(searchParams.get('limit') || '50');
        if (!workspaceId) {
            return server_1.NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
        }
        const where = {
            workspace_id: workspaceId,
            forecast_period: period,
        };
        if (clientId)
            where.client_id = clientId;
        if (brandId)
            where.brand_id = brandId;
        const forecasts = await prisma.demandForecast.findMany({
            where,
            include: {
                client: true,
                brand: true,
            },
            orderBy: { forecast_date: 'asc' },
            take: limit,
        });
        return server_1.NextResponse.json({ forecasts });
    }
    catch (error) {
        // console.error('Demand forecast fetch error:', error)
        return server_1.NextResponse.json({
            error: 'Failed to fetch demand forecasts'
        }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const { workspaceId, clientId, brandId, productCategory, productType, forecastPeriod, forecastDate, predictedQuantity, predictedRevenue, confidenceScore, seasonalFactor, trendFactor, externalFactors, modelVersion } = await request.json();
        if (!workspaceId) {
            return server_1.NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
        }
        // In a real implementation, this would call actual ML models
        // For now, we'll create realistic sample forecasts based on historical data
        const forecast = await generateDemandForecast({
            workspaceId,
            clientId,
            brandId,
            productCategory,
            productType,
            forecastPeriod,
            forecastDate,
            predictedQuantity,
            predictedRevenue,
            confidenceScore,
            seasonalFactor,
            trendFactor,
            externalFactors,
            modelVersion: modelVersion || 'v1.0'
        });
        return server_1.NextResponse.json({ forecast });
    }
    catch (error) {
        // console.error('Demand forecast creation error:', error)
        return server_1.NextResponse.json({
            error: 'Failed to create demand forecast'
        }, { status: 500 });
    }
}
async function generateDemandForecast(params) {
    // Get historical data for this client/brand/product combination
    const historicalOrders = await prisma.order.findMany({
        where: {
            workspace_id: params.workspaceId,
            ...(params.clientId && { client_id: params.clientId }),
            ...(params.brandId && { brand_id: params.brandId }),
            created_at: {
                gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
            }
        },
        include: {
            line_items: true
        }
    });
    // Simple demand forecasting algorithm (in production, use ML models)
    const currentMonth = new Date().getMonth();
    const isSeasonalProduct = params.productCategory === 'APPAREL';
    // Calculate seasonal factors
    const seasonalMultipliers = {
        0: 0.8, // January - post holiday dip
        1: 0.9, // February
        2: 1.0, // March - spring
        3: 1.1, // April
        4: 1.2, // May
        5: 1.3, // June - summer start
        6: 1.2, // July
        7: 1.1, // August
        8: 1.0, // September - back to school
        9: 1.2, // October
        10: 1.4, // November - pre holiday
        11: 1.6, // December - holiday peak
    };
    // Calculate base demand from historical data
    const totalHistoricalQuantity = historicalOrders.reduce((sum, order) => sum + order.line_items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0), 0);
    const monthlyAverage = totalHistoricalQuantity / 12;
    const seasonalFactor = isSeasonalProduct ? seasonalMultipliers[currentMonth] : 1.0;
    // Apply trend (simplified - in production, use regression analysis)
    const trendFactor = 1.05; // 5% growth trend
    const predictedQuantity = Math.round(monthlyAverage * seasonalFactor * trendFactor);
    const averagePrice = 850; // Average price per unit in PHP
    const predictedRevenue = predictedQuantity * averagePrice;
    // Confidence score based on data availability
    const confidenceScore = Math.min(0.95, Math.max(0.6, historicalOrders.length / 20));
    const forecast = await prisma.demandForecast.create({
        data: {
            workspace_id: params.workspaceId,
            client_id: params.clientId || null,
            brand_id: params.brandId || null,
            product_category: params.productCategory,
            product_type: params.productType,
            forecast_period: params.forecastPeriod,
            forecast_date: new Date(params.forecastDate),
            predicted_quantity: predictedQuantity,
            predicted_revenue: predictedRevenue,
            confidence_score: confidenceScore,
            seasonal_factor: seasonalFactor,
            trend_factor: trendFactor,
            external_factors: JSON.stringify({
                historicalOrders: historicalOrders.length,
                averageOrderSize: monthlyAverage,
                seasonality: isSeasonalProduct,
                economicFactors: 'stable'
            }),
            model_version: params.modelVersion,
        }
    });
    return forecast;
}
