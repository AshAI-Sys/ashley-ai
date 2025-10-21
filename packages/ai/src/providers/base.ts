import type { AIProvider, ValidationContext, AshleyAnalysis } from "../types";

export interface AIProviderConfig {
  apiKey?: string;
  baseURL?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export abstract class BaseAIProvider {
  protected config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  abstract getName(): string;

  abstract validateOrder(context: ValidationContext): Promise<AshleyAnalysis>;

  abstract assessClient(context: ValidationContext): Promise<AshleyAnalysis>;

  abstract validateProduction(
    context: ValidationContext
  ): Promise<AshleyAnalysis>;

  abstract analyzeDesign(context: ValidationContext): Promise<AshleyAnalysis>;

  abstract performQC(context: ValidationContext): Promise<AshleyAnalysis>;

  protected buildSystemPrompt(entity: string, stage: string): string {
    return `You are Ashley AI, an expert AI assistant specialized in apparel manufacturing in the Philippines.

Your role is to analyze ${entity} data for the ${stage} stage and provide:
1. Risk assessment (GREEN/AMBER/RED)
2. Specific issues with severity levels
3. Actionable recommendations
4. Confidence score (0-1)

Context:
- Location: Philippines (consider local regulations, materials, labor costs)
- Industry: Apparel manufacturing (garments, textiles)
- Focus: Production feasibility, timeline risks, cost analysis, quality concerns

Respond in JSON format with the following structure:
{
  "risk": "GREEN|AMBER|RED",
  "confidence": 0.85,
  "issues": [
    {
      "type": "Issue Type",
      "message": "Detailed description",
      "severity": "LOW|MEDIUM|HIGH|CRITICAL",
      "category": "TIMELINE|COST|QUALITY|FEASIBILITY|COMPLIANCE",
      "details": {}
    }
  ],
  "recommendations": ["Specific actionable recommendation"],
  "metadata": {
    "estimatedDays": 30,
    "estimatedCost": 50000,
    "complexity": "MEDIUM"
  }
}`;
  }

  protected buildUserPrompt(context: ValidationContext): string {
    return `Analyze this ${context.entity} data for ${context.stage}:

Data: ${JSON.stringify(context.data, null, 2)}

Workspace: ${context.workspaceId}
User: ${context.userId}

Please provide your analysis focusing on Philippine manufacturing context.`;
  }
}
