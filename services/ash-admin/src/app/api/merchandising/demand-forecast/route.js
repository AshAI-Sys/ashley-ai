"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("@/lib/auth-middleware");
const validation_1 = require("@/lib/validation");
const prisma = new client_1.PrismaClient();
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspaceId');
        const clientId = searchParams.get('clientId');
        const brandId = searchParams.get('brandId');
        const period = searchParams.get('period') || 'MONTHLY';
        const limitParam = searchParams.get('limit') || '50';
        // Validate required parameters
        const workspaceError = (0, validation_1.validateRequired)(workspaceId, 'workspaceId');
        if (workspaceError) {
            return (0, validation_1.createValidationErrorResponse)([workspaceError]);
        }
        // Validate workspace access
        if (!(0, auth_middleware_1.validateWorkspaceAccess)(user.workspaceId, workspaceId)) {
            return server_1.NextResponse.json({ error: 'Access denied to this workspace' }, { status: 403 });
        }
        // Validate period parameter
        const validPeriods = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];
        const periodError = (0, validation_1.validateEnum)(period, validPeriods, 'period');
        if (periodError) {
            return (0, validation_1.createValidationErrorResponse)([periodError]);
        }
        // Validate limit parameter
        const limitError = (0, validation_1.validateNumber)(limitParam, 'limit', 1, 200);
        if (limitError) {
            return (0, validation_1.createValidationErrorResponse)([limitError]);
        }
        const limit = parseInt(limitParam);
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
        console.error('Demand forecast fetch error:', error);
        return server_1.NextResponse.json({
            error: 'Failed to fetch demand forecasts'
        }, { status: 500 });
    }
});
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const body = await request.json();
        const { workspaceId, clientId, brandId, productCategory, productType, forecastPeriod, forecastDate, predictedQuantity, predictedRevenue, confidenceScore, seasonalFactor, trendFactor, externalFactors, modelVersion } = body;
        // Validate required parameters
        const errors = [];
        const workspaceError = (0, validation_1.validateRequired)(workspaceId, 'workspaceId');
        if (workspaceError)
            errors.push(workspaceError);
        if (errors.length > 0) {
            return (0, validation_1.createValidationErrorResponse)(errors);
        }
        // Validate workspace access
        if (!(0, auth_middleware_1.validateWorkspaceAccess)(user.workspaceId, workspaceId)) {
            return server_1.NextResponse.json({ error: 'Access denied to this workspace' }, { status: 403 });
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
        console.error('Demand forecast creation error:', error);
        return server_1.NextResponse.json({
            error: 'Failed to create demand forecast'
        }, { status: 500 });
    }
});
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
