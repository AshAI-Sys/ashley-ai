import type { ValidationContext, AshleyAnalysis } from "../types";
export interface AIProviderConfig {
  apiKey?: string;
  baseURL?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}
export declare abstract class BaseAIProvider {
  protected config: AIProviderConfig;
  constructor(config: AIProviderConfig);
  abstract getName(): string;
  abstract validateOrder(context: ValidationContext): Promise<AshleyAnalysis>;
  abstract assessClient(context: ValidationContext): Promise<AshleyAnalysis>;
  abstract validateProduction(
    context: ValidationContext
  ): Promise<AshleyAnalysis>;
  abstract analyzeDesign(context: ValidationContext): Promise<AshleyAnalysis>;
  abstract performQC(context: ValidationContext): Promise<AshleyAnalysis>;
  protected buildSystemPrompt(entity: string, stage: string): string;
  protected buildUserPrompt(context: ValidationContext): string;
}
