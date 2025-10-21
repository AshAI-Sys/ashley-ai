"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ashley = void 0;
const database_1 = require("@ash-ai/database");
const providers_1 = require("./providers");
const validation_1 = require("./validation");
class Ashley {
  constructor(config) {
    this.enableCaching = config.enableCaching ?? true;
    this.cacheTTL = config.cacheTTL ?? 3600; // 1 hour default
    switch (config.provider) {
      case "openai":
        this.provider = new providers_1.OpenAIProvider(config.config);
        break;
      case "anthropic":
        this.provider = new providers_1.AnthropicProvider(config.config);
        break;
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }
  async validateOrderIntake(workspaceId, userId, orderData) {
    const validatedData = validation_1.OrderIntakeDataSchema.parse(orderData);
    const context = {
      workspaceId,
      userId,
      stage: "ORDER_INTAKE",
      entity: "order",
      data: validatedData,
    };
    const analysis = await this.getOrCreateAnalysis(context);
    // Convert to OrderAnalysis format
    return {
      feasibility: analysis.risk,
      timelineRisk: this.calculateTimelineRisk(validatedData),
      costRisk: this.calculateCostRisk(validatedData),
      qualityRisk: analysis.risk,
      overallRisk: analysis.risk,
      estimatedProfit: this.calculateEstimatedProfit(validatedData),
      estimatedDuration: this.calculateDuration(validatedData),
      keyRisks: analysis.issues,
      recommendations: analysis.recommendations,
    };
  }
  async assessClientRisk(workspaceId, userId, clientData) {
    const validatedData = validation_1.ClientDataSchema.parse(clientData);
    const context = {
      workspaceId,
      userId,
      stage: "CLIENT_ASSESSMENT",
      entity: "client",
      data: validatedData,
    };
    const analysis = await this.getOrCreateAnalysis(context);
    // Get historical data for client scoring
    const historyScore = await this.calculateClientHistoryScore(
      workspaceId,
      validatedData
    );
    return {
      creditRisk: analysis.risk,
      historyScore,
      paymentPattern: this.determinePaymentPattern(historyScore),
      recommendations: analysis.recommendations,
    };
  }
  async validateProduction(workspaceId, userId, productionData) {
    const validatedData =
      validation_1.ProductionDataSchema.parse(productionData);
    const context = {
      workspaceId,
      userId,
      stage: "PRODUCTION_PLANNING",
      entity: "production",
      data: validatedData,
    };
    const analysis = await this.getOrCreateAnalysis(context);
    return {
      isValid: analysis.risk !== "RED",
      risk: analysis.risk,
      estimatedDays: analysis.metadata.estimatedDays || 30,
      estimatedCost: analysis.metadata.estimatedCost || 50000,
      complexity: analysis.metadata.complexity || "MEDIUM",
      issues: analysis.issues,
      recommendations: analysis.recommendations,
    };
  }
  async analyzeDesignFeasibility(workspaceId, userId, designData) {
    const context = {
      workspaceId,
      userId,
      stage: "DESIGN_ANALYSIS",
      entity: "design",
      data: designData,
    };
    return this.getOrCreateAnalysis(context);
  }
  async performQualityCheck(workspaceId, userId, qcData) {
    const context = {
      workspaceId,
      userId,
      stage: "QUALITY_CONTROL",
      entity: "qc",
      data: qcData,
    };
    return this.getOrCreateAnalysis(context);
  }
  async getOrCreateAnalysis(context) {
    const validatedContext =
      validation_1.ValidationContextSchema.parse(context);
    // Check cache if enabled
    if (this.enableCaching) {
      const cached = await this.getCachedAnalysis(validatedContext);
      if (cached) {
        return cached;
      }
    }
    // Perform AI analysis
    const analysis = await this.performAnalysis(validatedContext);
    // Cache result and save to database
    await Promise.all([
      this.cacheAnalysis(validatedContext, analysis),
      this.saveAnalysis(validatedContext, analysis),
    ]);
    return analysis;
  }
  async performAnalysis(context) {
    switch (context.entity) {
      case "order":
        return this.provider.validateOrder(context);
      case "client":
        return this.provider.assessClient(context);
      case "production":
        return this.provider.validateProduction(context);
      case "design":
        return this.provider.analyzeDesign(context);
      case "qc":
        return this.provider.performQC(context);
      default:
        throw new Error(`Unsupported entity type: ${context.entity}`);
    }
  }
  async getCachedAnalysis(context) {
    try {
      const cacheKey = this.generateCacheKey(context);
      // Check database cache (could also use Redis)
      const cached = await database_1.db.aiAnalysis.findFirst({
        where: {
          cacheKey,
          createdAt: {
            gt: new Date(Date.now() - this.cacheTTL * 1000),
          },
        },
        orderBy: { createdAt: "desc" },
      });
      if (cached?.result) {
        return JSON.parse(cached.result);
      }
      return null;
    } catch (error) {
      console.error("Cache retrieval error:", error);
      return null;
    }
  }
  async cacheAnalysis(context, analysis) {
    if (!this.enableCaching) return;
    try {
      const cacheKey = this.generateCacheKey(context);
      await database_1.db.aiAnalysis.create({
        data: {
          workspaceId: context.workspaceId,
          userId: context.userId,
          entity: context.entity,
          stage: context.stage,
          cacheKey,
          result: JSON.stringify(analysis),
          risk: analysis.risk,
          confidence: analysis.confidence,
        },
      });
    } catch (error) {
      console.error("Cache storage error:", error);
    }
  }
  async saveAnalysis(context, analysis) {
    // This would save the analysis result for audit/history purposes
    // Implementation depends on your database schema
  }
  generateCacheKey(context) {
    const data = JSON.stringify(context.data);
    const hash = Buffer.from(data).toString("base64").slice(0, 32);
    return `${context.entity}_${context.stage}_${hash}`;
  }
  calculateTimelineRisk(orderData) {
    const deadline = new Date(orderData.deadline);
    const daysUntilDeadline = Math.ceil(
      (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    // Simple timeline risk calculation
    if (daysUntilDeadline > 30) return "GREEN";
    if (daysUntilDeadline > 14) return "AMBER";
    return "RED";
  }
  calculateCostRisk(orderData) {
    // Simple cost risk based on target price vs quantity
    const pricePerUnit = orderData.targetPrice
      ? orderData.targetPrice / orderData.quantity
      : 0;
    if (pricePerUnit > 500) return "GREEN"; // Premium pricing
    if (pricePerUnit > 200) return "AMBER"; // Mid-range
    return "RED"; // Low margin
  }
  calculateEstimatedProfit(orderData) {
    // Simplified profit calculation
    const revenue = orderData.targetPrice || orderData.quantity * 300;
    const estimatedCosts = orderData.quantity * 200; // Rough estimate
    return revenue - estimatedCosts;
  }
  calculateDuration(orderData) {
    // Simplified duration calculation based on quantity and complexity
    const baseTime = 7; // days
    const quantityFactor = Math.ceil(orderData.quantity / 100);
    return baseTime + quantityFactor;
  }
  async calculateClientHistoryScore(workspaceId, clientData) {
    // This would calculate based on historical orders, payments, etc.
    // For now, return a placeholder
    return 85;
  }
  determinePaymentPattern(historyScore) {
    if (historyScore >= 90) return "EXCELLENT";
    if (historyScore >= 75) return "GOOD";
    if (historyScore >= 60) return "FAIR";
    return "POOR";
  }
}
exports.Ashley = Ashley;
