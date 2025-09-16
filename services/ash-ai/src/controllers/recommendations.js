"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationsRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const logger_1 = require("@ash/shared/logger");
const database_1 = require("@ash/database");
const router = (0, express_1.Router)();
exports.recommendationsRouter = router;
// Get reprint recommendations
router.get('/reprints', [
    (0, express_validator_1.query)('workspace_id').isUUID(),
    (0, express_validator_1.query)('client_id').optional().isUUID(),
    (0, express_validator_1.query)('time_range').optional().isIn(['month', 'quarter', 'year']),
    (0, express_validator_1.query)('min_confidence').optional().isFloat({ min: 0, max: 1 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const { workspace_id, client_id, time_range = 'quarter', min_confidence = 0.7 } = req.query;
        // Get historical order data for analysis
        const timeRangeMonths = time_range === 'month' ? 1 : time_range === 'quarter' ? 3 : 12;
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - timeRangeMonths);
        const orders = await database_1.prisma.order.findMany({
            where: {
                workspace_id: workspace_id,
                ...(client_id && { client_id: client_id }),
                status: 'completed',
                created_at: { gte: startDate },
                deleted_at: null
            },
            include: {
                client: { select: { name: true } },
                brand: { select: { name: true } },
                line_items: true
            },
            orderBy: { created_at: 'desc' }
        });
        // Analyze patterns for reprint recommendations
        const itemFrequency = new Map();
        const clientPreferences = new Map();
        const seasonalPatterns = new Map();
        orders.forEach(order => {
            order.line_items.forEach(item => {
                const key = `${item.description}_${item.printing_method}_${item.garment_type}`;
                const month = new Date(order.created_at).getMonth();
                // Track frequency
                itemFrequency.set(key, (itemFrequency.get(key) || 0) + item.quantity);
                // Track client preferences
                const clientKey = `${order.client_id}_${key}`;
                clientPreferences.set(clientKey, (clientPreferences.get(clientKey) || 0) + 1);
                // Track seasonal patterns
                const seasonKey = `${key}_${Math.floor(month / 3)}`; // Quarter
                seasonalPatterns.set(seasonKey, (seasonalPatterns.get(seasonKey) || 0) + 1);
            });
        });
        // Generate recommendations
        const recommendations = [];
        const currentQuarter = Math.floor(new Date().getMonth() / 3);
        for (const [key, frequency] of itemFrequency.entries()) {
            if (frequency < 100)
                continue; // Minimum threshold
            const [description, printing_method, garment_type] = key.split('_');
            // Find best client match
            let bestClient = null;
            let bestClientFreq = 0;
            for (const [clientKey, clientFreq] of clientPreferences.entries()) {
                if (clientKey.includes(key) && clientFreq > bestClientFreq) {
                    bestClientFreq = clientFreq;
                    bestClient = orders.find(o => o.client_id === clientKey.split('_')[0])?.client;
                }
            }
            // Check seasonal relevance
            const seasonKey = `${key}_${currentQuarter}`;
            const seasonalRelevance = seasonalPatterns.get(seasonKey) || 0;
            // Calculate confidence score
            const baseConfidence = Math.min(frequency / 500, 1); // Normalize frequency
            const seasonalBoost = seasonalRelevance > 0 ? 0.2 : -0.1;
            const clientBoost = bestClientFreq > 2 ? 0.1 : 0;
            const confidence = Math.max(0, Math.min(1, baseConfidence + seasonalBoost + clientBoost));
            if (confidence >= parseFloat(min_confidence)) {
                // Estimate optimal quantity based on historical data
                const avgQuantity = Math.round(frequency / orders.length * 2); // Conservative estimate
                recommendations.push({
                    item: {
                        description,
                        printing_method,
                        garment_type
                    },
                    recommended_client: bestClient,
                    historical_frequency: frequency,
                    confidence: Math.round(confidence * 100) / 100,
                    estimated_quantity: avgQuantity,
                    estimated_revenue: avgQuantity * 200, // Estimated average price
                    reasons: [
                        frequency > 200 ? 'High historical demand' : 'Moderate demand',
                        seasonalRelevance > 0 ? 'Seasonally relevant' : null,
                        bestClientFreq > 2 ? 'Strong client preference' : null
                    ].filter(Boolean),
                    priority: confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low'
                });
            }
        }
        // Sort by confidence and limit results
        recommendations.sort((a, b) => b.confidence - a.confidence);
        const topRecommendations = recommendations.slice(0, 10);
        res.json({
            workspace_id,
            time_range,
            analysis_period: {
                start_date: startDate,
                end_date: new Date(),
                orders_analyzed: orders.length
            },
            recommendations: topRecommendations,
            summary: {
                total_recommendations: topRecommendations.length,
                high_priority: topRecommendations.filter(r => r.priority === 'high').length,
                estimated_total_revenue: topRecommendations.reduce((sum, r) => sum + r.estimated_revenue, 0)
            },
            generated_at: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('Reprint recommendations error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to generate reprint recommendations'
        });
    }
});
// Get theme suggestions
router.post('/themes', [
    (0, express_validator_1.body)('workspace_id').isUUID(),
    (0, express_validator_1.body)('context').isString(),
    (0, express_validator_1.body)('target_audience').optional().isString(),
    (0, express_validator_1.body)('season').optional().isIn(['spring', 'summer', 'fall', 'winter']),
    (0, express_validator_1.body)('style_preference').optional().isString()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const { workspace_id, context, target_audience, season, style_preference } = req.body;
        // Mock theme suggestions (in production, use OpenAI for creative suggestions)
        const currentSeason = season || ['spring', 'summer', 'fall', 'winter'][Math.floor(new Date().getMonth() / 3)];
        const themeCategories = {
            spring: ['Fresh Blooms', 'Urban Garden', 'Pastel Dreams', 'New Beginnings'],
            summer: ['Beach Vibes', 'Tropical Paradise', 'Sunset Collection', 'Adventure Ready'],
            fall: ['Autumn Leaves', 'Cozy Comfort', 'Harvest Moon', 'Back to School'],
            winter: ['Winter Wonderland', 'Holiday Spirit', 'Minimalist Chic', 'Warm & Cozy']
        };
        const colorPalettes = {
            spring: [
                { name: 'Fresh Mint', colors: ['#E8F5E8', '#95C99A', '#4A7C59'] },
                { name: 'Sunset Peach', colors: ['#FFE5B4', '#FFAB91', '#FF7043'] }
            ],
            summer: [
                { name: 'Ocean Blue', colors: ['#E3F2FD', '#2196F3', '#0D47A1'] },
                { name: 'Tropical Sunset', colors: ['#FFF9C4', '#FF9800', '#E65100'] }
            ],
            fall: [
                { name: 'Autumn Warmth', colors: ['#FFF8E1', '#FF8F00', '#BF360C'] },
                { name: 'Earth Tones', colors: ['#EFEBE9', '#8D6E63', '#3E2723'] }
            ],
            winter: [
                { name: 'Ice Crystal', colors: ['#F3E5F5', '#9C27B0', '#4A148C'] },
                { name: 'Winter Forest', colors: ['#E8F5E8', '#2E7D32', '#1B5E20'] }
            ]
        };
        const suggestions = themeCategories[currentSeason].map((theme, index) => ({
            theme_name: theme,
            description: `A ${currentSeason} collection inspired by ${theme.toLowerCase()}`,
            color_palettes: colorPalettes[currentSeason],
            target_demographics: target_audience ? [target_audience] : ['Young Adults', 'Casual Wear', 'Lifestyle'],
            style_elements: [
                'Modern Typography',
                'Minimalist Design',
                style_preference || 'Contemporary',
                'Versatile Graphics'
            ],
            suggested_products: [
                { product: 'T-Shirts', methods: ['silkscreen', 'dtf'] },
                { product: 'Hoodies', methods: ['embroidery', 'dtf'] },
                { product: 'Accessories', methods: ['sublimation'] }
            ],
            market_appeal: {
                score: 85 - (index * 5), // Decreasing score for demo
                factors: ['Seasonal Relevance', 'Trend Alignment', 'Broad Appeal']
            },
            estimated_demand: Math.max(50, 200 - (index * 30)),
            confidence: Math.max(0.6, 0.9 - (index * 0.1))
        }));
        res.json({
            workspace_id,
            context,
            season: currentSeason,
            target_audience,
            theme_suggestions: suggestions,
            recommendations: {
                top_pick: suggestions[0].theme_name,
                trending_colors: colorPalettes[currentSeason][0].colors,
                best_printing_methods: ['dtf', 'silkscreen', 'embroidery']
            },
            generated_at: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('Theme suggestions error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to generate theme suggestions'
        });
    }
});
// Get optimization recommendations
router.post('/optimize', [
    (0, express_validator_1.body)('workspace_id').isUUID(),
    (0, express_validator_1.body)('optimization_type').isIn(['workflow', 'capacity', 'quality', 'cost']),
    (0, express_validator_1.body)('department').optional().isString(),
    (0, express_validator_1.body)('time_range').optional().isIn(['week', 'month', 'quarter'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const { workspace_id, optimization_type, department, time_range = 'month' } = req.body;
        // Mock optimization recommendations based on type
        const optimizations = {
            workflow: [
                {
                    title: 'Parallel Processing Setup',
                    description: 'Enable parallel processing for cutting and printing stages',
                    impact: 'Reduce production time by 15-20%',
                    effort: 'Medium',
                    savings: 12000,
                    implementation_time: '2 weeks'
                },
                {
                    title: 'Batch Size Optimization',
                    description: 'Optimize batch sizes for screen printing operations',
                    impact: 'Increase efficiency by 25%',
                    effort: 'Low',
                    savings: 8000,
                    implementation_time: '1 week'
                }
            ],
            capacity: [
                {
                    title: 'Cross-Training Program',
                    description: 'Train workers in multiple departments for flexibility',
                    impact: 'Increase capacity utilization by 30%',
                    effort: 'High',
                    savings: 25000,
                    implementation_time: '6 weeks'
                },
                {
                    title: 'Shift Schedule Optimization',
                    description: 'Optimize shift schedules based on demand patterns',
                    impact: 'Better resource allocation',
                    effort: 'Medium',
                    savings: 15000,
                    implementation_time: '2 weeks'
                }
            ],
            quality: [
                {
                    title: 'Inline Quality Checks',
                    description: 'Implement quality checkpoints at each production stage',
                    impact: 'Reduce defects by 40%',
                    effort: 'Medium',
                    savings: 18000,
                    implementation_time: '3 weeks'
                },
                {
                    title: 'Predictive Quality Analytics',
                    description: 'Use AI to predict quality issues before they occur',
                    impact: 'Early defect detection',
                    effort: 'High',
                    savings: 22000,
                    implementation_time: '8 weeks'
                }
            ],
            cost: [
                {
                    title: 'Material Waste Reduction',
                    description: 'Optimize cutting patterns to reduce fabric waste',
                    impact: 'Reduce material costs by 12%',
                    effort: 'Medium',
                    savings: 35000,
                    implementation_time: '4 weeks'
                },
                {
                    title: 'Energy Efficiency Program',
                    description: 'Implement energy-saving measures across production',
                    impact: 'Reduce utility costs by 20%',
                    effort: 'Low',
                    savings: 8000,
                    implementation_time: '2 weeks'
                }
            ]
        };
        const selectedOptimizations = optimizations[optimization_type] || [];
        res.json({
            workspace_id,
            optimization_type,
            department,
            time_range,
            recommendations: selectedOptimizations.map((opt, index) => ({
                ...opt,
                priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
                roi_months: Math.ceil(10000 / (opt.savings / 12)), // Simple ROI calculation
                confidence: 0.85 - (index * 0.1)
            })),
            summary: {
                total_potential_savings: selectedOptimizations.reduce((sum, opt) => sum + opt.savings, 0),
                average_implementation_time: '3-4 weeks',
                recommended_priority: selectedOptimizations[0]?.title
            },
            generated_at: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('Optimization recommendations error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to generate optimization recommendations'
        });
    }
});
