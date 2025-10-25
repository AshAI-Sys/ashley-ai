"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const auth_middleware_1 = require("@/lib/auth-middleware");
const validation_1 = require("@/lib/validation");
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get("workspaceId");
        const clientId = searchParams.get("clientId");
        const recommendationType = searchParams.get("type");
        const limitParam = searchParams.get("limit") || "10";
        // Validate required parameters
        const workspaceError = (0, validation_1.validateRequired)(workspaceId, "workspaceId");
        if (workspaceError) {
            return (0, validation_1.createValidationErrorResponse)([workspaceError]);
        }
        // Validate workspace access
        if (!(0, auth_middleware_1.validateWorkspaceAccess)(user.workspaceId, workspaceId)) {
            return server_1.NextResponse.json({ error: "Access denied to this workspace" }, { status: 403 });
        }
        // Validate limit parameter
        const limitError = (0, validation_1.validateNumber)(limitParam, "limit", 1, 100);
        if (limitError) {
            return (0, validation_1.createValidationErrorResponse)([limitError]);
        }
        const limit = parseInt(limitParam);
        // Validate recommendation type if provided
        if (recommendationType) {
            const validTypes = ["REORDER", "CROSS_SELL", "SEASONAL", "TRENDING"];
            const typeError = (0, validation_1.validateEnum)(recommendationType, validTypes, "type");
            if (typeError) {
                return (0, validation_1.createValidationErrorResponse)([typeError]);
            }
            const where = {
                workspace_id: workspaceId,
                expires_at: {
                    gte: new Date(), // Only non-expired recommendations
                },
            };
            if (clientId)
                where.client_id = clientId;
            if (recommendationType)
                where.recommendation_type = recommendationType;
            const recommendations = await db_1.prisma.productRecommendation.findMany({
                where,
                include: {
                    client: true,
                },
                orderBy: [
                    { confidence_score: "desc" },
                    { expected_revenue: "desc" },
                    { created_at: "desc" },
                ],
                take: limit,
                return: server_1.NextResponse.json({ recommendations })
            });
            try { }
            catch (error) {
                console.error("Recommendations fetch error:", error);
                return server_1.NextResponse.json({
                    error: "Failed to fetch recommendations",
                }, { status: 500 });
            }
        }
    }
    finally { }
});
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const { workspaceId, clientId, generateAll } = await request.json();
        // Validate required parameters
        const workspaceError = (0, validation_1.validateRequired)(workspaceId, "workspaceId");
        if (workspaceError) {
            return (0, validation_1.createValidationErrorResponse)([workspaceError]);
        }
        // Validate workspace access
        if (!(0, auth_middleware_1.validateWorkspaceAccess)(user.workspaceId, workspaceId)) {
            return server_1.NextResponse.json({ error: "Access denied to this workspace" }, { status: 403 });
        }
        let recommendations = [];
        if (generateAll) {
            // Generate recommendations for all active clients
        }
        const clients = await db_1.prisma.client.findMany({
            where: {
                workspace_id: workspaceId,
                is_active: true,
            },
        });
        for (const client of clients) {
            const clientRecommendations = await generateRecommendationsForClient(workspaceId, client.id);
            recommendations.push(...clientRecommendations);
        }
    }
    finally { }
    if (clientId) {
        // Generate recommendations for specific client
        recommendations = await generateRecommendationsForClient(workspaceId, clientId);
    }
    else {
        return server_1.NextResponse.json({ error: "Client ID is required when not generating for all clients" }, { status: 400 });
    }
    return server_1.NextResponse.json({
        recommendations,
        count: recommendations.length,
    });
});
try { }
catch (error) {
    console.error("Recommendation generation error:", error);
    return server_1.NextResponse.json({
        error: "Failed to generate recommendations",
    }, { status: 500 });
}
async function generateRecommendationsForClient(workspaceId, clientId) {
    // Get client's order history
    const clientOrders = await db_1.prisma.order.findMany({
        where: {
            workspace_id: workspaceId,
            client_id: clientId,
            created_at: {
                gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
            },
        },
        include: {
            line_items: true,
            brand: true,
        },
        orderBy: { created_at: "desc" },
    });
    if (clientOrders.length === 0) {
        return [];
    }
    ;
    const recommendations = [];
    // 1. REORDER RECOMMENDATIONS - Based on repeat purchases
    const reorderRecommendations = await generateReorderRecommendations(workspaceId, clientId, clientOrders);
    recommendations.push(...reorderRecommendations);
    // 2. CROSS-SELL RECOMMENDATIONS - Products often bought together
    const crossSellRecommendations = await generateCrossSellRecommendations(workspaceId, clientId, clientOrders);
    recommendations.push(...crossSellRecommendations);
    // 3. SEASONAL RECOMMENDATIONS - Based on time of year
    const seasonalRecommendations = await generateSeasonalRecommendations(workspaceId, clientId, clientOrders);
    recommendations.push(...seasonalRecommendations);
    // 4. TRENDING RECOMMENDATIONS - Based on what's popular
    const trendingRecommendations = await generateTrendingRecommendations(workspaceId, clientId);
    recommendations.push(...trendingRecommendations);
    return recommendations;
}
async function generateReorderRecommendations(workspaceId, clientId, clientOrders) {
    const recommendations = [];
    // Find products ordered multiple times
    const productFrequency = {};
    clientOrders.forEach(order => {
        order.line_items.forEach((item) => {
            const key = `${item.product_type || "unknown"}-${item.color || "default"}`;
            if (!productFrequency[key]) {
                productFrequency[key] = {
                    count: 0,
                    lastOrder: order.created_at,
                    avgQuantity: 0,
                    totalRevenue: 0,
                };
            }
            productFrequency[key].count++;
            productFrequency[key].avgQuantity += item.quantity || 0;
            productFrequency[key].totalRevenue +=
                (item.quantity || 0) * (item.unit_price || 0);
            if (order.created_at > productFrequency[key].lastOrder) {
                productFrequency[key].lastOrder = order.created_at;
            }
        });
        // Generate reorder recommendations for frequently ordered items
        for (const [productKey, data] of Object.entries(productFrequency)) {
            if (data.count >= 2) {
                // Ordered at least twice
                const daysSinceLastOrder = Math.floor((Date.now() - data.lastOrder.getTime()) / (1000 * 60 * 60 * 24));
                const avgOrderInterval = 90; // Assume 90 days between reorders
                if (daysSinceLastOrder >= avgOrderInterval * 0.8) {
                    // 80% of typical interval
                    const [productType, color] = productKey.split("-");
                    const confidence = Math.min(0.95, 0.6 + data.count * 0.1);
                }
                const avgQuantity = Math.round(data.avgQuantity / data.count);
                recommendations.push(await db_1.prisma.productRecommendation.create({
                    data: {
                        workspace_id: workspaceId,
                        client_id: clientId,
                        recommendation_type: "REORDER",
                        source_product_type: productType,
                        recommended_product_type: productType,
                        recommended_category: "APPAREL",
                        confidence_score: confidence,
                        expected_quantity: avgQuantity,
                        expected_revenue: data.totalRevenue / data.count,
                        reasoning: `Customer has ordered this product ${data.count} times. Last order was ${daysSinceLastOrder} days ago.`,
                        historical_success: confidence,
                        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                    },
                }));
            }
        }
        return recommendations;
    }, async function generateCrossSellRecommendations(workspaceId, clientId, clientOrders) {
        const recommendations = [];
        // Analyze what products are often bought together
        const productCombinations = {};
        clientOrders.forEach(order => {
            const productsInOrder = order.line_items.map((item) => item.product_type || "unknown");
            productsInOrder.forEach((product, index) => {
                if (!productCombinations[product]) {
                    productCombinations[product] = [];
                }
                // Add other products from the same order
                productsInOrder.forEach((otherProduct, otherIndex) => {
                    if (index !== otherIndex &&
                        !productCombinations[product].includes(otherProduct)) {
                        productCombinations[product].push(otherProduct);
                    }
                });
                // Generate cross-sell recommendations
                const recentProducts = clientOrders
                    .slice(0, 3)
                    .flatMap(order => order.line_items.map((item) => item.product_type || "unknown"));
                for (const recentProduct of recentProducts) {
                    if (productCombinations[recentProduct]) {
                        for (const suggestedProduct of productCombinations[recentProduct]) {
                        }
                        if (suggestedProduct !== recentProduct) {
                            recommendations.push(await db_1.prisma.productRecommendation.create({
                                data: {
                                    workspace_id: workspaceId,
                                    client_id: clientId,
                                    recommendation_type: "CROSS_SELL",
                                    source_product_type: recentProduct,
                                    recommended_product_type: suggestedProduct,
                                    recommended_category: "APPAREL",
                                    confidence_score: 0.75,
                                    expected_quantity: 50,
                                    expected_revenue: 25000,
                                    reasoning: `Customers who buy ${recentProduct} often also purchase ${suggestedProduct}.`,
                                    historical_success: 0.75,
                                    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
                                },
                            }));
                        }
                    }
                }
                return recommendations.slice(0, 3); // Limit to 3 cross-sell recommendations
            }, async function generateSeasonalRecommendations(workspaceId, clientId, clientOrders) {
                const recommendations = [];
                const currentMonth = new Date().getMonth();
                // Define seasonal products
                const seasonalProducts = {
                    0: ["HOODIE", "JACKET"], // January - Winter
                    1: ["HOODIE", "JACKET"], // February - Winter
                    2: ["T_SHIRT", "POLO"], // March - Spring
                    3: ["T_SHIRT", "POLO"], // April - Spring
                    4: ["T_SHIRT", "SHORTS"], // May - Late Spring
                    5: ["T_SHIRT", "SHORTS"], // June - Summer
                    6: ["T_SHIRT", "SHORTS"], // July - Summer
                    7: ["T_SHIRT", "SHORTS"], // August - Summer
                    8: ["T_SHIRT", "POLO"], // September - Early Fall
                    9: ["HOODIE", "JACKET"], // October - Fall
                    10: ["HOODIE", "JACKET"], // November - Late Fall
                    11: ["HOODIE", "JACKET"], // December - Winter
                };
                const currentSeasonProducts = seasonalProducts[currentMonth] || ["T_SHIRT"];
                for (const productType of currentSeasonProducts) {
                    recommendations.push(await db_1.prisma.productRecommendation.create({
                        data: {
                            workspace_id: workspaceId,
                            client_id: clientId,
                            recommendation_type: "SEASONAL",
                            recommended_product_type: productType,
                            recommended_category: "APPAREL",
                            confidence_score: 0.8,
                            expected_quantity: 100,
                            expected_revenue: 50000,
                            reasoning: `${productType} is popular during this season based on historical trends.`,
                            seasonal_relevance: 0.9,
                            expires_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
                        },
                    }));
                }
                return recommendations.slice(0, 2); // Limit to 2 seasonal recommendations
            }, async function generateTrendingRecommendations(workspaceId, clientId) {
                const recommendations = [];
                // Get trending products based on recent order activity across all clients
                const recentOrders = await db_1.prisma.order.findMany({
                    where: {
                        workspace_id: workspaceId,
                        created_at: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                        },
                    },
                    include: {
                        line_items: true,
                    },
                });
                const productPopularity = {};
                recentOrders.forEach(order => {
                    order.line_items.forEach((item) => {
                        const productType = item.product_type || "unknown";
                        productPopularity[productType] =
                            (productPopularity[productType] || 0) + (item.quantity || 0);
                    });
                    // Get top 2 trending products
                    const trendingProducts = Object.entries(productPopularity)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 2);
                    for (const [productType, quantity] of trendingProducts) {
                        recommendations.push(await db_1.prisma.productRecommendation.create({
                            data: {
                                workspace_id: workspaceId,
                                client_id: clientId,
                                recommendation_type: "TRENDING",
                                recommended_product_type: productType,
                                recommended_category: "APPAREL",
                                confidence_score: 0.7,
                                expected_quantity: 75,
                                expected_revenue: 37500,
                                reasoning: `${productType} is trending with ${quantity} units ordered recently across all clients.`,
                                trend_alignment: 0.85,
                                expires_at: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days
                            },
                        }));
                    }
                    return recommendations;
                });
            });
        });
    });
}
