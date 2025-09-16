"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictiveAnalyticsService = void 0;
const openai_1 = require("openai");
const database_1 = require("@ash/database");
const shared_1 = require("@ash/shared");
class PredictiveAnalyticsService {
    constructor() {
        this.openai = new openai_1.OpenAI({
            apiKey: process.env.ASH_OPENAI_API_KEY
        });
    }
    // Capacity vs deadline validation with AI
    async validateCapacityVsDeadline(workspaceId, orderId) {
        try {
            // Get order and production data
            const order = await database_1.prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    line_items: true,
                    routing_steps: {
                        include: { routing_template_step: true }
                    }
                }
            });
            if (!order)
                throw new Error('Order not found');
            // Get historical production data for similar orders
            const historicalData = await database_1.prisma.routingStep.findMany({
                where: {
                    workspace_id: workspaceId,
                    completed_at: { not: null },
                    order: {
                        line_items: {
                            some: {
                                garment_type: { in: order.line_items.map(li => li.garment_type).filter(Boolean) }
                            }
                        }
                    }
                },
                include: {
                    routing_template_step: true,
                    order: {
                        select: {
                            line_items: {
                                select: { quantity: true, garment_type: true }
                            }
                        }
                    }
                }
            });
            // Current workforce capacity
            const currentCapacity = await database_1.prisma.employee.findMany({
                where: {
                    workspace_id: workspaceId,
                    is_active: true,
                    department: { in: ['cutting', 'printing', 'sewing'] }
                }
            });
            const prompt = `
Analyze production capacity for apparel manufacturing order:

ORDER DETAILS:
- Order ID: ${order.order_number}
- Delivery Date: ${order.delivery_date}
- Items: ${JSON.stringify(order.line_items.map(li => ({
                type: li.garment_type,
                quantity: li.quantity,
                printing: li.printing_method
            })))}

HISTORICAL PERFORMANCE:
${historicalData.slice(0, 10).map(step => `
- ${step.routing_template_step?.step_name}: ${step.actual_hours}h (estimated: ${step.estimated_hours}h)
- Garment: ${step.order?.line_items[0]?.garment_type}
`).join('')}

CURRENT CAPACITY:
- Available Staff: ${currentCapacity.length}
- Departments: ${JSON.stringify(currentCapacity.reduce((acc, emp) => {
                acc[emp.department] = (acc[emp.department] || 0) + 1;
                return acc;
            }, {}))}

ANALYSIS REQUIRED:
1. Can this order be completed by delivery date?
2. What are the bottleneck departments?
3. What's the confidence level (0-100)?
4. What actions should be taken?

Respond in JSON format:
{
  "can_meet_deadline": boolean,
  "confidence": number,
  "bottlenecks": ["department1", "department2"],
  "estimated_completion": "YYYY-MM-DD",
  "recommendations": ["action1", "action2"],
  "risk_factors": ["risk1", "risk2"]
}
`;
            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3
            });
            const analysis = JSON.parse(response.choices[0].message.content);
            return {
                type: 'capacity_analysis',
                confidence: analysis.confidence,
                recommendation: `Order ${analysis.can_meet_deadline ? 'CAN' : 'CANNOT'} meet deadline. ${analysis.recommendations.join('. ')}`,
                data: analysis
            };
        }
        catch (error) {
            shared_1.logger.error('Capacity validation error:', error);
            throw error;
        }
    }
    // Quality prediction based on historical patterns
    async predictQualityIssues(workspaceId, bundleId) {
        try {
            const bundle = await database_1.prisma.bundle.findUnique({
                where: { id: bundleId },
                include: {
                    order: {
                        include: {
                            line_items: true,
                            client: true
                        }
                    },
                    cutting_order: true,
                    printing_orders: true
                }
            });
            if (!bundle)
                throw new Error('Bundle not found');
            // Get historical quality data for similar products
            const qualityHistory = await database_1.prisma.qcCheck.findMany({
                where: {
                    workspace_id: workspaceId,
                    bundle: {
                        order: {
                            line_items: {
                                some: {
                                    garment_type: bundle.order.line_items[0]?.garment_type,
                                    printing_method: bundle.order.line_items[0]?.printing_method
                                }
                            }
                        }
                    }
                },
                include: {
                    bundle: {
                        include: {
                            order: {
                                select: {
                                    client: { select: { name: true } },
                                    line_items: { select: { garment_type: true, printing_method: true } }
                                }
                            }
                        }
                    }
                }
            });
            const prompt = `
Predict quality risks for apparel production bundle:

CURRENT BUNDLE:
- Bundle ID: ${bundle.qr_code}
- Client: ${bundle.order.client.name}
- Garment Type: ${bundle.order.line_items[0]?.garment_type}
- Printing Method: ${bundle.order.line_items[0]?.printing_method}
- Current Status: ${bundle.status}

HISTORICAL QUALITY DATA:
${qualityHistory.slice(0, 15).map(qc => `
- Status: ${qc.status}
- Stage: ${qc.stage}
- Issues: ${qc.notes || 'None'}
- Client: ${qc.bundle?.order?.client?.name}
`).join('')}

ANALYSIS REQUIRED:
1. What's the quality risk level (low/medium/high)?
2. What specific issues might occur?
3. At which stage are problems most likely?
4. What preventive actions should be taken?

Respond in JSON format:
{
  "risk_level": "low|medium|high",
  "confidence": number,
  "likely_issues": ["issue1", "issue2"],
  "high_risk_stages": ["stage1", "stage2"],
  "preventive_actions": ["action1", "action2"],
  "attention_points": ["point1", "point2"]
}
`;
            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3
            });
            const prediction = JSON.parse(response.choices[0].message.content);
            return {
                type: 'quality_prediction',
                confidence: prediction.confidence,
                recommendation: `${prediction.risk_level.toUpperCase()} quality risk. Focus on: ${prediction.attention_points.join(', ')}`,
                data: prediction
            };
        }
        catch (error) {
            shared_1.logger.error('Quality prediction error:', error);
            throw error;
        }
    }
    // Employee fatigue and performance monitoring
    async analyzeEmployeeFatigue(workspaceId) {
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            // Get employee performance and work patterns
            const employeeData = await database_1.prisma.employee.findMany({
                where: {
                    workspace_id: workspaceId,
                    is_active: true,
                    department: { in: ['cutting', 'printing', 'sewing'] }
                },
                include: {
                    sewing_operations: {
                        where: { completed_at: { gte: thirtyDaysAgo } },
                        orderBy: { completed_at: 'desc' }
                    },
                    payroll_earnings: {
                        where: {
                            payroll_period: {
                                period_end: { gte: thirtyDaysAgo }
                            }
                        }
                    }
                }
            });
            // Analyze work patterns
            const analysis = employeeData.map(emp => {
                const recentWork = emp.sewing_operations.slice(0, 10);
                const avgProductivity = recentWork.reduce((sum, op) => sum + (op.pieces_completed || 0), 0) / recentWork.length;
                const workDays = recentWork.length;
                return {
                    id: emp.id,
                    name: `${emp.first_name} ${emp.last_name}`,
                    department: emp.department,
                    recent_productivity: avgProductivity,
                    work_frequency: workDays,
                    total_earnings: emp.payroll_earnings.reduce((sum, pe) => sum + pe.gross_pay, 0)
                };
            });
            const prompt = `
Analyze employee fatigue and performance patterns:

EMPLOYEE DATA:
${analysis.map(emp => `
- ${emp.name} (${emp.department})
  - Avg daily pieces: ${emp.recent_productivity.toFixed(1)}
  - Work days (30d): ${emp.work_frequency}
  - Earnings: ₱${emp.total_earnings.toFixed(2)}
`).join('')}

ANALYSIS REQUIRED:
1. Which employees show signs of fatigue?
2. Who might need performance support?
3. Are there department-wide issues?
4. What interventions are recommended?

Respond in JSON format:
{
  "fatigue_alerts": [
    {
      "employee": "name",
      "department": "dept", 
      "risk_level": "low|medium|high",
      "indicators": ["indicator1", "indicator2"]
    }
  ],
  "department_analysis": {
    "cutting": "status",
    "printing": "status", 
    "sewing": "status"
  },
  "recommendations": ["rec1", "rec2"],
  "overall_health": "good|concerning|critical"
}
`;
            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3
            });
            const fatigueAnalysis = JSON.parse(response.choices[0].message.content);
            return {
                type: 'fatigue_analysis',
                confidence: 85,
                recommendation: `Workforce health: ${fatigueAnalysis.overall_health}. ${fatigueAnalysis.recommendations.slice(0, 2).join('. ')}`,
                data: fatigueAnalysis
            };
        }
        catch (error) {
            shared_1.logger.error('Fatigue analysis error:', error);
            throw error;
        }
    }
    // Predictive maintenance for equipment
    async predictMaintenance(workspaceId) {
        try {
            const assets = await database_1.prisma.asset.findMany({
                where: { workspace_id: workspaceId },
                include: {
                    work_orders: {
                        where: {
                            created_at: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
                        },
                        orderBy: { created_at: 'desc' }
                    },
                    maintenance_schedules: {
                        where: {
                            next_due: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
                        }
                    }
                }
            });
            const prompt = `
Analyze equipment maintenance needs:

ASSET DATA:
${assets.map(asset => `
- ${asset.name} (${asset.category})
  - Location: ${asset.location}
  - Status: ${asset.status}
  - Recent work orders: ${asset.work_orders.length}
  - Purchase date: ${asset.purchase_date}
  - Upcoming maintenance: ${asset.maintenance_schedules.length}
`).join('')}

ANALYSIS REQUIRED:
1. Which assets need immediate attention?
2. What maintenance should be scheduled?
3. Are there failure risk patterns?
4. Cost optimization opportunities?

Respond in JSON format:
{
  "immediate_attention": ["asset1", "asset2"],
  "maintenance_due": [
    {
      "asset": "name",
      "type": "preventive|corrective",
      "urgency": "low|medium|high",
      "estimated_cost": number
    }
  ],
  "risk_assessment": {
    "high_risk": ["asset1"],
    "medium_risk": ["asset2"],
    "low_risk": ["asset3"]
  },
  "recommendations": ["rec1", "rec2"]
}
`;
            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3
            });
            const maintenancePrediction = JSON.parse(response.choices[0].message.content);
            return {
                type: 'maintenance_prediction',
                confidence: 80,
                recommendation: `${maintenancePrediction.immediate_attention.length} assets need immediate attention. ${maintenancePrediction.recommendations[0]}`,
                data: maintenancePrediction
            };
        }
        catch (error) {
            shared_1.logger.error('Maintenance prediction error:', error);
            throw error;
        }
    }
    // Comprehensive AI insights dashboard
    async generateInsightsDashboard(workspaceId) {
        try {
            const [capacityInsights, qualityPredictions, fatigueAnalysis, maintenancePredictions] = await Promise.all([
                this.getCapacityInsights(workspaceId),
                this.getQualityInsights(workspaceId),
                this.analyzeEmployeeFatigue(workspaceId),
                this.predictMaintenance(workspaceId)
            ]);
            return {
                timestamp: new Date().toISOString(),
                workspace_id: workspaceId,
                insights: {
                    capacity: capacityInsights,
                    quality: qualityPredictions,
                    workforce: fatigueAnalysis,
                    maintenance: maintenancePredictions
                },
                summary: {
                    high_priority_alerts: this.extractHighPriorityAlerts([
                        capacityInsights,
                        qualityPredictions,
                        fatigueAnalysis,
                        maintenancePredictions
                    ]),
                    recommended_actions: this.generateActionItems([
                        capacityInsights,
                        qualityPredictions,
                        fatigueAnalysis,
                        maintenancePredictions
                    ])
                }
            };
        }
        catch (error) {
            shared_1.logger.error('Insights dashboard error:', error);
            throw error;
        }
    }
    async getCapacityInsights(workspaceId) {
        const activeOrders = await database_1.prisma.order.findMany({
            where: {
                workspace_id: workspaceId,
                status: { in: ['confirmed', 'in_progress'] }
            }
        });
        return {
            active_orders_count: activeOrders.length,
            capacity_utilization: Math.min((activeOrders.length / 10) * 100, 100), // Simplified
            recommendation: activeOrders.length > 8 ? 'Consider capacity expansion' : 'Capacity adequate'
        };
    }
    async getQualityInsights(workspaceId) {
        const recentQC = await database_1.prisma.qcCheck.findMany({
            where: {
                workspace_id: workspaceId,
                created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }
        });
        const passRate = recentQC.length > 0 ?
            (recentQC.filter(qc => qc.status === 'approved').length / recentQC.length) * 100 : 100;
        return {
            weekly_pass_rate: passRate,
            trend: passRate > 95 ? 'excellent' : passRate > 85 ? 'good' : 'needs_attention',
            recommendation: passRate < 90 ? 'Review quality processes' : 'Quality standards maintained'
        };
    }
    extractHighPriorityAlerts(insights) {
        const alerts = [];
        insights.forEach(insight => {
            if (insight.data && insight.confidence > 70) {
                if (insight.type === 'fatigue_analysis' && insight.data.overall_health === 'critical') {
                    alerts.push('Critical workforce fatigue detected');
                }
                if (insight.type === 'maintenance_prediction' && insight.data.immediate_attention?.length > 0) {
                    alerts.push(`${insight.data.immediate_attention.length} assets need immediate maintenance`);
                }
            }
        });
        return alerts;
    }
    generateActionItems(insights) {
        const actions = [];
        insights.forEach(insight => {
            if (insight.data?.recommendations) {
                actions.push(...insight.data.recommendations.slice(0, 2));
            }
        });
        return actions.slice(0, 5); // Top 5 actions
    }
}
exports.PredictiveAnalyticsService = PredictiveAnalyticsService;
