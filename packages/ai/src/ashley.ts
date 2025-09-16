import { db } from "@ash-ai/database";
import { BaseAIProvider, OpenAIProvider, AnthropicProvider, type AIProviderConfig } from "./providers";
import { 
  ValidationContextSchema, 
  OrderIntakeDataSchema, 
  ClientDataSchema, 
  ProductionDataSchema 
} from "./validation";
import type { 
  ValidationContext, 
  AshleyAnalysis, 
  ProductionValidation, 
  ClientRiskAssessment, 
  OrderAnalysis 
} from "./types";

export interface AshleyConfig {
  provider: "openai" | "anthropic";
  config: AIProviderConfig;
  enableCaching?: boolean;
  cacheTTL?: number; // seconds
}

export class Ashley {
  private provider: BaseAIProvider;
  private enableCaching: boolean;
  private cacheTTL: number;

  constructor(config: AshleyConfig) {
    this.enableCaching = config.enableCaching ?? true;
    this.cacheTTL = config.cacheTTL ?? 3600; // 1 hour default

    switch (config.provider) {
      case "openai":
        this.provider = new OpenAIProvider(config.config);
        break;
      case "anthropic":
        this.provider = new AnthropicProvider(config.config);
        break;
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }

  async validateOrderIntake(
    workspaceId: string, 
    userId: string, 
    orderData: unknown
  ): Promise<OrderAnalysis> {
    const validatedData = OrderIntakeDataSchema.parse(orderData);
    
    const context: ValidationContext = {
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

  async assessClientRisk(
    workspaceId: string, 
    userId: string, 
    clientData: unknown
  ): Promise<ClientRiskAssessment> {
    const validatedData = ClientDataSchema.parse(clientData);
    
    const context: ValidationContext = {
      workspaceId,
      userId,
      stage: "CLIENT_ASSESSMENT",
      entity: "client",
      data: validatedData,
    };

    const analysis = await this.getOrCreateAnalysis(context);
    
    // Get historical data for client scoring
    const historyScore = await this.calculateClientHistoryScore(workspaceId, validatedData);
    
    return {
      creditRisk: analysis.risk,
      historyScore,
      paymentPattern: this.determinePaymentPattern(historyScore),
      recommendations: analysis.recommendations,
    };
  }

  async validateProduction(
    workspaceId: string, 
    userId: string, 
    productionData: unknown
  ): Promise<ProductionValidation> {
    const validatedData = ProductionDataSchema.parse(productionData);
    
    const context: ValidationContext = {
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
      estimatedDays: analysis.metadata.estimatedDays as number || 30,
      estimatedCost: analysis.metadata.estimatedCost as number || 50000,
      complexity: analysis.metadata.complexity as any || "MEDIUM",
      issues: analysis.issues,
      recommendations: analysis.recommendations,
    };
  }

  async analyzeDesignFeasibility(
    workspaceId: string, 
    userId: string, 
    designData: unknown
  ): Promise<AshleyAnalysis> {
    const context: ValidationContext = {
      workspaceId,
      userId,
      stage: "DESIGN_ANALYSIS",
      entity: "design",
      data: designData,
    };

    return this.getOrCreateAnalysis(context);
  }

  async performQualityCheck(
    workspaceId: string, 
    userId: string, 
    qcData: unknown
  ): Promise<AshleyAnalysis> {
    const context: ValidationContext = {
      workspaceId,
      userId,
      stage: "QUALITY_CONTROL",
      entity: "qc",
      data: qcData,
    };

    return this.getOrCreateAnalysis(context);
  }

  private async getOrCreateAnalysis(context: ValidationContext): Promise<AshleyAnalysis> {
    const validatedContext = ValidationContextSchema.parse(context);
    
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

  private async performAnalysis(context: ValidationContext): Promise<AshleyAnalysis> {
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

  private async getCachedAnalysis(context: ValidationContext): Promise<AshleyAnalysis | null> {
    try {
      const cacheKey = this.generateCacheKey(context);
      
      // Check database cache (could also use Redis)
      const cached = await db.aiAnalysis.findFirst({
        where: {
          cacheKey,
          createdAt: {
            gt: new Date(Date.now() - this.cacheTTL * 1000),
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (cached?.result) {
        return JSON.parse(cached.result) as AshleyAnalysis;
      }

      return null;
    } catch (error) {
      console.error("Cache retrieval error:", error);
      return null;
    }
  }

  private async cacheAnalysis(context: ValidationContext, analysis: AshleyAnalysis): Promise<void> {
    if (!this.enableCaching) return;

    try {
      const cacheKey = this.generateCacheKey(context);
      
      await db.aiAnalysis.create({
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

  private async saveAnalysis(context: ValidationContext, analysis: AshleyAnalysis): Promise<void> {
    // This would save the analysis result for audit/history purposes
    // Implementation depends on your database schema
  }

  private generateCacheKey(context: ValidationContext): string {
    const data = JSON.stringify(context.data);
    const hash = Buffer.from(data).toString("base64").slice(0, 32);
    return `${context.entity}_${context.stage}_${hash}`;
  }

  private calculateTimelineRisk(orderData: any): "GREEN" | "AMBER" | "RED" {
    const deadline = new Date(orderData.deadline);
    const daysUntilDeadline = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    // Simple timeline risk calculation
    if (daysUntilDeadline > 30) return "GREEN";
    if (daysUntilDeadline > 14) return "AMBER";
    return "RED";
  }

  private calculateCostRisk(orderData: any): "GREEN" | "AMBER" | "RED" {
    // Simple cost risk based on target price vs quantity
    const pricePerUnit = orderData.targetPrice ? orderData.targetPrice / orderData.quantity : 0;
    
    if (pricePerUnit > 500) return "GREEN";  // Premium pricing
    if (pricePerUnit > 200) return "AMBER";  // Mid-range
    return "RED"; // Low margin
  }

  private calculateEstimatedProfit(orderData: any): number {
    // Simplified profit calculation
    const revenue = orderData.targetPrice || orderData.quantity * 300;
    const estimatedCosts = orderData.quantity * 200; // Rough estimate
    return revenue - estimatedCosts;
  }

  private calculateDuration(orderData: any): number {
    // Simplified duration calculation based on quantity and complexity
    const baseTime = 7; // days
    const quantityFactor = Math.ceil(orderData.quantity / 100);
    return baseTime + quantityFactor;
  }

  private async calculateClientHistoryScore(workspaceId: string, clientData: any): Promise<number> {
    // This would calculate based on historical orders, payments, etc.
    // For now, return a placeholder
    return 85;
  }

  private determinePaymentPattern(historyScore: number): "EXCELLENT" | "GOOD" | "FAIR" | "POOR" {
    if (historyScore >= 90) return "EXCELLENT";
    if (historyScore >= 75) return "GOOD";
    if (historyScore >= 60) return "FAIR";
    return "POOR";
  }
}