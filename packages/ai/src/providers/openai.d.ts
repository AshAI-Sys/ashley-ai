import { BaseAIProvider, type AIProviderConfig } from "./base";
import type { ValidationContext, AshleyAnalysis } from "../types";
export declare class OpenAIProvider extends BaseAIProvider {
    private client;
    constructor(config: AIProviderConfig);
    getName(): string;
    validateOrder(context: ValidationContext): Promise<AshleyAnalysis>;
    assessClient(context: ValidationContext): Promise<AshleyAnalysis>;
    validateProduction(context: ValidationContext): Promise<AshleyAnalysis>;
    analyzeDesign(context: ValidationContext): Promise<AshleyAnalysis>;
    performQC(context: ValidationContext): Promise<AshleyAnalysis>;
    private analyze;
    private parseIssues;
}
