import Anthropic from "@anthropic-ai/sdk";
import { nanoid } from "nanoid";
import { BaseAIProvider, type AIProviderConfig } from "./base";
import type { ValidationContext, AshleyAnalysis, AshleyIssue } from "../types";

export class AnthropicProvider extends BaseAIProvider {
  private client: Anthropic;

  constructor(config: AIProviderConfig) {
    super(config);
    
    if (!config.apiKey) {
      throw new Error("Anthropic API key is required");
    }

    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
  }

  getName(): string {
    return "anthropic";
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

      const response = await this.client.messages.create({
        model: this.config.model || "claude-3-sonnet-20240229",
        max_tokens: this.config.maxTokens || 2000,
        temperature: this.config.temperature || 0.1,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `${analysisType}: ${userPrompt}\n\nPlease respond with valid JSON only.`
          }
        ],
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Invalid response type from Anthropic");
      }

      const parsed = JSON.parse(content.text);
      
      return {
        id: nanoid(),
        timestamp: new Date(),
        risk: parsed.risk || "AMBER",
        confidence: parsed.confidence || 0.5,
        issues: this.parseIssues(parsed.issues || []),
        recommendations: parsed.recommendations || [],
        metadata: {
          ...parsed.metadata,
          provider: "anthropic",
          model: this.config.model || "claude-3-sonnet-20240229",
          analysisType,
        },
      };
    } catch (error) {
      console.error("Anthropic analysis error:", error);
      
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
          "Consider checking API configuration if this persists"
        ],
        metadata: {
          provider: "anthropic",
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