"use strict";
// Real-Time Bottleneck Detection AI
// Monitors production flow and identifies bottlenecks causing delays
Object.defineProperty(exports, "__esModule", { value: true });
exports.bottleneckDetectionAI = exports.BottleneckDetectionAI = void 0;
class BottleneckDetectionAI {
    constructor() {
        // Thresholds for bottleneck detection
        this.THRESHOLDS = {
            QUEUE_LENGTH_WARNING: 10,
            QUEUE_LENGTH_CRITICAL: 30,
            WAIT_TIME_WARNING: 30, // minutes
            WAIT_TIME_CRITICAL: 120, // minutes
            THROUGHPUT_LOSS_WARNING: 20, // percent
            THROUGHPUT_LOSS_CRITICAL: 40, // percent
            UTILIZATION_LOW: 60, // percent
            UTILIZATION_HIGH: 95, // percent
            DEFECT_RATE_WARNING: 5, // percent
            DEFECT_RATE_CRITICAL: 10, // percent
        };
    }
    // Detect bottleneck at a single station
    async detectStationBottleneck(metrics) {
        // Calculate bottleneck indicators
        const throughputLoss = this.calculateThroughputLoss(metrics);
        const queuePressure = this.calculateQueuePressure(metrics);
        const waitTimeImpact = this.calculateWaitTimeImpact(metrics);
        const utilizationIssue = this.calculateUtilizationIssue(metrics);
        const qualityImpact = this.calculateQualityImpact(metrics);
        // Calculate overall bottleneck score (weighted average)
        const bottleneckScore = throughputLoss * 0.35 +
            queuePressure * 0.25 +
            waitTimeImpact * 0.2 +
            utilizationIssue * 0.15 +
            qualityImpact * 0.05;
        // Determine severity
        const severity = this.determineSeverity(bottleneckScore);
        const isBottleneck = severity !== "NONE";
        // Identify root causes
        const rootCauses = this.identifyRootCauses(metrics, {
            throughputLoss,
            queuePressure,
            waitTimeImpact,
            utilizationIssue,
            qualityImpact,
        });
        // Calculate impact
        const impact = this.calculateImpact(metrics, bottleneckScore);
        // Generate recommendations
        const recommendations = this.generateRecommendations(metrics, rootCauses, severity);
        return {
            is_bottleneck: isBottleneck,
            severity,
            bottleneck_score: Math.round(bottleneckScore * 100) / 100,
            impact,
            root_causes: rootCauses,
            recommendations,
            station_metrics: metrics,
        };
    }
    // Analyze entire production system for bottlenecks
    async analyzeProductionSystem(allMetrics) {
        // Detect bottlenecks at each station
        const bottleneckDetections = await Promise.all(allMetrics.map(m => this.detectStationBottleneck(m)));
        // Filter actual bottlenecks
        const detectedBottlenecks = bottleneckDetections.filter(b => b.is_bottleneck);
        // Find primary bottleneck (highest score)
        const primaryBottleneck = detectedBottlenecks.length > 0
            ? detectedBottlenecks.reduce((worst, current) => current.bottleneck_score > worst.bottleneck_score ? current : worst)
            : null;
        // Calculate system-level metrics
        const systemThroughput = Math.min(...allMetrics.map(m => m.current_throughput));
        const optimalThroughput = Math.min(...allMetrics.map(m => m.expected_throughput));
        const overallEfficiency = (systemThroughput / optimalThroughput) * 100;
        const efficiencyLoss = 100 - overallEfficiency;
        // Identify critical path (sequence of stations)
        const criticalPath = this.identifyCriticalPath(allMetrics);
        // Generate system-level recommendations
        const recommendations = this.generateSystemRecommendations(detectedBottlenecks, primaryBottleneck, efficiencyLoss);
        // Predict completion delays
        const predictedDelays = this.predictCompletionDelays(detectedBottlenecks, systemThroughput, optimalThroughput);
        return {
            detected_bottlenecks: detectedBottlenecks,
            primary_bottleneck: primaryBottleneck,
            overall_efficiency: Math.round(overallEfficiency * 100) / 100,
            system_throughput: Math.round(systemThroughput * 100) / 100,
            optimal_throughput: Math.round(optimalThroughput * 100) / 100,
            efficiency_loss_percent: Math.round(efficiencyLoss * 100) / 100,
            critical_path: criticalPath,
            recommendations,
            predicted_completion_delays: predictedDelays,
        };
    }
    // Calculate throughput loss score
    calculateThroughputLoss(metrics) {
        if (metrics.expected_throughput === 0)
            return 0;
        const loss = ((metrics.expected_throughput - metrics.current_throughput) /
            metrics.expected_throughput) *
            100;
        if (loss >= this.THRESHOLDS.THROUGHPUT_LOSS_CRITICAL)
            return 100;
        if (loss >= this.THRESHOLDS.THROUGHPUT_LOSS_WARNING)
            return 60;
        if (loss > 0)
            return Math.min(loss * 2, 50);
        return 0;
    }
    // Calculate queue pressure score
    calculateQueuePressure(metrics) {
        if (metrics.queue_length >= this.THRESHOLDS.QUEUE_LENGTH_CRITICAL)
            return 100;
        if (metrics.queue_length >= this.THRESHOLDS.QUEUE_LENGTH_WARNING)
            return 60;
        return Math.min((metrics.queue_length / this.THRESHOLDS.QUEUE_LENGTH_WARNING) * 60, 50);
    }
    // Calculate wait time impact score
    calculateWaitTimeImpact(metrics) {
        if (metrics.avg_wait_time_minutes >= this.THRESHOLDS.WAIT_TIME_CRITICAL)
            return 100;
        if (metrics.avg_wait_time_minutes >= this.THRESHOLDS.WAIT_TIME_WARNING)
            return 60;
        return Math.min((metrics.avg_wait_time_minutes / this.THRESHOLDS.WAIT_TIME_WARNING) * 60, 50);
    }
    // Calculate utilization issue score
    calculateUtilizationIssue(metrics) {
        const util = metrics.utilization_rate;
        // Over-utilization (burnout risk)
        if (util >= this.THRESHOLDS.UTILIZATION_HIGH) {
            return Math.min((util - this.THRESHOLDS.UTILIZATION_HIGH) * 4, 100);
        }
        // Under-utilization (inefficiency)
        if (util <= this.THRESHOLDS.UTILIZATION_LOW) {
            return Math.min(this.THRESHOLDS.UTILIZATION_LOW - util, 50);
        }
        return 0;
    }
    // Calculate quality impact score
    calculateQualityImpact(metrics) {
        if (metrics.defect_rate >= this.THRESHOLDS.DEFECT_RATE_CRITICAL)
            return 100;
        if (metrics.defect_rate >= this.THRESHOLDS.DEFECT_RATE_WARNING)
            return 60;
        return Math.min((metrics.defect_rate / this.THRESHOLDS.DEFECT_RATE_WARNING) * 60, 50);
    }
    // Determine severity level
    determineSeverity(score) {
        if (score >= 80)
            return "CRITICAL";
        if (score >= 60)
            return "HIGH";
        if (score >= 40)
            return "MEDIUM";
        if (score >= 20)
            return "LOW";
        return "NONE";
    }
    // Identify root causes
    identifyRootCauses(metrics, scores) {
        const causes = [];
        // Throughput issues
        if (scores.throughputLoss > 50) {
            causes.push({
                cause: "LOW_THROUGHPUT",
                confidence: Math.min(scores.throughputLoss, 100),
                description: `Station throughput is ${(((metrics.expected_throughput - metrics.current_throughput) / metrics.expected_throughput) * 100).toFixed(0)}% below expected`,
            });
        }
        // Queue buildup
        if (scores.queuePressure > 50) {
            causes.push({
                cause: "QUEUE_BUILDUP",
                confidence: Math.min(scores.queuePressure, 100),
                description: `Queue has ${metrics.queue_length} pending items, causing delays`,
            });
        }
        // Long wait times
        if (scores.waitTimeImpact > 50) {
            causes.push({
                cause: "EXCESSIVE_WAIT_TIME",
                confidence: Math.min(scores.waitTimeImpact, 100),
                description: `Average wait time is ${metrics.avg_wait_time_minutes} minutes`,
            });
        }
        // Utilization problems
        if (metrics.utilization_rate < this.THRESHOLDS.UTILIZATION_LOW) {
            causes.push({
                cause: "UNDER_UTILIZATION",
                confidence: 80,
                description: `Station utilization is only ${metrics.utilization_rate.toFixed(0)}%`,
            });
        }
        else if (metrics.utilization_rate > this.THRESHOLDS.UTILIZATION_HIGH) {
            causes.push({
                cause: "OVER_UTILIZATION",
                confidence: 85,
                description: `Station utilization is ${metrics.utilization_rate.toFixed(0)}%, risking operator burnout`,
            });
        }
        // Operator shortage
        if (metrics.active_operators < metrics.operator_count) {
            const shortage = metrics.operator_count - metrics.active_operators;
            causes.push({
                cause: "OPERATOR_SHORTAGE",
                confidence: 90,
                description: `${shortage} operator(s) missing from station (${metrics.active_operators}/${metrics.operator_count})`,
            });
        }
        // Quality issues
        if (scores.qualityImpact > 50) {
            causes.push({
                cause: "HIGH_DEFECT_RATE",
                confidence: Math.min(scores.qualityImpact, 100),
                description: `Defect rate is ${metrics.defect_rate.toFixed(1)}%, causing rework delays`,
            });
        }
        return causes.sort((a, b) => b.confidence - a.confidence);
    }
    // Calculate impact
    calculateImpact(metrics, bottleneckScore) {
        // Throughput loss
        const throughputLossPercent = ((metrics.expected_throughput - metrics.current_throughput) /
            metrics.expected_throughput) *
            100;
        // Estimated delay (simplified calculation)
        const queueProcessingTime = metrics.current_throughput > 0
            ? metrics.queue_length / metrics.current_throughput
            : 0;
        const estimatedDelayHours = queueProcessingTime + metrics.avg_wait_time_minutes / 60;
        // Affected orders (rough estimate based on queue)
        const affectedOrders = Math.ceil(metrics.queue_length / 100); // Assume 100 units per order
        // Cost impact (PHP per hour of delay * delay hours)
        const costPerDelayHour = 5000; // Simplified cost
        const costImpact = estimatedDelayHours * costPerDelayHour * (bottleneckScore / 100);
        return {
            throughput_loss_percent: Math.round(Math.max(throughputLossPercent, 0) * 100) / 100,
            estimated_delay_hours: Math.round(estimatedDelayHours * 100) / 100,
            affected_orders: affectedOrders,
            cost_impact_php: Math.round(costImpact * 100) / 100,
        };
    }
    // Generate recommendations for a station
    generateRecommendations(metrics, rootCauses, severity) {
        const recommendations = [];
        rootCauses.forEach(cause => {
            switch (cause.cause) {
                case "OPERATOR_SHORTAGE":
                    recommendations.push({
                        action: "Assign additional operators to this station immediately",
                        priority: severity === "CRITICAL" ? "URGENT" : "HIGH",
                        estimated_impact: "Increase throughput by 30-50%",
                        implementation_cost: "LOW",
                    });
                    break;
                case "LOW_THROUGHPUT":
                    recommendations.push({
                        action: "Investigate and optimize work processes at this station",
                        priority: "HIGH",
                        estimated_impact: "Reduce processing time per unit",
                        implementation_cost: "MEDIUM",
                    });
                    break;
                case "QUEUE_BUILDUP":
                    recommendations.push({
                        action: "Redistribute workload or add parallel processing capacity",
                        priority: severity === "CRITICAL" ? "URGENT" : "MEDIUM",
                        estimated_impact: "Clear queue backlog within 24-48 hours",
                        implementation_cost: "MEDIUM",
                    });
                    break;
                case "OVER_UTILIZATION":
                    recommendations.push({
                        action: "Schedule operator breaks and rotate assignments to prevent burnout",
                        priority: "HIGH",
                        estimated_impact: "Maintain sustainable productivity",
                        implementation_cost: "LOW",
                    });
                    break;
                case "HIGH_DEFECT_RATE":
                    recommendations.push({
                        action: "Implement additional quality checks and operator retraining",
                        priority: "HIGH",
                        estimated_impact: "Reduce rework and improve first-pass yield",
                        implementation_cost: "MEDIUM",
                    });
                    break;
                case "UNDER_UTILIZATION":
                    recommendations.push({
                        action: "Reallocate operators to busier stations or schedule maintenance",
                        priority: "MEDIUM",
                        estimated_impact: "Better resource allocation and cost savings",
                        implementation_cost: "LOW",
                    });
                    break;
            }
        });
        // General recommendations
        if (recommendations.length === 0) {
            recommendations.push({
                action: "Continue monitoring - no immediate action required",
                priority: "LOW",
                estimated_impact: "Maintain current performance levels",
                implementation_cost: "LOW",
            });
        }
        return recommendations;
    }
    // Identify critical path
    identifyCriticalPath(metrics) {
        // Order stations by typical production flow
        const flowOrder = ["CUTTING", "PRINTING", "SEWING", "QC", "FINISHING"];
        return metrics
            .sort((a, b) => {
            const aIndex = flowOrder.indexOf(a.station_type);
            const bIndex = flowOrder.indexOf(b.station_type);
            return aIndex - bIndex;
        })
            .map(m => m.station_id);
    }
    // Generate system-level recommendations
    generateSystemRecommendations(bottlenecks, primaryBottleneck, efficiencyLoss) {
        const recommendations = [];
        if (primaryBottleneck) {
            recommendations.push(`🎯 PRIMARY BOTTLENECK: ${primaryBottleneck.station_metrics.station_name} (${primaryBottleneck.severity} severity) - Focus optimization efforts here`);
        }
        if (bottlenecks.length > 3) {
            recommendations.push(`⚠️ Multiple bottlenecks detected (${bottlenecks.length}) - systematic workflow redesign recommended`);
        }
        if (efficiencyLoss > 30) {
            recommendations.push(`📉 System efficiency is ${(100 - efficiencyLoss).toFixed(0)}% - significant productivity loss`);
        }
        if (bottlenecks.some(b => b.root_causes.some(c => c.cause === "OPERATOR_SHORTAGE"))) {
            recommendations.push(`👥 Operator staffing issues detected across multiple stations - review shift schedules`);
        }
        if (bottlenecks.some(b => b.root_causes.some(c => c.cause === "HIGH_DEFECT_RATE"))) {
            recommendations.push(`🔍 Quality issues contributing to delays - implement enhanced QC processes`);
        }
        if (recommendations.length === 0) {
            recommendations.push("✅ Production system running smoothly - no bottlenecks detected");
        }
        return recommendations;
    }
    // Predict completion delays
    predictCompletionDelays(bottlenecks, systemThroughput, optimalThroughput) {
        if (bottlenecks.length === 0)
            return [];
        // Simplified delay prediction
        const throughputRatio = systemThroughput / optimalThroughput;
        const _delayFactor = 1 - throughputRatio;
        return bottlenecks.slice(0, 5).map((b, idx) => ({
            order_id: `ORDER_${idx + 1}`,
            expected_delay_hours: b.impact.estimated_delay_hours,
            reason: `Delayed by bottleneck at ${b.station_metrics.station_name}`,
        }));
    }
    // Monitor bottlenecks over time (trend analysis)
    async analyzeBottleneckTrends(historicalMetrics) {
        const analyses = await Promise.all(historicalMetrics.map(async (h) => {
            const analysis = await this.analyzeProductionSystem(h.metrics);
            return {
                timestamp: h.timestamp,
                bottleneck_count: analysis.detected_bottlenecks.length,
                worst_severity: analysis.primary_bottleneck?.severity || "NONE",
                primary_station: analysis.primary_bottleneck?.station_metrics.station_name || "N/A",
                efficiency: analysis.overall_efficiency,
            };
        }));
        // Determine trend
        const recentEfficiency = analyses.slice(-3).reduce((sum, a) => sum + a.efficiency, 0) / 3;
        const olderEfficiency = analyses.slice(0, -3).reduce((sum, a) => sum + a.efficiency, 0) /
            Math.max(analyses.length - 3, 1);
        let trend;
        if (recentEfficiency > olderEfficiency + 5)
            trend = "IMPROVING";
        else if (recentEfficiency < olderEfficiency - 5)
            trend = "WORSENING";
        else
            trend = "STABLE";
        const trendAnalysis = trend === "IMPROVING"
            ? `Production efficiency improving (${recentEfficiency.toFixed(0)}% recent vs ${olderEfficiency.toFixed(0)}% historical)`
            : trend === "WORSENING"
                ? `Production efficiency declining (${recentEfficiency.toFixed(0)}% recent vs ${olderEfficiency.toFixed(0)}% historical) - immediate attention required`
                : `Production efficiency stable at ~${recentEfficiency.toFixed(0)}%`;
        const recommendations = [];
        if (trend === "WORSENING") {
            recommendations.push("🚨 Urgent: Schedule production review meeting to address declining efficiency");
            recommendations.push("📊 Analyze root causes of recent performance decline");
        }
        return {
            trend,
            trend_analysis: trendAnalysis,
            historical_bottlenecks: analyses,
            recommendations,
        };
    }
}
exports.BottleneckDetectionAI = BottleneckDetectionAI;
// Export singleton
exports.bottleneckDetectionAI = new BottleneckDetectionAI();
