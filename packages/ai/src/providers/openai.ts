import OpenAI from "openai";
import { nanoid } from "nanoid";
import { BaseAIProvider, type AIProviderConfig } from "./base";
import type { ValidationContext, AshleyAnalysis, AshleyIssue } from "../types";

export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor(config: AIProviderConfig) {
    super(config);
    
    if (!config.apiKey) {
      throw new Error("OpenAI API key is required");
    }

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
    });
  }

  getName(): string {
    return "openai";
  }

  async validateOrder(context: ValidationContext): Promise<AshleyAnalysis> {
    return this.analyze(context, "Order Intake Validation");
  }

  async assessClient(context: ValidationContext): Promise<AshleyAnalysis> {
    return this.analyze(context, "Client Risk Assessment");
  }

  async validateProduction(context: ValidationContext): Promise<AshleyAnalysis> {
    return this.analyze(context, "Production Feasibility");
  }

  async analyzeDesign(context: ValidationContext): Promise<AshleyAnalysis> {
    return this.analyze(context, "Design Analysis");
  }

  async performQC(context: ValidationContext): Promise<AshleyAnalysis> {
    return this.analyze(context, "Quality Control");
  }

  private async analyze(context: ValidationContext, analysisType: string): Promise<AshleyAnalysis> {
    try {
      const systemPrompt = this.buildSystemPrompt(context.entity, context.stage);
      const userPrompt = this.buildUserPrompt(context);

      const response = await this.client.chat.completions.create({
        model: this.config.model || "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${analysisType}: ${userPrompt}` }
        ],
        max_tokens: this.config.maxTokens || 2000,
        temperature: this.config.temperature || 0.1,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from OpenAI");
      }

      const parsed = JSON.parse(content);
      
      return {
        id: nanoid(),
        timestamp: new Date(),
        risk: parsed.risk || "AMBER",
        confidence: parsed.confidence || 0.5,
        issues: this.parseIssues(parsed.issues || []),
        recommendations: parsed.recommendations || [],
        metadata: {
          ...parsed.metadata,
          provider: "openai",
          model: this.config.model || "gpt-4-turbo-preview",
          analysisType,
        },
      };
    } catch (error) {
      console.error("OpenAI analysis error:", error);
      
      // Fallback analysis
      return {
        id: nanoid(),
        timestamp: new Date(),
        risk: "AMBER",
        confidence: 0.3,
        issues: [{
          type: "Analysis Error",
          message: "Unable to complete AI analysis. Manual review required.",
          severity: "HIGH",
          category: "FEASIBILITY",
          details: { error: String(error) }
        }],
        recommendations: [
          "Manual review required due to AI analysis failure",
          "Consider contacting technical support if this persists"
        ],
        metadata: {
          provider: "openai",
          error: String(error),
          analysisType,
        },
      };
    }
  }

  private parseIssues(issues: any[]): AshleyIssue[] {
    return issues.map(issue => ({
      type: issue.type || "Unknown Issue",
      message: issue.message || "No details provided",
      severity: issue.severity || "MEDIUM",
      category: issue.category || "FEASIBILITY",
      details: issue.details || {},
    }));
  }
}