"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicProvider = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const nanoid_1 = require("nanoid");
const base_1 = require("./base");
class AnthropicProvider extends base_1.BaseAIProvider {
    constructor(config) {
        super(config);
        if (!config.apiKey) {
            throw new Error("Anthropic API key is required");
        }
        this.client = new sdk_1.default({
            apiKey: config.apiKey,
            baseURL: config.baseURL,
        });
    }
    getName() {
        return "anthropic";
    }
    async validateOrder(context) {
        return this.analyze(context, "Order Intake Validation");
    }
    async assessClient(context) {
        return this.analyze(context, "Client Risk Assessment");
    }
    async validateProduction(context) {
        return this.analyze(context, "Production Feasibility");
    }
    async analyzeDesign(context) {
        return this.analyze(context, "Design Analysis");
    }
    async performQC(context) {
        return this.analyze(context, "Quality Control");
    }
    async analyze(context, analysisType) {
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
                        content: `${analysisType}: ${userPrompt}\n\nPlease respond with valid JSON only.`,
                    },
                ],
            });
            const content = response.content[0];
            if (content.type !== "text") {
                throw new Error("Invalid response type from Anthropic");
            }
            const parsed = JSON.parse(content.text);
            return {
                id: (0, nanoid_1.nanoid)(),
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
        }
        catch (error) {
            console.error("Anthropic analysis error:", error);
            // Fallback analysis
            return {
                id: (0, nanoid_1.nanoid)(),
                timestamp: new Date(),
                risk: "AMBER",
                confidence: 0.3,
                issues: [
                    {
                        type: "Analysis Error",
                        message: "Unable to complete AI analysis. Manual review required.",
                        severity: "HIGH",
                        category: "FEASIBILITY",
                        details: { error: String(error) },
                    },
                ],
                recommendations: [
                    "Manual review required due to AI analysis failure",
                    "Consider checking API configuration if this persists",
                ],
                metadata: {
                    provider: "anthropic",
                    error: String(error),
                    analysisType,
                },
            };
        }
    }
    parseIssues(issues) {
        return issues.map(issue => ({
            type: issue.type || "Unknown Issue",
            message: issue.message || "No details provided",
            severity: issue.severity || "MEDIUM",
            category: issue.category || "FEASIBILITY",
            details: issue.details || {},
        }));
    }
}
exports.AnthropicProvider = AnthropicProvider;
