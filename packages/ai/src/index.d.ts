export { Ashley } from "./ashley";
export type { AshleyConfig } from "./ashley";
export * from "./types";
export * from "./validation";
export * from "./providers";
export declare const defaultConfigs: {
    openai: {
        provider: "openai";
        config: {
            model: string;
            maxTokens: number;
            temperature: number;
        };
    };
    anthropic: {
        provider: "anthropic";
        config: {
            model: string;
            maxTokens: number;
            temperature: number;
        };
    };
};
export declare function createAshley(provider: "openai" | "anthropic", apiKey: string, options?: Partial<AshleyConfig>): any;
